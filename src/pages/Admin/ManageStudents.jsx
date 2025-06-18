import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useData } from '../../context/DataContext';
import Swal from 'sweetalert2';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import printJS from 'print-js';
import { 
  Plus, Edit2, Trash2, Download, Printer, Search, X, Save, Eye, Phone, Mail, 
  MapPin, GraduationCap, Calendar, User, Users, BookOpen, Award, UserCheck, UserX, Building, RefreshCw
} from 'lucide-react';

// Default data in case DataContext fails
const defaultData = {
  students: [],
  classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']
};

export default function ManageStudents() {
  const { 
    students = defaultData.students, 
    setStudents, 
    classes = defaultData.classes
  } = useData() || {};

  // Student states
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    class: '',
    roll: '',
    registrationNo: '',
    admissionDate: '',
    guardianName: '',
    guardianPhone: '',
    status: 'active',
    dateOfBirth: '',
    gender: 'male'
  });

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Auto-generate registration number
  useEffect(() => {
    if (!editId && !newStudent.registrationNo) {
      const maxRegNo = students.reduce((max, student) => {
        const regNo = parseInt(student.registrationNo) || 0;
        return regNo > max ? regNo : max;
      }, 0);
      const newRegNo = String(maxRegNo + 1).padStart(4, '0');
      setNewStudent(prev => ({ ...prev, registrationNo: newRegNo }));
    }
  }, [students, editId]);

  // Validation function
  const validateStudent = (student) => {
    const newErrors = {};
    
    if (!student.name.trim()) newErrors.name = 'Name is required';
    if (!student.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(student.email)) newErrors.email = 'Enter a valid email';
    if (!student.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^((\+92|0)[0-9]{10}|[0-9]{10})$/.test(student.phone.replace(/[\s-]/g, ''))) newErrors.phone = 'Enter a valid phone number (e.g., +923001234567 or 03001234567)';
    if (!student.address.trim()) newErrors.address = 'Address is required';
    if (!student.class) newErrors.class = 'Class is required';
    if (!student.roll.trim()) newErrors.roll = 'Roll number is required';
    if (!student.admissionDate) newErrors.admissionDate = 'Admission date is required';
    if (!student.guardianName.trim()) newErrors.guardianName = 'Guardian name is required';
    if (!student.guardianPhone.trim()) newErrors.guardianPhone = 'Guardian phone is required';
    else if (!/^((\+92|0)[0-9]{10}|[0-9]{10})$/.test(student.guardianPhone.replace(/[\s-]/g, ''))) newErrors.guardianPhone = 'Enter a valid phone number (e.g., +923001234567 or 03001234567)';
    if (!student.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    return newErrors;
  };

  // Filtered students based on search and filters
  const filteredStudents = useMemo(() => {
    let filtered = [...(students || [])];
    
    if (selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.class && student.class.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.roll && student.roll.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.guardianName && student.guardianName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.registrationNo && student.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [students, searchTerm, selectedClass, statusFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClassChange = (option) => {
    const value = option ? option.value : '';
    setNewStudent(prev => ({ ...prev, class: value }));
    
    if (errors.class) {
      setErrors(prev => ({ ...prev, class: '' }));
    }
  };

  const resetForm = () => {
    setNewStudent({
      name: '',
      email: '',
      phone: '',
      address: '',
      class: '',
      roll: '',
      registrationNo: '',
      admissionDate: '',
      guardianName: '',
      guardianPhone: '',
      status: 'active',
      dateOfBirth: '',
      gender: 'male'
    });
    setErrors({});
    setEditId(null);
    setShowAddForm(false);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    
    const validationErrors = validateStudent(newStudent);
    
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

    // Check for duplicates
    if (students.some(s => s.email === newStudent.email && s.id !== editId)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Email',
        text: 'This email already exists',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }
    if (students.some(s => s.roll === newStudent.roll && s.class === newStudent.class && s.id !== editId)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Roll Number',
        text: `Roll number ${newStudent.roll} already exists in ${newStudent.class}`,
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    const newEntry = { 
      id: Date.now(), 
      ...newStudent,
      createdAt: new Date().toISOString()
    };
    
    setStudents([...(students || []), newEntry]);
    resetForm();

    Swal.fire({
      icon: 'success',
      title: 'Student Added',
      text: `${newStudent.name} has been added successfully`,
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setNewStudent({
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      class: item.class || '',
      roll: item.roll || '',
      registrationNo: item.registrationNo || '',
      admissionDate: item.admissionDate || '',
      guardianName: item.guardianName || '',
      guardianPhone: item.guardianPhone || '',
      status: item.status || 'active',
      dateOfBirth: item.dateOfBirth || '',
      gender: item.gender || 'male'
    });
    setShowAddForm(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    
    const validationErrors = validateStudent(newStudent);
    
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

    if (students.some(s => s.email === newStudent.email && s.id !== editId)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Email',
        text: 'This email already exists',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    if (students.some(s => s.roll === newStudent.roll && s.class === newStudent.class && s.id !== editId)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Roll Number',
        text: `Roll number ${newStudent.roll} already exists in ${newStudent.class}`,
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    const updated = students.map((s) =>
      s.id === editId ? { ...s, ...newStudent, updatedAt: new Date().toISOString() } : s
    );
    setStudents(updated);
    resetForm();

    Swal.fire({
      icon: 'success',
      title: 'Information Updated',
      text: 'Student information has been updated successfully',
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleDelete = (id) => {
    const item = students.find((item) => item.id === id);
    if (!item) return;

    Swal.fire({
      title: `Delete ${item.name}?`,
      text: `Are you sure you want to delete this student? (${item.registrationNo})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setStudents(students.filter((s) => s.id !== id));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${item.name} (${item.registrationNo}) has been deleted`,
          confirmButtonColor: '#2E86C1',
        });
      }
    });
  };

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No students available to export',
        confirmButtonColor: '#2E86C1',
      });
      return;
    }

    const data = filteredStudents.map((s) => ({
      'Reg No': s.registrationNo || 'N/A',
      'Name': s.name || 'N/A',
      'Guardian Name': s.guardianName || 'N/A',
      'Guardian Phone': s.guardianPhone || 'N/A',
      'Email': s.email || 'N/A',
      'Phone': s.phone || 'N/A',
      'Address': s.address || 'N/A',
      'Class': s.class || 'N/A',
      'Roll No': s.roll || 'N/A',
      'Date of Birth': s.dateOfBirth || 'N/A',
      'Gender': s.gender || 'N/A',
      'Admission Date': s.admissionDate || 'N/A',
      'Status': s.status === 'active' ? 'Active' : 'Inactive'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students List');
    XLSX.writeFile(workbook, `Students_List_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Export Complete',
      text: 'File has been downloaded successfully',
      confirmButtonColor: '#2E86C1',
    });
  };

  const handlePrint = () => {
    if (filteredStudents.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No students available to print',
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

  // Custom styles for react-select
  const selectStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      borderColor: errors.class ? '#ef4444' : '#AED6F1',
      '&:hover': {
        borderColor: errors.class ? '#ef4444' : '#2E86C1',
      },
      borderRadius: '0.5rem',
      padding: '0.25rem',
      boxShadow: isFocused ? '0 0 0 1px #2E86C1' : 'none'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#AED6F1' : 'white',
      color: '#1C2833',
      '&:hover': {
        backgroundColor: '#AED6F1',
      }
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
    })
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass(null);
    setStatusFilter('all');
  };

  const handleView = (item) => {
    setViewingItem(item);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 w-full max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2E86C1]">Manage Students</h2>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#2E86C1] text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-[#1C628F] transition-colors flex items-center gap-2 text-sm sm:text-base min-w-fit"
            >
              <Plus size={16} />
              {showAddForm ? 'Cancel' : 'Add New Student'}
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base min-w-fit"
            >
              <Download size={16} />
              Export to Excel
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base min-w-fit"
            >
              <Printer size={16} />
              Print List
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-[#2E86C1] transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#2E86C1]">{students.length}</p>
              </div>
              <GraduationCap className="text-[#2E86C1]" size={20} />
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-green-500 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Active Students</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                  {students.filter(s => s.status === 'active').length}
                </p>
              </div>
              <UserCheck className="text-green-500" size={20} />
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-red-500 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Inactive Students</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                  {students.filter(s => s.status === 'inactive').length}
                </p>
              </div>
              <UserX className="text-red-500" size={20} />
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-yellow-500 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Classes</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">{classes.length}</p>
              </div>
              <Building className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-[#2E86C1] p-4 sm:p-6 w-full max-w-full mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1C2833]">
                {editId ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editId ? handleUpdate : handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <User size={16} /> Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.name ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                  placeholder="Enter name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Mail size={16} /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.email ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                  placeholder="Enter email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Phone size={16} /> Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={newStudent.phone}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.phone ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                  placeholder="e.g., +923001234567 or 03001234567"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <MapPin size={16} /> Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={newStudent.address}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.address ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                  placeholder="Enter address"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Calendar size={16} /> Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={newStudent.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Users size={16} /> Gender
                </label>
                <select
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.gender ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <UserCheck size={16} /> Status
                </label>
                <select
                  name="status"
                  value={newStudent.status}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.status ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <GraduationCap size={16} /> Class
                </label>
                <Select
                  name="class"
                  options={classes.map(cls => ({ value: cls, label: cls }))}
                  value={newStudent.class ? { value: newStudent.class, label: newStudent.class } : null}
                  onChange={handleClassChange}
                  styles={selectStyles}
                  placeholder="Select class"
                  isClearable
                  className="text-sm sm:text-base"
                />
                {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <BookOpen size={16} /> Roll Number
                </label>
                <input
                  type="text"
                  name="roll"
                  value={newStudent.roll}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.roll ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                  placeholder="Enter roll number"
                />
                {errors.roll && <p className="text-red-500 text-xs mt-1">{errors.roll}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Award size={16} /> Registration Number
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    name="registrationNo"
                    value={newStudent.registrationNo}
                    readOnly
                    className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 cursor-not-allowed text-sm sm:text-base min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const maxRegNo = students.reduce((max, student) => {
                        const regNo = parseInt(student.registrationNo) || 0;
                        return regNo > max ? regNo : max;
                      }, 0);
                      const newRegNo = String(maxRegNo + 1).padStart(4, '0');
                      setNewStudent(prev => ({ ...prev, registrationNo: newRegNo }));
                    }}
                    className="ml-2 p-1 sm:p-2 bg-[#2E86C1] text-white rounded-lg hover:bg-[#1C628F] transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Calendar size={16} /> Admission Date
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={newStudent.admissionDate}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.admissionDate ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                />
                {errors.admissionDate && <p className="text-red-500 text-xs mt-1">{errors.admissionDate}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <User size={16} /> Guardian Name
                </label>
                <input
                  type="text"
                  name="guardianName"
                  value={newStudent.guardianName}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.guardianName ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                  placeholder="Enter guardian name"
                />
                {errors.guardianName && <p className="text-red-500 text-xs mt-1">{errors.guardianName}</p>}
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Phone size={16} /> Guardian Phone
                </label>
                <input
                  type="text"
                  name="guardianPhone"
                  value={newStudent.guardianPhone}
                  onChange={handleChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] ${errors.guardianPhone ? 'border-red-500' : 'border-gray-300'} text-sm sm:text-base min-w-0`}
                  placeholder="e.g., +923001234567 or 03001234567"
                />
                {errors.guardianPhone && <p className="text-red-500 text-xs mt-1">{errors.guardianPhone}</p>}
              </div>

              <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 sm:gap-4 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#2E86C1] text-white rounded-lg hover:bg-[#1C628F] transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  <Save size={16} />
                  {editId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-full">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <div className="flex-1 relative w-full sm:w-64">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, class..."
                className="w-full pl-8 sm:pl-10 p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-[#2E86C1] border-gray-300 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
              <Select
                options={[{ value: null, label: 'All Classes' }, ...classes.map(cls => ({ value: cls, label: cls }))]}
                value={selectedClass ? { value: selectedClass, label: selectedClass } : { value: null, label: 'All Classes' }}
                onChange={(option) => setSelectedClass(option ? option.value : null)}
                styles={selectStyles}
                placeholder="Filter by class"
                className="w-full sm:w-48 text-sm sm:text-base"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
                value={{ value: statusFilter, label: statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) }}
                onChange={(option) => setStatusFilter(option.value)}
                styles={selectStyles}
                className="w-full sm:w-48 text-sm sm:text-base"
              />
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <RefreshCw size={16} /> Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-lg w-full max-w-full overflow-x-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 gap-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1C2833]">Students List</h3>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <Download size={16} /> Export
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
          <div id="print-section">
            <div className="print-header hidden print:block text-center mb-4">
              <h2 className="text-2xl text-[#2E86C1]">Students List</h2>
            </div>
            <div className="print-date hidden print:block text-right mb-2 text-sm">
              Generated on: {new Date().toLocaleString()}
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#2E86C1]">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white">ID</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white">Name</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white">Class</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white">Roll No</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white">Guardian</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white">Email</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white">Phone</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white">Status</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{item.registrationNo}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 max-w-[150px] sm:max-w-[200px] truncate">{item.name}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{item.class}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{item.roll}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 max-w-[150px] sm:max-w-[200px] truncate">{item.guardianName}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 max-w-[150px] sm:max-w-[200px] truncate">{item.email}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{item.phone}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm print:hidden">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-1 sm:p-2 text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 sm:p-2 text-yellow-600 hover:text-yellow-800"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 sm:p-2 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {viewingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-[90vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1C2833]">
                  Student Details
                </h3>
                <button
                  onClick={() => setViewingItem(null)}
                  className="text-gray-500 hover:text-red-500 transition-colors p-2"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-medium text-gray-700">Name</h4>
                  <p>{viewingItem.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Email</h4>
                  <p>{viewingItem.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Phone</h4>
                  <p>{viewingItem.phone}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Address</h4>
                  <p>{viewingItem.address}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Date of Birth</h4>
                  <p>{viewingItem.dateOfBirth}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Gender</h4>
                  <p>{viewingItem.gender.charAt(0).toUpperCase() + viewingItem.gender.slice(1)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Status</h4>
                  <p>{viewingItem.status.charAt(0).toUpperCase() + viewingItem.status.slice(1)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Class</h4>
                  <p>{viewingItem.class}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Roll Number</h4>
                  <p>{viewingItem.roll}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Registration Number</h4>
                  <p>{viewingItem.registrationNo}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Admission Date</h4>
                  <p>{viewingItem.admissionDate}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Guardian Name</h4>
                  <p>{viewingItem.guardianName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Guardian Phone</h4>
                  <p>{viewingItem.guardianPhone}</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 flex justify-end gap-3 sm:gap-4">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
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