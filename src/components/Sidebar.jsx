import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, UserCheck, Settings, Calendar, DollarSign, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/manage-students', label: 'Manage Students', icon: Users },
    { path: '/admin/teachers', label: 'Manage Teachers', icon: UserCheck },
    { path: '/admin/class-subject-setup', label: 'Setup Classes & Subjects', icon: Settings },
    { path: '/admin/attendance', label: 'Manage Attendance', icon: Calendar },
    { path: '/admin/payroll', label: 'Payroll Management', icon: DollarSign },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => {
          console.log('Toggling Sidebar', !isSidebarOpen); // Debugging
          setIsSidebarOpen(!isSidebarOpen);
        }}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-[#1C2833] text-white"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 w-[80vw] xs:w-56 md:w-64 h-screen bg-[#1C2833] text-white p-3 xs:p-4 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <h2 className="text-xl xs:text-2xl font-bold text-[#2E86C1] mb-4 xs:mb-6">Admin Panel</h2>
        <ul className="space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                   className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${isActive ? 'bg-[#2E86C1] text-white' : 'text-gray-300 hover:bg-[#AED6F1] hover:text-[#1C2833]'}`}
                  onClick={() => {
                    console.log('Nav Item Clicked', item.label); // Debugging
                    setIsSidebarOpen(false);
                  }}
                >
                  <item.icon size={16} xs:size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => {
            console.log('Overlay Clicked, Closing Sidebar'); // Debugging
            setIsSidebarOpen(false);
          }}
        />
      )}
    </>
  );
}