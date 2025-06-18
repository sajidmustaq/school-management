import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useData } from '../../context/DataContext';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Users, UserCheck, Calendar, BookOpen, DollarSign } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { students, teachers, attendance, teacherAttendance, classes } = useData();
  const navigate = useNavigate();

  // Today's date
  const today = new Date().toISOString().split('T')[0];

  // Student Attendance calculation
  const todayStudentAttendance = attendance.filter((a) => a.date === today);
  const totalStudents = students.length || 1;
  const presentStudents = todayStudentAttendance.filter((a) => a.status === 'present').length;
  const studentAttendancePercentage = Math.round((presentStudents / totalStudents) * 100);

  // Teacher Attendance calculation
  const todayTeacherAttendance = teacherAttendance.filter((a) => a.date === today);
  const totalTeachers = teachers.length || 1;
  const presentTeachers = todayTeacherAttendance.filter((a) => a.status === 'present').length;
  const teacherAttendancePercentage = Math.round((presentTeachers / totalTeachers) * 100);

  // Class-wise attendance summary
  const classWiseAttendance = classes.map((cls) => {
    const classStudents = students.filter((s) => s.class === cls);
    const classAttendance = todayStudentAttendance.filter((a) =>
      classStudents.some((s) => s.id === a.studentId)
    );
    const classTotal = classStudents.length || 1;
    const classPresent = classAttendance.filter((a) => a.status === 'present').length;
    const classPercentage = Math.round((classPresent / classTotal) * 100);
    return {
      class: cls,
      total: classStudents.length,
      present: classPresent,
      percentage: classPercentage,
    };
  });

  // Bar chart data for class-wise attendance
  const barChartData = {
    labels: classWiseAttendance.map((c) => c.class),
    datasets: [
      {
        label: 'Present (%)',
        data: classWiseAttendance.map((c) => c.percentage),
        backgroundColor: '#2E86C1',
        borderColor: '#1C628F',
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data for overall student attendance
  const pieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [presentStudents, totalStudents - presentStudents],
        backgroundColor: ['#2E86C1', '#EF4444'],
        borderColor: ['#1C628F', '#B91C1C'],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Class-wise Attendance Today', color: '#1C2833' },
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage (%)' } },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Overall Student Attendance Today', color: '#1C2833' },
    },
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold text-[#2E86C1] mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
        <div
          onClick={() => navigate('/admin/students')}
          className="cursor-pointer bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#2E86C1] hover:bg-[#F0F8FF] transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm text-gray-600 mb-2">Total Students</h3>
            <p className="text-3xl font-semibold text-[#2E86C1]">{students.length}</p>
          </div>
          <Users className="text-[#2E86C1] size-10" />
        </div>
        
        <div
          onClick={() => navigate('/admin/teachers')}
          className="cursor-pointer bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#2E86C1] hover:bg-[#F0F8FF] transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm text-gray-600 mb-2">Total Teachers</h3>
            <p className="text-3xl font-semibold text-[#2E86C1]">{teachers.length}</p>
          </div>
          <UserCheck className="text-[#2E86C1] size-10" />
        </div>

        <div
          onClick={() => navigate('/admin/attendance')}
          className="cursor-pointer bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#2E86C1] hover:bg-[#F0F8FF] transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm text-gray-600 mb-2">Student Attendance</h3>
            <p className="text-3xl font-semibold text-[#2E86C1]">{studentAttendancePercentage}%</p>
          </div>
          <Calendar className="text-[#2E86C1] size-10" />
        </div>

        <div
          className="cursor-pointer bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#2E86C1] hover:bg-[#F0F8FF] transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm text-gray-600 mb-2">Teacher Attendance</h3>
            <p className="text-3xl font-semibold text-[#2E86C1]">{teacherAttendancePercentage}%</p>
          </div>
          <Calendar className="text-[#2E86C1] size-10" />
        </div>

  <div
  onClick={() => navigate('/admin/payroll')}
  className="cursor-pointer bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#2E86C1] hover:bg-[#F0F8FF] transition-colors flex items-center justify-between"
>
  <div>
    <h3 className="text-sm text-gray-600 mb-2">Payroll Management</h3>
    <p className="text-3xl font-semibold text-[#2E86C1]">{teachers.length > 0 ? 'Active' : 'N/A'}</p>
  </div>
  <DollarSign className="text-[#2E86C1] size-10" />
</div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#2E86C1]">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#2E86C1]">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>

      {/* Class-wise Attendance Summary */}
      <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#2E86C1] p-6">
        <h2 className="text-xl font-semibold text-[#1C2833] mb-4 flex items-center gap-2">
          <BookOpen size={24} /> Class-wise Attendance Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#2E86C1] text-white">
              <tr>
                <th className="p-3 border text-left">Class</th>
                <th className="p-3 border text-left">Total Students</th>
                <th className="p-3 border text-left">Present</th>
                <th className="p-3 border text-left">Attendance (%)</th>
              </tr>
            </thead>
            <tbody>
              {classWiseAttendance.map((cls, idx) => (
                <tr key={cls.class} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border">{cls.class}</td>
                  <td className="p-3 border">{cls.total}</td>
                  <td className="p-3 border">{cls.present}</td>
                  <td className="p-3 border">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      cls.percentage >= 80 ? 'bg-green-100 text-green-800' :
                      cls.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {cls.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
              {classWiseAttendance.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No attendance data available for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Students List */}
      <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#2E86C1] p-6 mt-6">
        <h2 className="text-xl font-semibold text-[#1C2833] mb-4 flex items-center gap-2">
          <Users size={24} /> Recently Added Students
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#AED6F1] text-[#1C2833]">
              <tr>
                <th className="p-3 border text-left">Name</th>
                <th className="p-3 border text-left">Guardian</th>
                <th className="p-3 border text-left">Class</th>
                <th className="p-3 border text-left">Roll No</th>
                <th className="p-3 border text-left">Admission Date</th>
              </tr>
            </thead>
            <tbody>
              {students
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 border">{student.name}</td>
                    <td className="p-3 border">{student.guardianName || 'N/A'}</td>
                    <td className="p-3 border">{student.class}</td>
                    <td className="p-3 border">{student.roll}</td>
                    <td className="p-3 border">
                      {new Date(student.admissionDate).toLocaleDateString('en-US')}
                    </td>
                  </tr>
                ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No students added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => navigate('/admin/students')}
          className="mt-4 bg-[#2E86C1] text-white px-4 py-2 rounded-lg hover:bg-[#1C628F] transition-colors"
        >
          View All Students
        </button>
      </div>
    </AdminLayout>
  );
}