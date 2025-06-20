import React, { useState } from 'react';
import { X, Save, User, DollarSign, CreditCard, Calendar, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import BasicInfoForm from './BasicInfoForm';
import PayrollInfoForm from './PayrollInfoForm';
import BankDetailsForm from './BankDetailsForm';
import LeavePolicyForm from './LeavePolicyForm';

const TeacherForm = ({ isOpen, onClose, teacher, onSave, subjects }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [newTeacher, setNewTeacher] = useState({
    // Basic Info
    employeeId: teacher?.employeeId || '',
    name: teacher?.name || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    gender: teacher?.gender || 'male',
    dateOfBirth: teacher?.dateOfBirth || '',
    qualification: teacher?.qualification || '',
    guardianSpouse: teacher?.guardianSpouse || '',
    address: teacher?.address || '',
    subjects: teacher?.subjects || [],
    joiningDate: teacher?.joiningDate || '',
    status: teacher?.status || 'active',
    profileImage: teacher?.profileImage || '',
    
    // Payroll Info
    payrollInfo: {
      basicSalary: teacher?.payrollInfo?.basicSalary || 0,
      hra: teacher?.payrollInfo?.hra || 0,
      transportAllowance: teacher?.payrollInfo?.transportAllowance || 0,
      medicalAllowance: teacher?.payrollInfo?.medicalAllowance || 0,
      otherAllowances: teacher?.payrollInfo?.otherAllowances || 0,
      providentFund: teacher?.payrollInfo?.providentFund || 0,
      incomeTax: teacher?.payrollInfo?.incomeTax || 0,
      professionalTax: teacher?.payrollInfo?.professionalTax || 0,
      otherDeductions: teacher?.payrollInfo?.otherDeductions || 0,
      netSalary: teacher?.payrollInfo?.netSalary || 0,
      paymentMode: teacher?.payrollInfo?.paymentMode || 'bank_transfer',
      paymentFrequency: teacher?.payrollInfo?.paymentFrequency || 'monthly'
    },
    
    // Bank Details
    bankDetails: {
      bankName: teacher?.bankDetails?.bankName || '',
      accountNumber: teacher?.bankDetails?.accountNumber || '',
      iban: teacher?.bankDetails?.iban || '',
      branchName: teacher?.bankDetails?.branchName || '',
      branchCode: teacher?.bankDetails?.branchCode || '',
      accountHolderName: teacher?.bankDetails?.accountHolderName || '',
      accountType: teacher?.bankDetails?.accountType || 'current'
    },
    
    // Leave Policy
    leavePolicy: {
      annualLeave: teacher?.leavePolicy?.annualLeave || 21,
      sickLeave: teacher?.leavePolicy?.sickLeave || 14,
      casualLeave: teacher?.leavePolicy?.casualLeave || 7,
      maternityPaternityLeave: teacher?.leavePolicy?.maternityPaternityLeave || 90,
      emergencyLeave: teacher?.leavePolicy?.emergencyLeave || 3,
      religiousLeave: teacher?.leavePolicy?.religiousLeave || 5,
      studyLeave: teacher?.leavePolicy?.studyLeave || 15,
      carryForward: teacher?.leavePolicy?.carryForward || false,
      maxCarryForward: teacher?.leavePolicy?.maxCarryForward || 7
    }
  });

  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: User,
      component: BasicInfoForm
    },
    {
      id: 'payroll',
      title: 'Payroll Information',
      icon: DollarSign,
      component: PayrollInfoForm
    },
    {
      id: 'bank',
      title: 'Bank Details',
      icon: CreditCard,
      component: BankDetailsForm
    },
    {
      id: 'leave',
      title: 'Leave Policy',
      icon: Calendar,
      component: LeavePolicyForm
    }
  ];

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    switch (stepIndex) {
      case 0: // Basic Info
        if (!newTeacher.name.trim()) newErrors.name = 'Name is required';
        if (!newTeacher.email.trim()) newErrors.email = 'Email is required';
        if (!newTeacher.phone.trim()) newErrors.phone = 'Phone is required';
        if (!newTeacher.qualification.trim()) newErrors.qualification = 'Qualification is required';
        if (!newTeacher.joiningDate) newErrors.joiningDate = 'Joining date is required';
        if (newTeacher.subjects.length === 0) newErrors.subjects = 'At least one subject is required';
        break;
      
      case 1: // Payroll Info
        if (!newTeacher.payrollInfo.basicSalary || newTeacher.payrollInfo.basicSalary <= 0) {
          newErrors.basicSalary = 'Basic salary is required and must be greater than 0';
        }
        break;
      
      case 2: // Bank Details
        if (!newTeacher.bankDetails.bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!newTeacher.bankDetails.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
        if (!newTeacher.bankDetails.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
        break;
      
      case 3: // Leave Policy - Usually no validation needed as defaults are provided
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Calculate net salary
      const { payrollInfo } = newTeacher;
      const grossSalary = 
        Number(payrollInfo.basicSalary) + 
        Number(payrollInfo.hra) + 
        Number(payrollInfo.transportAllowance) + 
        Number(payrollInfo.medicalAllowance) + 
        Number(payrollInfo.otherAllowances);
      
      const totalDeductions = 
        Number(payrollInfo.providentFund) + 
        Number(payrollInfo.incomeTax) + 
        Number(payrollInfo.professionalTax) + 
        Number(payrollInfo.otherDeductions);
      
      const netSalary = grossSalary - totalDeductions;
      
      const finalTeacher = {
        ...newTeacher,
        payrollInfo: {
          ...payrollInfo,
          netSalary,
          grossSalary
        },
        id: teacher?.id || Date.now(),
        createdAt: teacher?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSave(finalTeacher);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewTeacher(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: finalValue
        }
      }));
    } else {
      setNewTeacher(prev => ({
        ...prev,
        [name]: finalValue
      }));
    }
  };

  const handleSelectChange = (selectedOptions) => {
    setNewTeacher(prev => ({
      ...prev,
      subjects: selectedOptions.map(option => option.value)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewTeacher(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {teacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <p className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      index <= currentStep
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          <CurrentStepComponent
            newTeacher={newTeacher}
            errors={errors}
            subjects={subjects}
            onImageChange={handleImageChange}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{teacher ? 'Update Teacher' : 'Add Teacher'}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;