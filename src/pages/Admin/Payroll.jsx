import React, { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react'; // Added for heading icon
import PayrollHeader from '../../components/payroll/header/PayrollHeader';
import PayrollTable from '../../components/payroll/table/PayrollTable';
import PayrollSettingsModal from '../../components/payroll/modals/PayrollSettingsModal';
import EmployeeDetailModal from '../../components/payroll/modals/EmployeeDetailModal';
import PayrollAnalytics from '../../components/payroll/analytics/PayrollAnalytics';
import ConfirmationModal from '../../components/payroll/modals/ConfirmationModal';
import BulkEmailSender from '../../components/payroll/email/BulkEmailSender';
import generatePDF from '../../components/payroll/pdf/PayslipPDFGenerator';
import { getWorkingDays, calculateIncomeTax, calculateNetPay } from '../../components/payroll/utils/payrollUtils';
import { useData } from '../../context/DataContext';
import Adminlayout from '../../components/AdminLayout';

const Payroll = () => {
  const { teachers, teacherAttendance } = useData();

  const [payrollData, setPayrollData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [payrollSettings, setPayrollSettings] = useState({
    companyName: 'Your Company',
    companyAddress: '123 Street, City',
    companyPhone: '1234567890',
    companyEmail: 'company@email.com',
    workingHours: 8,
    standardInTime: '09:00',
    standardOutTime: '17:00',
    lateArrivalGrace: 10,
    transportAllowance: 1000,
    medicalAllowance: 2000,
    houseRentAllowance: 20,
    basicSalaryPercentage: 50,
    providentFund: 5,
    professionalTax: 200,
    esi: 2,
    lateDeductionAfter: 3,
  });

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    generatePayroll();
  }, [teachers, teacherAttendance, selectedMonth, selectedYear, payrollSettings]);

  const generatePayroll = () => {
    const data = teachers.map((teacher) => {
      const attendanceRecords = teacherAttendance.filter(
        (a) =>
          a.teacherId === teacher.id &&
          new Date(a.date).getMonth() === selectedMonth &&
          new Date(a.date).getFullYear() === selectedYear &&
          a.status === 'present',
      );

      const presentDays = attendanceRecords.length;
      const workingDays = getWorkingDays(selectedMonth, selectedYear);
      const attendancePercentage = ((presentDays / workingDays) * 100).toFixed(1);

      const basic = teacher.salary * (payrollSettings.basicSalaryPercentage / 100);
      const allowances = {
        houseRent: teacher.salary * (payrollSettings.houseRentAllowance / 100),
        medicalAllowance: payrollSettings.medicalAllowance,
        transportAllowance: payrollSettings.transportAllowance,
      };
      const deductions = {
        professionalTax: payrollSettings.professionalTax,
        providentFund: teacher.salary * (payrollSettings.providentFund / 100),
        esi: teacher.salary * (payrollSettings.esi / 100),
      };
      const tax = calculateIncomeTax(teacher.salary);

      const { grossSalary, netPay } = calculateNetPay(basic, allowances, deductions, tax);

      return {
        id: teacher.id,
        name: teacher.name,
        employeeId: teacher.employeeId,
        department: teacher.department,
        presentDays,
        workingDays,
        attendancePercentage,
        basicSalary: basic,
        ...allowances,
        ...deductions,
        incomeTax: tax,
        grossSalary,
        netPay,
        email: teacher.email,
      };
    });

    setPayrollData(data);
  };

  const filteredData = payrollData
    .filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterStatus === 'all' || emp.department === filterStatus),
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
      return a[sortBy] < b[sortBy] ? 1 : -1;
    });

  const handleDownload = (employee) => {
    generatePDF(employee, payrollSettings, selectedMonth, selectedYear);
  };

  const handleBulkDownload = () => {
    filteredData.forEach((emp) => generatePDF(emp, payrollSettings, selectedMonth, selectedYear));
  };

  const handleSendEmail = async (employee) => {
    console.log(`Email sent to ${employee.email}`);
    // Integrate with your backend or email service
  };

return (
  <Adminlayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2E86C1] to-[#3498DB] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Briefcase size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Payroll Management
                </h1>
                <p className="text-blue-100 mt-1">
                  Manage employee payroll and generate reports
                </p>
              </div>
            </div>
          </div>
          
          {/* Controls Section */}
          <div className="p-6 sm:p-8 bg-white border-b border-gray-100">
            <PayrollHeader
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onProcess={() => setShowConfirm(true)}
              onExport={() => console.log('Export Excel')}
              onDownload={handleBulkDownload}
              onShowSettings={() => setShowSettings(true)}
              onShowAnalytics={() => setShowAnalytics(true)}
            />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="border-l-4 border-[#2E86C1]">
            <div className="p-6 sm:p-8">
              <div className="space-y-8">
                {/* Payroll Table */}
                <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                  <PayrollTable
                    data={filteredData}
                    onView={setSelectedEmployee}
                    onDownload={handleDownload}
                    onEmail={handleSendEmail}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    setSortBy={setSortBy}
                    setSortOrder={setSortOrder}
                  />
                </div>

                {/* Bulk Email Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <BulkEmailSender
                    payrollData={filteredData}
                    onSendEmail={handleSendEmail}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showSettings && (
          <PayrollSettingsModal
            settings={payrollSettings}
            setSettings={setPayrollSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {selectedEmployee && (
          <EmployeeDetailModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}

        {showAnalytics && (
          <PayrollAnalytics
            payrollData={filteredData}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {showConfirm && (
          <ConfirmationModal
            isOpen={showConfirm}
            title="Process Payroll"
            message="Are you sure you want to process payroll?"
            onConfirm={() => {
              generatePayroll();
              setShowConfirm(false);
            }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    </div>
  </Adminlayout>
);
};

export default Payroll;