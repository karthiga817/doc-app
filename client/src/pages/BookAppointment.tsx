import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Search, Filter, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { format, addDays, isWeekend } from 'date-fns';

const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const { doctors, addAppointment } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const specializations = Array.from(new Set(doctors.map(doc => doc.specialization)));

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization && doctor.isActive;
  });

  const getAvailableDates = (doctor: any) => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      const dayName = format(date, 'EEEE');
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Check if doctor is available on this day and not on leave
      const isAvailable = doctor.availability.some((slot: any) => slot.day === dayName);
      const isOnLeave = doctor.leaveDays.includes(dateString);
      
      if (isAvailable && !isOnLeave && !isWeekend(date)) {
        dates.push(dateString);
      }
    }
    
    return dates;
  };

  const getAvailableTimes = (doctor: any, date: string) => {
    const dayName = format(new Date(date), 'EEEE');
    const daySlot = doctor.availability.find((slot: any) => slot.day === dayName);
    
    if (!daySlot) return [];
    
    const times = [];
    const start = parseInt(daySlot.startTime.split(':')[0]);
    const end = parseInt(daySlot.endTime.split(':')[0]);
    
    for (let hour = start; hour < end; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour + 1 < end) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return times;
  };

  const handleBookAppointment = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowBookingForm(true);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
  };

  const handleSubmitBooking = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason.trim()) {
      alert('Please fill in all fields');
      return;
    }

    addAppointment({
      patientId: user!.id,
      doctorId: selectedDoctor.id,
      date: selectedDate,
      time: selectedTime,
      status: 'pending' as const,
      reason: reason
    }).then(success => {
      if (success) {
        navigate('/patient/appointments');
      } else {
        alert('Failed to book appointment. Please try again.');
      }
    });
  };

  if (showBookingForm) {
    const availableDates = getAvailableDates(selectedDoctor);
    const availableTimes = selectedDate ? getAvailableTimes(selectedDoctor, selectedDate) : [];

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowBookingForm(false)}
            className="text-blue-600 hover:text-blue-500 mb-4"
          >
            ← Back to Doctors
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-1">Schedule with {selectedDoctor.name}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedDoctor.name}</h2>
              <p className="text-gray-600">{selectedDoctor.specialization}</p>
              <p className="text-sm text-gray-500">{selectedDoctor.experience} years experience</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableDates.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedDate === date
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {format(new Date(date), 'MMM dd')}
                    <br />
                    <span className="text-xs opacity-75">
                      {format(new Date(date), 'EEEE')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please describe the reason for your appointment..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowBookingForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBooking}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600 mt-1">Find and book with available doctors</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                <p className="text-gray-600">{doctor.specialization}</p>
                <p className="text-sm text-gray-500">{doctor.experience} years experience</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Available days: {doctor.availability.map((slot: any) => slot.day).join(', ')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {doctor.availability.length > 0 && `${doctor.availability[0].startTime} - ${doctor.availability[0].endTime}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleBookAppointment(doctor)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;