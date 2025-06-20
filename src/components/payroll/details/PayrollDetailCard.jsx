const PayrollDetailCard = ({ salary, deductions, netPay }) => (
  <div className='bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#2E86C1]'>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <p className='text-sm text-gray-600'>Monthly Salary</p>
        <p className='text-2xl font-bold text-[#2E86C1]'>{salary} PKR</p>
      </div>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <p className='text-sm text-gray-600'>Deductions</p>
        <p className='text-2xl font-bold text-red-600'>{deductions} PKR</p>
      </div>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <p className='text-sm text-gray-600'>Net Pay</p>
        <p className='text-2xl font-bold text-green-600'>{netPay} PKR</p>
      </div>
    </div>
  </div>
);

export default PayrollDetailCard;
