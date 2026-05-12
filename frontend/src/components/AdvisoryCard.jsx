import React from 'react';

const AdvisoryCard = ({ title, description, icon, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-white text-opacity-90">{description}</p>
      <button className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg">
        View Details
      </button>
    </div>
  );
};

export default AdvisoryCard;