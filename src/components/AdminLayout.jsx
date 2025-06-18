import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8F9F9]">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
