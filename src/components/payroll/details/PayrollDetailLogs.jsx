const PayrollDetailLogs = ({ lateDetails, earlyOutDetails, leaveDetails }) => (
  <div className='bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#2E86C1]'>
    <h3 className='text-xl font-semibold text-[#1C2833] mb-4'>Detailed Logs</h3>

    {lateDetails.length > 0 && (
      <div className='mb-4'>
        <h4 className='font-semibold text-[#1C2833]'>Late Entries</h4>
        <ul className='list-disc pl-5'>
          {lateDetails.map((d, idx) => (
            <li key={idx}>{`${d.date} - ${d.inTime}`}</li>
          ))}
        </ul>
      </div>
    )}

    {earlyOutDetails.length > 0 && (
      <div className='mb-4'>
        <h4 className='font-semibold text-[#1C2833]'>Early Out Entries</h4>
        <ul className='list-disc pl-5'>
          {earlyOutDetails.map((d, idx) => (
            <li key={idx}>{`${d.date} - ${d.outTime}`}</li>
          ))}
        </ul>
      </div>
    )}

    {leaveDetails.length > 0 && (
      <div>
        <h4 className='font-semibold text-[#1C2833]'>Leave Dates</h4>
        <ul className='list-disc pl-5'>
          {leaveDetails.map((d, idx) => (
            <li key={idx}>{d.date}</li>
          ))}
        </ul>
      </div>
    )}

    {lateDetails.length === 0 && earlyOutDetails.length === 0 && leaveDetails.length === 0 && (
      <p className='text-gray-500'>No attendance issues recorded this month.</p>
    )}
  </div>
);

export default PayrollDetailLogs;
