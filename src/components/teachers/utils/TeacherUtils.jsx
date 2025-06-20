// TeacherUtils.jsx - Utility functions for teacher management

export const calculateDailyHours = (startTime, endTime) => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  const diffMs = end - start;
  return diffMs / (1000 * 60 * 60); // Convert to hours
};

export const calculateHourlyRate = (salary, workingDays) => {
  const monthlyWorkingDays = workingDays * 4.33; // Average weeks per month
  const dailyHours = 8; // Standard 8-hour workday
  const monthlyHours = monthlyWorkingDays * dailyHours;
  return salary / monthlyHours;
};

export const calculatePayroll = (teacher, payrollData) => {
  const {
    workingDays,
    presentDays,
    absentDays,
    lateMinutes,
    overtimeHours,
    casualLeavesTaken,
    sickLeavesTaken,
    bonusAmount,
    extraDeductions,
  } = payrollData;

  const basicSalary = parseFloat(teacher.basicSalary || teacher.salary || 0);
  const allowances = teacher.allowances || {};
  const deductions = teacher.deductions || {};
  const latePolicy = teacher.latePolicy || {};

  // Calculate total allowances
  const totalAllowances = Object.values(allowances).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

  // Calculate gross salary
  const grossSalary = basicSalary + totalAllowances;

  // Calculate per day salary
  const perDaySalary = grossSalary / workingDays;

  // Calculate absent deduction
  const absentDeduction = absentDays * perDaySalary;

  // Calculate late deduction
  const lateDeduction = lateMinutes * (latePolicy.deductionPerMinute || 0);

  // Calculate overtime payment
  const hourlyRate = calculateHourlyRate(basicSalary, teacher.workingDays || 6);
  const overtimeRate = teacher.overtimeRate || 1.5;
  const overtimePayment = overtimeHours * hourlyRate * overtimeRate;

  // Calculate total deductions
  const totalDeductions = Object.values(deductions).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

  // Calculate net salary
  const netSalary = grossSalary - absentDeduction - lateDeduction - totalDeductions - extraDeductions + overtimePayment + bonusAmount;

  return {
    basicSalary,
    totalAllowances,
    grossSalary,
    absentDeduction,
    lateDeduction,
    overtimePayment,
    totalDeductions,
    bonusAmount,
    extraDeductions,
    netSalary,
    perDaySalary,
    breakdown: {
      allowances: allowances,
      deductions: deductions,
      attendance: {
        workingDays,
        presentDays,
        absentDays,
        lateMinutes,
        overtimeHours,
        casualLeavesTaken,
        sickLeavesTaken,
      },
    },
  };
};

export const validateTeacher = (teacher) => {
  const errors = {};

  if (!teacher.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!teacher.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(teacher.email)) {
    errors.email = 'Email is invalid';
  }

  if (!teacher.phone?.trim()) {
    errors.phone = 'Phone is required';
  }

  if (!teacher.qualification?.trim()) {
    errors.qualification = 'Qualification is required';
  }

  if (!teacher.subjects || teacher.subjects.length === 0) {
    errors.subjects = 'At least one subject is required';
  }

  if (!teacher.joiningDate) {
    errors.joiningDate = 'Joining date is required';
  }

  if (!teacher.salary && !teacher.basicSalary) {
    errors.salary = 'Salary is required';
  }

  if (!teacher.employeeId?.trim()) {
    errors.employeeId = 'Employee ID is required';
  }

  return errors;
};

export const generateEmployeeId = (existingTeachers = []) => {
  const year = new Date().getFullYear();
  const prefix = `TCH${year}`;
  
  // Find the highest existing number for this year
  const existingNumbers = existingTeachers
    .map(teacher => teacher.employeeId)
    .filter(id => id && id.startsWith(prefix))
    .map(id => parseInt(id.replace(prefix, '')) || 0)
    .filter(num => !isNaN(num));

  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

export const handleExport = (teachers, format = 'csv') => {
  if (format === 'csv') {
    const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Subjects', 'Salary', 'Status', 'Joining Date'];
    const csvContent = [
      headers.join(','),
      ...teachers.map(teacher => [
        teacher.employeeId || '',
        teacher.name || '',
        teacher.email || '',
        teacher.phone || '',
        (teacher.subjects || []).join('; '),
        teacher.salary || '',
        teacher.status || '',
        teacher.joiningDate || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

export const handlePrint = (teachers) => {
  const printContent = `
    <html>
      <head>
        <title>Teachers List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Teachers List</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subjects</th>
              <th>Salary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${teachers.map(teacher => `
              <tr>
                <td>${teacher.employeeId || ''}</td>
                <td>${teacher.name || ''}</td>
                <td>${teacher.email || ''}</td>
                <td>${teacher.phone || ''}</td>
                <td>${(teacher.subjects || []).join(', ')}</td>
                <td>${teacher.salary || ''}</td>
                <td>${teacher.status || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};

export const handleDownloadPayslipPDF = (teacher, payrollData) => {
  // This would typically integrate with a PDF library like jsPDF
  console.log('Downloading payslip for:', teacher.name);
  alert(`Payslip download functionality for ${teacher.name} - Integration with PDF library needed`);
};

export const handleBulkPayslipDownload = (teachers) => {
  console.log('Bulk payslip download for:', teachers.length, 'teachers');
  alert(`Bulk payslip download for ${teachers.length} teachers - Integration with PDF library needed`);
};

export const handleSendPayslipEmail = (teacher, payrollData) => {
  console.log('Sending payslip email to:', teacher.email);
  alert(`Email payslip functionality for ${teacher.name} - Integration with email service needed`);
};

export const handleBulkEmailSend = (teachers) => {
  console.log('Bulk email send to:', teachers.length, 'teachers');
  alert(`Bulk email send to ${teachers.length} teachers - Integration with email service needed`);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-PK');
};

export const getTeacherStats = (teachers) => {
  const total = teachers.length;
  const active = teachers.filter(t => t.status === 'active').length;
  const inactive = teachers.filter(t => t.status === 'inactive').length;
  const totalSalary = teachers.reduce((sum, t) => sum + parseFloat(t.salary || 0), 0);

  return {
    total,
    active,
    inactive,
    totalSalary,
  };
};