import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { appointments, prescriptions } = useApp();
  
  const doctorAppointments = appointments.filter(app => app.doctorId === user?.id);
  
  const pendingAppointments = doctorAppointments.filter(app => app.status === 'pending');
  const todayAppointments = doctorAppointments.filter(app => 
    isToday(new Date(app.date)) && app.status === 'confirmed'
  );
  const tomorrowAppointments = doctorAppointments.filter(app => 
    isTomorrow(new Date(app.date)) && app.status === 'confirmed'
  );
  
  const doctorPrescriptions = prescriptions.filter(presc => presc.doctorId === user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    return format(appointmentDate, 'MMM dd');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and patient care</p>
        </div>
        <Link
          to="/doctor/appointments"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Calendar className="w-5 h-5" />
          <span>View All Appointments</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingAppointments.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{doctorAppointments.length}</p>
            </div>
            <User className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{doctorPrescriptions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Appointment Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Pending Requests</h2>
              <Link
                to="/doctor/appointments"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {pendingAppointments.length > 0 ? (
              <div className="space-y-4">
                {pendingAppointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                      <p className="text-sm text-gray-500">
                        {getDateLabel(appointment.date)} at {appointment.time}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending appointment requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
              <Link
                to="/doctor/appointments"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                      <p className="text-sm text-blue-600 font-medium">{appointment.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tomorrow's Preview */}
      {tomorrowAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Tomorrow's Schedule Preview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tomorrowAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{appointment.reason}</p>
                  <p className="text-sm text-green-600 font-medium mt-2">{appointment.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/doctor/appointments"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Appointments</h3>
              <p className="text-sm text-gray-600">Review and respond to requests</p>
            </div>
          </Link>

          <Link
            to="/doctor/prescriptions"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Prescriptions</h3>
              <p className="text-sm text-gray-600">Create and manage prescriptions</p>
            </div>
          </Link>

          <Link
            to="/doctor/availability"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Set Availability</h3>
              <p className="text-sm text-gray-600">Update schedule and leave days</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;