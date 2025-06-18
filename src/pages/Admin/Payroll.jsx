import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  Calendar,
  Download,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  FileText,
  Settings,
  Eye,
  Calculator,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Send,
  Mail,
  Building,
  User,
  CreditCard,
  Shield,
  Award,
  Target,
  TrendingDown,
  X,
  Printer,
} from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import AdminLayout from '../../components/AdminLayout';

export default function Payroll() {
  const { teachers, teacherAttendanceById } = useData();
  const [payrollData, setPayrollData] = useState({});
  const [processedPayrolls, setProcessedPayrolls] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Enhanced payroll settings with more professional features
  const [payrollSettings, setPayrollSettings] = useState({
    workingHours: 8,
    lateArrivalGrace: 15,
    standardInTime: '09:00',
    standardOutTime: '17:00',
    overtimeRate: 1.5,
    nightShiftRate: 1.3,
    weekendRate: 2.0,
    holidayRate: 2.5,
    probationaryLeaves: 2,
    permanentLeaves: 12,
    casualLeaves: 8,
    sickLeaves: 10,
    lateDeductionAfter: 3,
    lateDeductionRate: 0.5, // percentage per day
    earlyOutDeductionRate: 1.0,
    basicSalaryPercentage: 60,
    transportAllowance: 3000,
    mealAllowance: 150,
    medicalAllowance: 2000,
    houseRentAllowance: 25, // percentage of basic
    providentFund: 8.33, // percentage
    professionalTax: 200,
    incomeTax: 0, // will be calculated based on salary slabs
    esi: 0.75, // percentage for employees
    companyName: 'Excellence Education Institute',
    companyAddress: 'Karachi, Pakistan',
    companyPhone: '+92-21-XXXXXXX',
    companyEmail: 'hr@excellence.edu.pk',
    logoUrl: '',
  });

  // Tax slabs for income tax calculation
  const taxSlabs = [
    { min: 0, max: 600000, rate: 0 },
    { min: 600001, max: 1200000, rate: 5 },
    { min: 1200001, max: 2400000, rate: 10 },
    { min: 2400001, max: 3600000, rate: 15 },
    { min: 3600001, max: 6000000, rate: 20 },
    { min: 6000001, max: Infinity, rate: 25 },
  ];

  useEffect(() => {
    calculatePayroll();
  }, [teachers, teacherAttendanceById, selectedMonth, selectedYear, payrollSettings]);

  const calculatePayroll = () => {
    const data = {};
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const workingDays = getWorkingDays(selectedYear, selectedMonth);

    teachers.forEach((teacher) => {
      const annualSalary = parseInt(teacher.salary || 0) * 12;
      const monthlySalary = parseInt(teacher.salary || 0);
      const basicSalary = (monthlySalary * payrollSettings.basicSalaryPercentage) / 100;
      const dailyRate = monthlySalary / daysInMonth;
      const hourlyRate = dailyRate / payrollSettings.workingHours;

      // Initialize components
      let earnings = {
        basicSalary: Math.round(basicSalary),
        houseRent: Math.round((basicSalary * payrollSettings.houseRentAllowance) / 100),
        transport: payrollSettings.transportAllowance,
        medical: payrollSettings.medicalAllowance,
        overtime: 0,
        nightShift: 0,
        weekend: 0,
        holiday: 0,
        bonus: 0,
        incentive: 0,
      };

      let deductions = {
        providentFund: Math.round((basicSalary * payrollSettings.providentFund) / 100),
        professionalTax: payrollSettings.professionalTax,
        incomeTax: calculateIncomeTax(annualSalary) / 12,
        esi: Math.round((monthlySalary * payrollSettings.esi) / 100),
        lateDeduction: 0,
        earlyOutDeduction: 0,
        leaveDeduction: 0,
        advance: 0,
        loan: 0,
      };

      const teacherAttendance = teacherAttendanceById[teacher.id] || {};

      // Filter attendance for selected month and year
      const monthlyAttendance = {};
      Object.keys(teacherAttendance).forEach((date) => {
        const recordDate = new Date(date);
        if (recordDate.getFullYear() === selectedYear && recordDate.getMonth() === selectedMonth) {
          monthlyAttendance[date] = teacherAttendance[date];
        }
      });

      const attendanceDates = Object.keys(monthlyAttendance);
      let attendanceStats = {
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        earlyOutDays: 0,
        overtimeHours: 0,
        totalWorkingHours: 0,
        weekendDays: 0,
        holidayDays: 0,
      };

      // Process attendance
      attendanceDates.forEach((date) => {
        const { inTime, outTime, status } = monthlyAttendance[date];
        const dateObj = new Date(date);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

        if (status === 'present' && inTime && outTime) {
          attendanceStats.presentDays++;
          const hoursWorked = calculateHoursWorked(inTime, outTime);
          attendanceStats.totalWorkingHours += hoursWorked;

          if (hoursWorked > payrollSettings.workingHours) {
            const overtimeHrs = hoursWorked - payrollSettings.workingHours;
            attendanceStats.overtimeHours += overtimeHrs;
            earnings.overtime += overtimeHrs * hourlyRate * payrollSettings.overtimeRate;
          }

          if (isLateArrival(inTime)) {
            attendanceStats.lateDays++;
          }

          if (isEarlyDeparture(outTime)) {
            attendanceStats.earlyOutDays++;
          }

          if (isWeekend) {
            attendanceStats.weekendDays++;
            earnings.weekend += hoursWorked * hourlyRate * payrollSettings.weekendRate;
          }

          // Night shift calculation (after 10 PM or before 6 AM)
          const outHour = parseInt(outTime.split(':')[0]);
          if (outHour >= 22 || outHour <= 6) {
            earnings.nightShift += hoursWorked * hourlyRate * payrollSettings.nightShiftRate;
          }
        } else if (status === 'absent') {
          attendanceStats.absentDays++;
        }
      });

      // Calculate deductions based on attendance
      if (attendanceStats.lateDays > payrollSettings.lateDeductionAfter) {
        const excessLateDays = attendanceStats.lateDays - payrollSettings.lateDeductionAfter;
        deductions.lateDeduction = excessLateDays * dailyRate * (payrollSettings.lateDeductionRate / 100);
      }

      deductions.earlyOutDeduction =
        attendanceStats.earlyOutDays * dailyRate * (payrollSettings.earlyOutDeductionRate / 100);

      // Leave deductions
      const allowedLeaves =
        teacher.status === 'probationary' ? payrollSettings.probationaryLeaves : payrollSettings.permanentLeaves;

      if (attendanceStats.absentDays > allowedLeaves) {
        const excessLeaves = attendanceStats.absentDays - allowedLeaves;
        deductions.leaveDeduction = excessLeaves * dailyRate;
      }

      // Calculate meal allowance based on present days
      earnings.transport = Math.round((attendanceStats.presentDays / workingDays) * payrollSettings.transportAllowance);

      // Performance bonus
      const attendancePercentage = (attendanceStats.presentDays / workingDays) * 100;
      if (attendancePercentage >= 95 && attendanceStats.lateDays === 0) {
        earnings.bonus = monthlySalary * 0.05; // 5% bonus for excellent attendance
      }

      // Calculate totals
      const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + val, 0);
      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
      const netPay = Math.max(0, totalEarnings - totalDeductions);

      data[teacher.id] = {
        ...teacher,
        name: teacher.name,
        employeeId: teacher.employeeId || teacher.id,
        department: teacher.department || 'Academic',
        position: teacher.position || 'Teacher',
        status: teacher.status || 'permanent',
        joiningDate: teacher.joiningDate || '2020-01-01',
        bankAccount: teacher.bankAccount || 'XXXX-XXXX-XXXX',
        cnic: teacher.cnic || 'XXXXX-XXXXXXX-X',
        earnings,
        deductions,
        totalEarnings: Math.round(totalEarnings),
        totalDeductions: Math.round(totalDeductions),
        netPay: Math.round(netPay),
        ...attendanceStats,
        attendancePercentage: Math.round(attendancePercentage),
        workingDays,
        payPeriod: `${getMonthName(selectedMonth)} ${selectedYear}`,
        generatedDate: new Date().toLocaleDateString(),
      };
    });

    setPayrollData(data);
  };

  const calculateIncomeTax = (annualSalary) => {
    let tax = 0;
    for (const slab of taxSlabs) {
      if (annualSalary > slab.min) {
        const taxableAmount = Math.min(annualSalary, slab.max) - slab.min + 1;
        tax += (taxableAmount * slab.rate) / 100;
      }
    }
    return Math.round(tax);
  };

  const getWorkingDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
    return workingDays;
  };

  const calculateHoursWorked = (inTime, outTime) => {
    const [inHour, inMin] = inTime.split(':').map(Number);
    const [outHour, outMin] = outTime.split(':').map(Number);
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    return Math.max(0, (outMinutes - inMinutes) / 60);
  };

  const isLateArrival = (inTime) => {
    const [inHour, inMin] = inTime.split(':').map(Number);
    const [standardHour, standardMin] = payrollSettings.standardInTime.split(':').map(Number);
    const inMinutes = inHour * 60 + inMin;
    const standardMinutes = standardHour * 60 + standardMin + payrollSettings.lateArrivalGrace;
    return inMinutes > standardMinutes;
  };

  const isEarlyDeparture = (outTime) => {
    const [outHour, outMin] = outTime.split(':').map(Number);
    const [standardHour, standardMin] = payrollSettings.standardOutTime.split(':').map(Number);
    const outMinutes = outHour * 60 + outMin;
    const standardMinutes = standardHour * 60 + standardMin;
    return outMinutes < standardMinutes;
  };

  const getMonthName = (monthIndex) => {
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
    return months[monthIndex];
  };

  const getFilteredAndSortedPayrollData = () => {
    let filteredData = Object.values(payrollData).filter((data) => {
      const matchesStatus = filterStatus === 'all' || data.status === filterStatus;
      const matchesSearch =
        searchTerm === '' ||
        data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.department.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    // Sort data
    filteredData.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filteredData;
  };

  const getTotalStats = () => {
    const filteredData = getFilteredAndSortedPayrollData();
    return {
      totalEmployees: filteredData.length,
      totalEarnings: filteredData.reduce((sum, data) => sum + data.totalEarnings, 0),
      totalDeductions: filteredData.reduce((sum, data) => sum + data.totalDeductions, 0),
      totalNetPay: filteredData.reduce((sum, data) => sum + data.netPay, 0),
      avgAttendance: filteredData.reduce((sum, data) => sum + data.attendancePercentage, 0) / filteredData.length || 0,
      totalOvertime: filteredData.reduce((sum, data) => sum + data.earnings.overtime, 0),
      totalBonuses: filteredData.reduce((sum, data) => sum + data.earnings.bonus, 0),
    };
  };

  const handleDownloadPayslipPDF = (employee) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Company Header with Logo
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(payrollSettings.companyName, 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(payrollSettings.companyAddress, 105, 28, { align: 'center' });
    doc.text(`Tel: ${payrollSettings.companyPhone} | Email: ${payrollSettings.companyEmail}`, 105, 35, {
      align: 'center',
    });

    // Payslip Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SALARY SLIP', 105, 55, { align: 'center' });

    // Employee Information Box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(15, 65, 180, 35);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE INFORMATION', 20, 75);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Name: ${employee.name}`, 20, 85);
    doc.text(`Employee ID: ${employee.employeeId}`, 20, 92);
    doc.text(`Department: ${employee.department}`, 20, 99);

    doc.text(`Position: ${employee.position}`, 110, 85);
    doc.text(`Status: ${employee.status}`, 110, 92);
    doc.text(`Pay Period: ${employee.payPeriod}`, 110, 99);

    // Salary Details Table
    let yPos = 115;

    // Earnings Section
    doc.setFillColor(240, 248, 255);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('EARNINGS', 20, yPos + 5);

    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const earningsData = [
      ['Basic Salary', `Rs. ${employee?.earnings?.basicSalary?.toLocaleString() || '0'}`],
      ['House Rent Allowance', `Rs. ${employee?.earnings?.houseRent?.toLocaleString() || '0'}`],
      ['Transport Allowance', `Rs. ${employee?.earnings?.transport?.toLocaleString() || '0'}`],
      ['Medical Allowance', `Rs. ${employee?.earnings?.medical?.toLocaleString() || '0'}`],
      ['Overtime Pay', `Rs. ${employee?.earnings?.overtime?.toLocaleString() || '0'}`],
      ['Night Shift Allowance', `Rs. ${employee?.earnings?.nightShift?.toLocaleString() || '0'}`],
      ['Weekend Pay', `Rs. ${employee?.earnings?.weekend?.toLocaleString() || '0'}`],
      ['Bonus', `Rs. ${employee?.earnings?.bonus?.toLocaleString() || '0'}`],
    ];

    earningsData.forEach(([label, amount]) => {
      if (parseFloat(amount.replace(/[Rs.,\s]/g, '')) > 0) {
        doc.text(label, 20, yPos);
        doc.text(amount, 170, yPos, { align: 'left' });
        yPos += 7;
      }
    });

    // Total Earnings
    doc.setFont('helvetica', 'bold');
    doc.setDrawColor(0, 0, 0);
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    doc.text('TOTAL EARNINGS', 20, yPos);
    doc.text(`Rs. ${employee.totalEarnings.toLocaleString()}`, 170, yPos, { align: 'left' });

    yPos += 15;

    // Deductions Section
    doc.setFillColor(255, 240, 240);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DEDUCTIONS', 20, yPos + 5);

    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const deductionsData = [
      ['Provident Fund', `Rs. ${employee.deductions.providentFund.toLocaleString()}`],
      ['Professional Tax', `Rs. ${employee.deductions.professionalTax.toLocaleString()}`],
      ['Income Tax', `Rs. ${Math.round(employee.deductions.incomeTax).toLocaleString()}`],
      ['ESI', `Rs. ${employee.deductions.esi.toLocaleString()}`],
      ['Late Deduction', `Rs. ${Math.round(employee.deductions.lateDeduction).toLocaleString()}`],
      ['Early Out Deduction', `Rs. ${Math.round(employee.deductions.earlyOutDeduction).toLocaleString()}`],
      ['Leave Deduction', `Rs. ${Math.round(employee.deductions.leaveDeduction).toLocaleString()}`],
    ];

    deductionsData.forEach(([label, amount]) => {
      if (parseFloat(amount.replace(/[Rs.,\s]/g, '')) > 0) {
        doc.text(label, 20, yPos);
        doc.text(amount, 170, yPos, { align: 'left' });
        yPos += 7;
      }
    });

    // Total Deductions
    doc.setFont('helvetica', 'bold');
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    doc.text('TOTAL DEDUCTIONS', 20, yPos);
    doc.text(`Rs. ${employee.totalDeductions.toLocaleString()}`, 170, yPos, { align: 'left' });

    yPos += 15;

    // Net Pay
    doc.setFillColor(230, 255, 230);
    doc.rect(15, yPos, 180, 12, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('NET PAY', 20, yPos + 8);
    doc.text(`Rs. ${employee.netPay.toLocaleString()}`, 170, yPos + 8, { align: 'left' });

    yPos += 20;

    // Attendance Summary
    doc.setFillColor(248, 248, 248);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ATTENDANCE SUMMARY', 20, yPos + 5);

    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Working Days: ${employee.workingDays}`, 20, yPos);
    doc.text(`Present Days: ${employee.presentDays}`, 20, yPos + 7);
    doc.text(`Absent Days: ${employee.absentDays}`, 20, yPos + 14);

    doc.text(`Late Days: ${employee.lateDays}`, 110, yPos);
    doc.text(`Overtime Hours: ${employee.overtimeHours.toFixed(1)}`, 110, yPos + 7);
    doc.text(`Attendance: ${employee.attendancePercentage}%`, 110, yPos + 14);

    // Footer
    yPos = 280;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This is a computer generated payslip and does not require signature.', 105, yPos, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, yPos + 5, {
      align: 'center',
    });

    // Confidentiality Notice
    doc.text(
      'CONFIDENTIAL: This document contains confidential information and is intended solely for the addressee.',
      105,
      yPos + 10,
      { align: 'center' },
    );

    doc.save(`Payslip_${employee.name}_${employee.payPeriod.replace(' ', '_')}.pdf`);

    Swal.fire({
      icon: 'success',
      title: 'Payslip Downloaded',
      text: 'Professional payslip has been generated successfully!',
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleBulkPayslipDownload = () => {
    const filteredData = getFilteredAndSortedPayrollData();
    if (filteredData.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No employees found to generate payslips.',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    Swal.fire({
      title: 'Generate Bulk Payslips?',
      text: `This will generate ${filteredData.length} payslip PDFs. Continue?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2E86C1',
      cancelButtonColor: '#E74C3C',
      confirmButtonText: 'Yes, Generate All',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      // ADD inside calculatePayroll function before setting payrollData:

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      for (const teacher of teachers) {
        const teacherAttendance = teacherAttendanceById[teacher.id] || {};
        const joiningDate = new Date(teacher.joiningDate);

        const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
        const selectedStartDate = new Date(selectedYear, selectedMonth, 1);
        const selectedEndDate = new Date(selectedYear, selectedMonth + 1, 0);

        const startDay = joiningDate > selectedStartDate ? joiningDate : selectedStartDate;
        const endDay = selectedEndDate;

        let incomplete = false;
        for (let d = new Date(startDay); d <= endDay; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const record = teacherAttendance[dateStr];
          const dayOfWeek = d.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekend

          if (!record || record.status !== 'present') {
            incomplete = true;
            break;
          }
        }

        if (incomplete) {
          Swal.fire({
            icon: 'warning',
            title: 'Attendance Not Complete',
            text: `Attendance for ${teacher.name} is not complete for ${getMonthName(selectedMonth)} ${selectedYear}.`,
            confirmButtonColor: '#E74C3C',
          });
          return; // stop payroll processing
        }
      }

      if (result.isConfirmed) {
        filteredData.forEach((employee, index) => {
          setTimeout(() => {
            handleDownloadPayslipPDF(employee);
          }, index * 500); // Stagger downloads
        });

        Swal.fire({
          icon: 'success',
          title: 'Bulk Download Started',
          text: 'All payslips are being generated. Check your downloads folder.',
          confirmButtonColor: '#2E86C1',
        });
      }
    });
  };

  const handleProcessPayroll = async () => {
    // ADD inside handleProcessPayroll()

    const selectedDate = new Date(selectedYear, selectedMonth, 1);

    const isPreviousMonthProcessed = (month, year) => {
      const prev = new Date(year, month - 1);
      return processedPayrolls.some((p) => p.month === prev.getMonth() && p.year === prev.getFullYear());
    };

    for (const teacher of teachers) {
      const teacherJoinDate = new Date(teacher.joiningDate);
      if (selectedDate < teacherJoinDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Month',
          text: `${teacher.name} joined on ${teacher.joiningDate}. You cannot process salary for earlier months.`,
        });
        return;
      }

      if (selectedDate > teacherJoinDate) {
        if (!isPreviousMonthProcessed(selectedMonth, selectedYear)) {
          const prevMonthName = getMonthName(selectedMonth - 1 < 0 ? 11 : selectedMonth - 1);
          const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

          Swal.fire({
            icon: 'warning',
            title: 'Previous Month Not Processed',
            text: `You must process salary for ${prevMonthName} ${prevMonthYear} before processing this month.`,
            confirmButtonColor: '#E74C3C',
          });
          return;
        }
      }
    }

    // Monthly Attendance Report Section (to be placed below attendance table or where needed)
    {
      viewMode === 'monthly' && activeTab === 'teachers' && selectedTeacherId && (
        <div className='overflow-x-auto mt-6 bg-white p-4 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-4 text-gray-700'>
            Monthly Attendance - {new Date(filterDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <table className='min-w-full border border-gray-200 text-sm'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='p-2 border'>Date</th>
                <th className='p-2 border'>Status</th>
                <th className='p-2 border'>In Time</th>
                <th className='p-2 border'>Out Time</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: new Date(filterDate.split('-')[0], filterDate.split('-')[1], 0).getDate() }).map(
                (_, i) => {
                  const day = i + 1;
                  const dateStr = `${filterDate.split('-')[0]}-${filterDate.split('-')[1]}-${day
                    .toString()
                    .padStart(2, '0')}`;
                  const record = teacherAttendance.find((a) => a.teacherId === selectedTeacherId && a.date === dateStr);

                  return (
                    <tr
                      key={i}
                      className={`${
                        !record ? 'bg-yellow-50' : record.status === 'absent' ? 'bg-red-50' : 'bg-green-50'
                      }`}>
                      <td className='border px-3 py-2'>{dateStr}</td>
                      <td className='border px-3 py-2'>{record ? record.status : 'Missing'}</td>
                      <td className='border px-3 py-2'>{record?.inTime || '--'}</td>
                      <td className='border px-3 py-2'>{record?.outTime || '--'}</td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      );
    }

    // Action Button in Attendance Table Rows
    {
      activeTab === 'teachers' && (
        <button
          onClick={() => {
            setSelectedTeacherId(item.id);
            setViewMode('monthly');
          }}
          className='bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs hover:bg-indigo-200 flex items-center gap-1'>
          <Calendar size={12} /> View Monthly
        </button>
      );
    }
  };

  const handleExportExcel = () => {
    const filteredData = getFilteredAndSortedPayrollData();
    if (filteredData.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No payroll data available to export.',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    const exportData = filteredData.map((emp, index) => ({
      'S.No': index + 1,
      'Employee ID': emp.employeeId,
      Name: emp.name,
      Department: emp.department,
      Position: emp.position,
      Status: emp.status,
      // Earnings
      'Basic Salary': emp.earnings.basicSalary,
      'House Rent': emp.earnings.houseRent,
      Transport: emp.earnings.transport,
      Medical: emp.earnings.medical,
      Overtime: emp.earnings.overtime,
      Bonus: emp.earnings.bonus,
      'Total Earnings': emp.totalEarnings,
      // Deductions
      PF: emp.deductions.providentFund,
      'Professional Tax': emp.deductions.professionalTax,
      'Income Tax': Math.round(emp.deductions.incomeTax),
      ESI: emp.deductions.esi,
      'Late Deduction': Math.round(emp.deductions.lateDeduction),
      'Leave Deduction': Math.round(emp.deductions.leaveDeduction),
      'Total Deductions': emp.totalDeductions,
      'Net Pay': emp.netPay,
      // Attendance
      'Working Days': emp.workingDays,
      'Present Days': emp.presentDays,
      'Absent Days': emp.absentDays,
      'Late Days': emp.lateDays,
      'Overtime Hours': emp.overtimeHours.toFixed(1),
      'Attendance %': emp.attendancePercentage,
      'Pay Period': emp.payPeriod,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Report');

    // Auto-resize columns
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const column = XLSX.utils.encode_col(C);
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = column + XLSX.utils.encode_row(R);
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellValue = cell.v.toString();
          maxWidth = Math.max(maxWidth, cellValue.length);
        }
      }
      colWidths.push({ width: Math.min(maxWidth, 30) });
    }
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Payroll_Report_${getMonthName(selectedMonth)}_${selectedYear}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Excel Export Successful',
      text: 'Payroll report has been exported to Excel successfully!',
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleSendPayslipEmail = (employee) => {
    Swal.fire({
      title: 'Send Payslip Email',
      html: `
        <div class="text-left">
          <p><strong>Employee:</strong> ${employee.name}</p>
          <p><strong>Email:</strong> ${employee.email || 'Not available'}</p>
          <p><strong>Pay Period:</strong> ${employee.payPeriod}</p>
          <hr class="my-3">
          <label class="block text-sm font-medium mb-2">Additional Message (Optional):</label>
          <textarea id="emailMessage" class="w-full p-2 border border-gray-300 rounded" rows="3" 
                    placeholder="Add any additional message for the employee..."></textarea>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2E86C1',
      cancelButtonColor: '#E74C3C',
      confirmButtonText: 'Send Email',
      cancelButtonText: 'Cancel',
      width: '500px',
      preConfirm: () => {
        const message = document.getElementById('emailMessage').value;
        return { message };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real application, you would integrate with an email service
        Swal.fire({
          icon: 'success',
          title: 'Email Sent!',
          text: `Payslip has been sent to ${employee.name}'s email address.`,
          confirmButtonColor: '#2E86C1',
        });
      }
    });
  };

  const handleBulkEmailSend = () => {
    const filteredData = getFilteredAndSortedPayrollData();
    const employeesWithEmail = filteredData.filter((emp) => emp.email);

    if (employeesWithEmail.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Email Addresses',
        text: 'No employees have email addresses configured.',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    Swal.fire({
      title: 'Send Bulk Payslip Emails?',
      html: `
        <div class="text-left">
          <p><strong>Total Employees:</strong> ${filteredData.length}</p>
          <p><strong>With Email:</strong> ${employeesWithEmail.length}</p>
          <p><strong>Without Email:</strong> ${filteredData.length - employeesWithEmail.length}</p>
          <hr class="my-3">
          <label class="block text-sm font-medium mb-2">Email Subject:</label>
          <input id="emailSubject" class="w-full p-2 border border-gray-300 rounded mb-3" 
                 value="Salary Slip - ${getMonthName(selectedMonth)} ${selectedYear}" />
          <label class="block text-sm font-medium mb-2">Email Message:</label>
          <textarea id="bulkEmailMessage" class="w-full p-2 border border-gray-300 rounded" rows="4" 
                    placeholder="Dear Employee,&#10;&#10;Please find attached your salary slip for ${getMonthName(
                      selectedMonth,
                    )} ${selectedYear}.&#10;&#10;Best regards,&#10;HR Department"></textarea>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2E86C1',
      cancelButtonColor: '#E74C3C',
      confirmButtonText: 'Send All Emails',
      cancelButtonText: 'Cancel',
      width: '600px',
      preConfirm: () => {
        const subject = document.getElementById('emailSubject').value;
        const message = document.getElementById('bulkEmailMessage').value;
        return { subject, message };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Bulk Emails Sent!',
          text: `Payslips have been sent to ${employeesWithEmail.length} employees.`,
          confirmButtonColor: '#2E86C1',
        });
      }
    });
  };

  const PayrollSettingsModal = () => (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>Payroll Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className='text-gray-500 hover:text-gray-700'>
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Company Information */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Company Information</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Company Name</label>
                <input
                  type='text'
                  value={payrollSettings.companyName}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, companyName: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                <textarea
                  value={payrollSettings.companyAddress}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, companyAddress: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  rows='2'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Phone</label>
                <input
                  type='text'
                  value={payrollSettings.companyPhone}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, companyPhone: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                <input
                  type='email'
                  value={payrollSettings.companyEmail}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, companyEmail: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Working Hours & Time */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Working Hours & Time</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Standard Working Hours</label>
                <input
                  type='number'
                  value={payrollSettings.workingHours}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, workingHours: parseInt(e.target.value) }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Standard In Time</label>
                <input
                  type='time'
                  value={payrollSettings.standardInTime}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, standardInTime: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Standard Out Time</label>
                <input
                  type='time'
                  value={payrollSettings.standardOutTime}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, standardOutTime: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Late Arrival Grace (minutes)</label>
                <input
                  type='number'
                  value={payrollSettings.lateArrivalGrace}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, lateArrivalGrace: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Pay Rates */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Pay Rates</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Overtime Rate Multiplier</label>
                <input
                  type='number'
                  step='0.1'
                  value={payrollSettings.overtimeRate}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, overtimeRate: parseFloat(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Night Shift Rate Multiplier</label>
                <input
                  type='number'
                  step='0.1'
                  value={payrollSettings.nightShiftRate}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, nightShiftRate: parseFloat(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Weekend Rate Multiplier</label>
                <input
                  type='number'
                  step='0.1'
                  value={payrollSettings.weekendRate}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, weekendRate: parseFloat(e.target.value) }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Holiday Rate Multiplier</label>
                <input
                  type='number'
                  step='0.1'
                  value={payrollSettings.holidayRate}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, holidayRate: parseFloat(e.target.value) }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Allowances */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Allowances</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Transport Allowance (Rs.)</label>
                <input
                  type='number'
                  value={payrollSettings.transportAllowance}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, transportAllowance: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Medical Allowance (Rs.)</label>
                <input
                  type='number'
                  value={payrollSettings.medicalAllowance}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, medicalAllowance: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>House Rent Allowance (%)</label>
                <input
                  type='number'
                  value={payrollSettings.houseRentAllowance}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, houseRentAllowance: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Basic Salary Percentage (%)</label>
                <input
                  type='number'
                  value={payrollSettings.basicSalaryPercentage}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, basicSalaryPercentage: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Deductions</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Provident Fund (%)</label>
                <input
                  type='number'
                  step='0.01'
                  value={payrollSettings.providentFund}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, providentFund: parseFloat(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Professional Tax (Rs.)</label>
                <input
                  type='number'
                  value={payrollSettings.professionalTax}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, professionalTax: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>ESI (%)</label>
                <input
                  type='number'
                  step='0.01'
                  value={payrollSettings.esi}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, esi: parseFloat(e.target.value) }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Late Deduction After (days)</label>
                <input
                  type='number'
                  value={payrollSettings.lateDeductionAfter}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, lateDeductionAfter: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Leave Settings */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Leave Settings</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Probationary Leaves (per month)</label>
                <input
                  type='number'
                  value={payrollSettings.probationaryLeaves}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, probationaryLeaves: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Permanent Leaves (per month)</label>
                <input
                  type='number'
                  value={payrollSettings.permanentLeaves}
                  onChange={(e) =>
                    setPayrollSettings((prev) => ({ ...prev, permanentLeaves: parseInt(e.target.value) }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Casual Leaves (per month)</label>
                <input
                  type='number'
                  value={payrollSettings.casualLeaves}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, casualLeaves: parseInt(e.target.value) }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Sick Leaves (per month)</label>
                <input
                  type='number'
                  value={payrollSettings.sickLeaves}
                  onChange={(e) => setPayrollSettings((prev) => ({ ...prev, sickLeaves: parseInt(e.target.value) }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='flex justify-end space-x-4 mt-6 pt-6 border-t'>
          <button
            onClick={() => setShowSettings(false)}
            className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'>
            Cancel
          </button>
          <button
            onClick={() => {
              setShowSettings(false);
              Swal.fire({
                icon: 'success',
                title: 'Settings Saved',
                text: 'Payroll settings have been updated successfully!',
                confirmButtonColor: '#2E86C1',
              });
            }}
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  const PayrollAnalytics = () => {
    const stats = getTotalStats();
    const filteredData = getFilteredAndSortedPayrollData();

    const departmentStats = filteredData.reduce((acc, emp) => {
      const dept = emp.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { count: 0, totalPay: 0, avgAttendance: 0 };
      }
      acc[dept].count++;
      acc[dept].totalPay += emp.netPay;
      acc[dept].avgAttendance += emp.attendancePercentage;
      return acc;
    }, {});

    Object.keys(departmentStats).forEach((dept) => {
      departmentStats[dept].avgAttendance = Math.round(
        departmentStats[dept].avgAttendance / departmentStats[dept].count,
      );
    });

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-bold text-gray-800'>Payroll Analytics</h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className='text-gray-500 hover:text-gray-700'>
              <X className='w-6 h-6' />
            </button>
          </div>

          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-blue-100'>Total Employees</p>
                  <p className='text-3xl font-bold'>{stats.totalEmployees}</p>
                </div>
                <Users className='w-12 h-12 text-blue-200' />
              </div>
            </div>

            <div className='bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-green-100'>Total Net Pay</p>
                  <p className='text-3xl font-bold'>Rs. {Math.round(stats.totalNetPay / 1000)}K</p>
                </div>
                <DollarSign className='w-12 h-12 text-green-200' />
              </div>
            </div>

            <div className='bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-orange-100'>Avg Attendance</p>
                  <p className='text-3xl font-bold'>{Math.round(stats.avgAttendance)}%</p>
                </div>
                <Activity className='w-12 h-12 text-orange-200' />
              </div>
            </div>

            <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-purple-100'>Total Overtime</p>
                  <p className='text-3xl font-bold'>Rs. {Math.round(stats.totalOvertime / 1000)}K</p>
                </div>
                <Clock className='w-12 h-12 text-purple-200' />
              </div>
            </div>
          </div>

          {/* Department-wise Analysis */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4 text-gray-800'>Department-wise Statistics</h3>
              <div className='space-y-4'>
                {Object.entries(departmentStats).map(([dept, data]) => (
                  <div
                    key={dept}
                    className='bg-gray-50 p-4 rounded-lg'>
                    <div className='flex justify-between items-center mb-2'>
                      <h4 className='font-medium text-gray-800'>{dept}</h4>
                      <span className='text-sm text-gray-500'>{data.count} employees</span>
                    </div>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <p className='text-gray-600'>Total Pay</p>
                        <p className='font-semibold'>Rs. {data.totalPay.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className='text-gray-600'>Avg Attendance</p>
                        <p className='font-semibold'>{data.avgAttendance}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payroll Summary */}
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4 text-gray-800'>Payroll Summary</h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg'>
                  <span className='text-gray-700'>Total Earnings</span>
                  <span className='font-semibold text-green-600'>Rs. {stats.totalEarnings.toLocaleString()}</span>
                </div>
                <div className='flex justify-between items-center p-3 bg-red-50 rounded-lg'>
                  <span className='text-gray-700'>Total Deductions</span>
                  <span className='font-semibold text-red-600'>Rs. {stats.totalDeductions.toLocaleString()}</span>
                </div>
                <div className='flex justify-between items-center p-3 bg-blue-50 rounded-lg'>
                  <span className='text-gray-700'>Net Payable</span>
                  <span className='font-semibold text-blue-600'>Rs. {stats.totalNetPay.toLocaleString()}</span>
                </div>

                <div className='mt-4 pt-4 border-t'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-gray-600'>Highest Paid</p>
                      <p className='font-semibold'>
                        Rs. {Math.max(...filteredData.map((emp) => emp.netPay)).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>Average Pay</p>
                      <p className='font-semibold'>
                        Rs. {Math.round(stats.totalNetPay / stats.totalEmployees).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Analysis */}
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4 text-gray-800'>Attendance Analysis</h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='w-5 h-5 text-green-600' />
                    <span className='text-gray-700'>Excellent (≥95%)</span>
                  </div>
                  <span className='font-semibold text-green-600'>
                    {filteredData.filter((emp) => emp.attendancePercentage >= 95).length}
                  </span>
                </div>

                <div className='flex items-center justify-between p-3 bg-yellow-50 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <Activity className='w-5 h-5 text-yellow-600' />
                    <span className='text-gray-700'>Good (80-94%)</span>
                  </div>
                  <span className='font-semibold text-yellow-600'>
                    {
                      filteredData.filter((emp) => emp.attendancePercentage >= 80 && emp.attendancePercentage < 95)
                        .length
                    }
                  </span>
                </div>

                <div className='flex items-center justify-between p-3 bg-red-50 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <AlertCircle className='w-5 h-5 text-red-600' />
                    <span className='text-gray-700'>Needs Attention (80%)</span>
                  </div>
                  <span className='font-semibold text-red-600'>
                    {filteredData.filter((emp) => emp.attendancePercentage < 80).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Overtime Analysis */}
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4 text-gray-800'>Overtime Summary</h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center p-4 bg-blue-50 rounded-lg'>
                    <p className='text-2xl font-bold text-blue-600'>
                      {filteredData.reduce((sum, emp) => sum + emp.overtimeHours, 0).toFixed(1)}
                    </p>
                    <p className='text-sm text-gray-600'>Total OT Hours</p>
                  </div>
                  <div className='text-center p-4 bg-green-50 rounded-lg'>
                    <p className='text-2xl font-bold text-green-600'>
                      Rs. {Math.round(stats.totalOvertime).toLocaleString()}
                    </p>
                    <p className='text-sm text-gray-600'>Total OT Pay</p>
                  </div>
                </div>

                <div className='mt-4'>
                  <p className='text-sm text-gray-600 mb-2'>Top Overtime Earners:</p>
                  {filteredData
                    .sort((a, b) => b.overtimeHours - a.overtimeHours)
                    .slice(0, 3)
                    .map((emp, index) => (
                      <div
                        key={emp.id}
                        className='flex justify-between items-center py-2 border-b'>
                        <span className='text-sm font-medium'>{emp.name}</span>
                        <span className='text-sm text-gray-600'>{emp.overtimeHours.toFixed(1)}h</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className='mt-8 bg-white border border-gray-200 rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Monthly Performance Trends</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg'>
                <TrendingUp className='w-8 h-8 text-blue-600 mx-auto mb-2' />
                <p className='text-lg font-bold text-blue-600'>+5.2%</p>
                <p className='text-sm text-gray-600'>Payroll Growth</p>
              </div>
              <div className='text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg'>
                <TrendingUp className='w-8 h-8 text-green-600 mx-auto mb-2' />
                <p className='text-lg font-bold text-green-600'>+2.1%</p>
                <p className='text-sm text-gray-600'>Attendance Rate</p>
              </div>
              <div className='text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg'>
                <TrendingDown className='w-8 h-8 text-orange-600 mx-auto mb-2' />
                <p className='text-lg font-bold text-orange-600'>-1.3%</p>
                <p className='text-sm text-gray-600'>Late Arrivals</p>
              </div>
            </div>
          </div>

          <div className='flex justify-end mt-6'>
            <button
              onClick={() => setShowAnalytics(false)}
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
              Close Analytics
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Employee Detail View Modal
  const EmployeeDetailModal = ({ employee, onClose }) => (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>Employee Details - {employee.name}</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'>
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Personal Information */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Personal Information</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Employee ID:</span>
                <span className='font-medium'>{employee.employeeId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Department:</span>
                <span className='font-medium'>{employee.department}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Position:</span>
                <span className='font-medium'>{employee.position}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Email:</span>
                <span className='font-medium'>{employee.email || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Join Date:</span>
                <span className='font-medium'>{employee.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Salary Breakdown</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Basic Salary:</span>
                <span className='font-medium'>Rs. {employee?.basicSalary?.toLocaleString() || '0'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>HRA:</span>
                <span className='font-medium'>Rs. {employee?.allowances?.hra?.toLocaleString() || '0'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Transport:</span>
                <span className='font-medium'>Rs. {employee?.allowances?.transport?.toLocaleString() || '0'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Medical:</span>
                <span className='font-medium'>Rs. {employee?.allowances?.medical?.toLocaleString() || '0'}</span>
              </div>
              <div className='flex justify-between border-t pt-2'>
                <span className='text-gray-600 font-semibold'>Gross Salary:</span>
                <span className='font-bold'>Rs. {employee?.grossSalary?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className='bg-red-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Deductions</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>PF:</span>
                <span className='font-medium text-red-600'>
                  Rs. {employee.deductions.providentFund.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Professional Tax:</span>
                <span className='font-medium text-red-600'>
                  Rs. {employee.deductions.professionalTax.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Income Tax:</span>
                <span className='font-medium text-red-600'>
                  Rs. {Math.round(employee.deductions.incomeTax).toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>ESI:</span>
                <span className='font-medium text-red-600'>Rs. {employee.deductions.esi.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Late Deduction:</span>
                <span className='font-medium text-red-600'>
                  Rs. {Math.round(employee.deductions.lateDeduction).toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between border-t pt-2'>
                <span className='text-gray-600 font-semibold'>Total Deductions:</span>
                <span className='font-bold text-red-600'>Rs. {employee.totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Attendance Details */}
          <div className='bg-green-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>Attendance Summary</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Working Days:</span>
                <span className='font-medium'>{employee.workingDays}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Present Days:</span>
                <span className='font-medium text-green-600'>{employee.presentDays}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Absent Days:</span>
                <span className='font-medium text-red-600'>{employee.absentDays}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Late Days:</span>
                <span className='font-medium text-orange-600'>{employee.lateDays}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Overtime Hours:</span>
                <span className='font-medium text-blue-600'>{employee.overtimeHours.toFixed(1)}</span>
              </div>
              <div className='flex justify-between border-t pt-2'>
                <span className='text-gray-600 font-semibold'>Attendance %:</span>
                <span
                  className={`font-bold ${
                    employee.attendancePercentage >= 95
                      ? 'text-green-600'
                      : employee.attendancePercentage >= 80
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                  {employee.attendancePercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Summary */}
        <div className='mt-6 bg-blue-50 p-6 rounded-lg'>
          <div className='flex justify-between items-center'>
            <h3 className='text-xl font-bold text-gray-800'>Net Pay for {employee.payPeriod}</h3>
            <span className='text-3xl font-bold text-blue-600'>Rs. {employee.netPay.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end space-x-4 mt-6'>
          <button
            onClick={() => handleSendPayslipEmail(employee)}
            className='flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors'>
            <Mail className='w-4 h-4' />
            <span>Send Payslip</span>
          </button>
          <button
            onClick={() => window.print()}
            className='flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'>
            <Printer className='w-4 h-4' />
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className='p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Payroll Management</h1>
          <div className='flex space-x-4'>
            <button
              onClick={() => setShowAnalytics(true)}
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
              <BarChart3 className='w-5 h-5' />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className='flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700'>
              <Settings className='w-5 h-5' />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className='bg-white p-4 rounded-lg shadow mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                {Array.from({ length: 12 }, (_, i) => (
                  <option
                    key={i}
                    value={i}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                {Array.from({ length: 10 }, (_, i) => (
                  <option
                    key={i}
                    value={new Date().getFullYear() - 5 + i}>
                    {new Date().getFullYear() - 5 + i}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                <option value='all'>All</option>
                <option value='probationary'>Probationary</option>
                <option value='permanent'>Permanent</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Search</label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search employees...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md'
                />
                <Search className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Actions */}
        <div className='bg-white p-4 rounded-lg shadow mb-6'>
          <div className='flex flex-wrap gap-4'>
            <button
              onClick={handleProcessPayroll}
              disabled={isProcessing}
              className='flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400'>
              {isProcessing ? (
                <>
                  <Clock className='w-5 h-5 animate-spin' />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Calculator className='w-5 h-5' />
                  <span>Process Payroll</span>
                </>
              )}
            </button>
            <button
              onClick={handleBulkPayslipDownload}
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
              <Download className='w-5 h-5' />
              <span>Download All Payslips</span>
            </button>
            <button
              onClick={handleExportExcel}
              className='flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700'>
              <FileText className='w-5 h-5' />
              <span>Export to Excel</span>
            </button>
            <button
              onClick={handleBulkEmailSend}
              className='flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'>
              <Send className='w-5 h-5' />
              <span>Send Bulk Emails</span>
            </button>
          </div>
        </div>

        {/* Payroll Table */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    <button
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className='flex items-center space-x-1'>
                      <span>Employee</span>
                      {sortBy === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Position
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    <button
                      onClick={() => {
                        setSortBy('netPay');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className='flex items-center space-x-1'>
                      <span>Net Pay</span>
                      {sortBy === 'netPay' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Attendance
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {getFilteredAndSortedPayrollData().map((employee) => (
                  <tr
                    key={employee.id}
                    className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                          <User className='h-6 w-6 text-gray-600' />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{employee.name}</div>
                          <div className='text-sm text-gray-500'>{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>{employee.position}</div>
                      <div className='text-sm text-gray-500'>{employee.department}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.status === 'permanent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      Rs. {employee.netPay.toLocaleString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {employee.presentDays}/{employee.workingDays} days
                      </div>
                      <div
                        className={`text-sm ${
                          employee.attendancePercentage >= 95
                            ? 'text-green-600'
                            : employee.attendancePercentage >= 80
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                        {employee.attendancePercentage}%
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={() => {
                            const data = payrollData[employee.id];
                            if (!data) {
                              Swal.fire({
                                icon: 'info',
                                title: 'Payroll Not Calculated',
                                text: `Payroll data is not available for ${employee.name}.`,
                              });
                              return;
                            }
                            setSelectedEmployee(data);
                          }}
                          className='text-blue-600 hover:text-blue-900'>
                          <Eye className='h-5 w-5' />
                        </button>
                        <button
                          onClick={() => handleDownloadPayslipPDF(employee)}
                          className='text-green-600 hover:text-green-900'>
                          <Download className='h-5 w-5' />
                        </button>
                        <button
                          onClick={() => handleSendPayslipEmail(employee)}
                          className='text-indigo-600 hover:text-indigo-900'>
                          <Mail className='h-5 w-5' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-6'>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Total Employees</p>
                <p className='text-2xl font-semibold text-gray-900'>{getTotalStats().totalEmployees}</p>
              </div>
              <Users className='h-8 w-8 text-blue-500' />
            </div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Total Earnings</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  Rs. {getTotalStats().totalEarnings.toLocaleString()}
                </p>
              </div>
              <TrendingUp className='h-8 w-8 text-green-500' />
            </div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Total Deductions</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  Rs. {getTotalStats().totalDeductions.toLocaleString()}
                </p>
              </div>
              <TrendingDown className='h-8 w-8 text-red-500' />
            </div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Net Payable</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  Rs. {getTotalStats().totalNetPay.toLocaleString()}
                </p>
              </div>
              <DollarSign className='h-8 w-8 text-purple-500' />
            </div>
          </div>
        </div>

        {/* Modals */}
        {showSettings && <PayrollSettingsModal />}
        {showAnalytics && <PayrollAnalytics />}
        {selectedEmployee && (
          <EmployeeDetailModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
