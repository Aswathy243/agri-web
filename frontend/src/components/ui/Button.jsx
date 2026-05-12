import React from 'react';

const Button = ({ children, onClick, type = "button", ...props }) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition duration-200"
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
