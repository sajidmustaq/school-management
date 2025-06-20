// 🧮 Calculate working days in a month
export const getWorkingDays = (month, year) => {
  let totalDays = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;
  for (let i = 1; i <= totalDays; i++) {
    let day = new Date(year, month, i).getDay();
    if (day !== 0 && day !== 6) workingDays++; // Skip Sunday & Saturday
  }
  return workingDays;
};

// 🕒 Calculate total hours worked from attendance records
export const calculateHoursWorked = (attendance) => {
  let totalHours = 0;
  attendance.forEach((record) => {
    let inTime = new Date(`1970-01-01T${record.in}`);
    let outTime = new Date(`1970-01-01T${record.out}`);
    let diff = (outTime - inTime) / (1000 * 60 * 60);
    totalHours += diff;
  });
  return totalHours.toFixed(2);
};

// ⌛ Check if arrival is late
export const isLateArrival = (inTime, standardInTime, gracePeriod = 0) => {
  const actual = new Date(`1970-01-01T${inTime}`);
  const standard = new Date(`1970-01-01T${standardInTime}`);
  const grace = new Date(standard.getTime() + gracePeriod * 60000);
  return actual > grace;
};

// 📉 Income Tax Calculation (basic example)
export const calculateIncomeTax = (grossSalary) => {
  if (grossSalary <= 30000) return 0;
  if (grossSalary <= 60000) return grossSalary * 0.05;
  if (grossSalary <= 100000) return grossSalary * 0.1;
  return grossSalary * 0.15;
};

// 🧮 Calculate Net Pay
export const calculateNetPay = (basic, allowances, deductions, tax) => {
  const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
  const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
  const grossSalary = basic + totalAllowances;
  const net = grossSalary - totalDeductions - tax;
  return { grossSalary, netPay: Math.round(net) };
};
