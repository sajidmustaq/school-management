import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  const handleLogin = (e) => {
    e.preventDefault();
    login(email, role);

    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'teacher') navigate('/teacher/dashboard');
    else navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F8FF]">
      <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#2E86C1] p-8 w-full max-w-md">
        <h2 className="text-3xl font-semibold text-[#2E86C1] mb-6 text-center flex items-center justify-center gap-2">
          <Lock size={24} /> Login
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4 relative">
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <div className="flex items-center">
              <Mail className="absolute left-3 text-[#2E86C1] size-5" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-3 py-2 border border-[#AED6F1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4 relative">
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <div className="flex items-center">
              <Lock className="absolute left-3 text-[#2E86C1] size-5" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-10 pr-3 py-2 border border-[#AED6F1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-6 relative">
            <label className="text-sm text-gray-600 mb-1 block">Role</label>
            <div className="flex items-center">
              <User className="absolute left-3 text-[#2E86C1] size-5" />
              <select
                className="w-full pl-10 pr-3 py-2 border border-[#AED6F1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] transition-colors appearance-none bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2E86C1] text-white py-2 rounded-lg hover:bg-[#1C628F] transition-colors font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}