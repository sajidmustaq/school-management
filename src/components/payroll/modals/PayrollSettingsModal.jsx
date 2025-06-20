import React from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';

const PayrollSettingsModal = ({ settings, setSettings, onClose }) => {
  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onClose();
    Swal.fire({
      icon: 'success',
      title: 'Settings Saved',
      text: 'Payroll settings updated successfully!',
      confirmButtonColor: '#2E86C1',
    });
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-gray-800'>Payroll Settings</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* FORM GRID */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Company Info */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Company Info</h3>
            <div className='space-y-3'>
              <input
                type='text'
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder='Company Name'
                className='w-full border p-2 rounded'
              />
              <input
                type='text'
                value={settings.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                placeholder='Address'
                className='w-full border p-2 rounded'
              />
              <input
                type='text'
                value={settings.companyPhone}
                onChange={(e) => handleChange('companyPhone', e.target.value)}
                placeholder='Phone'
                className='w-full border p-2 rounded'
              />
              <input
                type='email'
                value={settings.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                placeholder='Email'
                className='w-full border p-2 rounded'
              />
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Working Hours</h3>
            <div className='space-y-3'>
              <input
                type='number'
                value={settings.workingHours}
                onChange={(e) => handleChange('workingHours', parseInt(e.target.value))}
                placeholder='Working Hours'
                className='w-full border p-2 rounded'
              />
              <input
                type='time'
                value={settings.standardInTime}
                onChange={(e) => handleChange('standardInTime', e.target.value)}
                className='w-full border p-2 rounded'
              />
              <input
                type='time'
                value={settings.standardOutTime}
                onChange={(e) => handleChange('standardOutTime', e.target.value)}
                className='w-full border p-2 rounded'
              />
              <input
                type='number'
                value={settings.lateArrivalGrace}
                onChange={(e) => handleChange('lateArrivalGrace', parseInt(e.target.value))}
                placeholder='Late Grace (min)'
                className='w-full border p-2 rounded'
              />
            </div>
          </div>

          {/* Allowances */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Allowances</h3>
            <div className='space-y-3'>
              <input
                type='number'
                value={settings.transportAllowance}
                onChange={(e) => handleChange('transportAllowance', parseInt(e.target.value))}
                placeholder='Transport Allowance'
                className='w-full border p-2 rounded'
              />
              <input
                type='number'
                value={settings.medicalAllowance}
                onChange={(e) => handleChange('medicalAllowance', parseInt(e.target.value))}
                placeholder='Medical Allowance'
                className='w-full border p-2 rounded'
              />
              <input
                type='number'
                value={settings.houseRentAllowance}
                onChange={(e) => handleChange('houseRentAllowance', parseInt(e.target.value))}
                placeholder='House Rent %'
                className='w-full border p-2 rounded'
              />
              <input
                type='number'
                value={settings.basicSalaryPercentage}
                onChange={(e) => handleChange('basicSalaryPercentage', parseInt(e.target.value))}
                placeholder='Basic Salary %'
                className='w-full border p-2 rounded'
              />
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Deductions</h3>
            <div className='space-y-3'>
              <input
                type='number'
                value={settings.providentFund}
                onChange={(e) => handleChange('providentFund', parseFloat(e.target.value))}
                placeholder='Provident Fund %'
                className='w-full border p-2 rounded'
              />
              <input
                type='number'
                value={settings.professionalTax}
                onChange={(e) => handleChange('professionalTax', parseInt(e.target.value))}
                placeholder='Professional Tax'
                className='w-full border p-2 rounded'
              />
              <input
                type='number'
                value={settings.esi}
                onChange={(e) => handleChange('esi', parseFloat(e.target.value))}
                placeholder='ESI %'
                className='w-full border p-2 rounded'
              />
              <input
                type='number'
                value={settings.lateDeductionAfter}
                onChange={(e) => handleChange('lateDeductionAfter', parseInt(e.target.value))}
                placeholder='Late Deduction After'
                className='w-full border p-2 rounded'
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3 mt-6'>
          <button
            onClick={onClose}
            className='px-5 py-2 border rounded text-gray-600 hover:bg-gray-100'>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollSettingsModal;
