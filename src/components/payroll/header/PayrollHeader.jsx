import React from 'react';
import { Calendar, Filter, Search, Settings, BarChart3, Download } from 'lucide-react';

const PayrollHeader = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  onProcess,
  onExport,
  onDownload,
  onShowSettings,
  onShowAnalytics,
}) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className='bg-white p-4 rounded shadow mb-4 flex flex-wrap gap-4 items-center justify-between'>
      <div className='flex gap-2 flex-wrap'>
        {/* Month Select */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className='border px-3 py-2 rounded-md text-sm'>
          {months.map((month, index) => (
            <option
              key={index}
              value={index}>
              {month}
            </option>
          ))}
        </select>

        {/* Year Select */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className='border px-3 py-2 rounded-md text-sm'>
          {years.map((year) => (
            <option
              key={year}
              value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className='border px-3 py-2 rounded-md text-sm'>
          <option value='all'>All</option>
          <option value='permanent'>Permanent</option>
          <option value='probationary'>Probationary</option>
        </select>

        {/* Search Input */}
        <div className='relative'>
          <input
            type='text'
            placeholder='Search employee...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='border px-10 py-2 rounded-md text-sm w-64'
          />
          <Search className='absolute left-2 top-2.5 w-4 h-4 text-gray-400' />
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2 flex-wrap'>
        <button
          onClick={onProcess}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm'>
          Process Payroll
        </button>
        <button
          onClick={onExport}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm'>
          Export Excel
        </button>
        <button
          onClick={onDownload}
          className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm'>
          Download All
        </button>
        <button
          onClick={onShowAnalytics}
          className='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm'>
          <BarChart3 className='inline w-4 h-4 mr-1' /> Analytics
        </button>
        <button
          onClick={onShowSettings}
          className='bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm'>
          <Settings className='inline w-4 h-4 mr-1' /> Settings
        </button>
      </div>
    </div>
  );
};

export default PayrollHeader;
