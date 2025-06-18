import React, { createContext, useState, useContext, useMemo, useEffect } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const loadFromLocalStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return defaultValue;
    }
  };

  const [students, setStudents] = useState(() => 
    loadFromLocalStorage('school_students', [{
      id: 1,
      name: "Ali Khan",
      email: "ali.khan@example.com",
      phone: "03001234567",
      address: "123 Main Street, Karachi",
      class: "Class 5",
      roll: "101",
      admissionDate: "2025-01-01",
      guardianName: "Ahmed Khan",
      status: "active",
      createdAt: "2025-06-12T10:00:00Z",
    },
    {
      id: 2,
      name: "Ayesha Siddiqui",
      email: "ayesha.siddiqui@example.com",
      phone: "03112345678",
      address: "456 Garden Road, Lahore",
      class: "Class 6",
      roll: "102",
      admissionDate: "2025-01-01",
      guardianName: "Siddiqui Rehman",
      status: "active",
      createdAt: "2025-06-12T10:00:00Z",
    },
  ]));

  const [teachers, setTeachers] = useState(() => 
    loadFromLocalStorage('school_teachers', [
    {
      id: 1,
      employeeId: "EMP001",
      name: "Usman Ahmed",
      email: "usman.ahmed@example.com",
      phone: "03211234567",
      address: "789 School Lane, Islamabad",
      qualification: "M.Sc Mathematics",
      subjects: ["Math", "Physics"],
      department: "Mathematics",
      position: "Senior Teacher",
      joiningDate: "2024-12-01",
      salary: 60000,
      status: "permanent",
      createdAt: "2025-06-12T10:00:00Z",
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Sara Malik",
      email: "sara.malik@example.com",
      phone: "03312345678",
      address: "101 Teacher Colony, Rawalpindi",
      qualification: "M.A English",
      subjects: ["English", "Literature"],
      department: "English",
      position: "Teacher",
      joiningDate: "2024-12-01",
      salary: 55000,
      status: "permanent",
      createdAt: "2025-06-12T10:00:00Z",
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Ahmed Hassan",
      email: "ahmed.hassan@example.com",
      phone: "03411234567",
      address: "234 New Colony, Karachi",
      qualification: "B.Sc Computer Science",
      subjects: ["Computer Science", "IT"],
      department: "Computer Science",
      position: "Junior Teacher",
      joiningDate: "2025-01-15",
      salary: 45000,
      status: "probationary",
      createdAt: "2025-06-12T10:00:00Z",
    },
  ]));

 const [attendance, setAttendance] = useState(() => 
    loadFromLocalStorage('school_attendance', [
    {
      studentId: 1,
      date: "2025-06-12",
      status: "present",
      recordedAt: "2025-06-12T08:00:00Z",
    },
    {
      studentId: 2,
      date: "2025-06-12",
      status: "absent",
      recordedAt: "2025-06-12T08:00:00Z",
    },
  ]));

  // Teacher attendance with enhanced structure for payroll
   const [teacherAttendance, setTeacherAttendance] = useState(() => 
    loadFromLocalStorage('school_teacher_attendance', [
    {
      teacherId: 1,
      date: "2025-06-01",
      status: "present",
      inTime: "08:45",
      outTime: "17:15",
      recordedAt: "2025-06-01T08:45:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-02",
      status: "present",
      inTime: "08:50",
      outTime: "17:10",
      recordedAt: "2025-06-02T08:50:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-03",
      status: "present",
      inTime: "09:15",
      outTime: "17:30",
      recordedAt: "2025-06-03T09:15:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-04",
      status: "present",
      inTime: "08:30",
      outTime: "18:00",
      recordedAt: "2025-06-04T08:30:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-05",
      status: "absent",
      inTime: null,
      outTime: null,
      recordedAt: "2025-06-05T08:00:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-06",
      status: "present",
      inTime: "08:55",
      outTime: "17:05",
      recordedAt: "2025-06-06T08:55:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-07",
      status: "present",
      inTime: "08:40",
      outTime: "17:20",
      recordedAt: "2025-06-07T08:40:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-08",
      status: "present",
      inTime: "09:20",
      outTime: "17:00",
      recordedAt: "2025-06-08T09:20:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-09",
      status: "present",
      inTime: "08:35",
      outTime: "17:45",
      recordedAt: "2025-06-09T08:35:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-10",
      status: "present",
      inTime: "08:45",
      outTime: "17:15",
      recordedAt: "2025-06-10T08:45:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-11",
      status: "present",
      inTime: "08:50",
      outTime: "17:10",
      recordedAt: "2025-06-11T08:50:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-12",
      status: "present",
      inTime: "08:40",
      outTime: "17:25",
      recordedAt: "2025-06-12T08:40:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-13",
      status: "present",
      inTime: "09:10",
      outTime: "17:05",
      recordedAt: "2025-06-13T09:10:00Z",
    },
    {
      teacherId: 1,
      date: "2025-06-14",
      status: "present",
      inTime: "08:30",
      outTime: "18:15",
      recordedAt: "2025-06-14T08:30:00Z",
    },

    // June 2025 attendance for Teacher 2 (Sara Malik)
    {
      teacherId: 2,
      date: "2025-06-01",
      status: "present",
      inTime: "09:05",
      outTime: "17:00",
      recordedAt: "2025-06-01T09:05:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-02",
      status: "present",
      inTime: "09:15",
      outTime: "17:10",
      recordedAt: "2025-06-02T09:15:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-03",
      status: "present",
      inTime: "08:55",
      outTime: "17:05",
      recordedAt: "2025-06-03T08:55:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-04",
      status: "present",
      inTime: "09:20",
      outTime: "16:45",
      recordedAt: "2025-06-04T09:20:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-05",
      status: "present",
      inTime: "09:00",
      outTime: "17:15",
      recordedAt: "2025-06-05T09:00:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-06",
      status: "absent",
      inTime: null,
      outTime: null,
      recordedAt: "2025-06-06T08:00:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-07",
      status: "present",
      inTime: "09:10",
      outTime: "17:00",
      recordedAt: "2025-06-07T09:10:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-08",
      status: "present",
      inTime: "09:25",
      outTime: "16:50",
      recordedAt: "2025-06-08T09:25:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-09",
      status: "present",
      inTime: "08:50",
      outTime: "17:20",
      recordedAt: "2025-06-09T08:50:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-10",
      status: "present",
      inTime: "09:05",
      outTime: "17:05",
      recordedAt: "2025-06-10T09:05:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-11",
      status: "present",
      inTime: "09:15",
      outTime: "17:00",
      recordedAt: "2025-06-11T09:15:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-12",
      status: "present",
      inTime: "09:00",
      outTime: "17:10",
      recordedAt: "2025-06-12T09:00:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-13",
      status: "absent",
      inTime: null,
      outTime: null,
      recordedAt: "2025-06-13T08:00:00Z",
    },
    {
      teacherId: 2,
      date: "2025-06-14",
      status: "present",
      inTime: "09:30",
      outTime: "16:45",
      recordedAt: "2025-06-14T09:30:00Z",
    },

    // June 2025 attendance for Teacher 3 (Ahmed Hassan - Probationary)
    {
      teacherId: 3,
      date: "2025-06-01",
      status: "present",
      inTime: "08:30",
      outTime: "17:00",
      recordedAt: "2025-06-01T08:30:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-02",
      status: "present",
      inTime: "08:45",
      outTime: "17:15",
      recordedAt: "2025-06-02T08:45:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-03",
      status: "present",
      inTime: "09:25",
      outTime: "17:10",
      recordedAt: "2025-06-03T09:25:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-04",
      status: "present",
      inTime: "08:40",
      outTime: "17:30",
      recordedAt: "2025-06-04T08:40:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-05",
      status: "present",
      inTime: "08:35",
      outTime: "17:05",
      recordedAt: "2025-06-05T08:35:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-06",
      status: "present",
      inTime: "09:15",
      outTime: "16:50",
      recordedAt: "2025-06-06T09:15:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-07",
      status: "absent",
      inTime: null,
      outTime: null,
      recordedAt: "2025-06-07T08:00:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-08",
      status: "absent",
      inTime: null,
      outTime: null,
      recordedAt: "2025-06-08T08:00:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-09",
      status: "present",
      inTime: "08:55",
      outTime: "17:20",
      recordedAt: "2025-06-09T08:55:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-10",
      status: "present",
      inTime: "09:30",
      outTime: "17:00",
      recordedAt: "2025-06-10T09:30:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-11",
      status: "present",
      inTime: "08:45",
      outTime: "17:15",
      recordedAt: "2025-06-11T08:45:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-12",
      status: "present",
      inTime: "09:20",
      outTime: "16:45",
      recordedAt: "2025-06-12T09:20:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-13",
      status: "present",
      inTime: "08:50",
      outTime: "17:25",
      recordedAt: "2025-06-13T08:50:00Z",
    },
    {
      teacherId: 3,
      date: "2025-06-14",
      status: "present",
      inTime: "09:10",
      outTime: "17:05",
      recordedAt: "2025-06-14T09:10:00Z",
    },
  ]));

  const [classes, setClasses] = useState([
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
  ]);

  const [subjects, setSubjects] = useState([
    "Math",
    "Science",
    "English",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Literature",
    "Computer Science",
  ]);

  // Optimized teacher attendance structure for payroll (by teacherId -> date)
  const teacherAttendanceById = useMemo(() => {
    const data = {};
    teacherAttendance.forEach((record) => {
      if (!data[record.teacherId]) data[record.teacherId] = {};
      data[record.teacherId][record.date] = {
        status: record.status,
        inTime: record.inTime,
        outTime: record.outTime,
        recordedAt: record.recordedAt,
      };
    });
    return data;
  }, [teacherAttendance]);

  // Helper function to add teacher attendance
  const addTeacherAttendance = (teacherId, date, status, inTime = null, outTime = null) => {
    const newRecord = {
      teacherId,
      date,
      status,
      inTime,
      outTime,
      recordedAt: new Date().toISOString(),
    };

    setTeacherAttendance(prev => {
      // Remove existing record for same teacher and date
      const filtered = prev.filter(record => 
        !(record.teacherId === teacherId && record.date === date)
      );
      return [...filtered, newRecord];
    });
  };

  // Helper function to get teacher attendance for a specific month
  const getTeacherAttendanceByMonth = (teacherId, year, month) => {
    return teacherAttendance.filter(record => {
      const recordDate = new Date(record.date);
      return record.teacherId === teacherId && 
             recordDate.getFullYear() === year && 
             recordDate.getMonth() === month;
    });
  };
useEffect(() => {
    localStorage.setItem('school_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('school_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('school_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('school_teacher_attendance', JSON.stringify(teacherAttendance));
  }, [teacherAttendance]);
  return (
    <DataContext.Provider
      value={{
        // Students
        students,
        setStudents,
        
        // Teachers
        teachers,
        setTeachers,
        
        // Student Attendance
        attendance,
        setAttendance,
        
        // Teacher Attendance
        teacherAttendance,
        setTeacherAttendance,
        teacherAttendanceById,
        addTeacherAttendance,
        getTeacherAttendanceByMonth,
        
        // Classes and Subjects
        classes,
        setClasses,
        subjects,
        setSubjects,
      }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);