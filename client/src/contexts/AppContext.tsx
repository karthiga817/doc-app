import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
import { useAuth } from './AuthContext';

interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  availability: any[];
  leaveDays: string[];
  isActive: boolean;
  createdAt: string;
}

interface Appointment {
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

interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  medications: string;
  instructions: string;
  createdAt: string;
}

interface AppContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  loading: boolean;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'patientName' | 'doctorName' | 'doctorSpecialization'>) => Promise<boolean>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<boolean>;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt' | 'patientName' | 'doctorName'>) => Promise<boolean>;
  updateDoctorAvailability: (doctorId: string, availability: any, leaveDays: string[]) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setDoctors([]);
      setAppointments([]);
      setPrescriptions([]);
      setLoading(false);
    }
  }, [user]);

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDoctors(),
        fetchAppointments(),
        fetchPrescriptions()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await apiClient.getDoctors();
      
      const doctorsData = data?.map(doc => ({
        id: doc.id,
        userId: doc.userId,
        name: doc.user.name,
        email: doc.user.email,
        phone: doc.user.phone,
        specialization: doc.specialization,
        experience: doc.experience,
        availability: doc.availability || [],
        leaveDays: doc.leaveDays || [],
        isActive: doc.isActive,
        createdAt: doc.createdAt
      })) || [];

      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await apiClient.getAppointments();
      
      // For now, use simplified appointment data
      // In a real implementation, we'd need to join with user data
      const appointmentsData = data?.map(apt => ({
        id: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        patientName: 'Patient', // TODO: Join with user data
        doctorName: 'Doctor', // TODO: Join with user data
        doctorSpecialization: 'General Medicine', // TODO: Join with doctor data
        date: apt.date,
        time: apt.time,
        status: apt.status,
        reason: apt.reason,
        createdAt: apt.createdAt
      })) || [];

      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const data = await apiClient.getPrescriptions();
      
      // For now, use simplified prescription data
      // In a real implementation, we'd need to join with user data
      const prescriptionsData = data?.map(presc => ({
        id: presc.id,
        appointmentId: presc.appointmentId,
        patientId: presc.patientId,
        doctorId: presc.doctorId,
        patientName: 'Patient', // TODO: Join with user data
        doctorName: 'Doctor', // TODO: Join with user data
        medications: presc.medications,
        instructions: presc.instructions,
        createdAt: presc.createdAt
      })) || [];

      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'patientName' | 'doctorName' | 'doctorSpecialization'>): Promise<boolean> => {
    try {
      await apiClient.createAppointment({
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        time: appointmentData.time,
        status: appointmentData.status,
        reason: appointmentData.reason
      });

      await fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error adding appointment:', error);
      return false;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.date) updateData.date = updates.date;
      if (updates.time) updateData.time = updates.time;
      if (updates.reason) updateData.reason = updates.reason;

      await apiClient.updateAppointment(id, updateData);

      await fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return false;
    }
  };

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'patientName' | 'doctorName'>): Promise<boolean> => {
    try {
      await apiClient.createPrescription({
        appointmentId: prescriptionData.appointmentId,
        patientId: prescriptionData.patientId,
        doctorId: prescriptionData.doctorId,
        medications: prescriptionData.medications,
        instructions: prescriptionData.instructions
      });

      await fetchPrescriptions();
      return true;
    } catch (error) {
      console.error('Error adding prescription:', error);
      return false;
    }
  };

  const updateDoctorAvailability = async (doctorId: string, availability: any, leaveDays: string[]): Promise<boolean> => {
    try {
      await apiClient.updateDoctorAvailability(doctorId, {
        availability,
        leaveDays
      });

      await fetchDoctors();
      return true;
    } catch (error) {
      console.error('Error updating doctor availability:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      doctors,
      appointments,
      prescriptions,
      loading,
      addAppointment,
      updateAppointment,
      addPrescription,
      updateDoctorAvailability,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};