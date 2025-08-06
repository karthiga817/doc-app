import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Search, Filter, Calendar, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  createdAt: string;
  appointmentCount: number;
}

const AdminPatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          phone,
          created_at,
          patients!patients_user_id_fkey (
            date_of_birth,
            address
          )
        `)
        .eq('role', 'patient');

      if (error) throw error;

      // Get appointment counts for each patient
      const { data: appointmentCounts, error: countError } = await supabase
        .from('appointments')
        .select('patient_id')
        .in('patient_id', data?.map(p => p.id) || []);

      if (countError) throw countError;

      const countMap = appointmentCounts?.reduce((acc, apt) => {
        acc[apt.patient_id] = (acc[apt.patient_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const patientsData = data?.map(patient => ({
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.patients?.[0]?.date_of_birth || '',
        address: patient.patients?.[0]?.address || '',
        createdAt: patient.created_at,
        appointmentCount: countMap[patient.id] || 0
      })) || [];

      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const totalAppointments = patients.reduce((sum, patient) => sum + patient.appointmentCount, 0);
  const avgAppointmentsPerPatient = patients.length > 0 ? (totalAppointments / patients.length).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <p className="text-gray-600 mt-1">View and manage patient records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
            <User className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-blue-600">{totalAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Appointments</p>
              <p className="text-2xl font-bold text-purple-600">{avgAppointmentsPerPatient}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date of Birth</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Address</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Appointments</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">ID: {patient.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center space-x-1 mb-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{patient.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">{patient.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">
                      {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 text-sm">{patient.address || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {patient.appointmentCount} appointments
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 text-sm">
                      {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPatientManagement;