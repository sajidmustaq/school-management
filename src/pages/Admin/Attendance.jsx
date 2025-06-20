import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useData } from "../../context/DataContext";
import MonthlyReportTable from "../../components/MonthlyReportTable";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  CalendarCheck,
  Users,
  Smartphone,
  Camera,
  Eye,
  EyeOff,
  Zap,
  Save,
  Download,
  LogIn,
  LogOut,
  UserCheck,
  UserX,
  Filter,
  ChevronUp,
  ChevronDown,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Settings,
  Calendar as CalendarIcon,
} from "lucide-react";

import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

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
  const selectedDate = useMemo(() => new Date(selectedYear, selectedMonth, 1), [selectedMonth, selectedYear]);

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [quickMarkMode, setQuickMarkMode] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const fetchFirebaseAttendance = async () => {
      try {
        const studentSnap = await getDocs(collection(db, "attendance"));
        const teacherSnap = await getDocs(collection(db, "teacherAttendance"));

        const studentData = [];
        studentSnap.forEach((doc) => studentData.push(doc.data()));

        const teacherData = [];
        teacherSnap.forEach((doc) => teacherData.push(doc.data()));

        setAttendance(studentData);
        setTeacherAttendance(teacherData);
      } catch (error) {
        console.error("Error fetching attendance from Firebase:", error);
      }
    };

    fetchFirebaseAttendance();
  }, []);

  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem("teacherAttendance", JSON.stringify(teacherAttendance));
  }, [teacherAttendance]);

  const isPreviousMonthProcessed = (month, year) => {
    const prev = new Date(year, month - 1);
    return processedPayrolls.some(
      (p) => p.month === prev.getMonth() && p.year === prev.getFullYear()
    );
  };
const datesArray = useMemo(() => {
  const year = selectedYear;
  const month = selectedMonth + 1; // 0-indexed to 1-indexed
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = (i + 1).toString().padStart(2, "0");
    return `${year}-${month.toString().padStart(2, "0")}-${day}`; // ✅ YYYY-MM-DD format
  });
}, [selectedYear, selectedMonth]);



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

    Swal.fire({
      icon: "success",
      title: `${timeType === "in" ? "Clock In" : "Clock Out"} Successful`,
      text: `Time: ${currentTime}`,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
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
    setSelectedAll(status === "present");
  };

  const handleQuickMark = (id, status, isTeacher = false) => {
    if (isTeacher) {
      setSelectedTeachers((prev) => ({ ...prev, [id]: status }));
      if (status === "present") {
        handleTimeUpdate(id, "inTime", currentTime);
      }
    } else {
      setSelectedStudents((prev) => ({ ...prev, [id]: status }));
    }
  };

  const handleSubmit = async (isTeacher = false) => {
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

    // ✅ Save to Firebase
    await Promise.all(
      newEntries.map((entry) => {
        const id = `${entry.date}_${isTeacher ? entry.teacherId : entry.studentId}`;
        return setDoc(
          doc(db, isTeacher ? "teacherAttendance" : "attendance", id),
          entry
        );
      })
    );

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
        if (!item.id) return;
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

  const monthlyAttendanceData = useMemo(() => {
    const isTeacher = activeTab === "monthly-teachers";
    const data = isTeacher ? teacherAttendance : attendance;
    const items = isTeacher ? teachers : students;

    const monthlyData = {};

    datesArray.forEach((date) => {
      monthlyData[date] = {};
      items.forEach((item) => {
        if (!item?.id) return;
        const record = data.find((a) => a?.date === date && a?.[isTeacher ? "teacherId" : "studentId"] === item.id);
        monthlyData[date][item.id] = record ? record.status : "N/A";
      });
    });

    return monthlyData;
  }, [activeTab, attendance, teacherAttendance, datesArray]);


  const averageAttendance = useMemo(() => {
    const items = activeTab === "monthly-teachers" ? filteredTeachers : filteredStudents;
    return Math.round(
      items.reduce((acc, item) => {
        const presentDays = datesArray.filter(
          (date) => monthlyAttendanceData[date]?.[item.id] === "present"
        ).length;
        const totalDays = datesArray.filter(
          (date) => monthlyAttendanceData[date]?.[item.id] !== "N/A"
        ).length;
        return acc + (totalDays > 0 ? (presentDays / totalDays) * 100 : 0);
      }, 0) / (items.length || 1)
    );
  }, [activeTab, filteredTeachers, filteredStudents, monthlyAttendanceData, datesArray]);

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2E86C1] flex items-center gap-2">
              <CalendarCheck size={24} className="sm:w-8 sm:h-8" />
              <span className="hidden sm:inline">Attendance</span>
              <span className="sm:hidden">Attendance</span>
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive attendance management</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-lg shadow-lg text-center sm:text-left">
              <div className="text-xs opacity-90">Today</div>
              <div className="font-bold text-sm">{new Date().toLocaleDateString()}</div>
            </div>
            <button
              onClick={exportAttendance}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
            >
              <Download size={16} className="sm:w-5 sm:h-5" /> Export
            </button>
          </div>
        </div>

        {/* Attendance Mode Selection */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => setAttendanceMode("manual")}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${attendanceMode === "manual"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <Users size={14} /> Manual
              </button>
              <button
                onClick={() => setAttendanceMode("qr")}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${attendanceMode === "qr"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <Smartphone size={14} /> QR Code
              </button>
              <button
                onClick={() => setAttendanceMode("biometric")}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${attendanceMode === "biometric"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <Camera size={14} /> Biometric
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setQuickMarkMode(!quickMarkMode)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${quickMarkMode
                  ? "bg-orange-600 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
              >
                <Zap size={14} /> Quick Mark
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {showStats ? <EyeOff size={14} /> : <Eye size={14} />}
                {showStats ? "Hide Stats" : "Show Stats"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b overflow-x-auto">
            <button
              className={`px-4 py-3 font-medium flex items-center gap-2 transition-colors whitespace-nowrap text-sm ${activeTab === "students"
                ? "border-b-2 border-[#2E86C1] text-[#2E86C1] bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("students")}
            >
              <Users size={16} className="sm:w-5 sm:h-5" />
              Students ({filteredStudents.length})
            </button>
            <button
              className={`px-4 py-3 font-medium flex items-center gap-2 transition-colors whitespace-nowrap text-sm ${activeTab === "teachers"
                ? "border-b-2 border-[#2E86C1] text-[#2E86C1] bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("teachers")}
            >
              <Users size={16} className="sm:w-5 sm:h-5" />
              Teachers ({filteredTeachers.length})
            </button>
            <button
              className={`px-4 py-3 font-medium flex items-center gap-2 transition-colors whitespace-nowrap text-sm ${activeTab === "monthly"
                ? "border-b-2 border-[#2E86C1] text-[#2E86C1] bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("monthly")}
            >
              <CalendarIcon size={16} className="sm:w-5 sm:h-5" />
              Monthly Report
            </button>
          </div>

          {/* Stats Section */}
          {showStats && activeTab !== "monthly" && (
            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Present</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{presentCount}</p>
                    </div>
                    <CheckCircle className="text-green-500 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-red-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Absent</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">{absentCount}</p>
                    </div>
                    <XCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-[#2E86C1]">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Attendance %</p>
                      <p className="text-xl sm:text-2xl font-bold text-[#2E86C1]">{attendancePercentage}%</p>
                    </div>
                    <TrendingUp className="text-[#2E86C1] w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-purple-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Total</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">{currentFiltered.length}</p>
                    </div>
                    <BarChart3 className="text-purple-500 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Section */}
          {activeTab !== "monthly" && (
            <div className="p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <CalendarIcon size={16} className="sm:w-5 sm:h-5" /> Select Date
                </h3>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="sm:hidden bg-blue-100 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <CalendarIcon size={14} />
                  {showCalendar ? "Hide Calendar" : "Show Calendar"}
                </button>
              </div>

              <div className={`mt-4 ${showCalendar ? "block" : "hidden"} sm:block`}>
                <div className="sm:hidden mb-4">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  />
                </div>
                <div className="hidden sm:block">
                  <Calendar
                    value={new Date(filterDate)}
                    onChange={(date) => setFilterDate(date.toISOString().split("T")[0])}
                    maxDate={new Date()}
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filters Section */}
          {activeTab !== "monthly" && (
            <div className="p-4 border-b bg-gray-50">
              <div
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => setExpandedFilters(!expandedFilters)}
              >
                <h3 className="font-medium text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <Filter size={16} className="sm:w-5 sm:h-5" /> Filters & Search
                </h3>
                {expandedFilters ? <ChevronUp size={16} className="sm:w-5 sm:h-5" /> : <ChevronDown size={16} className="sm:w-5 sm:h-5" />}
              </div>
              <div className={`transition-all duration-300 ${expandedFilters ? "block" : "hidden"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search by Name/ID
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {activeTab === "students" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Class
                      </label>
                      <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent text-sm"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Actions
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkAll("present", activeTab === "teachers")}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm flex items-center justify-center gap-1"
                      >
                        <UserCheck size={14} /> All Present
                      </button>
                      <button
                        onClick={() => handleMarkAll("absent", activeTab === "teachers")}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm flex items-center justify-center gap-1"
                      >
                        <UserX size={14} /> All Absent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E86C1]"></div>
                <span className="ml-3 text-gray-600">Loading attendance data...</span>
              </div>
            ) : (
              <>
                {/* Students Tab */}
                {activeTab === "students" && (
                  <div className="space-y-4">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-3 sm:gap-4">
                          {filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${selectedStudents[student.id] === "present"
                                ? "border-green-300 bg-green-50"
                                : selectedStudents[student.id] === "absent"
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {student.name?.charAt(0)?.toUpperCase() || "S"}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                        {student.name || "Unknown Student"}
                                      </h4>
                                      <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                                        <span>Roll: {student.roll || student.id}</span>
                                        <span>Class: {student.class || "N/A"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                  {quickMarkMode ? (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleQuickMark(student.id, "present")}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedStudents[student.id] === "present"
                                          ? "bg-green-600 text-white"
                                          : "bg-green-100 text-green-700 hover:bg-green-200"
                                          }`}
                                      >
                                        Present
                                      </button>
                                      <button
                                        onClick={() => handleQuickMark(student.id, "absent")}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedStudents[student.id] === "absent"
                                          ? "bg-red-600 text-white"
                                          : "bg-red-100 text-red-700 hover:bg-red-200"
                                          }`}
                                      >
                                        Absent
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleToggle(student.id)}
                                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedStudents[student.id] === "present"
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : selectedStudents[student.id] === "absent"
                                          ? "bg-red-600 text-white hover:bg-red-700"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                      {selectedStudents[student.id] === "present"
                                        ? "Present"
                                        : selectedStudents[student.id] === "absent"
                                          ? "Absent"
                                          : "Mark"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center pt-6">
                          <button
                            onClick={() => handleSubmit(false)}
                            className="bg-[#2E86C1] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
                          >
                            <Save size={18} />
                            Save Student Attendance
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Teachers Tab */}
                {activeTab === "teachers" && (
                  <div className="space-y-4">
                    {filteredTeachers.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4">
                          {filteredTeachers.map((teacher) => (
                            <div
                              key={teacher.id}
                              className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${selectedTeachers[teacher.id] === "present"
                                ? "border-green-300 bg-green-50"
                                : selectedTeachers[teacher.id] === "absent"
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                              <div className="flex flex-col lg:flex-row gap-4">
                                {/* Teacher Info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                      {teacher.name?.charAt(0)?.toUpperCase() || "T"}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                      {teacher.name || "Unknown Teacher"}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span>ID: {teacher.id}</span>
                                      <span>Subject: {teacher.subject || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Time Management */}
                                {selectedTeachers[teacher.id] === "present" && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        In Time
                                      </label>
                                      <input
                                        type="time"
                                        value={teacherTimeRecords[teacher.id]?.inTime || ""}
                                        onChange={(e) => handleTimeUpdate(teacher.id, "inTime", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Out Time
                                      </label>
                                      <input
                                        type="time"
                                        value={teacherTimeRecords[teacher.id]?.outTime || ""}
                                        onChange={(e) => handleTimeUpdate(teacher.id, "outTime", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Break (min)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={teacherTimeRecords[teacher.id]?.breakTime || 0}
                                        onChange={(e) => handleTimeUpdate(teacher.id, "breakTime", parseInt(e.target.value) || 0)}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Working Hours
                                      </label>
                                      <div className="p-2 bg-gray-100 rounded text-sm font-medium text-center">
                                        {calculateWorkingHours(teacherTimeRecords[teacher.id] || {}).toFixed(1)}h
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {quickMarkMode ? (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleQuickMark(teacher.id, "present", true)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedTeachers[teacher.id] === "present"
                                          ? "bg-green-600 text-white"
                                          : "bg-green-100 text-green-700 hover:bg-green-200"
                                          }`}
                                      >
                                        Present
                                      </button>
                                      <button
                                        onClick={() => handleQuickMark(teacher.id, "absent", true)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedTeachers[teacher.id] === "absent"
                                          ? "bg-red-600 text-white"
                                          : "bg-red-100 text-red-700 hover:bg-red-200"
                                          }`}
                                      >
                                        Absent
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => markTeacherPresent(teacher.id, "in")}
                                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
                                      >
                                        <LogIn size={14} />
                                        Clock In
                                      </button>
                                      <button
                                        onClick={() => markTeacherPresent(teacher.id, "out")}
                                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                                      >
                                        <LogOut size={14} />
                                        Clock Out
                                      </button>
                                      <button
                                        onClick={() => handleToggle(teacher.id, true)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedTeachers[teacher.id] === "present"
                                          ? "bg-green-600 text-white hover:bg-green-700"
                                          : selectedTeachers[teacher.id] === "absent"
                                            ? "bg-red-600 text-white hover:bg-red-700"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                          }`}
                                      >
                                        {selectedTeachers[teacher.id] === "present"
                                          ? "Present"
                                          : selectedTeachers[teacher.id] === "absent"
                                            ? "Absent"
                                            : "Mark"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Additional Info */}
                              {selectedTeachers[teacher.id] === "present" && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Location
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Auto-filled with GPS or enter manually"
                                        value={teacherTimeRecords[teacher.id]?.location || ""}
                                        onChange={(e) => handleTimeUpdate(teacher.id, "location", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Notes
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Optional notes"
                                        value={teacherTimeRecords[teacher.id]?.notes || ""}
                                        onChange={(e) => handleTimeUpdate(teacher.id, "notes", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center pt-6">
                          <button
                            onClick={() => handleSubmit(true)}
                            className="bg-[#2E86C1] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
                          >
                            <Save size={18} />
                            Save Teacher Attendance
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Monthly Report Tab */}
                {(activeTab === "monthly" ||
                  activeTab === "monthly-students" ||
                  activeTab === "monthly-teachers") && (
                    <MonthlyReportTable
                      activeTab={activeTab}
                      students={students}
                      teachers={teachers}
                      attendance={attendance}
                      teacherAttendance={teacherAttendance}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      datesArray={datesArray}
                      setSelectedMonth={setSelectedMonth}
                      setSelectedYear={setSelectedYear}
                      setActiveTab={setActiveTab}
                      setSearchTerm={setSearchTerm}
                      filteredTeachers={filteredTeachers}
                      filteredStudents={filteredStudents}
                      monthlyAttendanceData={monthlyAttendanceData}
                      averageAttendance={averageAttendance}
                      compactReportView={compactReportView}
                      setCompactReportView={setCompactReportView}
                    />
                  )}
              </>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}