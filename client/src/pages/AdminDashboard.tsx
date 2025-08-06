import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Users, Calendar, FileText, Stethoscope, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { doctors, appointments, prescriptions } = useApp();
  
  const activeApps = appointments.filter(app => app.status !== 'cancelled');
  const pendingApps = appointments.filter(app => app.status === 'pending');
  const todayApps = appointments.filter(app => 
    format(new Date(app.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const activeDoctors = doctors.filter(doc => doc.isActive);
  const totalPatients = new Set(appointments.map(app => app.patientId)).size;

  // Recent activity
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentPrescriptions = prescriptions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{activeDoctors.length}</p>
              <p className="text-sm text-gray-500">of {doctors.length} total</p>
            </div>
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
              <p className="text-sm text-gray-500">registered users</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{activeApps.length}</p>
              <p className="text-sm text-gray-500">{pendingApps.length} pending</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              <p className="text-sm text-gray-500">total issued</p>
            </div>
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Today's Activity</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{todayApps.length}</p>
              <p className="text-gray-600">Appointments Today</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{pendingApps.length}</p>
              <p className="text-gray-600">Pending Requests</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((activeApps.length / Math.max(doctors.length, 1)) * 10) / 10}
              </p>
              <p className="text-gray-600">Avg. Appointments/Doctor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
              <Link
                to="/admin/appointments"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-600">with {appointment.doctorName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.date), 'MMM dd')} at {appointment.time}
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
                <p className="text-gray-500">No recent appointments</p>
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
                to="/admin/prescriptions"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {recentPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{prescription.patientName}</h3>
                      <p className="text-sm text-gray-600">by {prescription.doctorName}</p>
                      <p className="text-sm text-gray-500">
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
                <p className="text-gray-500">No recent prescriptions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/admin/doctors"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Stethoscope className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Doctors</h3>
              <p className="text-sm text-gray-600">Add, edit, or view doctors</p>
            </div>
          </Link>

          <Link
            to="/admin/appointments"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">View Appointments</h3>
              <p className="text-sm text-gray-600">System-wide appointments</p>
            </div>
          </Link>

          <Link
            to="/admin/patients"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Patient Records</h3>
              <p className="text-sm text-gray-600">View patient information</p>
            </div>
          </Link>

          <Link
            to="/admin/prescriptions"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-teal-600" />
            <div>
              <h3 className="font-medium text-gray-900">Prescriptions</h3>
              <p className="text-sm text-gray-600">View all prescriptions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;