import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Calendar, Clock, User, FileText, Plus, Bell } from 'lucide-react';
import { format } from 'date-fns';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { appointments, prescriptions } = useApp();
  
  const userAppointments = appointments.filter(app => app.patientId === user?.id);
  const upcomingAppointments = userAppointments
    .filter(app => new Date(app.date) >= new Date() && app.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  const userPrescriptions = prescriptions
    .filter(presc => presc.patientId === user?.id)
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and health records</p>
        </div>
        <Link
          to="/patient/book"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{userAppointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {userAppointments.filter(app => app.status === 'confirmed').length}
              </p>
            </div>
            <User className="w-8 h-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{userPrescriptions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link
                to="/patient/appointments"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                      </p>
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
                <p className="text-gray-500">No upcoming appointments</p>
                <Link
                  to="/patient/book"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium mt-2 inline-block"
                >
                  Book your first appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h2>
              <Link
                to="/patient/prescriptions"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {userPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {userPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{prescription.doctorName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {prescription.medications.length > 50 
                          ? prescription.medications.substring(0, 50) + '...' 
                          : prescription.medications}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No prescriptions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/patient/book"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Book Appointment</h3>
              <p className="text-sm text-gray-600">Schedule with a doctor</p>
            </div>
          </Link>

          <Link
            to="/patient/appointments"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">My Appointments</h3>
              <p className="text-sm text-gray-600">View and manage</p>
            </div>
          </Link>

          <Link
            to="/patient/prescriptions"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Prescriptions</h3>
              <p className="text-sm text-gray-600">Download and view</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;