import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useData } from '../../context/DataContext';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function PayrollDetails() {
  const { teachers, attendance } = useData();
  const { teacherId } = useParams();
  const [payrollDetail, setPayrollDetail] = useState(null);

  useEffect(() => {
    const teacher = teachers.find((t) => t.id === parseInt(teacherId));
    if (!teacher) {
      Swal.fire({
        icon: 'error',
        title: 'Teacher Not Found',
        text: 'Please select a valid teacher',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    const calculatePayrollDetail = () => {
      const monthlySalary = parseInt(teacher.salary || 0);
      let deductions = 0;
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const dailyRate = monthlySalary / daysInMonth;

      const teacherAttendance = attendance[teacher.id] || {};
      const attendanceDates = Object.keys(teacherAttendance);
      let lateDays = 0;
      let earlyOutDays = 0;
      let leaves = 0;
      let lateDetails = [];
      let earlyOutDetails = [];
      let leaveDetails = [];

      attendanceDates.forEach((date) => {
        const { inTime, outTime, status } = teacherAttendance[date];
        const [inHour, inMin] = inTime.split(':').map(Number);
        const [outHour, outMin] = outTime.split(':').map(Number);

        if (inHour > 9 || (inHour === 9 && inMin > 5)) {
          lateDays++;
          lateDetails.push({ date, inTime });
        }

        if (outHour < 17 || (outHour === 17 && outMin < 0)) {
          earlyOutDays++;
          earlyOutDetails.push({ date, outTime });
        }

        if (status === 'absent') {
          leaves++;
          leaveDetails.push({ date });
        }
      });

      if (lateDays > 4) {
        deductions += (lateDays - 4) * dailyRate;
      }
      deductions += earlyOutDays * dailyRate;

      if (teacher.status === 'probationary') {
        deductions += leaves * dailyRate;
      } else if (teacher.status === 'permanent') {
        const allowedLeaves = 6 / 6 + 1;
        if (leaves > allowedLeaves) {
          deductions += (leaves - allowedLeaves) * dailyRate;
        }
      }

      setPayrollDetail({
        name: teacher.name,
        salary: monthlySalary,
        deductions,
        netPay: monthlySalary - deductions,
        lateDays,
        earlyOutDays,
        leaves,
        lateDetails,
        earlyOutDetails,
        leaveDetails,
      });
    };

    calculatePayrollDetail();
  }, [teacherId, teachers, attendance]);

  const handleExport = () => {
    if (!payrollDetail) return;

    const data = [
      { 'Field': 'Name', 'Value': payrollDetail.name },
      { 'Field': 'Monthly Salary', 'Value': `${payrollDetail.salary} PKR` },
      { 'Field': 'Deductions', 'Value': `${payrollDetail.deductions} PKR` },
      { 'Field': 'Net Pay', 'Value': `${payrollDetail.netPay} PKR` },
      { 'Field': 'Late Days', 'Value': payrollDetail.lateDays },
      { 'Field': 'Early Out Days', 'Value': payrollDetail.earlyOutDays },
      { 'Field': 'Leaves', 'Value': payrollDetail.leaves },
      ...payrollDetail.lateDetails.map((d) => ({ 'Field': 'Late Date', 'Value': `${d.date} (${d.inTime})` })),
      ...payrollDetail.earlyOutDetails.map((d) => ({ 'Field': 'Early Out Date', 'Value': `${d.date} (${d.outTime})` })),
      ...payrollDetail.leaveDetails.map((d) => ({ 'Field': 'Leave Date', 'Value': d.date })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Details');
    XLSX.writeFile(workbook, `Payroll_Details_${payrollDetail.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
    Swal.fire({
      icon: 'success',
      title: 'Export Complete',
      text: 'File has been downloaded successfully',
      confirmButtonColor: '#2E86C1',
    });
  };

  if (!payrollDetail) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-[#2E86C1]">Payroll Details - {payrollDetail.name}</h2>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={20} /> Export to Excel
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#2E86C1]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Monthly Salary</p>
              <p className="text-2xl font-bold text-[#2E86C1]">{payrollDetail.salary} PKR</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Deductions</p>
              <p className="text-2xl font-bold text-red-600">{payrollDetail.deductions} PKR</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Net Pay</p>
              <p className="text-2xl font-bold text-green-600">{payrollDetail.netPay} PKR</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#2E86C1]">
          <h3 className="text-xl font-semibold text-[#1C2833] mb-4">Attendance Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Late Days</p>
              <p className="text-lg font-bold">{payrollDetail.lateDays}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Early Out Days</p>
              <p className="text-lg font-bold">{payrollDetail.earlyOutDays}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Leaves</p>
              <p className="text-lg font-bold">{payrollDetail.leaves}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#2E86C1]">
          <h3 className="text-xl font-semibold text-[#1C2833] mb-4">Detailed Logs</h3>
          {payrollDetail.lateDetails.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-[#1C2833]">Late Entries</h4>
              <ul className="list-disc pl-5">
                {payrollDetail.lateDetails.map((d, idx) => (
                  <li key={idx}>{`${d.date} - ${d.inTime}`}</li>
                ))}
              </ul>
            </div>
          )}
          {payrollDetail.earlyOutDetails.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-[#1C2833]">Early Out Entries</h4>
              <ul className="list-disc pl-5">
                {payrollDetail.earlyOutDetails.map((d, idx) => (
                  <li key={idx}>{`${d.date} - ${d.outTime}`}</li>
                ))}
              </ul>
            </div>
          )}
          {payrollDetail.leaveDetails.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#1C2833]">Leave Dates</h4>
              <ul className="list-disc pl-5">
                {payrollDetail.leaveDetails.map((d, idx) => (
                  <li key={idx}>{d.date}</li>
                ))}
              </ul>
            </div>
          )}
          {payrollDetail.lateDetails.length === 0 && payrollDetail.earlyOutDetails.length === 0 && payrollDetail.leaveDetails.length === 0 && (
            <p className="text-gray-500">No attendance issues recorded this month.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}