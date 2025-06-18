import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';

export default function AttendanceLog({ teacherId }) {
  const { attendance, updateAttendance } = useData();
  const [log, setLog] = useState({});

  useEffect(() => {
    // Simulate attendance data (replace with actual data from backend)
    const sampleData = {
      [teacherId]: {
        '2025-06-01': { inTime: '09:00', outTime: '17:00', status: 'present' },
        '2025-06-02': { inTime: '09:10', outTime: '16:59', status: 'present' },
        // Add more sample data as needed
      },
    };
    setLog(sampleData[teacherId] || {});
  }, [teacherId]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Attendance Log</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#2E86C1] text-white">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">In Time</th>
            <th className="p-2 border">Out Time</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(log).map(([date, data]) => (
            <tr key={date} className="hover:bg-gray-50">
              <td className="p-2 border">{date}</td>
              <td className="p-2 border">{data.inTime}</td>
              <td className="p-2 border">{data.outTime}</td>
              <td className="p-2 border">{data.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}