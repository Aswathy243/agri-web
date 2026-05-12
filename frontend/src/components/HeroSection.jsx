import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-green-50 py-16 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl font-bold text-green-900 mb-4">Your Digital Agricultural Companion</h1>
          <p className="text-lg text-gray-700 mb-6">
            Smart, hyperlocal advisories for Idukki farmers based on soil, weather, and crop conditions.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/advisory')}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium"
            >
              Get Advisory
            </button>
            <button
              onClick={() => navigate('/crop-loss')}
              className="border-2 border-green-700 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium"
            >
              Report Crop Loss
            </button>
          </div>
        </div>
        <div className="md:w-1/2">
          <img src="/images/farmer-hero.jpg" alt="Farmer using digital tools" className="rounded-lg shadow-xl" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
