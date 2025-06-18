import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function StudentDashboard() {
  const { user } = useAuth(); // Logged-in user
  const { students, attendance } = useData();

  const student = students.find((s) => s.name === user?.email); // For testing, match with email or name
  const studentAttendance = attendance.filter(
    (a) => a.studentId === student?.id
  );

  const presentCount = studentAttendance.filter((a) => a.status === 'present').length;
  const total = studentAttendance.length || 1;
  const percentage = Math.round((presentCount / total) * 100);

  return (
    <div className="p-6 bg-[#F8F9F9] min-h-screen">
      <h2 className="text-2xl font-bold text-[#2E86C1] mb-6">My Dashboard</h2>
      <div className="bg-white p-4 rounded shadow border-l-4 border-[#2E86C1]">
        <p><strong>Name:</strong> {student?.name || 'N/A'}</p>
        <p><strong>Class:</strong> {student?.class || 'N/A'}</p>
        <p><strong>Roll No:</strong> {student?.roll || 'N/A'}</p>
        <p className="mt-4"><strong>Attendance:</strong> {percentage}%</p>
      </div>
    </div>
  );
}
