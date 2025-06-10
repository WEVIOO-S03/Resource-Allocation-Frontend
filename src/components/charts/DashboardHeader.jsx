import React from 'react';
import { getCurrentUser } from '../../api/authService';


const DashboardHeader = ({ projectResources = [] }) => {
  const currentHour = new Date().getHours();
    const currentUser = getCurrentUser();
 
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  
  return (
<div className="bg-gradient-to-r from-slate-800 via-emerald-500 to-slate-700 rounded-3xl p-6 mx-5 mb-6 text-white shadow-lg">      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-white/30 p-1">
            <img
              src="https://i.pravatar.cc/150?img=1"
              alt="User Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm opacity-90">{greeting},</span>
            <span className="text-xl font-semibold">{currentUser?.firstName || 'User'}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.072 1.072a.75.75 0 101.06 1.06l1.072-1.072zM18 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0118 12zM16.822 16.822a.75.75 0 011.06 0l1.072 1.072a.75.75 0 11-1.06 1.06l-1.072-1.072a.75.75 0 010-1.06zM12 18a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 18zM7.178 16.822a.75.75 0 010 1.06l-1.072 1.072a.75.75 0 01-1.06-1.06l1.072-1.072a.75.75 0 011.06 0zM6 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 016 12zM7.178 7.178a.75.75 0 01-1.06 0L5.046 6.106a.75.75 0 011.06-1.06l1.072 1.072a.75.75 0 010 1.06z"/>
            </svg>
            <span className="text-2xl font-bold">Agressive</span>
          </div>
          <span className="text-sm opacity-90">Investing Strategy</span>
        </div>

        <div className="flex flex-col items-end">
          <div className="mb-4">
            <span className="text-xs uppercase opacity-80">Deadline</span>
            <div className="text-3xl font-bold">02-02-26</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;