import React from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md shadow-lg'>
        {/* Header */}
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-bold text-gray-800'>{title || 'Confirm Action'}</h3>
          <button
            onClick={onCancel}
            className='text-gray-500 hover:text-gray-700'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Message */}
        <p className='text-gray-700 text-sm mb-6'>{message || 'Are you sure you want to proceed?'}</p>

        {/* Buttons */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onCancel}
            className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm text-gray-700'>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm'>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
