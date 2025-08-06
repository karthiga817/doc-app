export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'doctor' | 'patient';
  createdAt: string;
}

export interface Doctor extends User {
  specialization: string;
  experience: number;
  availability: TimeSlot[];
  leaveDays: string[];
  isActive: boolean;
}

export interface Patient extends User {
  dateOfBirth: string;
  address: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  reason: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  medications: string;
  instructions: string;
  fileUrl?: string;
  fileType?: 'pdf' | 'image' | 'text';
  createdAt: string;
}