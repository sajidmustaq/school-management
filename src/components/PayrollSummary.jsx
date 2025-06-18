import React from 'react';

export default function PayrollSummary({ teacher, payroll }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Teacher Name</p>
        <p className="text-lg font-bold">{teacher.name}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Monthly Salary</p>
        <p className="text-lg font-bold">{payroll.salary || 0} PKR</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Deductions</p>
        <p className="text-lg font-bold text-red-600">{payroll.deductions || 0} PKR</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Net Pay</p>
        <p className="text-lg font-bold text-green-600">{payroll.netPay || 0} PKR</p>
      </div>
    </div>
  );
}