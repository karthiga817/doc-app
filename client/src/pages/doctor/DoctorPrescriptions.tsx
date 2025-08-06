import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { FileText, Plus, Search, Calendar, User, Edit } from 'lucide-react';
import { format } from 'date-fns';

const DoctorPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const { prescriptions, appointments, addPrescription } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [formData, setFormData] = useState({
    medications: '',
    instructions: ''
  });

  const doctorPrescriptions = prescriptions.filter(presc => presc.doctorId === user?.id);
  const completedAppointments = appointments.filter(apt => 
    apt.doctorId === user?.id && apt.status === 'completed'
  );

  const filteredPrescriptions = doctorPrescriptions.filter(presc =>
    presc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presc.medications.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPrescriptions = filteredPrescriptions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAppointment || !formData.medications.trim() || !formData.instructions.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const appointment = appointments.find(apt => apt.id === selectedAppointment);
    if (!appointment) {
      alert('Selected appointment not found');
      return;
    }

    const success = await addPrescription({
      appointmentId: selectedAppointment,
      patientId: appointment.patientId,
      doctorId: user!.id,
      medications: formData.medications,
      instructions: formData.instructions
    });

    if (success) {
      setShowCreateForm(false);
      setFormData({ medications: '', instructions: '' });
      setSelectedAppointment('');
    } else {
      alert('Failed to create prescription. Please try again.');
    }
  };

  if (showCreateForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(false)}
            className="text-blue-600 hover:text-blue-500 mb-4"
          >
            ← Back to Prescriptions
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Prescription</h1>
          <p className="text-gray-600 mt-1">Add a new prescription for a patient</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="appointment" className="block text-sm font-medium text-gray-700 mb-2">
                Select Appointment
              </label>
              <select
                id="appointment"
                value={selectedAppointment}
                onChange={(e) => setSelectedAppointment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a completed appointment...</option>
                {completedAppointments.map(appointment => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.patientName} - {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
                Medications
              </label>
              <textarea
                id="medications"
                value={formData.medications}
                onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List medications with dosage and frequency..."
                required
              />
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Special instructions for the patient..."
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Prescription
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-gray-600 mt-1">Create and manage patient prescriptions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Prescription</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{doctorPrescriptions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">
                {doctorPrescriptions.filter(p => 
                  new Date(p.createdAt).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available to Create</p>
              <p className="text-2xl font-bold text-green-600">{completedAppointments.length}</p>
            </div>
            <Plus className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search prescriptions by patient name or medication..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {sortedPrescriptions.length > 0 ? (
          sortedPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Prescription for {prescription.patientName}
                      </h3>
                      <p className="text-gray-600">
                        Created on {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Medications:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                          {prescription.medications}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans">
                          {prescription.instructions}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-500">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching prescriptions' : 'No prescriptions yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first prescription for a completed appointment'
              }
            </p>
            {!searchTerm && completedAppointments.length > 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create First Prescription
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPrescriptions;