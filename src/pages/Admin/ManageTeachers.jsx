import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useData } from '../../context/DataContext';
import TeacherHeader from '../../components/teachers/TeacherHeader';
import TeacherStatsCards from '../../components/teachers/TeacherStatsCards';
import TeacherForm from '../../components/teachers/TeacherForm';
import PayrollCalculatorModal from '../../components/teachers/PayrollCalculatorModal';
import TeacherListTable from '../../components/teachers/TeacherListTable';
import TeacherDetailModal from '../../components/teachers/TeacherDetailModal';
import {
  calculateDailyHours,
  calculateHourlyRate,
  calculatePayroll,
  validateTeacher,
  generateEmployeeId,
  handleExport,
  handlePrint,
  handleDownloadPayslipPDF,
  handleBulkPayslipDownload,
  handleSendPayslipEmail,
  handleBulkEmailSend,
} from '../../components/teachers/utils/TeacherUtils';

export default function ManageTeachers() {
  const { teachers = [], setTeachers, subjects } = useData();

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
    allowances: { medical: 0, transport: 0, house: 0, food: 0, other: 0 },
    deductions: { tax: 0, providentFund: 0, insurance: 0, loan: 0, other: 0 },
    leavePolicy: { casualLeave: 12, sickLeave: 10, annualLeave: 21, maternityLeave: 90, leaveEncashment: true },
    bonusPolicy: { performanceBonus: 0, festivalBonus: 0, yearEndBonus: 0 },
    latePolicy: { graceMinutes: 15, deductionPerMinute: 0, maxLateMinutesPerMonth: 120 },
    bankDetails: { accountTitle: '', accountNumber: '', bankName: '', branchCode: '' },
  });

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
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
    extraDeductions: 0,
  });

const filteredTeachers = useMemo(() => {
  if (!Array.isArray(teachers)) return [];

  return teachers
    .filter((teacher) =>
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(teacher.subjects) &&
        teacher.subjects.some((subject) =>
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    )
    .filter((teacher) => filterStatus === 'all' || teacher.status === filterStatus);
}, [teachers, searchTerm, filterStatus]);


  useEffect(() => {
    if (showAddForm && !editId && !newTeacher.employeeId) {
      const generatedId = generateEmployeeId(teachers);
      setNewTeacher((prev) => ({
        ...prev,
        employeeId: generatedId,
        basicSalary: prev.basicSalary || prev.salary || '',
      }));
    }
  }, [showAddForm, editId, teachers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'salary') {
      setNewTeacher((prev) => ({
        ...prev,
        salary: value,
        basicSalary: value,
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewTeacher({
        ...newTeacher,
        [parent]: {
          ...newTeacher[parent],
          [child]: value,
        },
      });
    } else {
      setNewTeacher({ ...newTeacher, [name]: value });
    }
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
      allowances: { medical: 0, transport: 0, house: 0, food: 0, other: 0 },
      deductions: { tax: 0, providentFund: 0, insurance: 0, loan: 0, other: 0 },
      leavePolicy: { casualLeave: 12, sickLeave: 10, annualLeave: 21, maternityLeave: 90, leaveEncashment: true },
      bonusPolicy: { performanceBonus: 0, festivalBonus: 0, yearEndBonus: 0 },
      latePolicy: { graceMinutes: 15, deductionPerMinute: 0, maxLateMinutesPerMonth: 120 },
      bankDetails: { accountTitle: '', accountNumber: '', bankName: '', branchCode: '' },
    });
    setErrors({});
    setEditId(null);
    setShowAddForm(false);
    setActiveTab('basic');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const teacherToValidate = { ...newTeacher, basicSalary: newTeacher.basicSalary || newTeacher.salary };
    const validationErrors = validateTeacher(teacherToValidate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (teachers.some((t) => t.email === newTeacher.email && t.id !== editId)) return;
    if (teachers.some((t) => t.employeeId === newTeacher.employeeId && t.id !== editId)) return;
    const maxId = teachers.length > 0 ? Math.max(...teachers.map((t) => t.id)) : 0;
    const newEntry = {
      id: maxId + 1,
      ...newTeacher,
      employeeId: newTeacher.employeeId || generateEmployeeId(teachers),
      createdAt: new Date().toISOString(),
    };
    setTeachers([...teachers, newEntry]);
    resetForm();
  };

  const handleEdit = (teacher) => {
    setEditId(teacher.id);
    setNewTeacher({ ...teacher });
    setShowAddForm(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const validationErrors = validateTeacher(newTeacher);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (teachers.some((t) => t.email === newTeacher.email && t.id !== editId)) return;
    if (teachers.some((t) => t.employeeId === newTeacher.employeeId && t.id !== editId)) return;
    const updated = teachers.map((t) =>
      t.id === editId ? { ...t, ...newTeacher, updatedAt: new Date().toISOString() } : t
    );
    setTeachers(updated);
    resetForm();
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this teacher?');
    if (confirmDelete) {
      const updatedTeachers = teachers.filter((t) => t.id !== id);
      setTeachers(updatedTeachers);
    }
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
      extraDeductions: 0,
    });
    setShowPayrollCalculator(true);
  };

  return (
    <AdminLayout>
      {/* Main Container - Responsive padding and max-width */}
      <div className="min-h-screen bg-gray-50/50">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">

          {/* Content Sections with responsive spacing */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">

            {/* Header Section */}
            <div className="w-full">
              <TeacherHeader
                showAddForm={showAddForm}
                onToggleAddForm={() => setShowAddForm(!showAddForm)}
                onBulkDownload={handleBulkPayslipDownload}
                onBulkEmail={handleBulkEmailSend}
                onExport={handleExport}
                onPrint={handlePrint}
              />
            </div>

            {/* Stats Cards Section */}
            <div className="w-full">
              <TeacherStatsCards teachers={teachers} subjects={subjects} />
            </div>

            {/* Add/Edit Form Section - Responsive form container */}
            {showAddForm && (
              <div className="w-full">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-3 sm:p-4 md:p-6">
                    <TeacherForm
                      newTeacher={newTeacher}
                      setNewTeacher={setNewTeacher}
                      errors={errors}
                      setErrors={setErrors}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      subjects={subjects}
                      editId={editId}
                      onSave={editId ? handleUpdate : handleAdd}
                      onCancel={resetForm}
                      onImageChange={handleImageChange}
                      onSelectChange={handleSelectChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Teacher List Table Section - Enhanced responsive table */}
            <div className="w-full">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table wrapper with horizontal scroll */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="min-w-full">
                    <TeacherListTable
                      teachers={filteredTeachers}
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      filterStatus="all" // اگر آپ فِلٹر فیچر نہیں رکھ رہے تو default دے دیں
                      onFilterChange={() => { }} // آپ چاہیں تو فِلٹر فیچر بعد میں بھی implement کر سکتے ہیں
                      onView={setViewingTeacher}
                      onEdit={handleEdit}
                      onDelete={(teacher) => handleDelete(teacher.id)}
                    />

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Calculator Modal - Enhanced responsive modal */}
        {showPayrollCalculator && selectedTeacherForPayroll && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowPayrollCalculator(false)}
            ></div>

            {/* Modal positioning */}
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <div className="relative transform overflow-hidden rounded-lg sm:rounded-xl bg-white shadow-2xl transition-all">
                  <div className="max-h-[90vh] overflow-y-auto">
                    <PayrollCalculatorModal
                      teacher={selectedTeacherForPayroll}
                      payrollData={payrollData}
                      setPayrollData={setPayrollData}
                      onClose={() => setShowPayrollCalculator(false)}
                      calculatePayroll={calculatePayroll}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Detail Modal - Enhanced responsive modal */}
       {viewingTeacher && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={() => setViewingTeacher(null)}
    ></div>

    {/* Modal positioning */}
    <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
        <div className="relative transform overflow-hidden rounded-lg sm:rounded-xl bg-white shadow-2xl transition-all">
          <div className="max-h-[90vh] overflow-y-auto">
            <TeacherDetailModal
              isOpen={!!viewingTeacher}  
              teacher={viewingTeacher}
              onClose={() => setViewingTeacher(null)}
            />
          </div>
        </div>
      </div>
    </div>
  </div>


        )}
      </div>
    </AdminLayout>
  );
}