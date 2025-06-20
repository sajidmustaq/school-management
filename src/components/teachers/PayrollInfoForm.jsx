import React from 'react';
import { DollarSign, Clock, Calendar, TrendingUp, Plus, Minus } from 'lucide-react';

const PayrollInfoForm = ({ newTeacher, errors, onChange }) => {
  const handleAllowanceChange = (type, value) => {
    onChange({
      target: {
        name: `allowances.${type}`,
        value: parseFloat(value) || 0
      }
    });
  };

  const handleDeductionChange = (type, value) => {
    onChange({
      target: {
        name: `deductions.${type}`,
        value: parseFloat(value) || 0
      }
    });
  };

  const handleBonusChange = (type, value) => {
    onChange({
      target: {
        name: `bonusPolicy.${type}`,
        value: parseFloat(value) || 0
      }
    });
  };

  const handleLatePolicyChange = (field, value) => {
    onChange({
      target: {
        name: `latePolicy.${field}`,
        value: field === 'graceMinutes' || field === 'maxLateMinutesPerMonth' ? parseInt(value) || 0 : parseFloat(value) || 0
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Basic Salary Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Basic Salary Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Basic Salary *
            </label>
            <input
              type="number"
              name="basicSalary"
              value={newTeacher.basicSalary}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.salary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter basic salary"
            />
            {errors.salary && (
              <p className="text-red-500 text-xs mt-1">{errors.salary}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate
            </label>
            <input
              type="number"
              name="hourlyRate"
              value={newTeacher.hourlyRate}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Auto-calculated"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overtime Rate Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              name="overtimeRate"
              value={newTeacher.overtimeRate}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.5"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Working Hours
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duty Start Time
            </label>
            <input
              type="time"
              name="dutyStartTime"
              value={newTeacher.dutyStartTime}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duty End Time
            </label>
            <input
              type="time"
              name="dutyEndTime"
              value={newTeacher.dutyEndTime}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Days per Week
            </label>
            <select
              name="workingDays"
              value={newTeacher.workingDays}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <option key={day} value={day}>{day} days</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Allowances */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Allowances
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(newTeacher.allowances || {}).map(([type, value]) => (
            <div key={type}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {type.replace(/([A-Z])/g, ' $1').trim()} Allowance
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleAllowanceChange(type, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Deductions */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Minus className="w-5 h-5 mr-2" />
          Deductions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(newTeacher.deductions || {}).map(([type, value]) => (
            <div key={type}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {type === 'providentFund' ? 'Provident Fund' : type.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleDeductionChange(type, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bonus Policy */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Bonus Policy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(newTeacher.bonusPolicy || {}).map(([type, value]) => (
            <div key={type}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleBonusChange(type, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Late Policy */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Late Policy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grace Minutes
            </label>
            <input
              type="number"
              value={newTeacher.latePolicy?.graceMinutes || 0}
              onChange={(e) => handleLatePolicyChange('graceMinutes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deduction per Minute
            </label>
            <input
              type="number"
              step="0.01"
              value={newTeacher.latePolicy?.deductionPerMinute || 0}
              onChange={(e) => handleLatePolicyChange('deductionPerMinute', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Late Minutes/Month
            </label>
            <input
              type="number"
              value={newTeacher.latePolicy?.maxLateMinutesPerMonth || 0}
              onChange={(e) => handleLatePolicyChange('maxLateMinutesPerMonth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="120"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollInfoForm;