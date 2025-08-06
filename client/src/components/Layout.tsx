import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Calendar, Users, FileText, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard', icon: Calendar },
          { to: '/admin/doctors', label: 'Doctors', icon: Users },
          { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
          { to: '/admin/patients', label: 'Patients', icon: User },
          { to: '/admin/prescriptions', label: 'Prescriptions', icon: FileText }
        ];
      case 'doctor':
        return [
          { to: '/doctor', label: 'Dashboard', icon: Calendar },
          { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
          { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
          { to: '/doctor/availability', label: 'Availability', icon: Settings }
        ];
      case 'patient':
        return [
          { to: '/patient', label: 'Dashboard', icon: Calendar },
          { to: '/patient/book', label: 'Book Appointment', icon: Calendar },
          { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
          { to: '/patient/prescriptions', label: 'Prescriptions', icon: FileText }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">MedBook</span>
                </Link>
                
                <div className="hidden md:flex space-x-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;