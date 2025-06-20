const PayrollDetailBreakdown = ({ lateDays, earlyOutDays, leaves }) => (
  <div className='bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#2E86C1]'>
    <h3 className='text-xl font-semibold text-[#1C2833] mb-4'>Attendance Breakdown</h3>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <p className='text-sm text-gray-600'>Late Days</p>
        <p className='text-lg font-bold'>{lateDays}</p>
      </div>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <p className='text-sm text-gray-600'>Early Out Days</p>
        <p className='text-lg font-bold'>{earlyOutDays}</p>
      </div>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <p className='text-sm text-gray-600'>Leaves</p>
        <p className='text-lg font-bold'>{leaves}</p>
      </div>
    </div>
  </div>
);

export default PayrollDetailBreakdown;
