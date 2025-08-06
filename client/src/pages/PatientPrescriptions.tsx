import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { FileText, Download, Calendar, User, Search } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const PatientPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const { prescriptions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const userPrescriptions = prescriptions.filter(presc => presc.patientId === user?.id);
  
  const filteredPrescriptions = userPrescriptions.filter(presc =>
    presc.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presc.medications.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPrescriptions = filteredPrescriptions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const downloadPrescriptionPDF = (prescription: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('PRESCRIPTION', 105, 20, { align: 'center' });
    
    // Patient Info
    doc.setFontSize(12);
    doc.text('Patient Information:', 20, 40);
    doc.text(`Name: ${prescription.patientName}`, 20, 50);
    doc.text(`Date: ${format(new Date(prescription.createdAt), 'MMMM dd, yyyy')}`, 20, 60);
    
    // Doctor Info
    doc.text('Prescribed by:', 20, 80);
    doc.text(`Dr. ${prescription.doctorName}`, 20, 90);
    
    // Medications
    doc.text('Medications:', 20, 110);
    
    const medications = prescription.medications.split('\n');
    let yPosition = 120;
    medications.forEach((med: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(med, 20, yPosition);
      yPosition += 10;
    });
    
    // Instructions
    if (prescription.instructions) {
      yPosition += 10;
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text('Instructions:', 20, yPosition);
      yPosition += 10;
      
      const instructions = prescription.instructions.split('\n');
      instructions.forEach((instruction: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(instruction, 20, yPosition);
        yPosition += 10;
      });
    }
    
    doc.save(`prescription-${prescription.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-600 mt-1">View and download your prescriptions</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search prescriptions by doctor or medication..."
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
                        Prescription from {prescription.doctorName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(prescription.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>For: {prescription.patientName}</span>
                        </div>
                      </div>
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

                    {prescription.instructions && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans">
                            {prescription.instructions}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-6">
                  <button
                    onClick={() => downloadPrescriptionPDF(prescription)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
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
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Your prescriptions will appear here after doctor visits'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPrescriptions;