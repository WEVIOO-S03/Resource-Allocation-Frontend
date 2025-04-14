import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from 'date-fns';
import '../styles/AttendanceView.css';

const AttendanceView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const daysRowRef = useRef(null);
  const attendanceRowsRef = useRef([]);

  // Mock data for departments and employees
  const departments = [
    {
      name: 'Design',
      employees: [
        { id: 1, name: 'Grant Marshall', title: 'Design manager', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 2, name: 'Pena Valdez', title: 'Senior designer', avatar: 'https://i.pravatar.cc/150?img=2' },
      ]
    },
    {
      name: 'Engineer',
      employees: [
        { id: 3, name: 'Jessica Miles', title: 'Associate engineer', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: 4, name: 'Kerri Barber', title: 'Engineer', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: 5, name: 'Natasha Gamble', title: 'Senior engineer', avatar: 'https://i.pravatar.cc/150?img=5' },
      ]
    }
  ];

  const getAttendanceStatus = (employeeId, date) => {
    // Mock attendance status - you would fetch this from your backend
    const random = Math.random();
    if (random < 0.7) return 'full';
    if (random < 0.9) return 'moyen';
    return 'low';
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  
  const handleCellClick = (employee, date) => {
    setSelectedEmployee(employee);
    setSelectedDate(date);
  };

  const handleColumnClick = (date) => {
    setSelectedColumn(date);
  };

  const isColumnSelected = (date) => {
    return selectedColumn && format(selectedColumn, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  };

  const isWeekEnd = (date) => {
    return isWeekend(date);
  };

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredDepartments = departments.map(dept => ({
    ...dept,
    employees: dept.employees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(dept => dept.employees.length > 0);

  useEffect(() => {
    const daysRow = daysRowRef.current;
    const attendanceRows = attendanceRowsRef.current;

    const handleScroll = (e) => {
      if (e.target === daysRow) {
        attendanceRows.forEach(row => {
          if (row) row.scrollLeft = daysRow.scrollLeft;
        });
      } else {
        const scrollLeft = e.target.scrollLeft;
        daysRow.scrollLeft = scrollLeft;
        attendanceRows.forEach(row => {
          if (row && row !== e.target) row.scrollLeft = scrollLeft;
        });
      }
    };

    daysRow?.addEventListener('scroll', handleScroll);
    attendanceRows.forEach(row => {
      row?.addEventListener('scroll', handleScroll);
    });

    return () => {
      daysRow?.removeEventListener('scroll', handleScroll);
      attendanceRows.forEach(row => {
        row?.removeEventListener('scroll', handleScroll);
      });
    };
  }, []);

  return (
    <div className="attendance-container">
      {/* Main calendar grid */}
      <div className="main-grid">
        {/* Calendar controls */}
        <div className="calendar-controls">
          <div className="date-range">
            {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
          </div>
          <div className="controls-right">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="navigation-container">
              <div className="year-nav">
                <button onClick={handlePrevMonth}>&lt;</button>
                <span>{format(currentDate, 'yyyy')}</span>
                <button onClick={handleNextMonth}>&gt;</button>
              </div>
              <div className="month-buttons">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthDate = new Date(currentDate.getFullYear(), i);
                  return (
                    <button
                      key={i}
                      className={`month-btn ${i === currentDate.getMonth() ? 'active' : ''}`}
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), i))}
                    >
                      {format(monthDate, 'MMM')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Days header */}
        <div className="days-header">
          <div className="employee-column-header">
            Employees
          </div>
          <div className="days-row" ref={daysRowRef}>
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`day-header ${isColumnSelected(day) ? 'selected' : ''} ${isWeekEnd(day) ? 'week-end' : ''}`}
                onClick={() => handleColumnClick(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                <div className="day-name">{format(day, 'EEE')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Departments and employees */}
        <div className="departments-container">
          {filteredDepartments.map((dept, deptIndex) => (
            <div key={deptIndex} className="department-section">
              <div className="department-header">
                {dept.name}
              </div>
              {dept.employees.map((emp, empIndex) => (
                <div key={empIndex} className="employee-attendance-row">
                  <div className="employee-info-cell">
                    <img src={emp.avatar} alt={emp.name} className="employee-avatar" />
                    <div className="employee-info">
                      <div className="employee-name">{emp.name}</div>
                      <div className="employee-title">{emp.title}</div>
                    </div>
                  </div>
                  <div 
                    className="attendance-cells" 
                    ref={el => {
                      if (el) {
                        attendanceRowsRef.current[deptIndex * dept.employees.length + empIndex] = el;
                      }
                    }}
                  >
                    {calendarDays.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`status-cell status-${getAttendanceStatus(emp.id, day)} ${isToday(day) ? 'today' : ''} ${isColumnSelected(day) ? 'selected' : ''} ${isWeekEnd(day) ? 'week-end' : ''}`}
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

      {/* Working time popup */}
      {selectedEmployee && selectedDate && (
        <div className="working-time-popup" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <h4>{selectedEmployee.name} - {format(selectedDate, 'MMM d, yyyy')}</h4>
          <div className="working-time-entry">
            <span className="working-time-label">Check-in:</span>
            <span className="working-time-value">9:00 AM</span>
          </div>
          <div className="working-time-entry">
            <span className="working-time-label">Check-out:</span>
            <span className="working-time-value">6:00 PM</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceView; 