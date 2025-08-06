import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
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
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          users!doctors_user_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      const doctorsData = data?.map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        name: doc.users.name,
        email: doc.users.email,
        phone: doc.users.phone,
        specialization: doc.specialization,
        experience: doc.experience,
        availability: doc.availability || [],
        leaveDays: doc.leave_days || [],
        isActive: doc.is_active,
        createdAt: doc.created_at
      })) || [];

      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!appointments_patient_id_fkey (name),
          doctor:users!appointments_doctor_id_fkey (name),
          doctor_profile:doctors!appointments_doctor_id_fkey (specialization)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const appointmentsData = data?.map(apt => ({
        id: apt.id,
        patientId: apt.patient_id,
        doctorId: apt.doctor_id,
        patientName: apt.patient.name,
        doctorName: apt.doctor.name,
        doctorSpecialization: apt.doctor_profile.specialization,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        reason: apt.reason,
        createdAt: apt.created_at
      })) || [];

      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:users!prescriptions_patient_id_fkey (name),
          doctor:users!prescriptions_doctor_id_fkey (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const prescriptionsData = data?.map(presc => ({
        id: presc.id,
        appointmentId: presc.appointment_id,
        patientId: presc.patient_id,
        doctorId: presc.doctor_id,
        patientName: presc.patient.name,
        doctorName: presc.doctor.name,
        medications: presc.medications,
        instructions: presc.instructions,
        createdAt: presc.created_at
      })) || [];

      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'patientName' | 'doctorName' | 'doctorSpecialization'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: appointmentData.patientId,
          doctor_id: appointmentData.doctorId,
          date: appointmentData.date,
          time: appointmentData.time,
          status: appointmentData.status,
          reason: appointmentData.reason
        });

      if (error) throw error;

      await fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error adding appointment:', error);
      return false;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<boolean> => {
    try {
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.time) dbUpdates.time = updates.time;
      if (updates.reason) dbUpdates.reason = updates.reason;

      const { error } = await supabase
        .from('appointments')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      await fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return false;
    }
  };

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'patientName' | 'doctorName'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          appointment_id: prescriptionData.appointmentId,
          patient_id: prescriptionData.patientId,
          doctor_id: prescriptionData.doctorId,
          medications: prescriptionData.medications,
          instructions: prescriptionData.instructions
        });

      if (error) throw error;

      await fetchPrescriptions();
      return true;
    } catch (error) {
      console.error('Error adding prescription:', error);
      return false;
    }
  };

  const updateDoctorAvailability = async (doctorId: string, availability: any, leaveDays: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          availability,
          leave_days: leaveDays
        })
        .eq('user_id', doctorId);

      if (error) throw error;

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