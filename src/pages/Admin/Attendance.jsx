import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useData } from "../../context/DataContext";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Clock,
  Users,
  MapPin,
  Camera,
  FileText,
  AlertTriangle,
  TrendingUp,
  Smartphone,
  CalendarCheck,
  BarChart3,
  Search,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  Download,
  Save,
  LogIn,
  LogOut,
} from "lucide-react";

export default function Attendance() {
  const {
    students = [],
    attendance = [],
    setAttendance,
    teachers = [],
    teacherAttendance = [],
    setTeacherAttendance,
    classes = [],
  } = useData() || {};

  const processedPayrolls = [];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const selectedDate = new Date(selectedYear, selectedMonth, 1);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [selectedTeachers, setSelectedTeachers] = useState({});
  const [teacherTimeRecords, setTeacherTimeRecords] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [attendanceMode, setAttendanceMode] = useState("manual");
  const [showStats, setShowStats] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [compactReportView, setCompactReportView] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    setIsLoading(true);
    initializeAttendance();
    setIsLoading(false);
    setTeacherTimeRecords({}); // Reset time records on date change
  }, [attendance, teacherAttendance, filterDate]);

  const isPreviousMonthProcessed = (month, year) => {
    const prev = new Date(year, month - 1);
    return processedPayrolls.some(
      (p) => p.month === prev.getMonth() && p.year === prev.getFullYear()
    );
  };

  const handleSalaryProcessCheck = () => {
    for (const teacher of teachers) {
      const teacherJoinDate = new Date(teacher.joiningDate);

      if (selectedDate < teacherJoinDate) {
        Swal.fire({
          icon: "error",
          title: "Invalid Month",
          text: `${teacher.name} joined on ${teacher.joiningDate}. You cannot process salary for earlier months.`,
        });
        return false;
      }

      if (selectedDate > teacherJoinDate && !isPreviousMonthProcessed(selectedMonth, selectedYear)) {
        const prevMonthName = selectedDate.toLocaleString("default", { month: "long" });
        const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

        Swal.fire({
          icon: "warning",
          title: "Previous Month Not Processed",
          text: `You must process salary for ${prevMonthName} ${prevMonthYear} before processing this month.`,
          confirmButtonColor: "#E74C3C",
        });
        return false;
      }
    }
    Swal.fire({
      icon: "success",
      title: "Ready",
      text: `Salary for ${selectedDate.toLocaleString("default", { month: "long" })} ${selectedYear} can be processed.`,
    });
    return true;
  };

const datesArray = useMemo(() => {
  const [year, month] = filterDate.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return `${year}-${month.toString().padStart(2, '0')}-${day}`;
  });
}, [filterDate]);

  const initializeAttendance = () => {
    const dayStudentAttendance = (attendance || []).filter((a) => a?.date === filterDate);
    const initialSelectedStudents = {};
    dayStudentAttendance.forEach((a) => {
      if (a?.studentId) {
        initialSelectedStudents[a.studentId] = a.status;
      }
    });
    setSelectedStudents(initialSelectedStudents);

    const dayTeacherAttendance = (teacherAttendance || []).filter((a) => a?.date === filterDate);
    const initialSelectedTeachers = {};
    const initialTimeRecords = {};

    dayTeacherAttendance.forEach((a) => {
      if (a?.teacherId) {
        initialSelectedTeachers[a.teacherId] = a.status;
        initialTimeRecords[a.teacherId] = {
          inTime: a.inTime || "",
          outTime: a.outTime || "",
          breakTime: a.breakTime || 0,
          location: a.location || "",
          notes: a.notes || "",
        };
      }
    });

    setSelectedTeachers(initialSelectedTeachers);
    setTeacherTimeRecords(initialTimeRecords);
  };

  const handleToggle = (id, isTeacher = false) => {
    if (isTeacher) {
      setSelectedTeachers((prev) => ({
        ...prev,
        [id]: prev[id] === "present" ? "absent" : "present",
      }));
    } else {
      setSelectedStudents((prev) => ({
        ...prev,
        [id]: prev[id] === "present" ? "absent" : "present",
      }));
    }
  };

  const handleTimeUpdate = (teacherId, field, value) => {
    setTeacherTimeRecords((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId] || {},
        [field]: value,
      },
    }));
  };

  const markTeacherPresent = (teacherId, timeType) => {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    setSelectedTeachers((prev) => ({
      ...prev,
      [teacherId]: "present",
    }));

    handleTimeUpdate(teacherId, timeType === "in" ? "inTime" : "outTime", currentTime);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          handleTimeUpdate(teacherId, "location", location);
        },
        (error) => {
          console.error("Geolocation error:", error);
          handleTimeUpdate(teacherId, "location", "N/A");
        }
      );
    }
  };

  const handleMarkAll = (status, isTeacher = false) => {
    const allSelected = {};
    if (isTeacher) {
      filteredTeachers.forEach((t) => {
        allSelected[t.id] = status;
        if (status === "present" && !teacherTimeRecords[t.id]?.inTime) {
          handleTimeUpdate(t.id, "inTime", currentTime);
        }
      });
      setSelectedTeachers(allSelected);
    } else {
      filteredStudents.forEach((s) => {
        allSelected[s.id] = status;
      });
      setSelectedStudents(allSelected);
    }
  };

  const handleSubmit = (isTeacher = false) => {
    const selectedData = isTeacher ? selectedTeachers : selectedStudents;
    const filteredData = isTeacher ? filteredTeachers : filteredStudents;

    const newEntries = Object.entries(selectedData)
      .filter(([id, status]) => status)
      .map(([id, status]) => {
        const baseEntry = {
          [isTeacher ? "teacherId" : "studentId"]: parseInt(id),
          date: filterDate,
          status,
          submittedAt: new Date().toISOString(),
          submittedBy: "admin",
        };

        if (isTeacher && teacherTimeRecords[id]) {
          return {
            ...baseEntry,
            ...teacherTimeRecords[id],
            totalHours: calculateWorkingHours(teacherTimeRecords[id]),
          };
        }

        return baseEntry;
      });

    const filteredAttendance = isTeacher
      ? (teacherAttendance || []).filter((a) => a?.date !== filterDate)
      : (attendance || []).filter((a) => a?.date !== filterDate);

    const setFunction = isTeacher ? setTeacherAttendance : setAttendance;
    setFunction([...filteredAttendance, ...newEntries]);

    const presentCount = Object.values(selectedData).filter((s) => s === "present").length;
    const absentCount = filteredData.length - presentCount;

    Swal.fire({
      icon: "success",
      title: "Attendance Saved Successfully!",
      html: `
        <div class="text-center">
          <div class="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p class="text-lg font-semibold mb-2">${isTeacher ? "Teacher" : "Student"} Attendance Recorded</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-green-50 p-3 rounded">
              <div class="text-green-600 font-bold text-xl">${presentCount}</div>
              <div class="text-green-700">Present</div>
            </div>
            <div class="bg-red-50 p-3 rounded">
              <div class="text-red-600 font-bold text-xl">${absentCount}</div>
              <div class="text-red-700">Absent</div>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-3">Date: ${new Date(filterDate).toLocaleDateString()}</p>
        </div>
      `,
      confirmButtonColor: "#2E86C1",
      confirmButtonText: "Great!",
      timer: 3000,
    });
  };

  const calculateWorkingHours = (timeRecord) => {
    if (!timeRecord?.inTime || !timeRecord?.outTime) return 0;

    const [inHour, inMin] = timeRecord.inTime.split(":").map(Number);
    const [outHour, outMin] = timeRecord.outTime.split(":").map(Number);

    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;

    const totalMinutes = outMinutes - inMinutes - (timeRecord.breakTime || 0);
    return Math.max(0, totalMinutes / 60);
  };

  const exportAttendance = () => {
    const studentData = filteredStudents.map((student, index) => ({
      "S.No": index + 1,
      "Roll No": student.roll || student.id,
      Name: student.name || "N/A",
      Class: student.class || "N/A",
      Status: selectedStudents[student.id] || "absent",
      Date: filterDate,
    }));

    const teacherData = filteredTeachers.map((teacher, index) => {
      const timeRecord = teacherTimeRecords[teacher.id] || {};
      return {
        "S.No": index + 1,
        "Teacher ID": teacher.id,
        Name: teacher.name || "N/A",
        Status: selectedTeachers[teacher.id] || "absent",
        "In Time": timeRecord.inTime || "",
        "Out Time": timeRecord.outTime || "",
        "Working Hours": calculateWorkingHours(timeRecord).toFixed(2),
        Location: timeRecord.location || "",
        Date: filterDate,
      };
    });

    const workbook = XLSX.utils.book_new();
    const studentSheet = XLSX.utils.json_to_sheet(studentData);
    XLSX.utils.book_append_sheet(workbook, studentSheet, "Students");
    const teacherSheet = XLSX.utils.json_to_sheet(teacherData);
    XLSX.utils.book_append_sheet(workbook, teacherSheet, "Teachers");

    const summaryData = [
      ["Summary", ""],
      ["Date", filterDate],
      ["Total Students", filteredStudents.length],
      ["Students Present", Object.values(selectedStudents).filter((s) => s === "present").length],
      ["Students Absent", filteredStudents.length - Object.values(selectedStudents).filter((s) => s === "present").length],
      ["Total Teachers", filteredTeachers.length],
      ["Teachers Present", Object.values(selectedTeachers).filter((s) => s === "present").length],
      ["Teachers Absent", filteredTeachers.length - Object.values(selectedTeachers).filter((s) => s === "present").length],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    XLSX.writeFile(workbook, `Attendance_${filterDate}.xlsx`);
  };

  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      if (!s) return false;
      const matchesSearch =
        (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.roll || s.id || "").toString().includes(searchTerm);
      const matchesClass = filterClass === "All" || (s.class || "") === filterClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, filterClass]);

  const filteredTeachers = useMemo(() => {
    return (teachers || []).filter((t) => {
      if (!t) return false;
      const matchesSearch =
        (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.id || "").toString().includes(searchTerm);
      return matchesSearch;
    });
  }, [teachers, searchTerm]);

  const currentData = activeTab === "students" ? selectedStudents : selectedTeachers;
  const currentFiltered = activeTab === "students" ? filteredStudents : filteredTeachers;

  const presentCount = Object.values(currentData).filter((s) => s === "present").length;
  const absentCount = currentFiltered.length - presentCount;
  const attendancePercentage =
    currentFiltered.length > 0 ? Math.round((presentCount / currentFiltered.length) * 100) : 0;

  const getMonthlyAttendance = (isTeacher = false) => {
    const data = isTeacher ? teacherAttendance : attendance;
    const items = isTeacher ? filteredTeachers : filteredStudents;
    const monthlyData = {};

    datesArray.forEach((date) => {
      monthlyData[date] = {};
      items.forEach((item) => {
        const record = data.find(
          (a) => a?.date === date && a?.[`${isTeacher ? "teacherId" : "studentId"}`] === item.id
        );
        monthlyData[date][item.id] = record ? record.status : "N/A";
      });
    });

    return monthlyData;
  };

  const isDayIncomplete = (date, isTeacher = false) => {
    const items = isTeacher ? filteredTeachers : filteredStudents;
    const data = isTeacher ? teacherAttendance : attendance;
    const records = data.filter((a) => a?.date === date);
    return items.length > 0 && records.length < items.length;
  };

  const monthlyAttendanceData = getMonthlyAttendance(activeTab === "teachers");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#2E86C1] flex items-center gap-2">
              <CalendarCheck size={32} /> Enhanced Attendance
            </h2>
            <p className="text-gray-600 mt-1">Comprehensive attendance management system</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="text-sm opacity-90">Today</div>
              <div className="font-bold">{new Date().toLocaleDateString()}</div>
            </div>
            <button
              onClick={exportAttendance}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Download size={20} /> Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setAttendanceMode("manual")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                attendanceMode === "manual" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              <Users size={16} /> Manual Entry
            </button>
            <button
              onClick={() => setAttendanceMode("qr")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                attendanceMode === "qr" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              <Smartphone size={16} /> QR Code
            </button>
            <button
              onClick={() => setAttendanceMode("biometric")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                attendanceMode === "biometric" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              <Camera size={16} /> Biometric
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
                activeTab === "students"
                  ? "border-b-2 border-[#2E86C1] text-[#2E86C1] bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("students")}
            >
              <Users size={20} /> Students ({filteredStudents.length})
            </button>
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
                activeTab === "teachers"
                  ? "border-b-2 border-[#2E86C1] text-[#2E86C1] bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("teachers")}
            >
              <Users size={20} /> Teachers ({filteredTeachers.length})
            </button>
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
                activeTab === "monthly"
                  ? "border-b-2 border-[#2E86C1] text-[#2E86C1] bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              <CalendarIcon size={20} /> Monthly Report
            </button>
          </div>

          {showStats && activeTab !== "monthly" && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Present</p>
                      <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                    </div>
                    <CheckCircle className="text-green-500" size={24} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Absent</p>
                      <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                    </div>
                    <XCircle className="text-red-500" size={24} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#2E86C1]">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Attendance %</p>
                      <p className="text-2xl font-bold text-[#2E86C1]">{attendancePercentage}%</p>
                    </div>
                    <TrendingUp className="text-[#2E86C1]" size={24} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-purple-600">{currentFiltered.length}</p>
                    </div>
                    <BarChart3 className="text-purple-500" size={24} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "monthly" && (
            <div className="p-4 bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <CalendarIcon size={20} /> Select Date
              </h3>
              <Calendar
                value={new Date(filterDate)}
                onChange={(date) => setFilterDate(date.toISOString().split("T")[0])}
                maxDate={new Date()}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}

          {activeTab !== "monthly" && (
            <div className="p-4 border-b bg-gray-50">
              <div
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => setExpandedFilters(!expandedFilters)}
              >
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Search size={20} /> Filters & Search
                </h3>
                {expandedFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search by name or ID"
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <CalendarIcon
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                    </div>
                  </div>
                  {activeTab === "students" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                      >
                        <option value="All">All Classes</option>
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => handleMarkAll("present", activeTab === "teachers")}
                      className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> All Present
                    </button>
                    <button
                      onClick={() => handleMarkAll("absent", activeTab === "teachers")}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} /> All Absent
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "monthly" && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <CalendarIcon size={20} /> Monthly Attendance Report
                </h3>
                <button
                  onClick={() => setCompactReportView(!compactReportView)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  {compactReportView ? "Detailed View" : "Compact View"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#2E86C1] to-[#3498DB] text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold">
                        {activeTab === "students" ? "Roll No" : "ID"}
                      </th>
                      <th className="p-4 text-left font-semibold">Name</th>
                      {compactReportView ? (
                        <th className="p-4 text-left font-semibold">Summary</th>
                      ) : (
                        datesArray.map((date) => (
                          <th
                            key={date}
                            className={
                              "p-4 text-center font-semibold" +
                              (isDayIncomplete(date, activeTab === "teachers") ? " bg-yellow-200 text-yellow-800" : "")
                            }
                          >
                            {new Date(date).getDate()}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentFiltered.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium">
                          {activeTab === "students" ? item.roll || item.id : item.id}
                        </td>
                        <td className="p-4">{item.name || "N/A"}</td>
                        {compactReportView ? (
                          <td className="p-4">
                            {(() => {
                              const presentDays = datesArray.filter(
                                (date) => monthlyAttendanceData[date][item.id] === "present"
                              ).length;
                              const totalDays = datesArray.length;
                              const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
                              return (
                                <span className="text-sm">
                                  {presentDays}/{totalDays} ({percentage}%)
                                </span>
                              );
                            })()}
                          </td>
                        ) : (
                          datesArray.map((date) => (
                            <td key={date} className="p-4 text-center">
                              {monthlyAttendanceData[date][item.id] === "present" ? (
                                <CheckCircle size={16} className="text-green-500 mx-auto" />
                              ) : monthlyAttendanceData[date][item.id] === "absent" ? (
                                <XCircle size={16} className="text-red-500 mx-auto" />
                              ) : (
                                <AlertTriangle size={16} className="text-yellow-500 mx-auto" />
                              )}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab !== "monthly" && (
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg">Loading...</p>
                </div>
              ) : currentFiltered.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No {activeTab} found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#2E86C1] to-[#3498DB] text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold">
                        {activeTab === "students" ? "Roll No" : "ID"}
                      </th>
                      <th className="p-4 text-left font-semibold">Name</th>
                      <th className="p-4 text-left font-semibold">
                        {activeTab === "students" ? "Class" : "Department"}
                      </th>
                      {activeTab === "teachers" && (
                        <>
                          <th className="p-4 text-left font-semibold">In Time</th>
                          <th className="p-4 text-left font-semibold">Out Time</th>
                          <th className="p-4 text-left font-semibold">Hours</th>
                        </>
                      )}
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentFiltered.map((item, index) => {
                      const isPresent =
                        (activeTab === "students" ? selectedStudents[item.id] : selectedTeachers[item.id]) === "present";
                      const timeRecord = teacherTimeRecords[item.id] || {};

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                        >
                          <td className="p-4 font-medium">
                            {activeTab === "students" ? item.roll || item.id : item.id}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${isPresent ? "bg-green-500" : "bg-red-500"}`}></div>
                              <span className="font-medium">{item.name || "N/A"}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{item.class || item.department || "N/A"}</td>
                          {activeTab === "teachers" && (
                            <>
                              <td className="p-4">
                                <input
                                  type="time"
                                  value={timeRecord.inTime || ""}
                                  onChange={(e) => handleTimeUpdate(item.id, "inTime", e.target.value)}
                                  className="w-full p-1 border rounded text-sm"
                                  disabled={!isPresent}
                                />
                              </td>
                              <td className="p-4">
                                <input
                                  type="time"
                                  value={timeRecord.outTime || ""}
                                  onChange={(e) => handleTimeUpdate(item.id, "outTime", e.target.value)}
                                  className="w-full p-1 border rounded text-sm"
                                  disabled={!isPresent}
                                />
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    calculateWorkingHours(timeRecord) >= 8
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {calculateWorkingHours(timeRecord).toFixed(1)}h
                                </span>
                              </td>
                            </>
                          )}
                          <td className="p-4">
                            <button
                              onClick={() => handleToggle(item.id, activeTab === "teachers")}
                              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 ${
                                isPresent
                                  ? "bg-green-100 text-green-700 hover:bg-green-200 shadow-green-200/50"
                                  : "bg-red-100 text-red-700 hover:bg-red-200 shadow-red-200/50"
                              } shadow-lg`}
                            >
                              {isPresent ? <CheckCircle size={16} /> : <XCircle size={16} />}
                              {isPresent ? "Present" : "Absent"}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {activeTab === "teachers" && (
                                <>
                                  <button
                                    onClick={() => markTeacherPresent(item.id, "in")}
                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 flex items-center gap-1"
                                  >
                                    <LogIn size={12} /> Clock In
                                  </button>
                                  <button
                                    onClick={() => markTeacherPresent(item.id, "out")}
                                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs hover:bg-purple-200 flex items-center gap-1"
                                  >
                                    <LogOut size={12} /> Clock Out
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab !== "monthly" && (
            <div className="p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarIcon size={16} />
                <span>Attendance for {new Date(filterDate).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmit(activeTab === "teachers")}
                  className="bg-[#2E86C1] text-white px-6 py-2 rounded-lg hover:bg-[#256D9B] transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Save size={20} /> Save Attendance
                </button>
                <button
                  onClick={() => {
                    setSelectedStudents({});
                    setSelectedTeachers({});
                    setTeacherTimeRecords({});
                    Swal.fire({
                      icon: "info",
                      title: "Attendance Reset",
                      text: "All attendance selections have been cleared.",
                      confirmButtonColor: "#2E86C1",
                      confirmButtonText: "OK",
                    });
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <XCircle size={20} /> Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}