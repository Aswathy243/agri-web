import React from 'react';
import FarmerForum from '../components/FarmerForum';

const Forum = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Farmer Forum</h1>
      <FarmerForum />
    </div>
  );
};

export default Forum;