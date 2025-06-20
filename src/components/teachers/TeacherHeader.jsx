import React from 'react';
import { Plus, Download, Mail, FileText, Printer } from 'lucide-react';

const TeacherHeader = ({
  showAddForm,
  onToggleAddForm,
  onBulkDownload,
  onBulkEmail,
  onExport,
  onPrint,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add, edit, and manage teacher information and payroll
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          {/* Export/Print Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onExport('csv')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Export to CSV"
            >
              <FileText className="h-4 w-4 mr-1" />
              Export
            </button>
            
            <button
              onClick={onPrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Print List"
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </button>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <button
              onClick={onBulkDownload}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Bulk Download Payslips"
            >
              <Download className="h-4 w-4 mr-1" />
              Bulk Download
            </button>
            
            <button
              onClick={onBulkEmail}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Bulk Email Payslips"
            >
              <Mail className="h-4 w-4 mr-1" />
              Bulk Email
            </button>
          </div>

          {/* Add Teacher Button */}
          <button
            onClick={onToggleAddForm}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              showAddForm
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Teacher'}
          </button>
        </div>
      </div>
      
      {/* Quick Stats Bar */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-600">Quick Actions</div>
          <div className="mt-1 text-xs text-blue-500">
            Bulk operations available
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-600">Export Options</div>
          <div className="mt-1 text-xs text-green-500">
            CSV, Print available
          </div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-purple-600">Payroll Ready</div>
          <div className="mt-1 text-xs text-purple-500">
            Calculate & send payslips
          </div>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-orange-600">Management</div>
          <div className="mt-1 text-xs text-orange-500">
            Add, edit, view details
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHeader;