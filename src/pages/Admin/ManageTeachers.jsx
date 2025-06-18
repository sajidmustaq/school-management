import React, { useState, useMemo, useEffect } from 'react'; // Add useEffect

import AdminLayout from '../../components/AdminLayout';
import { useData } from '../../context/DataContext';
import Swal from 'sweetalert2';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import printJS from 'print-js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Plus, Edit2, Trash2, Download, Printer, Search, X, Save, Eye, Phone, Mail,
  MapPin, GraduationCap, Calendar, Clock, DollarSign, AlertTriangle,
  CheckCircle, Calculator, FileText, Users, TrendingUp, Award, Coffee,
  UserCheck, UserX, CreditCard, PieChart, BarChart3, FilePlus, Send,
  RefreshCw // Add this
} from 'lucide-react';

export default function ManageTeachers() {
  const { teachers, setTeachers, subjects } = useData();

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    subjects: [],
    joiningDate: '',
    salary: '',
    status: 'active',
    guardianSpouse: '',
    gender: 'male',
    dateOfBirth: '',
    profileImage: null,
    employeeId: '',
    dutyStartTime: '08:00',
    dutyEndTime: '16:00',
    workingDays: 6,
    hourlyRate: '',
    overtimeRate: 1.5,
    basicSalary: '',
    allowances: {
      medical: 0,
      transport: 0,
      house: 0,
      food: 0,
      other: 0
    },
    deductions: {
      tax: 0,
      providentFund: 0,
      insurance: 0,
      loan: 0,
      other: 0
    },
    leavePolicy: {
      casualLeave: 12,
      sickLeave: 10,
      annualLeave: 21,
      maternityLeave: 90,
      leaveEncashment: true
    },
    bonusPolicy: {
      performanceBonus: 0,
      festivalBonus: 0,
      yearEndBonus: 0
    },
    latePolicy: {
      graceMinutes: 15,
      deductionPerMinute: 0,
      maxLateMinutesPerMonth: 120
    },
    bankDetails: {
      accountTitle: '',
      accountNumber: '',
      bankName: '',
      branchCode: ''
    }
  });

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [showPayrollCalculator, setShowPayrollCalculator] = useState(false);
  const [selectedTeacherForPayroll, setSelectedTeacherForPayroll] = useState(null);

  const [payrollData, setPayrollData] = useState({
    workingDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateMinutes: 0,
    overtimeHours: 0,
    casualLeavesTaken: 0,
    sickLeavesTaken: 0,
    bonusAmount: 0,
    extraDeductions: 0
  });

  const calculateDailyHours = (startTime, endTime) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return (end - start) / (1000 * 60 * 60);
  };

  const calculateHourlyRate = (monthlySalary, workingDays) => {
    const dailyHours = calculateDailyHours(newTeacher.dutyStartTime, newTeacher.dutyEndTime);
    const monthlyHours = workingDays * 4.33 * dailyHours;
    return monthlySalary / monthlyHours;
  };

  const calculatePayroll = (teacher, payrollInputs) => {
    const basicSalary = parseFloat(teacher.basicSalary || teacher.salary || 0);
    const hourlyRate = calculateHourlyRate(basicSalary, teacher.workingDays || 6);
    const dailyRate = basicSalary / (teacher.workingDays * 4.33);
    const grossSalary = (payrollInputs.presentDays / (teacher.workingDays * 4.33)) * basicSalary;
    const absentDeduction = payrollInputs.absentDays * dailyRate;
    const lateDeduction = (payrollInputs.lateMinutes / 60) * hourlyRate;
    const overtimePay = payrollInputs.overtimeHours * hourlyRate * (teacher.overtimeRate || 1.5);
    const totalAllowances = Object.values(teacher.allowances || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalDeductions = Object.values(teacher.deductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const casualLeaveBalance = (teacher.leavePolicy?.casualLeave || 12) - payrollInputs.casualLeavesTaken;
    const sickLeaveBalance = (teacher.leavePolicy?.sickLeave || 10) - payrollInputs.sickLeavesTaken;
    const leaveEncashment = teacher.leavePolicy?.leaveEncashment ?
      (casualLeaveBalance > 0 ? casualLeaveBalance * dailyRate : 0) : 0;
    const netSalary = grossSalary + totalAllowances + overtimePay + payrollInputs.bonusAmount + leaveEncashment
      - absentDeduction - lateDeduction - totalDeductions - payrollInputs.extraDeductions;

    return {
      basicSalary,
      hourlyRate,
      dailyRate,
      grossSalary,
      totalAllowances,
      overtimePay,
      absentDeduction,
      lateDeduction,
      totalDeductions,
      leaveEncashment,
      bonusAmount: payrollInputs.bonusAmount,
      extraDeductions: payrollInputs.extraDeductions,
      netSalary: Math.max(0, netSalary),
      payrollBreakdown: {
        workingDays: teacher.workingDays * 4.33,
        presentDays: payrollInputs.presentDays,
        absentDays: payrollInputs.absentDays,
        lateMinutes: payrollInputs.lateMinutes,
        overtimeHours: payrollInputs.overtimeHours,
        casualLeavesTaken: payrollInputs.casualLeavesTaken,
        sickLeavesTaken: payrollInputs.sickLeavesTaken,
        casualLeaveBalance,
        sickLeaveBalance
      }
    };
  };

  const validateTeacher = (teacher) => {
    const newErrors = {};
    if (!teacher.name?.trim()) newErrors.name = 'Name is required';
    if (!teacher.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(teacher.email)) newErrors.email = 'Please enter a valid email';
    if (!teacher.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!teacher.address?.trim()) newErrors.address = 'Address is required';
    if (!teacher.qualification?.trim()) newErrors.qualification = 'Qualification is required';
    if (!teacher.joiningDate) newErrors.joiningDate = 'Joining date is required';

    // Validate only basicSalary (not salary)
    if (!teacher.basicSalary || teacher.basicSalary <= 0) newErrors.basicSalary = 'Basic salary is required';

    if (!teacher.subjects || teacher.subjects.length === 0) newErrors.subjects = 'Please select at least one subject';
    if (!teacher.employeeId?.trim()) newErrors.employeeId = 'Employee ID is required';

    // Duty times validation
    if (!teacher.dutyStartTime || !teacher.dutyEndTime) {
      newErrors.dutyTimes = 'Duty timings are required';
    } else if (teacher.dutyStartTime >= teacher.dutyEndTime) {
      newErrors.dutyTimes = 'End time must be after start time';
    }

    return newErrors;
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some(subject =>
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [teachers, searchTerm]);

  const generateEmployeeId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const existingIds = teachers.map(t => t.employeeId).filter(Boolean);
    let counter = 1;
    let newId;

    do {
      newId = `EMP${String(counter).padStart(4, '0')}`;
      counter++;
    } while (existingIds.includes(newId));

    return newId;
  };

  //New use
  useEffect(() => {
    if (showAddForm && !editId && !newTeacher.employeeId) {
      const generatedId = generateEmployeeId();
      setNewTeacher(prev => ({
        ...prev,
        employeeId: generatedId,
        basicSalary: prev.basicSalary || prev.salary || '' 
      }));
    }
  }, [showAddForm, editId, teachers.length]);



  const handleChange = (e) => {
    const { name, value } = e.target;

    
    if (name === 'salary') {
      setNewTeacher(prev => ({
        ...prev,
        salary: value,
        basicSalary: value 
      }));
    }
  
    else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewTeacher({
        ...newTeacher,
        [parent]: {
          ...newTeacher[parent],
          [child]: value
        }
      });
    } else {
      setNewTeacher({ ...newTeacher, [name]: value });
    }

    // اگر کوئی خرابی تھی تو صاف کریں
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTeacher({ ...newTeacher, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (selected) => {
    setNewTeacher({
      ...newTeacher,
      subjects: selected ? selected.map((opt) => opt.value) : [],
    });
    if (errors.subjects) {
      setErrors({ ...errors, subjects: '' });
    }
  };

  const resetForm = () => {
    setNewTeacher({
      name: '',
      email: '',
      phone: '',
      address: '',
      qualification: '',
      subjects: [],
      joiningDate: '',
      salary: '',
      status: 'active',
      guardianSpouse: '',
      gender: 'male',
      dateOfBirth: '',
      profileImage: null,
      employeeId: '',
      dutyStartTime: '08:00',
      dutyEndTime: '16:00',
      workingDays: 6,
      hourlyRate: '',
      overtimeRate: 1.5,
      basicSalary: '',
      allowances: {
        medical: 0,
        transport: 0,
        house: 0,
        food: 0,
        other: 0
      },
      deductions: {
        tax: 0,
        providentFund: 0,
        insurance: 0,
        loan: 0,
        other: 0
      },
      leavePolicy: {
        casualLeave: 12,
        sickLeave: 10,
        annualLeave: 21,
        maternityLeave: 90,
        leaveEncashment: true
      },
      bonusPolicy: {
        performanceBonus: 0,
        festivalBonus: 0,
        yearEndBonus: 0
      },
      latePolicy: {
        graceMinutes: 15,
        deductionPerMinute: 0,
        maxLateMinutesPerMonth: 120
      },
      bankDetails: {
        accountTitle: '',
        accountNumber: '',
        bankName: '',
        branchCode: ''
      }
    });
    setErrors({});
    setEditId(null);
    setShowAddForm(false);
    setActiveTab('basic');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const teacherToValidate = {
      ...newTeacher,
      basicSalary: newTeacher.basicSalary || newTeacher.salary
    };
    const validationErrors = validateTeacher(teacherToValidate);

if (Object.keys(validationErrors).length > 0) {
  setErrors(validationErrors);
  Swal.fire({
    icon: 'error',
    title: 'Invalid Input',
    text: 'Please fill all required fields correctly',
    confirmButtonColor: '#2E86C1',
  });
  return;
}
    if (teachers.some(t => t.email === newTeacher.email && t.id !== editId)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Email',
        text: 'This email already exists',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }
    if (teachers.some(t => t.employeeId === newTeacher.employeeId && t.id !== editId)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Employee ID',
        text: 'This employee ID already exists',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }
    const maxId = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) : 0;
    const newEntry = {
      id: maxId + 1,
      ...newTeacher,
      employeeId: newTeacher.employeeId || generateEmployeeId(),
      createdAt: new Date().toISOString()
    };
    setTeachers([...teachers, newEntry]);
    resetForm();
    Swal.fire({
      icon: 'success',
      title: 'Teacher Added',
      text: `${newEntry.name} has been added successfully`,
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleEdit = (teacher) => {
    setEditId(teacher.id);
    setNewTeacher({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone || '',
      address: teacher.address || '',
      qualification: teacher.qualification || '',
      subjects: teacher.subjects || [],
      joiningDate: teacher.joiningDate || '',
      salary: teacher.salary || '',
      status: teacher.status || 'active',
      guardianSpouse: teacher.guardianSpouse || '',
      gender: teacher.gender || 'male',
      dateOfBirth: teacher.dateOfBirth || '',
      profileImage: teacher.profileImage || null,
      employeeId: teacher.employeeId || '',
      dutyStartTime: teacher.dutyStartTime || '08:00',
      dutyEndTime: teacher.dutyEndTime || '16:00',
      workingDays: teacher.workingDays || 6,
      hourlyRate: teacher.hourlyRate || '',
      overtimeRate: teacher.overtimeRate || 1.5,
      basicSalary: teacher.basicSalary || teacher.salary || '',
      allowances: teacher.allowances || {
        medical: 0,
        transport: 0,
        house: 0,
        food: 0,
        other: 0
      },
      deductions: teacher.deductions || {
        tax: 0,
        providentFund: 0,
        insurance: 0,
        loan: 0,
        other: 0
      },
      leavePolicy: teacher.leavePolicy || {
        casualLeave: 12,
        sickLeave: 10,
        annualLeave: 21,
        maternityLeave: 90,
        leaveEncashment: true
      },
      bonusPolicy: teacher.bonusPolicy || {
        performanceBonus: 0,
        festivalBonus: 0,
        yearEndBonus: 0
      },
      latePolicy: teacher.latePolicy || {
        graceMinutes: 15,
        deductionPerMinute: 0,
        maxLateMinutesPerMonth: 120
      },
      bankDetails: teacher.bankDetails || {
        accountTitle: '',
        accountNumber: '',
        bankName: '',
        branchCode: ''
      }
    });
    setShowAddForm(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const validationErrors = validateTeacher(newTeacher);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (teachers.some(t => t.email === newTeacher.email && t.id !== editId)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Email',
        text: 'This email already exists',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }
    if (teachers.some(t => t.employeeId === newTeacher.employeeId && t.id !== editId)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Employee ID',
        text: 'This employee ID already exists',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }
    const updated = teachers.map((t) =>
      t.id === editId ? { ...t, ...newTeacher, updatedAt: new Date().toISOString() } : t
    );
    setTeachers(updated);
    resetForm();
    Swal.fire({
      icon: 'success',
      title: 'Information Updated',
      text: 'Teacher information has been updated successfully',
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleDelete = (id) => {
    const teacher = teachers.find((t) => t.id === id);
    Swal.fire({
      title: `Delete ${teacher.name}?`,
      text: 'Are you sure you want to delete this teacher?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setTeachers(teachers.filter((t) => t.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${teacher.name} has been deleted`,
          confirmButtonColor: '#2E86C1',
        });
      }
    });
  };

  const handleExport = () => {
    if (teachers.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No teachers available to export',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }
    const data = teachers.map((t, index) => ({
      'Serial No': index + 1,
      'Employee ID': t.employeeId || 'N/A',
      'Name': t.name,
      'Email': t.email || 'N/A',
      'Phone': t.phone || 'N/A',
      'Address': t.address || 'N/A',
      'Qualification': t.qualification || 'N/A',
      'Subjects': t.subjects?.join(', ') || 'N/A',
      'Joining Date': t.joiningDate || 'N/A',
      'Basic Salary': t.basicSalary || t.salary || 'N/A',
      'Hourly Rate': t.hourlyRate || 'N/A',
      'Duty Hours': `${t.dutyStartTime || '08:00'} - ${t.dutyEndTime || '16:00'}`,
      'Working Days': t.workingDays || 'N/A',
      'Status': t.status === 'active' ? 'Active' : 'Inactive',
      'Guardian/Spouse': t.guardianSpouse || 'N/A',
      'Gender': t.gender || 'N/A',
      'Date of Birth': t.dateOfBirth || 'N/A',
      'Bank Account': t.bankDetails?.accountNumber || 'N/A',
      'Bank Name': t.bankDetails?.bankName || 'N/A'
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers Payroll Data');
    XLSX.writeFile(workbook, `Teachers_Payroll_${new Date().toISOString().split('T')[0]}.xlsx`);
    Swal.fire({
      icon: 'success',
      title: 'Export Complete',
      text: 'File has been downloaded successfully',
      confirmButtonColor: '#2E86C1',
    });
  };

  const handlePrint = () => {
    if (teachers.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No teachers available to print',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }
    printJS({
      printable: 'print-section',
      type: 'html',
      style: `
        @page { margin: 1cm; }
        table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
        th { background-color: #2E86C1; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .print-header { text-align: center; margin-bottom: 20px; }
        .print-header h2 { color: #2E86C1; margin: 0; }
        .print-date { text-align: right; margin-bottom: 10px; font-size: 12px; }
      `,
      scanStyles: false
    });
  };

  const openPayrollCalculator = (teacher) => {
    setSelectedTeacherForPayroll(teacher);
    setPayrollData({
      workingDays: teacher.workingDays * 4.33 || 26,
      presentDays: teacher.workingDays * 4.33 || 26,
      absentDays: 0,
      lateMinutes: 0,
      overtimeHours: 0,
      casualLeavesTaken: 0,
      sickLeavesTaken: 0,
      bonusAmount: 0,
      extraDeductions: 0
    });
    setShowPayrollCalculator(true);
  };

  const handlePayrollInputChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setPayrollData(prev => {
      const updated = { ...prev, [name]: numericValue };
      if (name === 'presentDays') {
        updated.absentDays = Math.max(0, updated.workingDays - numericValue);
      }
      return updated;
    });
  };
  const handleDownloadPayslipPDF = (teacher) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Company Header
    doc.setFillColor(46, 134, 193);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Excellence Education Institute', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Karachi, Pakistan | Tel: +92-21-XXXXXXX | Email: hr@excellence.edu.pk', 105, 22, { align: 'center' });

    // Payslip Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SALARY SLIP', 105, 40, { align: 'center' });

    // Employee Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Employee Name: ${teacher.name}`, 20, 50);
    doc.text(`Employee ID: ${teacher.employeeId}`, 20, 56);
    doc.text(`Department: ${teacher.department || 'Academic'}`, 20, 62);
    doc.text(`Position: ${teacher.position || 'Teacher'}`, 20, 68);
    doc.text(`Pay Period: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`, 20, 74);

    // Earnings Section
    doc.setFont('helvetica', 'bold');
    doc.text('EARNINGS', 20, 84);
    doc.setFont('helvetica', 'normal');

    const basicSalary = parseFloat(teacher.basicSalary || teacher.salary || 0);
    const allowances = Object.values(teacher.allowances || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalEarnings = basicSalary + allowances;

    doc.text(`Basic Salary: Rs. ${basicSalary.toLocaleString()}`, 20, 90);
    doc.text(`Allowances: Rs. ${allowances.toLocaleString()}`, 20, 96);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Earnings: Rs. ${totalEarnings.toLocaleString()}`, 20, 102);

    // Deductions Section
    doc.setFont('helvetica', 'bold');
    doc.text('DEDUCTIONS', 20, 112);
    doc.setFont('helvetica', 'normal');

    const deductions = Object.values(teacher.deductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    doc.text(`Tax & Deductions: Rs. ${deductions.toLocaleString()}`, 20, 118);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Deductions: Rs. ${deductions.toLocaleString()}`, 20, 124);

    // Net Pay
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`NET PAY: Rs. ${(totalEarnings - deductions).toLocaleString()}`, 20, 136);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer generated payslip and does not require signature.', 105, 280, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });

    doc.save(`Payslip_${teacher.name}_${new Date().getMonth() + 1}_${new Date().getFullYear()}.pdf`);

    Swal.fire({
      icon: 'success',
      title: 'Payslip Generated',
      text: 'Payslip PDF has been downloaded',
      confirmButtonColor: '#2E86C1',
    });
  };
  const handleBulkPayslipDownload = () => {
    if (teachers.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No teachers available to generate payslips',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    Swal.fire({
      title: 'Generate All Payslips?',
      text: `This will generate ${teachers.length} payslip PDFs. Continue?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2E86C1',
      cancelButtonColor: '#E74C3C',
      confirmButtonText: 'Generate All',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        teachers.forEach((teacher, index) => {
          setTimeout(() => {
            handleDownloadPayslipPDF(teacher);
          }, index * 500);
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
  const handleSendPayslipEmail = (teacher) => {
    Swal.fire({
      title: 'Send Payslip Email',
      html: `
            <div class="text-left">
              <p><strong>Employee:</strong> ${teacher.name}</p>
              <p><strong>Email:</strong> ${teacher.email || 'Not available'}</p>
              <hr class="my-3">
              <label class="block text-sm font-medium mb-2">Additional Message:</label>
              <textarea id="emailMessage" class="w-full p-2 border border-gray-300 rounded" rows="3" 
                        placeholder="Add any additional message..."></textarea>
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
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Email Sent!',
          text: `Payslip has been sent to ${teacher.name}'s email.`,
          confirmButtonColor: '#2E86C1',
        });
      }
    });
  };
  const handleBulkEmailSend = () => {
    const teachersWithEmail = teachers.filter(t => t.email);

    if (teachersWithEmail.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Email Addresses',
        text: 'No teachers have email addresses configured',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    Swal.fire({
      title: 'Send Bulk Payslip Emails?',
      html: `
              <div class="text-left">
                <p><strong>Total Teachers:</strong> ${teachers.length}</p>
                <p><strong>With Email:</strong> ${teachersWithEmail.length}</p>
                <hr class="my-3">
                <label class="block text-sm font-medium mb-2">Email Subject:</label>
                <input id="emailSubject" class="w-full p-2 border border-gray-300 rounded mb-3" 
                       value="Salary Slip - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}" />
                <label class="block text-sm font-medium mb-2">Email Message:</label>
                <textarea id="bulkEmailMessage" class="w-full p-2 border border-gray-300 rounded" rows="4" 
                          placeholder="Dear Employee,\n\nPlease find attached your salary slip..."></textarea>
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
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Bulk Emails Sent!',
          text: `Payslips have been sent to ${teachersWithEmail.length} teachers.`,
          confirmButtonColor: '#2E86C1',
        });
      }
    });
  };
  const totalSalaryExpense = teachers.reduce((sum, t) => sum + (parseFloat(t.basicSalary || t.salary) || 0), 0);
  const averageSalary = teachers.length > 0 ? totalSalaryExpense / teachers.length : 0;
  const activeTeachers = teachers.filter(t => t.status === 'active').length;

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: errors.subjects ? '#ef4444' : '#AED6F1',
      '&:hover': {
        borderColor: errors.subjects ? '#ef4444' : '#2E86C1',
      },
      borderRadius: '0.5rem',
      padding: '0.25rem',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#AED6F1',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1C2833',
      fontWeight: '500',
    }),
  };

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2E86C1]">Complete Payroll Management System</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#2E86C1] text-white px-4 py-2 rounded-lg hover:bg-[#1C628F] transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              {showAddForm ? 'Cancel' : 'Add New Teacher'}
            </button>
            <button
              onClick={handleBulkPayslipDownload}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              Download All Payslips
            </button>
            <button
              onClick={handleBulkEmailSend}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              Send Bulk Emails
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FileText size={20} />
              Export to Excel
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Printer size={20} />
              Print List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#2E86C1] transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-xl sm:text-2xl font-bold text-[#2E86C1]">{teachers.length}</p>
              </div>
              <Users className="text-[#2E86C1]" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Employees</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{activeTeachers}</p>
              </div>
              <UserCheck className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subjects</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{subjects.length}</p>
              </div>
              <GraduationCap className="text-yellow-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Salary</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {Math.round(averageSalary).toLocaleString()} PKR
                </p>
              </div>
              <DollarSign className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Expense</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {Math.round(totalSalaryExpense).toLocaleString()} PKR
                </p>
              </div>
              <CreditCard className="text-red-500" size={24} />
            </div>
          </div>
        </div>

       {showAddForm && (
  <div className="bg-white rounded-xl shadow-lg border-l-4 border-[#2E86C1] p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-[#1C2833]">
                {editId ? 'Edit Employee Information' : 'Add New Employee'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 border-b border-gray-200">
              {['basic', 'payroll', 'leaves', 'bank'].map(tab => (
                <button
                  key={tab}
                  className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors rounded-t-md ${activeTab === tab
                    ? 'bg-[#2E86C1] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-[#AED6F1] hover:text-[#1C2833]'
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={newTeacher.name}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'
                          } p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors`}
                        placeholder="Enter full name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={newTeacher.email}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'
                          } p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors`}
                        placeholder="Enter email"
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="phone"
                        value={newTeacher.phone}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'
                          } p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors`}
                        placeholder="Enter phone number"
                      />
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address"
                        value={newTeacher.address}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300'
                          } p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors`}
                        placeholder="Enter address"
                      />
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="qualification"
                        value={newTeacher.qualification}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.qualification ? 'border-red-500' : 'border-gray-300'
                          } p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors`}
                        placeholder="Enter qualification"
                      />
                      <GraduationCap className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
                    <Select
                      isMulti
                      options={subjects.map(subject => ({ value: subject, label: subject }))}
                      value={newTeacher.subjects.map(subject => ({ value: subject, label: subject }))}
                      onChange={handleSelectChange}
                      className="mt-1"
                      styles={selectStyles}
                    />
                    {errors.subjects && <p className="text-red-500 text-xs mt-1">{errors.subjects}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="joiningDate"
                        value={newTeacher.joiningDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors pl-10"  /* Added pl-10 for padding */
                      />
                      <Calendar
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={newTeacher.gender}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={newTeacher.dateOfBirth}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors pl-10"  /* Added pl-10 for padding */
                      />
                      <Calendar
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guardian/Spouse</label>
                    <input
                      type="text"
                      name="guardianSpouse"
                      value={newTeacher.guardianSpouse}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                      placeholder="Enter guardian/spouse name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={newTeacher.status === 'active'}
                          onChange={() => setNewTeacher({ ...newTeacher, status: 'active' })}
                          className="h-4 w-4 text-[#2E86C1] focus:ring-[#2E86C1]"
                        />
                        <span className="ml-2">Active</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={newTeacher.status === 'inactive'}
                          onChange={() => setNewTeacher({ ...newTeacher, status: 'inactive' })}
                          className="h-4 w-4 text-[#2E86C1] focus:ring-[#2E86C1]"
                        />
                        <span className="ml-2">Inactive</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full rounded-lg border border-gray-300 p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#2E86C1] file:text-white hover:file:bg-[#1C628F]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'payroll' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        name="employeeId"
                        value={newTeacher.employeeId}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.employeeId ? 'border-red-500' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors`}
                        placeholder="Employee ID will auto-generate"
                        readOnly={!editId}
                      />
                      {!editId && (
                        <button
                          type="button"
                          onClick={() => setNewTeacher(prev => ({
                            ...prev,
                            employeeId: generateEmployeeId()
                          }))}
                          className="ml-2 p-2 bg-[#2E86C1] text-white rounded-lg hover:bg-[#1C628F] transition-colors"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                      {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (PKR)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="basicSalary"
                        value={newTeacher.basicSalary}
                        onChange={handleChange}
                        className={`w-full rounded-lg border ${errors.basicSalary ? 'border-red-500' : 'border-gray-300'
                          } p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors`}
                        placeholder="Enter basic salary"
                      />
                      <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      {errors.basicSalary && <p className="text-red-500 text-xs mt-1">{errors.basicSalary}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duty Start Time</label>
                    <input
                      type="time"
                      name="dutyStartTime"
                      value={newTeacher.dutyStartTime}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duty End Time</label>
                    <input
                      type="time"
                      name="dutyEndTime"
                      value={newTeacher.dutyEndTime}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                    />
                    {errors.dutyTimes && <p className="text-red-500 text-xs mt-1">{errors.dutyTimes}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Working Days per Week</label>
                    <input
                      type="number"
                      name="workingDays"
                      value={newTeacher.workingDays}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                      min="1"
                      max="7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Rate (x)</label>
                    <input
                      type="number"
                      name="overtimeRate"
                      value={newTeacher.overtimeRate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                      step="0.1"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <h4 className="text-lg font-medium text-[#2E86C1] mb-3">Allowances</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medical Allowance</label>
                        <input
                          type="number"
                          name="allowances.medical"
                          value={newTeacher.allowances.medical}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transport Allowance</label>
                        <input
                          type="number"
                          name="allowances.transport"
                          value={newTeacher.allowances.transport}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">House Allowance</label>
                        <input
                          type="number"
                          name="allowances.house"
                          value={newTeacher.allowances.house}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Food Allowance</label>
                        <input
                          type="number"
                          name="allowances.food"
                          value={newTeacher.allowances.food}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <h4 className="text-lg font-medium text-[#2E86C1] mb-3">Deductions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                        <input
                          type="number"
                          name="deductions.tax"
                          value={newTeacher.deductions.tax}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provident Fund</label>
                        <input
                          type="number"
                          name="deductions.providentFund"
                          value={newTeacher.deductions.providentFund}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance</label>
                        <input
                          type="number"
                          name="deductions.insurance"
                          value={newTeacher.deductions.insurance}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loan</label>
                        <input
                          type="number"
                          name="deductions.loan"
                          value={newTeacher.deductions.loan}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'leaves' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Casual Leave (Days/Year)</label>
                    <input
                      type="number"
                      name="leavePolicy.casualLeave"
                      value={newTeacher.leavePolicy.casualLeave}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sick Leave (Days/Year)</label>
                    <input
                      type="number"
                      name="leavePolicy.sickLeave"
                      value={newTeacher.leavePolicy.sickLeave}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Leave (Days/Year)</label>
                    <input
                      type="number"
                      name="leavePolicy.annualLeave"
                      value={newTeacher.leavePolicy.annualLeave}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maternity Leave (Days)</label>
                    <input
                      type="number"
                      name="leavePolicy.maternityLeave"
                      value={newTeacher.leavePolicy.maternityLeave}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Encashment</label>
                    <input
                      type="checkbox"
                      name="leavePolicy.leaveEncashment"
                      checked={newTeacher.leavePolicy.leaveEncashment}
                      onChange={(e) => setNewTeacher({
                        ...newTeacher,
                        leavePolicy: {
                          ...newTeacher.leavePolicy,
                          leaveEncashment: e.target.checked
                        }
                      })}
                      className="mt-1 h-5 w-5 text-[#2E86C1] focus:ring-[#2E86C1]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Title</label>
                    <input
                      type="text"
                      name="bankDetails.accountTitle"
                      value={newTeacher.bankDetails.accountTitle}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                      placeholder="Enter account title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      name="bankDetails.accountNumber"
                      value={newTeacher.bankDetails.accountNumber}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      name="bankDetails.bankName"
                      value={newTeacher.bankDetails.bankName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
                    <input
                      type="text"
                      name="bankDetails.branchCode"
                      value={newTeacher.bankDetails.branchCode}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                      placeholder="Enter branch code"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editId ? handleUpdate : handleAdd}
                  className="px-4 py-2 bg-[#2E86C1] text-white rounded-lg hover:bg-[#1C628F] transition-colors flex items-center gap-2"
                >
                  <Save size={20} />
                  {editId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPayrollCalculator && selectedTeacherForPayroll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg sm:max-w-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#1C2833]">
                  Payroll Calculator for {selectedTeacherForPayroll.name}
                </h3>
                <button
                  onClick={() => setShowPayrollCalculator(false)}
                  className="text-gray-500 hover:text-red-500 transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Working Days</label>
                  <input
                    type="number"
                    name="workingDays"
                    value={payrollData.workingDays}
                    onChange={handlePayrollInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Present Days</label>
                  <input
                    type="number"
                    name="presentDays"
                    value={payrollData.presentDays}
                    onChange={handlePayrollInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Late Minutes</label>
                  <input
                    type="number"
                    name="lateMinutes"
                    value={payrollData.lateMinutes}
                    onChange={handlePayrollInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
                  <input
                    type="number"
                    name="overtimeHours"
                    value={payrollData.overtimeHours}
                    onChange={handlePayrollInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Casual Leaves Taken</label>
                  <input
                    type="number"
                    name="casualLeavesTaken"
                    value={payrollData.casualLeavesTaken}
                    onChange={handlePayrollInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sick Leaves Taken</label>
                  <input
                    type="number"
                    name="sickLeavesTaken"
                    value={payrollData.sickLeavesTaken}
                    onChange={handlePayrollInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Amount</label>
                  <input
                    type="number"
                    name="bonusAmount"
                    value={payrollData.bonusAmount}
                    onChange={handlePayrollInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Deductions</label>
                  <input
                    type="number"
                    name="extraDeductions"
                    value={payrollData.extraDeductions}
                    onChange={handlePayrollInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium text-[#2E86C1] mb-3">Payroll Summary</h4>
                {(() => {
                  const payroll = calculatePayroll(selectedTeacherForPayroll, payrollData);
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Basic Salary: <span className="font-medium">{payroll.basicSalary.toLocaleString()} PKR</span></p>
                        <p className="text-sm text-gray-600">Gross Salary: <span className="font-medium">{payroll.grossSalary.toLocaleString()} PKR</span></p>
                        <p className="text-sm text-gray-600">Total Allowances: <span className="font-medium">{payroll.totalAllowances.toLocaleString()} PKR</span></p>
                        <p className="text-sm text-gray-600">Overtime Pay: <span className="font-medium">{payroll.overtimePay.toLocaleString()} PKR</span></p>
                        <p className="text-sm text-gray-600">Leave Encashment: <span className="font-medium">{payroll.leaveEncashment.toLocaleString()} PKR</span></p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Absent Deduction: <span className="font-medium">{payroll.absentDeduction.toLocaleString()} PKR</span></p>
                        <p className="text-sm text-gray-600">Late Deduction: <span className="font-medium">{payroll.lateDeduction.toLocaleString()} PKR</span></p>
                        <p className="text-sm text-gray-600">Total Deductions: <span className="font-medium">{payroll.totalDeductions.toLocaleString()} PKR</span></p>
                        <p className="text-sm text-gray-600">Extra Deductions: <span className="font-medium">{payroll.extraDeductions.toLocaleString()} PKR</span></p>
                        <p className="text-lg font-bold text-[#2E86C1] mt-2">Net Salary: <span>{payroll.netSalary.toLocaleString()} PKR</span></p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

     <div className="bg-white rounded-xl shadow-lg border-l-4 border-[#2E86C1] p-4 sm:p-6 mt-6">
  {console.log("Employee List Section Rendering", { teachers, filteredTeachers })} {/* Debugging */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
    <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-[#1C2833]">Employee List</h3>
    <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
      <div className="relative w-full xs:w-48 sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E86C1] focus:border-[#2E86C1] transition-colors"
        />
      </div>
      <div className="flex gap-2 w-full xs:w-auto">
        <button
          onClick={() => {
            console.log("Export Button Clicked"); // Debugging
            handleExport();
          }}
          className="bg-green-500 text-white px-3 xs:px-4 py-2 text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 w-full xs:w-auto"
        >
          <Download size={16} />
          Export
        </button>
        <button
          onClick={() => {
            console.log("Print Button Clicked"); // Debugging
            handlePrint();
          }}
          className="bg-blue-500 text-white px-3 xs:px-4 py-2 text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 w-full xs:w-auto"
        >
          <Printer size={16} />
          Print
        </button>
      </div>
    </div>
  </div>

  <div id="print-section" className="overflow-x-auto">
    <table className="w-full divide-y divide-gray-200">
      <thead className="bg-[#2E86C1]">
        <tr>
          <th className="px-3 xs:px-4 sm:px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Employee ID</th>
          <th className="px-3 xs:px-4 sm:px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
          <th className="px-3 xs:px-4 sm:px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider hidden sm:table-cell">Email</th>
          <th className="px-3 xs:px-4 sm:px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider hidden md:table-cell">Phone</th>
          <th className="px-3 xs:px-4 sm:px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider hidden lg:table-cell">Subjects</th>
          <th className="px-3 xs:px-4 sm:px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Salary</th>
          <th className="px-3 xs:px-4 sm:px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider hidden sm:table-cell">Status</th>
          <th className="px-3 xs:px-4 sm:px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <tr key={teacher.id} className="hover:bg-gray-50">
              <td className="px-3 xs:px-4 sm:px-6 py-3 whitespace-nowrap text-xs xs:text-sm">{teacher.employeeId || 'N/A'}</td>
              <td className="px-3 xs:px-4 sm:px-6 py-3 whitespace-nowrap text-xs xs:text-sm">{teacher.name || 'N/A'}</td>
              <td className="px-3 xs:px-4 sm:px-6 py-3 whitespace-nowrap text-xs xs:text-sm hidden sm:table-cell">{teacher.email || 'N/A'}</td>
              <td className="px-3 xs:px-4 sm:px-6 py-3 whitespace-nowrap text-xs xs:text-sm hidden md:table-cell">{teacher.phone || 'N/A'}</td>
              <td className="px-3 xs:px-4 sm:px-6 py-3 whitespace-nowrap text-xs xs:text-sm hidden lg:table-cell">{teacher.subjects?.join(', ') || 'N/A'}</td>
              <td className="px-3 xs:px-4 sm:px-6 py-3 whitespace-nowrap text-xs xs:text-sm">
                {(parseFloat(teacher.basicSalary || teacher.salary) || 0).toLocaleString()} PKR
              </td>
              <td className="px-3 xs:px-4 sm:px-6 py-3 whitespace-nowrap text-xs xs:text-sm hidden sm:table-cell">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {teacher.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-3 xs:px-4 sm:px-6 py-3 whitespace-nowrap text-xs xs:text-sm font-medium">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      console.log("Edit Button Clicked", teacher); // Debugging
                      handleEdit(teacher);
                    }}
                    className="text-[#2E86C1] hover:text-[#1C628F] transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      console.log("Delete Button Clicked", teacher.id); // Debugging
                      handleDelete(teacher.id);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      console.log("Download Payslip Button Clicked", teacher); // Debugging
                      handleDownloadPayslipPDF(teacher);
                    }}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <FilePlus size={16} />
                  </button>
                  <button
                    onClick={() => {
                      console.log("Send Payslip Email Button Clicked", teacher); // Debugging
                      handleSendPayslipEmail(teacher);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Mail size={16} />
                  </button>
                  <button
                    onClick={() => {
                      console.log("Payroll Calculator Button Clicked", teacher); // Debugging
                      openPayrollCalculator(teacher);
                    }}
                    className="text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <Calculator size={16} />
                  </button>
                  <button
                    onClick={() => {
                      console.log("View Details Button Clicked", teacher); // Debugging
                      setViewingTeacher(teacher);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" className="px-3 xs:px-4 sm:px-6 py-3 text-center text-xs xs:text-sm text-gray-500">
              No employees found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

{viewingTeacher && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 xs:p-4"
    onClick={() => console.log("View Modal Rendering", viewingTeacher)} // Debugging
  >
    <div className="bg-white rounded-xl p-4 xs:p-6 w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-[#1C2833]">{viewingTeacher.name || 'N/A'}'s Details</h3>
        <button
          onClick={() => {
            console.log("Closing View Modal"); // Debugging
            setViewingTeacher(null);
          }}
          className="text-gray-500 hover:text-red-500 transition-colors p-2"
        >
          <X size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 text-xs xs:text-sm">
        <p><strong>Employee ID:</strong> {viewingTeacher.employeeId || 'N/A'}</p>
        <p><strong>Email:</strong> {viewingTeacher.email || 'N/A'}</p>
        <p><strong>Phone:</strong> {viewingTeacher.phone || 'N/A'}</p>
        <p><strong>Address:</strong> {viewingTeacher.address || 'N/A'}</p>
        <p><strong>Qualification:</strong> {viewingTeacher.qualification || 'N/A'}</p>
        <p><strong>Subjects:</strong> {viewingTeacher.subjects?.join(', ') || 'N/A'}</p>
        <p><strong>Joining Date:</strong> {viewingTeacher.joiningDate || 'N/A'}</p>
        <p>
          <strong>Basic Salary:</strong>{' '}
          {(parseFloat(viewingTeacher.basicSalary || viewingTeacher.salary) || 0).toLocaleString()} PKR
        </p>
        <p><strong>Status:</strong> {viewingTeacher.status || 'N/A'}</p>
        <p><strong>Gender:</strong> {viewingTeacher.gender || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> {viewingTeacher.dateOfBirth || 'N/A'}</p>
        <p><strong>Guardian/Spouse:</strong> {viewingTeacher.guardianSpouse || 'N/A'}</p>
      </div>
      {viewingTeacher.profileImage && (
        <div className="mt-4 flex justify-center">
          <img
            src={viewingTeacher.profileImage}
            alt="Profile"
            className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-[#2E86C1]"
          />
        </div>
      )}
      <div className="mt-4 xs:mt-6 flex justify-end">
        <button
          onClick={() => {
            console.log("Closing View Modal from Button"); // Debugging
            setViewingTeacher(null);
          }}
          className="px-3 xs:px-4 py-2 bg-gray-200 text-gray-700 text-xs xs:text-sm rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </AdminLayout>
  );
}