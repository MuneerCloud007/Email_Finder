import React from 'react';

const UnderConstruction = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 bg-white rounded shadow-lg">
        <svg
          className="w-16 h-16 text-yellow-500 mx-auto mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01m6.938-2.519A8 8 0 1113 5.06m2.992 5.853l1.06 1.06M15.44 15.44l1.06-1.06M12 3v.01M21 12h-.01M12 21v-.01M3 12h.01M4.22 4.22l.084.073M19.78 19.78l-.073-.084M19.78 4.22l-.073.084M4.22 19.78l.084-.073"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          This page is not developed yet
        </h1>
        <p className="text-gray-600">
          Our developers are currently working on it. Please check back later.
        </p>
      </div>
    </div>
  );
};

export default UnderConstruction;
