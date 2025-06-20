import React from 'react';
import {
  Camera, User, Mail, Phone, MapPin, GraduationCap,
  Calendar, Users, Hash
} from 'lucide-react';

const BasicInfoForm = ({
  newTeacher,
  errors,
  subjects,
  onImageChange,
  onChange,
  onSelectChange,
}) => {
  const subjectOptions = subjects?.map(subject => ({
    value: subject,
    label: subject
  })) || [];

  const selectedSubjects = newTeacher.subjects.map(subject => ({
    value: subject,
    label: subject
  }));

  return (
    <div className="space-y-6">
      {/* Profile Image Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {newTeacher.profileImage ? (
              <img
                src={newTeacher.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-gray-600">Click camera icon to upload photo</p>
      </div>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Employee ID */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 mr-2" />
            Employee ID
          </label>
          <input
            type="text"
            name="employeeId"
            value={newTeacher.employeeId}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Auto-generated"
          />
          {errors.employeeId && (
            <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={newTeacher.name}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={newTeacher.email}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={newTeacher.phone}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 mr-2" />
            Gender
          </label>
          <select
            name="gender"
            value={newTeacher.gender}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={newTeacher.dateOfBirth}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Qualification */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <GraduationCap className="w-4 h-4 mr-2" />
            Qualification *
          </label>
          <input
            type="text"
            name="qualification"
            value={newTeacher.qualification}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.qualification ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., Master's in Mathematics"
          />
          {errors.qualification && (
            <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>
          )}
        </div>

        {/* Guardian/Spouse */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 mr-2" />
            Guardian/Spouse Name
          </label>
          <input
            type="text"
            name="guardianSpouse"
            value={newTeacher.guardianSpouse}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter guardian or spouse name"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 mr-2" />
          Address
        </label>
        <textarea
          name="address"
          value={newTeacher.address}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Subjects */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="w-4 h-4 mr-2" />
          Subjects *
        </label>
        <div className="relative">
          <select
            multiple
            name="subjects"
            value={newTeacher.subjects}
            onChange={(e) => {
              const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
              onSelectChange(selectedValues.map(value => ({ value, label: value })));
            }}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] ${errors.subjects ? 'border-red-500' : 'border-gray-300'}`}
          >
            {subjectOptions.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl/Cmd to select multiple subjects
          </p>
        </div>
        {errors.subjects && (
          <p className="text-red-500 text-xs mt-1">{errors.subjects}</p>
        )}
        {newTeacher.subjects.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Subjects:</p>
            <div className="flex flex-wrap gap-2">
              {newTeacher.subjects.map((subject, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => {
                      const updatedSubjects = newTeacher.subjects.filter((_, i) => i !== index);
                      onSelectChange(updatedSubjects.map(s => ({ value: s, label: s })));
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Joining Date and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Joining Date *
          </label>
          <input
            type="date"
            name="joiningDate"
            value={newTeacher.joiningDate}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.joiningDate ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.joiningDate && (
            <p className="text-red-500 text-xs mt-1">{errors.joiningDate}</p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 mr-2" />
            Status
          </label>
          <select
            name="status"
            value={newTeacher.status}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
