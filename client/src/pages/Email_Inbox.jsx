import React from 'react';
import { Button } from '@material-tailwind/react'; // Import Material Tailwind components

function SuccessPage() {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2l4 -4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 12l-4 4l6 6l10-10l-4-4l-8 8z"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-2">Success!</h2>
        <p className="text-gray-700 mb-4">An email has been sent to your inbox. Please check it.</p>
        <Button color="green" onClick={() => window.location.href = '/'}>
          Go to Home
        </Button>
      </div>
    </div>
  );
}

export default SuccessPage;
