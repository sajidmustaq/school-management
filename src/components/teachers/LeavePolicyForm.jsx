import React from 'react';
import { Calendar, Heart, Umbrella, Baby, DollarSign } from 'lucide-react';

const LeavePolicyForm = ({ newTeacher, onChange }) => {
  const handleLeavePolicyChange = (field, value) => {
    onChange({
      target: {
        name: `leavePolicy.${field}`,
        value: field === 'leaveEncashment' ? value === 'true' : parseInt(value) || 0
      }
    });
  };

  const leaveTypes = [
    {
      key: 'casualLeave',
      label: 'Casual Leave',
      icon: Calendar,
      description: 'For personal matters and unexpected situations',
      color: 'blue'
    },
    {
      key: 'sickLeave',
      label: 'Sick Leave',
      icon: Heart,
      description: 'For medical emergencies and health issues',
      color: 'red'
    },
    {
      key: 'annualLeave',
      label: 'Annual Leave',
      icon: Umbrella,
      description: 'For vacations and planned time off',
      color: 'green'
    },
    {
      key: 'maternityLeave',
      label: 'Maternity Leave',
      icon: Baby,
      description: 'For maternity and paternity purposes',
      color: 'pink'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      red: 'bg-red-50 border-red-200 text-red-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      pink: 'bg-pink-50 border-pink-200 text-pink-700'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getIconColorClasses = (color) => {
    const colorMap = {
      blue: 'text-blue-500',
      red: 'text-red-500',
      green: 'text-green-500',
      pink: 'text-pink-500'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Policy Configuration</h3>
        <p className="text-sm text-gray-600">
          Set annual leave entitlements and policies for this teacher
        </p>
      </div>

      {/* Leave Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leaveTypes.map(({ key, label, icon: Icon, description, color }) => (
          <div
            key={key}
            className={`p-6 rounded-lg border-2 ${getColorClasses(color)}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Icon className={`w-6 h-6 ${getIconColorClasses(color)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">{label}</h4>
                <p className="text-xs opacity-75 mb-3">{description}</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={newTeacher.leavePolicy?.[key] || 0}
                    onChange={(e) => handleLeavePolicyChange(key, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium">days/year</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Encashment Policy */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <DollarSign className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-700 mb-2">Leave Encashment Policy</h4>
            <p className="text-xs text-yellow-600 mb-4">
              Allow unused leaves to be converted to cash at the end of the year
            </p>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="leaveEncashment"
                  value="true"
                  checked={newTeacher.leavePolicy?.leaveEncashment === true}
                  onChange={(e) => handleLeavePolicyChange('leaveEncashment', e.target.value)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-yellow-700">Enabled</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="leaveEncashment"
                  value="false"
                  checked={newTeacher.leavePolicy?.leaveEncashment === false}
                  onChange={(e) => handleLeavePolicyChange('leaveEncashment', e.target.value)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-yellow-700">Disabled</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Leave Policy Summary</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {leaveTypes.map(({ key, label }) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {newTeacher.leavePolicy?.[key] || 0}
              </div>
              <div className="text-xs text-gray-600">{label}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Annual Leave Days:</span>
            <span className="text-lg font-semibold text-gray-900">
              {Object.values(newTeacher.leavePolicy || {})
                .filter((value, index) => index < 4) // Only count the numeric leave types
                .reduce((sum, value) => sum + (parseInt(value) || 0), 0)} days
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Leave Encashment:</span>
            <span className={`text-sm font-medium ${
              newTeacher.leavePolicy?.leaveEncashment ? 'text-green-600' : 'text-red-600'
            }`}>
              {newTeacher.leavePolicy?.leaveEncashment ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-800 mb-2">Leave Policy Guidelines</h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Casual leave is typically for personal matters (recommended: 12 days/year)</li>
          <li>• Sick leave is for medical emergencies (recommended: 10 days/year)</li>
          <li>• Annual leave is for planned vacations (recommended: 21 days/year)</li>
          <li>• Maternity leave varies by local laws (recommended: 90 days/year)</li>
          <li>• Leave encashment allows conversion of unused leaves to salary</li>
        </ul>
      </div>
    </div>
  );
};

export default LeavePolicyForm;