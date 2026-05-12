import React from 'react';
import { Link } from 'react-router-dom';
import AdvisoryCard from './AdvisoryCard';

const Features = () => {
  const features = [
    /*{
      title: "Smart Advisory",
      description: "Get personalized farming advice based on soil, weather, and crop conditions.",
      icon: "🌱",
      bgColor: "bg-green-600",
      path: "/advisory"
    }, */
    {
      title: "Crop Loss Reporting",
      description: "Report crop damage and get connected with compensation schemes.",
      icon: "📝",
      bgColor: "bg-green-700",
      path: "/crop-loss"
    },
    {
      title: "Farmer Forum",
      description: "Connect with other farmers and agricultural experts in your area.",
      icon: "👨‍🌾",
      bgColor: "bg-green-800",
      path: "/WelcomePage"
    },
    {
      title: "Weather Alerts",
      description: "Receive timely weather forecasts and warnings for your location.",
      icon: "⛅",
      bgColor: "bg-green-600",
      path: "/weather"
    },
    
    /*{
      title: "Scheme Information",
      description: "Learn about and apply for government agricultural schemes.",
      icon: "🏛️",
      bgColor: "bg-green-800",
      path: "/schemes"
    } */
  ];

  return (
    <div className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-green-900 mb-12">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link to={feature.path} key={index}>
              <AdvisoryCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                bgColor={feature.bgColor}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
