import React from 'react';
import { CreditCard, Building, Hash, User } from 'lucide-react';

const BankDetailsForm = ({ newTeacher, onChange }) => {
  const handleBankDetailsChange = (field, value) => {
    onChange({
      target: {
        name: `bankDetails.${field}`,
        value: value
      }
    });
  };

  const popularBanks = [
    'Allied Bank Limited',
    'Bank Alfalah Limited',
    'Bank Al Habib Limited',
    'Faysal Bank Limited',
    'Habib Bank Limited',
    'Habib Metropolitan Bank',
    'JS Bank Limited',
    'MCB Bank Limited',
    'Meezan Bank Limited',
    'National Bank of Pakistan',
    'Standard Chartered Bank',
    'Summit Bank Limited',
    'United Bank Limited',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Bank Account Details</h3>
        <p className="text-sm text-gray-600">
          Enter bank details for salary transfers and payments
        </p>
      </div>

      {/* Bank Details Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Account Title */}
          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 mr-2" />
              Account Title *
            </label>
            <input
              type="text"
              value={newTeacher.bankDetails?.accountTitle || ''}
              onChange={(e) => handleBankDetailsChange('accountTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account holder name (as per bank record)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must match exactly as shown on bank statement
            </p>
          </div>

          {/* Account Number */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 mr-2" />
              Account Number *
            </label>
            <input
              type="text"
              value={newTeacher.bankDetails?.accountNumber || ''}
              onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account number"
            />
          </div>

          {/* Branch Code */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Branch Code
            </label>
            <input
              type="text"
              value={newTeacher.bankDetails?.branchCode || ''}
              onChange={(e) => handleBankDetailsChange('branchCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 0123"
            />
          </div>

          {/* Bank Name */}
          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 mr-2" />
              Bank Name *
            </label>
            <select
              value={newTeacher.bankDetails?.bankName || ''}
              onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a bank</option>
              {popularBanks.map((bank, index) => (
                <option key={index} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsForm;
