import React, { useState } from 'react';
import { X, Calculator, DollarSign, Plus, Minus, Save } from 'lucide-react';

const PayrollCalculatorModal = ({ isOpen, onClose, teacher, onSave }) => {
  const [payrollData, setPayrollData] = useState({
    basicSalary: teacher?.payrollInfo?.basicSalary || 0,
    allowances: [
      { name: 'House Rent', amount: 0 },
      { name: 'Transport', amount: 0 },
      { name: 'Medical', amount: 0 },
      { name: 'Food', amount: 0 }
    ],
    deductions: [
      { name: 'Income Tax', amount: 0 },
      { name: 'Provident Fund', amount: 0 },
      { name: 'Insurance', amount: 0 },
      { name: 'Late Penalty', amount: 0 }
    ],
    overtime: {
      hours: 0,
      rate: 0
    },
    bonus: 0
  });

  const addAllowance = () => {
    setPayrollData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { name: '', amount: 0 }]
    }));
  };

  const addDeduction = () => {
    setPayrollData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { name: '', amount: 0 }]
    }));
  };

  const updateAllowance = (index, field, value) => {
    setPayrollData(prev => ({
      ...prev,
      allowances: prev.allowances.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateDeduction = (index, field, value) => {
    setPayrollData(prev => ({
      ...prev,
      deductions: prev.deductions.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeAllowance = (index) => {
    setPayrollData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index)
    }));
  };

  const removeDeduction = (index) => {
    setPayrollData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const totalAllowances = payrollData.allowances.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalDeductions = payrollData.deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const overtimeAmount = Number(payrollData.overtime.hours || 0) * Number(payrollData.overtime.rate || 0);
    const grossSalary = Number(payrollData.basicSalary || 0) + totalAllowances + overtimeAmount + Number(payrollData.bonus || 0);
    const netSalary = grossSalary - totalDeductions;

    return {
      totalAllowances,
      totalDeductions,
      overtimeAmount,
      grossSalary,
      netSalary
    };
  };

  const totals = calculateTotals();

  const handleSave = () => {
    onSave({
      ...payrollData,
      ...totals,
      calculatedAt: new Date().toISOString()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calculator className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Payroll Calculator</h2>
              <p className="text-sm text-gray-600">{teacher?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Input Section */}
            <div className="space-y-6">
              {/* Basic Salary */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Basic Salary
                </label>
                <input
                  type="number"
                  value={payrollData.basicSalary}
                  onChange={(e) => setPayrollData(prev => ({ ...prev, basicSalary: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter basic salary"
                />
              </div>

              {/* Allowances */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Allowances</h3>
                  <button
                    onClick={addAllowance}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {payrollData.allowances.map((allowance, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={allowance.name}
                        onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Allowance name"
                      />
                      <input
                        type="number"
                        value={allowance.amount}
                        onChange={(e) => updateAllowance(index, 'amount', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => removeAllowance(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Deductions</h3>
                  <button
                    onClick={addDeduction}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {payrollData.deductions.map((deduction, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={deduction.name}
                        onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Deduction name"
                      />
                      <input
                        type="number"
                        value={deduction.amount}
                        onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => removeDeduction(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overtime */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Overtime</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Hours</label>
                    <input
                      type="number"
                      value={payrollData.overtime.hours}
                      onChange={(e) => setPayrollData(prev => ({
                        ...prev,
                        overtime: { ...prev.overtime, hours: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Rate per hour</label>
                    <input
                      type="number"
                      value={payrollData.overtime.rate}
                      onChange={(e) => setPayrollData(prev => ({
                        ...prev,
                        overtime: { ...prev.overtime, rate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Bonus */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bonus</label>
                <input
                  type="number"
                  value={payrollData.bonus}
                  onChange={(e) => setPayrollData(prev => ({ ...prev, bonus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bonus amount"
                />
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Basic Salary:</span>
                  <span className="font-medium">PKR {Number(payrollData.basicSalary || 0).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Allowances:</span>
                  <span className="font-medium text-green-600">+PKR {totals.totalAllowances.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overtime:</span>
                  <span className="font-medium text-green-600">+PKR {totals.overtimeAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bonus:</span>
                  <span className="font-medium text-green-600">+PKR {Number(payrollData.bonus || 0).toLocaleString()}</span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Gross Salary:</span>
                  <span className="font-semibold text-lg">PKR {totals.grossSalary.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Deductions:</span>
                  <span className="font-medium text-red-600">-PKR {totals.totalDeductions.toLocaleString()}</span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md">
                  <span className="text-sm font-semibold text-blue-900">Net Salary:</span>
                  <span className="font-bold text-xl text-blue-900">PKR {totals.netSalary.toLocaleString()}</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Breakdown</h4>
                
                {payrollData.allowances.filter(a => a.name && a.amount > 0).length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Allowances:</p>
                    {payrollData.allowances.filter(a => a.name && a.amount > 0).map((allowance, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>{allowance.name}:</span>
                        <span>PKR {Number(allowance.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {payrollData.deductions.filter(d => d.name && d.amount > 0).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deductions:</p>
                    {payrollData.deductions.filter(d => d.name && d.amount > 0).map((deduction, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>{deduction.name}:</span>
                        <span>PKR {Number(deduction.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Calculation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollCalculatorModal;