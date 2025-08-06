import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDoctorSchema, insertPatientSchema, insertAppointmentSchema, insertPrescriptionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Handle demo logins for development
      const demoUsers = {
        'admin@medbook.com': {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@medbook.com',
          name: 'System Administrator',
          phone: '+1-555-0100',
          role: 'admin' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'doctor@medbook.com': {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'doctor@medbook.com',
          name: 'Dr. John Smith',
          phone: '+1-555-0200',
          role: 'doctor' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'patient@medbook.com': {
          id: '00000000-0000-0000-0000-000000000003',
          email: 'patient@medbook.com',
          name: 'Jane Doe',
          phone: '+1-555-0300',
          role: 'patient' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      if (demoUsers[email as keyof typeof demoUsers] && (password === 'admin123' || password === 'doctor123' || password === 'patient123')) {
        res.json({ user: demoUsers[email as keyof typeof demoUsers], success: true });
        return;
      }

      // Try to find user in database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials', success: false });
        return;
      }

      // In a real app, you'd verify the password hash here
      res.json({ user, success: true });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error', success: false });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ user, success: true });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed', success: false });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get("/api/doctors/:userId", async (req, res) => {
    try {
      const doctor = await storage.getDoctor(req.params.userId);
      if (!doctor) {
        res.status(404).json({ message: 'Doctor not found' });
        return;
      }
      res.json(doctor);
    } catch (error) {
      console.error('Get doctor error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post("/api/doctors", async (req, res) => {
    try {
      const doctorData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(doctorData);
      res.json(doctor);
    } catch (error) {
      console.error('Create doctor error:', error);
      res.status(400).json({ message: 'Failed to create doctor' });
    }
  });

  app.put("/api/doctors/:userId", async (req, res) => {
    try {
      const doctor = await storage.updateDoctor(req.params.userId, req.body);
      if (!doctor) {
        res.status(404).json({ message: 'Doctor not found' });
        return;
      }
      res.json(doctor);
    } catch (error) {
      console.error('Update doctor error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(400).json({ message: 'Failed to create patient' });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const { patientId, doctorId } = req.query;
      
      let appointments;
      if (patientId) {
        appointments = await storage.getAppointmentsByPatient(patientId as string);
      } else if (doctorId) {
        appointments = await storage.getAppointmentsByDoctor(doctorId as string);
      } else {
        appointments = await storage.getAppointments();
      }
      
      res.json(appointments);
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(400).json({ message: 'Failed to create appointment' });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.updateAppointment(req.params.id, req.body);
      if (!appointment) {
        res.status(404).json({ message: 'Appointment not found' });
        return;
      }
      res.json(appointment);
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Prescription routes
  app.get("/api/prescriptions", async (req, res) => {
    try {
      const { patientId, doctorId } = req.query;
      
      let prescriptions;
      if (patientId) {
        prescriptions = await storage.getPrescriptionsByPatient(patientId as string);
      } else if (doctorId) {
        prescriptions = await storage.getPrescriptionsByDoctor(doctorId as string);
      } else {
        prescriptions = await storage.getPrescriptions();
      }
      
      res.json(prescriptions);
    } catch (error) {
      console.error('Get prescriptions error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post("/api/prescriptions", async (req, res) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(prescriptionData);
      res.json(prescription);
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(400).json({ message: 'Failed to create prescription' });
    }
  });

  app.put("/api/prescriptions/:id", async (req, res) => {
    try {
      const prescription = await storage.updatePrescription(req.params.id, req.body);
      if (!prescription) {
        res.status(404).json({ message: 'Prescription not found' });
        return;
      }
      res.json(prescription);
    } catch (error) {
      console.error('Update prescription error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
