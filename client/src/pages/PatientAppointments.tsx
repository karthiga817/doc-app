import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Calendar, Clock, User, MapPin, Edit, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';

const PatientAppointments: React.FC = () => {
  const { user } = useAuth();
  const { appointments, updateAppointment } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');

  const userAppointments = appointments.filter(app => app.patientId === user?.id);
  
  const filteredAppointments = statusFilter === 'all' 
    ? userAppointments 
    : userAppointments.filter(app => app.status === statusFilter);

  const sortedAppointments = filteredAppointments.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'rejected': return '✗';
      case 'cancelled': return '⊘';
      case 'completed': return '✓';
      default: return '?';
    }
  };

  const canCancelAppointment = (appointment: any) => {
    return appointment.status === 'pending' || appointment.status === 'confirmed';
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      updateAppointment(appointmentId, { status: 'cancelled' }).then(success => {
        if (!success) {
          alert('Failed to cancel appointment. Please try again.');
        }
      });
    }
  };

  const statusCounts = {
    all: userAppointments.length,
    pending: userAppointments.filter(app => app.status === 'pending').length,
    confirmed: userAppointments.filter(app => app.status === 'confirmed').length,
    completed: userAppointments.filter(app => app.status === 'completed').length,
    cancelled: userAppointments.filter(app => app.status === 'cancelled').length,
    rejected: userAppointments.filter(app => app.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-1">View and manage your appointments</p>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">Filter by status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
            { key: 'completed', label: 'Completed', count: statusCounts.completed },
            { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {sortedAppointments.length > 0 ? (
          sortedAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                      <p className="text-gray-600">{appointment.doctorSpecialization}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(appointment.date), 'MMMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Reason for visit:</p>
                    <p className="text-gray-900">{appointment.reason}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      <span className="mr-1">{getStatusIcon(appointment.status)}</span>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>

                    <div className="flex items-center space-x-2">
                      {appointment.status === 'pending' && (
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-500 text-sm">
                          <Edit className="w-4 h-4" />
                          <span>Reschedule</span>
                        </button>
                      )}
                      
                      {canCancelAppointment(appointment) && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-500 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {appointment.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    This appointment was rejected. Please contact the doctor's office for more information or book a new appointment.
                  </p>
                </div>
              )}

              {appointment.status === 'confirmed' && new Date(appointment.date) > new Date() && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Your appointment is confirmed. Please arrive 15 minutes early and bring your ID and insurance card.
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No appointments yet' : `No ${statusFilter} appointments`}
            </h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all' 
                ? 'Start by booking your first appointment with a doctor'
                : `You don't have any ${statusFilter} appointments`
              }
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => window.location.href = '/patient/book'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Book Appointment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;