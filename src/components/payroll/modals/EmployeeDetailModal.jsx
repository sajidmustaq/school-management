import React from 'react';
import { X } from 'lucide-react';

const EmployeeDetailModal = ({ employee, onClose }) => {
  if (!employee) return null;

  const {
    name,
    employeeId,
    department,
    presentDays,
    workingDays,
    basicSalary,
    houseRent,
    medicalAllowance,
    transportAllowance,
    grossSalary,
    professionalTax,
    providentFund,
    esi,
    incomeTax,
    netPay,
  } = employee;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg relative'>
        {/* Header */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold text-gray-800'>Payslip Detail - {name}</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Employee Info */}
        <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
          <div>
            <strong>Employee ID:</strong> {employeeId}
          </div>
          <div>
            <strong>Department:</strong> {department}
          </div>
          <div>
            <strong>Present Days:</strong> {presentDays} / {workingDays}
          </div>
        </div>

        {/* Salary Table */}
        <div className='overflow-x-auto mb-4'>
          <table className='w-full text-sm border'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='text-left p-2'>Component</th>
                <th className='text-right p-2'>Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='p-2'>Basic Salary</td>
                <td className='p-2 text-right'>{basicSalary}</td>
              </tr>
              <tr>
                <td className='p-2'>House Rent</td>
                <td className='p-2 text-right'>{houseRent}</td>
              </tr>
              <tr>
                <td className='p-2'>Medical Allowance</td>
                <td className='p-2 text-right'>{medicalAllowance}</td>
              </tr>
              <tr>
                <td className='p-2'>Transport Allowance</td>
                <td className='p-2 text-right'>{transportAllowance}</td>
              </tr>
              <tr className='font-bold bg-gray-50'>
                <td className='p-2'>Gross Salary</td>
                <td className='p-2 text-right'>{grossSalary}</td>
              </tr>
              <tr>
                <td className='p-2'>Provident Fund</td>
                <td className='p-2 text-right'>- {providentFund}</td>
              </tr>
              <tr>
                <td className='p-2'>Professional Tax</td>
                <td className='p-2 text-right'>- {professionalTax}</td>
              </tr>
              <tr>
                <td className='p-2'>ESI</td>
                <td className='p-2 text-right'>- {esi}</td>
              </tr>
              <tr>
                <td className='p-2'>Income Tax</td>
                <td className='p-2 text-right'>- {incomeTax}</td>
              </tr>
              <tr className='font-bold bg-gray-50'>
                <td className='p-2'>Net Pay</td>
                <td className='p-2 text-right text-green-600'>{netPay}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Close Button */}
        <div className='text-right'>
          <button
            onClick={onClose}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm'>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
