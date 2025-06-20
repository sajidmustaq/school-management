import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const BulkEmailSender = ({ payrollData, onSendEmail }) => {
  const [sending, setSending] = useState(false);

  const handleBulkEmail = async () => {
    setSending(true);

    for (const employee of payrollData) {
      try {
        await onSendEmail(employee);
      } catch (err) {
        console.error(`Email failed for ${employee.name}`, err);
      }
    }

    setSending(false);
    Swal.fire({
      icon: 'success',
      title: 'Emails Sent',
      text: 'All employee payslips have been emailed.',
      confirmButtonColor: '#3085d6',
    });
  };

  return (
    <button
      onClick={handleBulkEmail}
      disabled={sending}
      className='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm disabled:opacity-50'>
      {sending ? <Loader2 className='animate-spin w-4 h-4' /> : <Mail className='w-4 h-4' />}
      {sending ? 'Sending Emails...' : 'Send All Payslips'}
    </button>
  );
};

export default BulkEmailSender;
