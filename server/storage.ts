import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import { 
  users, doctors, patients, appointments, prescriptions,
  type User, type Doctor, type Patient, type Appointment, type Prescription,
  type InsertUser, type InsertDoctor, type InsertPatient, type InsertAppointment, type InsertPrescription
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Doctor operations
  getDoctors(): Promise<(Doctor & { user: User })[]>;
  getDoctor(userId: string): Promise<(Doctor & { user: User }) | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(userId: string, updates: Partial<Doctor>): Promise<Doctor | undefined>;
  
  // Patient operations
  getPatients(): Promise<(Patient & { user: User })[]>;
  getPatient(userId: string): Promise<(Patient & { user: User }) | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(userId: string, updates: Partial<Patient>): Promise<Patient | undefined>;
  
  // Appointment operations
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Prescription operations
  getPrescriptions(): Promise<Prescription[]>;
  getPrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: string, updates: Partial<Prescription>): Promise<Prescription | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values([{
      ...user,
      role: user.role as 'admin' | 'doctor' | 'patient'
    }]).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Doctor operations
  async getDoctors(): Promise<(Doctor & { user: User })[]> {
    const result = await db.select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id));
    
    return result.map(row => ({
      ...row.doctors,
      user: row.users
    }));
  }

  async getDoctor(userId: string): Promise<(Doctor & { user: User }) | undefined> {
    const result = await db.select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.userId, userId))
      .limit(1);
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].doctors,
      user: result[0].users
    };
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const result = await db.insert(doctors).values([doctor]).returning();
    return result[0];
  }

  async updateDoctor(userId: string, updates: Partial<Doctor>): Promise<Doctor | undefined> {
    const result = await db.update(doctors).set({ ...updates, updatedAt: new Date() }).where(eq(doctors.userId, userId)).returning();
    return result[0];
  }

  // Patient operations
  async getPatients(): Promise<(Patient & { user: User })[]> {
    const result = await db.select()
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id));
    
    return result.map(row => ({
      ...row.patients,
      user: row.users
    }));
  }

  async getPatient(userId: string): Promise<(Patient & { user: User }) | undefined> {
    const result = await db.select()
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.userId, userId))
      .limit(1);
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].patients,
      user: result[0].users
    };
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const result = await db.insert(patients).values([patient]).returning();
    return result[0];
  }

  async updatePatient(userId: string, updates: Partial<Patient>): Promise<Patient | undefined> {
    const result = await db.update(patients).set({ ...updates, updatedAt: new Date() }).where(eq(patients.userId, userId)).returning();
    return result[0];
  }

  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    const result = await db.select().from(appointments);
    return result;
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const result = await db.select().from(appointments).where(eq(appointments.patientId, patientId));
    return result;
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const result = await db.select().from(appointments).where(eq(appointments.doctorId, doctorId));
    return result;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values([{
      ...appointment,
      status: appointment.status as 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | undefined
    }]).returning();
    return result[0];
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointments).set({ ...updates, updatedAt: new Date() }).where(eq(appointments.id, id)).returning();
    return result[0];
  }

  // Prescription operations
  async getPrescriptions(): Promise<Prescription[]> {
    const result = await db.select().from(prescriptions);
    return result;
  }

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    const result = await db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId));
    return result;
  }

  async getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]> {
    const result = await db.select().from(prescriptions).where(eq(prescriptions.doctorId, doctorId));
    return result;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const result = await db.insert(prescriptions).values([prescription]).returning();
    return result[0];
  }

  async updatePrescription(id: string, updates: Partial<Prescription>): Promise<Prescription | undefined> {
    const result = await db.update(prescriptions).set({ ...updates, updatedAt: new Date() }).where(eq(prescriptions.id, id)).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
