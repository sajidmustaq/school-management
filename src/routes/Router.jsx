import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Auth pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Admin pages
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageStudents from '../pages/Admin/ManageStudents';
import ManageTeachers from '../pages/Admin/ManageTeachers';
import Attendance from '../pages/Admin/Attendance';
import ClassSubjectSetup from '../pages/Admin/ClassSubjectSetup';
import Payroll from '../pages/Admin/Payroll';
import PayrollDetails from '../pages/Admin/PayrollDetails';

// Student pages
import StudentDashboard from '../pages/Student/Dashboard';

// Teacher pages
import TeacherDashboard from '../pages/Teacher/Dashboard';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-students" element={<ManageStudents />} />
        <Route path="/admin/teachers" element={<ManageTeachers />} />
        <Route path="/admin/attendance" element={<Attendance />} />
        <Route path="/admin/class-subject-setup" element={<ClassSubjectSetup />} />
        <Route path="/admin/Payroll" element={<Payroll />} />
        <Route path="/admin/payroll-details" element={<PayrollDetails />} />
        {/* <Route path='/admin/process-payroll' element={<ProcessPayroll />} /> */}

        {/* Student Route */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* Teacher Route */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
}
