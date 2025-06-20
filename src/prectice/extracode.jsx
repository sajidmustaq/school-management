import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import PayrollDetailCard from '../../components/payroll/details/PayrollDetailCard';
import PayrollDetailBreakdown from '../../components/payroll/details/PayrollDetailBreakdown';
import PayrollDetailLogs from '../../components/payroll/details/PayrollDetailLogs';
import { Download } from 'lucide-react';

const PayrollDetails = () => {
  const { teachers, attendance } = useData();
  const { teacherId } = useParams();
  const [payrollDetail, setPayrollDetail] = useState(null);

  useEffect(() => {
    if (!teachers || teachers.length === 0 || !teacherId) return;

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
        deductions: Math.round(deductions),
        netPay: Math.round(monthlySalary - deductions),
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
      { Field: 'Name', Value: payrollDetail.name },
      { Field: 'Monthly Salary', Value: `${payrollDetail.salary} PKR` },
      { Field: 'Deductions', Value: `${payrollDetail.deductions} PKR` },
      { Field: 'Net Pay', Value: `${payrollDetail.netPay} PKR` },
      { Field: 'Late Days', Value: payrollDetail.lateDays },
      { Field: 'Early Out Days', Value: payrollDetail.earlyOutDays },
      { Field: 'Leaves', Value: payrollDetail.leaves },
      ...payrollDetail.lateDetails.map((d) => ({ Field: 'Late Date', Value: `${d.date} (${d.inTime})` })),
      ...payrollDetail.earlyOutDetails.map((d) => ({ Field: 'Early Out Date', Value: `${d.date} (${d.outTime})` })),
      ...payrollDetail.leaveDetails.map((d) => ({ Field: 'Leave Date', Value: d.date })),
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

  if (!payrollDetail) return <div className='p-4'>Loading...</div>;

  return (
    <AdminLayout>
      <div className='p-4 space-y-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <h2 className='text-2xl font-bold text-[#2E86C1]'>Payroll Details - {payrollDetail.name}</h2>
          <button
            onClick={handleExport}
            className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'>
            <Download size={20} /> Export to Excel
          </button>
        </div>

        <PayrollDetailCard
          salary={payrollDetail.salary}
          deductions={payrollDetail.deductions}
          netPay={payrollDetail.netPay}
        />

        <PayrollDetailBreakdown
          lateDays={payrollDetail.lateDays}
          earlyOutDays={payrollDetail.earlyOutDays}
          leaves={payrollDetail.leaves}
        />

        <PayrollDetailLogs
          lateDetails={payrollDetail.lateDetails}
          earlyOutDetails={payrollDetail.earlyOutDetails}
          leaveDetails={payrollDetail.leaveDetails}
        />
      </div>
    </AdminLayout>
  );
};

export default PayrollDetails;
