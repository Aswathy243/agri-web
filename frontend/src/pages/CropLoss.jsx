import React from 'react';
import CropLossForm from '../components/CropLossForm';

const CropLoss = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Report Crop Loss</h1>
      <CropLossForm />
    </div>
  );
};

export default CropLoss;