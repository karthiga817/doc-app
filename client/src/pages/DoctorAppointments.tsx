import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Calendar, Clock, User, CheckCircle, XCircle, Filter, MessageCircle } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const { appointments, updateAppointment } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');

  const doctorAppointments = appointments.filter(app => app.doctorId === user?.id);
  
  const filteredAppointments = statusFilter === 'all' 
    ? doctorAppointments 
    : doctorAppointments.filter(app => app.status === statusFilter);

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare === 0) {
      return a.time.localeCompare(b.time);
    }
    return dateCompare;
  });

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

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    return format(appointmentDate, 'MMM dd, yyyy');
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'confirmed' }).then(success => {
      if (!success) {
        alert('Failed to confirm appointment. Please try again.');
      }
    });
  };

  const handleRejectAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to reject this appointment?')) {
      updateAppointment(appointmentId, { status: 'rejected' }).then(success => {
        if (!success) {
          alert('Failed to reject appointment. Please try again.');
        }
      });
    }
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'completed' }).then(success => {
      if (!success) {
        alert('Failed to complete appointment. Please try again.');
      }
    });
  };

  const statusCounts = {
    all: doctorAppointments.length,
    pending: doctorAppointments.filter(app => app.status === 'pending').length,
    confirmed: doctorAppointments.filter(app => app.status === 'confirmed').length,
    completed: doctorAppointments.filter(app => app.status === 'completed').length,
    cancelled: doctorAppointments.filter(app => app.status === 'cancelled').length,
    rejected: doctorAppointments.filter(app => app.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-1">Manage patient appointments and requests</p>
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
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                      <p className="text-gray-600">Patient</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{getDateLabel(appointment.date)}</span>
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
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>

                    <div className="flex items-center space-x-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmAppointment(appointment.id)}
                            className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleRejectAppointment(appointment.id)}
                            className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && new Date(appointment.date) <= new Date() && (
                        <button
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Complete</span>
                        </button>
                      )}

                      {appointment.status === 'completed' && (
                        <button
                          onClick={() => window.location.href = `/doctor/prescriptions?appointment=${appointment.id}`}
                          className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Add Prescription</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Based on Status */}
              {appointment.status === 'pending' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    This appointment is waiting for your confirmation. Please review and respond.
                  </p>
                </div>
              )}

              {appointment.status === 'confirmed' && isToday(new Date(appointment.date)) && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    This appointment is scheduled for today. The patient has been notified.
                  </p>
                </div>
              )}

              {appointment.status === 'completed' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Appointment completed. You can now add a prescription if needed.
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
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'Your appointments will appear here when patients book with you'
                : `You don't have any ${statusFilter} appointments`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;