import jsPDF from 'jspdf';

const PayslipPDFGenerator = (employee, settings, month, year) => {
  const doc = new jsPDF();
  const lineHeight = 10;
  let y = 10;

  doc.setFontSize(14);
  doc.text(settings.companyName || 'Company Name', 10, y);
  y += lineHeight;
  doc.setFontSize(10);
  doc.text(settings.companyAddress || 'Company Address', 10, y);
  y += lineHeight;
  doc.text(`Email: ${settings.companyEmail} | Phone: ${settings.companyPhone}`, 10, y);
  y += lineHeight * 2;

  doc.setFontSize(12);
  doc.text(`Pay Slip for ${month + 1}/${year}`, 10, y);
  y += lineHeight;

  doc.setFontSize(10);
  doc.text(`Employee Name: ${employee.name}`, 10, y);
  y += lineHeight;
  doc.text(`Employee ID: ${employee.employeeId}`, 10, y);
  y += lineHeight;
  doc.text(`Department: ${employee.department}`, 10, y);
  y += lineHeight * 2;

  doc.setFontSize(11);
  doc.text('Earnings:', 10, y);
  y += lineHeight;
  doc.setFontSize(10);
  doc.text(`Basic Salary: Rs. ${employee.basicSalary}`, 10, y);
  y += lineHeight;
  doc.text(`House Rent: Rs. ${employee.houseRent}`, 10, y);
  y += lineHeight;
  doc.text(`Medical Allowance: Rs. ${employee.medicalAllowance}`, 10, y);
  y += lineHeight;
  doc.text(`Transport Allowance: Rs. ${employee.transportAllowance}`, 10, y);
  y += lineHeight;

  y += 5;
  doc.setFontSize(11);
  doc.text('Deductions:', 10, y);
  y += lineHeight;
  doc.setFontSize(10);
  doc.text(`Provident Fund: Rs. ${employee.providentFund}`, 10, y);
  y += lineHeight;
  doc.text(`Professional Tax: Rs. ${employee.professionalTax}`, 10, y);
  y += lineHeight;
  doc.text(`ESI: Rs. ${employee.esi}`, 10, y);
  y += lineHeight;
  doc.text(`Income Tax: Rs. ${employee.incomeTax}`, 10, y);
  y += lineHeight * 2;

  doc.setFontSize(12);
  doc.text(`Net Pay: Rs. ${employee.netPay}`, 10, y);
  y += lineHeight * 2;

  doc.setFontSize(10);
  doc.text('This is a computer-generated payslip and does not require a signature.', 10, y);

  // Save PDF
  doc.save(`${employee.name}_Payslip_${month + 1}_${year}.pdf`);
};

export default PayslipPDFGenerator;
