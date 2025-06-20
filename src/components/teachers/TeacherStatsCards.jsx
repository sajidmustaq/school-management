import React from 'react';
import { Users, UserCheck, UserX, DollarSign, BookOpen, Calendar } from 'lucide-react';
import { getTeacherStats, formatCurrency } from './utils/TeacherUtils';

const TeacherStatsCards = ({ teachers, subjects }) => {
  const stats = getTeacherStats(teachers);
  
  const totalSubjects = subjects ? subjects.length : 0;
  const averageSalary = stats.total > 0 ? stats.totalSalary / stats.total : 0;
  
  // Calculate additional stats
  const newHiresThisMonth = teachers.filter(teacher => {
    if (!teacher.joiningDate) return false;
    const joiningDate = new Date(teacher.joiningDate);
    const currentDate = new Date();
    return joiningDate.getMonth() === currentDate.getMonth() && 
           joiningDate.getFullYear() === currentDate.getFullYear();
  }).length;

  const statsData = [
    {
      title: 'Total Teachers',
      value: stats.total,
      icon: Users,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      change: `${stats.active} active`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Active Teachers',
      value: stats.active,
      icon: UserCheck,
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
      change: `${((stats.active / stats.total) * 100 || 0).toFixed(1)}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Inactive Teachers',
      value: stats.inactive,
      icon: UserX,
      bgColor: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
      change: `${((stats.inactive / stats.total) * 100 || 0).toFixed(1)}%`,
      changeColor: 'text-red-600'
    },
    {
      title: 'Total Salary Cost',
      value: formatCurrency(stats.totalSalary),
      icon: DollarSign,
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      change: `Avg: ${formatCurrency(averageSalary)}`,
      changeColor: 'text-purple-600'
    },
    {
      title: 'Total Subjects',
      value: totalSubjects,
      icon: BookOpen,
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
      change: 'Available subjects',
      changeColor: 'text-orange-600'
    },
    {
      title: 'New Hires (This Month)',
      value: newHiresThisMonth,
      icon: Calendar,
      bgColor: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      change: 'Recently joined',
      changeColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgLight}`}>
                <Icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 truncate">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className={`text-xs ${stat.changeColor}`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeacherStatsCards;