import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useData } from '../../context/DataContext';
import Swal from 'sweetalert2';
import { BookOpen, Bookmark, Plus, Trash2, Edit } from 'lucide-react';

export default function ClassSubjectSetup() {
  const { classes, setClasses, subjects, setSubjects } = useData();
  const [newClass, setNewClass] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.trim()) return;

    if (classes.includes(newClass)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Class',
        text: 'This class already exists.',
      });
      return;
    }

    setClasses([...classes, newClass]);
    setNewClass('');
    Swal.fire({
      icon: 'success',
      title: 'Class Added',
      text: `${newClass} has been added successfully.`,
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    if (subjects.includes(newSubject)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Subject',
        text: 'This subject already exists.',
      });
      return;
    }

    setSubjects([...subjects, newSubject]);
    setNewSubject('');
    Swal.fire({
      icon: 'success',
      title: 'Subject Added',
      text: `${newSubject} has been added successfully.`,
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleDeleteClass = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2E86C1',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedClasses = [...classes];
        updatedClasses.splice(index, 1);
        setClasses(updatedClasses);
        Swal.fire(
          'Deleted!',
          'Class has been deleted.',
          'success'
        );
      }
    });
  };

  const handleDeleteSubject = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2E86C1',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedSubjects = [...subjects];
        updatedSubjects.splice(index, 1);
        setSubjects(updatedSubjects);
        Swal.fire(
          'Deleted!',
          'Subject has been deleted.',
          'success'
        );
      }
    });
  };

  const handleUpdateClass = (index) => {
    if (!newClass.trim()) return;
    const updatedClasses = [...classes];
    updatedClasses[index] = newClass;
    setClasses(updatedClasses);
    setEditingClass(null);
    setNewClass('');
    Swal.fire({
      icon: 'success',
      title: 'Class Updated',
      text: 'Class has been updated successfully.',
      confirmButtonColor: '#2E86C1',
    });
  };

  const handleUpdateSubject = (index) => {
    if (!newSubject.trim()) return;
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = newSubject;
    setSubjects(updatedSubjects);
    setEditingSubject(null);
    setNewSubject('');
    Swal.fire({
      icon: 'success',
      title: 'Subject Updated',
      text: 'Subject has been updated successfully.',
      confirmButtonColor: '#2E86C1',
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#2E86C1] flex items-center gap-2">
          <BookOpen size={24} /> Class & Subject Management
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Section */}
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#2E86C1] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#1C2833] flex items-center gap-2">
              <BookOpen size={20} /> Classes
            </h3>
            <span className="bg-[#2E86C1] text-white px-3 py-1 rounded-full text-sm">
              {classes.length} Total
            </span>
          </div>

          <form onSubmit={handleAddClass} className="mb-6">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="Enter new class name"
                className="flex-1 p-3 border border-[#AED6F1] rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="bg-[#2E86C1] text-white p-3 rounded-lg hover:bg-[#1C628F] transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </form>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#2E86C1] text-white">
                <tr>
                  <th className="p-3 text-left">Class Name</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.length > 0 ? (
                  classes.map((cls, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        {editingClass === index ? (
                          <input
                            type="text"
                            value={newClass}
                            onChange={(e) => setNewClass(e.target.value)}
                            className="p-2 border border-[#AED6F1] rounded w-full"
                            autoFocus
                          />
                        ) : (
                          cls
                        )}
                      </td>
                      <td className="p-3 flex justify-end gap-2">
                        {editingClass === index ? (
                          <button
                            onClick={() => handleUpdateClass(index)}
                            className="text-white bg-green-500 p-2 rounded hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingClass(index);
                              setNewClass(cls);
                            }}
                            className="text-[#2E86C1] hover:bg-[#AED6F1] p-2 rounded transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClass(index)}
                          className="text-red-500 hover:bg-red-100 p-2 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="p-4 text-center text-gray-500">
                      No classes added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#2E86C1] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#1C2833] flex items-center gap-2">
              <Bookmark size={20} /> Subjects
            </h3>
            <span className="bg-[#2E86C1] text-white px-3 py-1 rounded-full text-sm">
              {subjects.length} Total
            </span>
          </div>

          <form onSubmit={handleAddSubject} className="mb-6">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter new subject name"
                className="flex-1 p-3 border border-[#AED6F1] rounded-lg focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="bg-[#2E86C1] text-white p-3 rounded-lg hover:bg-[#1C628F] transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </form>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#2E86C1] text-white">
                <tr>
                  <th className="p-3 text-left">Subject Name</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((subj, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        {editingSubject === index ? (
                          <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            className="p-2 border border-[#AED6F1] rounded w-full"
                            autoFocus
                          />
                        ) : (
                          subj
                        )}
                      </td>
                      <td className="p-3 flex justify-end gap-2">
                        {editingSubject === index ? (
                          <button
                            onClick={() => handleUpdateSubject(index)}
                            className="text-white bg-green-500 p-2 rounded hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSubject(index);
                              setNewSubject(subj);
                            }}
                            className="text-[#2E86C1] hover:bg-[#AED6F1] p-2 rounded transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSubject(index)}
                          className="text-red-500 hover:bg-red-100 p-2 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="p-4 text-center text-gray-500">
                      No subjects added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}