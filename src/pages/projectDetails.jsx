import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getWeek, startOfWeek, endOfWeek } from 'date-fns';
import '../styles/AttendanceView.css';

const AttendanceView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [workingTimePopup, setWorkingTimePopup] = useState(null);

  const employees = [
    {
      id: 1,
      name: 'Grant Marshall',
      role: 'Design manager',
      department: 'Design',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 2,
      name: 'Pena Valdez',
      role: 'Design manager',
      department: 'Design',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 3,
      name: 'Jessica Miles',
      role: 'Assistant engineer',
      department: 'Engineer',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 4,
      name: 'Kerri Barber',
      role: 'Engineer',
      department: 'Engineer',
      avatar: 'https://via.placeholder.com/40'
    }
  ];

  const departments = ['Design', 'Engineer'];
  
  // Get all days for the calendar view
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const handlePreviousYear = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear() - 1, prevDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear() + 1, prevDate.getMonth(), 1));
  };

  const handleMonthClick = (month) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  const getAttendanceStatus = (employeeId, date) => {
    // This would normally come from your backend
    const statuses = ['present', 'late', 'absent'];
    const randomIndex = Math.floor((employeeId + date.getDate()) % 3);
    return statuses[randomIndex];
  };

  const handleCellClick = (employee, date) => {
    setWorkingTimePopup({
      employee,
      date,
      position: { x: window.event.clientX, y: window.event.clientY }
    });
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWeekIndicator = (date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(weekStart, 'd')} - ${format(weekEnd, 'd')} ${format(date, 'MMMM')} - W${getWeek(date)}`;
  };

  return (
    <div className="attendance-container">
      {/* Header row with date range, search and navigation */}
      <div className="header-row">
        <div className="date-range">
          {format(startOfMonth(currentDate), 'dd MMM yyyy')} - {format(endOfMonth(currentDate), 'dd MMM yyyy')}
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="navigation-container">
          <div className="year-nav">
            <button onClick={handlePreviousYear}>&lt;</button>
            <span>{currentDate.getFullYear()}</span>
            <button onClick={handleNextYear}>&gt;</button>
          </div>
          <div className="month-buttons">
            {Array.from({ length: 12 }, (_, i) => (
              <button
                key={i}
                className={`month-btn ${currentDate.getMonth() === i ? 'active' : ''}`}
                onClick={() => handleMonthClick(i)}
              >
                {format(new Date(currentDate.getFullYear(), i, 1), 'MMM')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Days header */}
        <div className="days-header">
          <div className="employee-column-header"></div>
          <div className="days-row">
            {calendarDays.map((day, index) => (
              <div key={index} className="day-header">
                <div className="day-number">{format(day, 'd')}</div>
                <div className="day-name">{format(day, 'EEE').toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Departments and Employees */}
        <div className="departments-container">
          {departments.map(dept => (
            <div key={dept} className="department-section">
              <div className="department-header">
                {dept}
              </div>
              {filteredEmployees
                .filter(emp => emp.department === dept)
                .map(emp => (
                  <div key={emp.id} className="employee-attendance-row">
                    <div className="employee-info-cell">
                      <img src={emp.avatar} alt="" className="employee-avatar" />
                      <div className="employee-info">
                        <div className="employee-name">{emp.name}</div>
                        <div className="employee-title">{emp.role}</div>
                      </div>
                      <div className="action-icons">
                        <span className="action-icon">⚙️</span>
                      </div>
                    </div>
                    <div className="attendance-cells">
                      {calendarDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`status-cell status-${getAttendanceStatus(emp.id, day)} ${isToday(day) ? 'today' : ''}`}
                          onClick={() => handleCellClick(emp, day)}
                        >
                          <div className="status-dot" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Working Time Popup */}
      {workingTimePopup && (
        <div className="working-time-popup" style={{
          left: workingTimePopup.position.x,
          top: workingTimePopup.position.y
        }}>
          <h4>Working Time</h4>
          <div className="working-time-entry">
            <span className="working-time-label">Check in:</span>
            <span className="working-time-value">09:00</span>
          </div>
          <div className="working-time-entry">
            <span className="working-time-label">Check out:</span>
            <span className="working-time-value">17:00</span>
          </div>
          <div className="working-time-entry">
            <span className="working-time-label">Total:</span>
            <span className="working-time-value">7h 56min</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceView; 