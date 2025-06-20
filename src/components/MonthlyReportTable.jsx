// components/MonthlyReportTable.jsx

import React, { useEffect } from "react";
import { Users, Settings, BarChart3, AlertTriangle, CheckCircle, XCircle, Calendar as CalendarIcon, TrendingUp } from "lucide-react";

export default function MonthlyReportTable({
    activeTab,
    students,
    teachers,
    attendance,
    teacherAttendance,
    selectedMonth,
    selectedYear,
    datesArray,
    setSelectedMonth,
    setSelectedYear,
    setActiveTab,
    setSearchTerm,
    filteredTeachers,
    filteredStudents,
    monthlyAttendanceData,
    averageAttendance,
    compactReportView,
    setCompactReportView,
    isDayIncomplete = () => false, // optional fallback
}) {
    // Safe date validation function
    const isValidDate = (year, month, day) => {
        const date = new Date(year, month, day);
        return date.getFullYear() === year &&
            date.getMonth() === month &&
            date.getDate() === day;
    };

    // Jab activeTab "monthly" ho to automatically "monthly-students" kar do
    useEffect(() => {
        if (activeTab === "monthly") {
            setActiveTab("monthly-students");
        }
    }, [activeTab]);

    if (!["monthly", "monthly-students", "monthly-teachers"].includes(activeTab)) return null;

    const currentList =
        activeTab === "monthly-teachers" ? filteredTeachers : filteredStudents;

    return (
        <div className="space-y-6">
            {/* Month/Year Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <BarChart3 size={20} />
                        Monthly Attendance Report
                    </h3>
                    <div className="flex gap-3">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent text-sm"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>
                                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent text-sm"
                        >
                            {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - 2 + i;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                        <button
                            onClick={() => setCompactReportView(!compactReportView)}
                            className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-1"
                        >
                            <Settings size={14} />
                            {compactReportView ? "Detailed" : "Compact"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Type Toggle */}
            <div className="flex justify-center">
                <div className="bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => {
                            setActiveTab("monthly-students");
                            setSearchTerm("");
                        }}
                        className={`px-4 py-2 rounded-md transition-colors text-sm ${activeTab === "monthly-students"
                            ? "bg-white text-[#2E86C1] shadow"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Students Report
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("monthly-teachers");
                            setSearchTerm("");
                        }}
                        className={`px-4 py-2 rounded-md transition-colors text-sm ${activeTab === "monthly-teachers"
                            ? "bg-white text-[#2E86C1] shadow"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Teachers Report
                    </button>
                </div>
            </div>

            {/* Monthly Attendance Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 z-10">
                                    {activeTab === "monthly-teachers" ? "Teacher" : "Student"}
                                </th>
                                {datesArray.map((date) => {
                                    // Safe date creation with validation
                                    const currentDate = new Date(selectedYear, selectedMonth, date);

                                    // Check if date is valid
                                    if (isNaN(currentDate.getTime())) {
                                        return (
                                            <th
                                                key={date}
                                                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[40px]"
                                            >
                                                {date}
                                            </th>
                                        );
                                    }

                                    return (
                                        <th
                                            key={date}
                                            className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[40px]"
                                        >
                                            {currentDate.getDate()}
                                        </th>
                                    );
                                })}
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                                    %
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentList.map((person, index) => {
                                const personAttendanceData = activeTab === "monthly-teachers"
                                    ? teacherAttendance.filter(att => att.teacherId === person.id)
                                    : attendance.filter(att => att.studentId === person.id);

                                let presentDays = 0;
                                let totalDays = 0;

                                return (
                                    <tr key={person.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        {/* Name & Roll/Subject */}
                                        <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 z-10">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                                                        {person.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{person.name}</div>
                                                    {!compactReportView && (
                                                        <div className="text-sm text-gray-500">
                                                            {activeTab === "monthly-teachers" ? person.subject : `Roll: ${person.rollNumber}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Attendance cells */}
                                        {datesArray.map((dateString) => {
                                            const currentDate = new Date(dateString);
                                            const dayAttendance = personAttendanceData.find(att => att.date === dateString);

                                            const isToday = currentDate.toDateString() === new Date().toDateString();
                                            const isFuture = currentDate > new Date();
                                            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

                                            if (!isFuture && !isWeekend) {
                                                totalDays++;
                                                if (dayAttendance?.status === 'present') {
                                                    presentDays++;
                                                }
                                            }

                                            let cellContent = '';
                                            let cellClass = 'px-2 py-3 text-center text-sm border-r border-gray-200 ';

                                            if (isFuture) {
                                                cellClass += 'bg-gray-100 text-gray-400';
                                                cellContent = '-';
                                            } else if (isWeekend) {
                                                cellClass += 'bg-gray-200 text-gray-500';
                                                cellContent = 'W';
                                            } else if (dayAttendance) {
                                                if (dayAttendance.status === 'present') {
                                                    cellClass += 'bg-green-100 text-green-800';
                                                    cellContent = compactReportView ? '✓' : 'P';
                                                } else if (dayAttendance.status === 'absent') {
                                                    cellClass += 'bg-red-100 text-red-800';
                                                    cellContent = compactReportView ? '✗' : 'A';
                                                } else if (dayAttendance.status === 'late') {
                                                    cellClass += 'bg-yellow-100 text-yellow-800';
                                                    cellContent = compactReportView ? '◐' : 'L';
                                                }
                                            } else {
                                                cellClass += 'bg-gray-100 text-gray-400';
                                                cellContent = '-';
                                            }

                                            return (
                                                <td key={dateString} className={cellClass}>
                                                    {cellContent}
                                                </td>
                                            );
                                        })}

                                        {/* Stats columns */}
                                        <td className="px-4 py-3 text-center text-sm font-medium bg-blue-50 border-r border-gray-200">
                                            {presentDays}/{totalDays}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-medium bg-green-50">
                                            {totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                </div>

                {/* Legend */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center text-green-800 font-bold">
                                {compactReportView ? '✓' : 'P'}
                            </span>
                            <span>Present</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-800 font-bold">
                                {compactReportView ? '✗' : 'A'}
                            </span>
                            <span>Absent</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded flex items-center justify-center text-yellow-800 font-bold">
                                {compactReportView ? '◐' : 'L'}
                            </span>
                            <span>Late</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-gray-600 font-bold">
                                W
                            </span>
                            <span>Weekend</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400 font-bold">
                                -
                            </span>
                            <span>No Data/Future</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Average Attendance</p>
                            <p className="text-2xl font-bold">{averageAttendance}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Working Days</p>
                            <p className="text-2xl font-bold">{datesArray.length}</p>
                        </div>
                        <CalendarIcon className="w-8 h-8 text-blue-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">
                                Total {activeTab === "monthly-teachers" ? "Teachers" : "Students"}
                            </p>
                            <p className="text-2xl font-bold">{currentList.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}