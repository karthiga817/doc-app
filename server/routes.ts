import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDoctorSchema, insertPatientSchema, insertAppointmentSchema, insertPrescriptionSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

// Initialize admin user if it doesn't exist
async function initializeAdmin() {
  try {
    const existingAdmin = await storage.getUserByEmail('admin@medbook.com');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await storage.createUser({
        email: 'admin@medbook.com',
        password: hashedPassword,
        name: 'System Administrator',
        phone: '+1-555-0100',
        role: 'admin'
      });
      console.log('Admin user created: admin@medbook.com / admin123');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin user on startup
  await initializeAdmin();

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required', success: false });
        return;
      }

      // Find user in database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials', success: false });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Invalid credentials', success: false });
        return;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ data: userWithoutPassword, success: true });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error', success: false });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        res.status(400).json({ message: 'User with this email already exists', success: false });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userToCreate = { ...userData, password: hashedPassword };
      
      const user = await storage.createUser(userToCreate);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ data: userWithoutPassword, success: true });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed', success: false });
    }
  });

  // Admin route to create doctor accounts
  app.post("/api/admin/doctors", async (req, res) => {
    try {
      const { email, password, name, phone, specialization, experience } = req.body;
      
      if (!email || !password || !name || !phone || !specialization) {
        res.status(400).json({ message: 'All fields are required', success: false });
        return;
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'User with this email already exists', success: false });
        return;
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'doctor'
      });

      // Create doctor profile
      const doctor = await storage.createDoctor({
        userId: user.id,
        specialization,
        experience: experience || 0,
        availability: [{}],
        leaveDays: [],
        isActive: true
      });

      res.json({ 
        data: { user: { ...user, password: undefined }, doctor }, 
        success: true 
      });
    } catch (error) {
      console.error('Error creating doctor:', error);
      res.status(500).json({ message: 'Failed to create doctor account', success: false });
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
