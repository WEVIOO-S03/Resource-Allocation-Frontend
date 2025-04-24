// components/StatsCard.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatsCard = ({ icon, iconColor, bgColor, title, value, delay }) => {
  return (
    <div className="card bg-white rounded-xl p-6 animate__animated animate__fadeInUp h-full" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center">
        <div className={`rounded-full ${bgColor} p-3`}>
          <FontAwesomeIcon icon={icon} className={iconColor} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;