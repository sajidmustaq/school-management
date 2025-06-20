import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PayrollAnalytics = ({ payrollData, onClose }) => {
  if (!payrollData || payrollData.length === 0) return null;

  const totalPay = payrollData.reduce((sum, emp) => sum + emp.netPay, 0);
  const avgPay = (totalPay / payrollData.length).toFixed(2);
  const avgAttendance = (
    payrollData.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / payrollData.length
  ).toFixed(1);

  const chartData = payrollData.map((emp) => ({
    name: emp.name,
    netPay: emp.netPay,
    attendance: emp.attendancePercentage,
  }));

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold text-gray-800'>Payroll Analytics</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 text-sm'>
            Close
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center'>
          <div className='bg-blue-100 p-4 rounded'>
            <h4 className='text-gray-600 text-sm'>Total Net Pay</h4>
            <p className='text-xl font-bold text-blue-700'>Rs. {totalPay.toLocaleString()}</p>
          </div>
          <div className='bg-green-100 p-4 rounded'>
            <h4 className='text-gray-600 text-sm'>Average Net Pay</h4>
            <p className='text-xl font-bold text-green-700'>Rs. {avgPay}</p>
          </div>
          <div className='bg-yellow-100 p-4 rounded'>
            <h4 className='text-gray-600 text-sm'>Average Attendance</h4>
            <p className='text-xl font-bold text-yellow-700'>{avgAttendance}%</p>
          </div>
        </div>

        {/* Chart */}
        <div className='bg-gray-50 p-4 rounded'>
          <h3 className='text-md font-semibold text-gray-700 mb-3'>Net Pay by Employee</h3>
          <ResponsiveContainer
            width='100%'
            height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey='netPay'
                fill='#4F46E5'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PayrollAnalytics;
