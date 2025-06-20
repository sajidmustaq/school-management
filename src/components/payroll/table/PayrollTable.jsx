import React from 'react';
import { Eye, Download, Mail } from 'lucide-react';

const PayrollTable = ({ data, onView, onDownload, onEmail, sortBy, sortOrder, setSortBy, setSortOrder }) => {
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className='bg-white rounded shadow overflow-x-auto'>
      <table className='min-w-full text-sm'>
        <thead className='bg-gray-100 text-left'>
          <tr>
            <th
              className='p-3 cursor-pointer'
              onClick={() => handleSort('name')}>
              Name
            </th>
            <th
              className='p-3 cursor-pointer'
              onClick={() => handleSort('employeeId')}>
              ID
            </th>
            <th className='p-3'>Department</th>
            <th className='p-3'>Net Pay</th>
            <th className='p-3'>Attendance %</th>
            <th className='p-3 text-center'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className='text-center p-4 text-gray-500'>
                No records found.
              </td>
            </tr>
          ) : (
            data.map((employee) => (
              <tr
                key={employee.id}
                className='border-t hover:bg-gray-50'>
                <td className='p-3 font-medium'>{employee.name}</td>
                <td className='p-3'>{employee.employeeId}</td>
                <td className='p-3'>{employee.department}</td>
                <td className='p-3 font-semibold text-green-600'>Rs. {employee.netPay.toLocaleString()}</td>
                <td className='p-3'>{employee.attendancePercentage}%</td>
                <td className='p-3 flex gap-2 justify-center'>
                  <button
                    onClick={() => onView(employee)}
                    className='bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs hover:bg-indigo-200 flex items-center gap-1'>
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => onDownload(employee)}
                    className='bg-green-100 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-200 flex items-center gap-1'>
                    <Download size={14} /> PDF
                  </button>
                  <button
                    onClick={() => onEmail(employee)}
                    className='bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs hover:bg-yellow-200 flex items-center gap-1'>
                    <Mail size={14} /> Email
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollTable;
