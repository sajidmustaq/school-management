import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, MapPin, GraduationCap, Calendar, 
  Users, Hash, CreditCard, Building, DollarSign, FileText,
  Edit2, Trash2, Download, Clock, CheckCircle
} from 'lucide-react';

const TeacherDetailModal = ({ isOpen, onClose, teacher, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('basic');

  if (!isOpen || !teacher) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'leave', label: 'Leave Policy', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="flex items-start space-x-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {teacher.profileImage ? (
            <img
              src={teacher.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{teacher.name}</h3>
          <p className="text-gray-600">{teacher.subjects?.join(', ')}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              teacher.status === 'active' ? 'bg-green-100 text-green-800' :
              teacher.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              teacher.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {teacher.status}
            </span>
            <span className="text-sm text-gray-500">ID: {teacher.employeeId}</span>
          </div>
        </div>
      </div>

      {/* Personal Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-sm text-gray-900">{teacher.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="text-sm text-gray-900">{teacher.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Gender</p>
              <p className="text-sm text-gray-900 capitalize">{teacher.gender}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Date of Birth</p>
              <p className="text-sm text-gray-900">{teacher.dateOfBirth || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Qualification</p>
              <p className="text-sm text-gray-900">{teacher.qualification}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Guardian/Spouse</p>
              <p className="text-sm text-gray-900">{teacher.guardianSpouse || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Joining Date</p>
              <p className="text-sm text-gray-900">{teacher.joiningDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start space-x-3">
        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-700">Address</p>
          <p className="text-sm text-gray-900">{teacher.address || 'Not provided'}</p>
        </div>
      </div>

      {/* Subjects */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Subjects Teaching</p>
        <div className="flex flex-wrap gap-2">
          {teacher.subjects?.map((subject, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPayrollInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Basic Salary</p>
            <p className="text-lg font-semibold text-gray-900">PKR {teacher.payrollInfo?.basicSalary?.toLocaleString() || '0'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">House Rent Allowance</p>
            <p className="text-sm text-gray-900">PKR {teacher.payrollInfo?.hra?.toLocaleString() || '0'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Transport Allowance</p>
            <p className="text-sm text-gray-900">PKR {teacher.payrollInfo?.transportAllowance?.toLocaleString() || '0'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Medical Allowance</p>
            <p className="text-sm text-gray-900">PKR {teacher.payrollInfo?.medicalAllowance?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Provident Fund</p>
            <p className="text-sm text-gray-900">{teacher.payrollInfo?.providentFund || '0'}%</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Income Tax</p>
            <p className="text-sm text-gray-900">PKR {teacher.payrollInfo?.incomeTax?.toLocaleString() || '0'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Professional Tax</p>
            <p className="text-sm text-gray-900">PKR {teacher.payrollInfo?.professionalTax?.toLocaleString() || '0'}</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-900">Net Salary</p>
            <p className="text-xl font-bold text-blue-900">PKR {teacher.payrollInfo?.netSalary?.toLocaleString() || '0'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Bank Name</p>
              <p className="text-sm text-gray-900">{teacher.bankDetails?.bankName || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Hash className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Account Number</p>
              <p className="text-sm text-gray-900 font-mono">{teacher.bankDetails?.accountNumber || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">IBAN</p>
              <p className="text-sm text-gray-900 font-mono">{teacher.bankDetails?.iban || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Branch Name</p>
            <p className="text-sm text-gray-900">{teacher.bankDetails?.branchName || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Branch Code</p>
            <p className="text-sm text-gray-900">{teacher.bankDetails?.branchCode || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Account Holder Name</p>
            <p className="text-sm text-gray-900">{teacher.bankDetails?.accountHolderName || teacher.name}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeavePolicy = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Annual Leave</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-900">{teacher.leavePolicy?.annualLeave || 0} days</p>
              <span className="text-xs text-gray-500">per year</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Sick Leave</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-900">{teacher.leavePolicy?.sickLeave || 0} days</p>
              <span className="text-xs text-gray-500">per year</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Casual Leave</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-900">{teacher.leavePolicy?.casualLeave || 0} days</p>
              <span className="text-xs text-gray-500">per year</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Maternity/Paternity Leave</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-900">{teacher.leavePolicy?.maternityPaternityLeave || 0} days</p>
              <span className="text-xs text-gray-500">per occurrence</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Emergency Leave</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-900">{teacher.leavePolicy?.emergencyLeave || 0} days</p>
              <span className="text-xs text-gray-500">per year</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Religious Leave</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-900">{teacher.leavePolicy?.religiousLeave || 0} days</p>
              <span className="text-xs text-gray-500">per year</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Study Leave</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-900">{teacher.leavePolicy?.studyLeave || 0} days</p>
              <span className="text-xs text-gray-500">per year</span>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-md">
            <p className="text-sm font-medium text-green-900">Total Leave Entitlement</p>
            <p className="text-lg font-semibold text-green-900">
              {(teacher.leavePolicy?.annualLeave || 0) + 
               (teacher.leavePolicy?.sickLeave || 0) + 
               (teacher.leavePolicy?.casualLeave || 0) + 
               (teacher.leavePolicy?.emergencyLeave || 0) + 
               (teacher.leavePolicy?.religiousLeave || 0) + 
               (teacher.leavePolicy?.studyLeave || 0)} days
            </p>
          </div>
        </div>
      </div>
      
      {/* Leave Balance */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Current Leave Balance</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Annual</p>
            <p className="text-lg font-semibold text-blue-600">{teacher.leaveBalance?.annual || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Sick</p>
            <p className="text-lg font-semibold text-green-600">{teacher.leaveBalance?.sick || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Casual</p>
            <p className="text-lg font-semibold text-yellow-600">{teacher.leaveBalance?.casual || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Emergency</p>
            <p className="text-lg font-semibold text-red-600">{teacher.leaveBalance?.emergency || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document list */}
        {[
          { name: 'Resume/CV', status: 'uploaded', date: '2024-01-15' },
          { name: 'Educational Certificates', status: 'uploaded', date: '2024-01-15' },
          { name: 'CNIC Copy', status: 'uploaded', date: '2024-01-15' },
          { name: 'Experience Letters', status: 'pending', date: null },
          { name: 'Medical Certificate', status: 'uploaded', date: '2024-01-20' },
          { name: 'Police Verification', status: 'pending', date: null }
        ].map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                {doc.date && (
                  <p className="text-xs text-gray-500">Uploaded: {doc.date}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {doc.status === 'uploaded' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${
                doc.status === 'uploaded' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {doc.status}
              </span>
              {doc.status === 'uploaded' && (
                <button className="p-1 text-blue-600 hover:text-blue-700">
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'payroll':
        return renderPayrollInfo();
      case 'bank':
        return renderBankDetails();
      case 'leave':
        return renderLeavePolicy();
      case 'documents':
        return renderDocuments();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Teacher Details</h2>
              <p className="text-sm text-gray-600">{teacher.name} - {teacher.employeeId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(teacher)}
              className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(teacher.id)}
              className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailModal;