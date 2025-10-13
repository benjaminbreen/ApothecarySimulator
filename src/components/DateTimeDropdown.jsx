import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

const DateTimeDropdown = ({
  time = '8:00 AM',
  date = 'August 22, 1680',
  weather = {
    condition: 'Clear',
    temperature: '72°F',
    humidity: '45%',
    wind: 'Light breeze'
  }
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'year'
  const [viewedMonth, setViewedMonth] = useState(null); // { month, year } for calendar navigation
  const [selectedDate, setSelectedDate] = useState(null); // Currently viewed date
  const [notes, setNotes] = useState(() => {
    // Load notes from localStorage
    const saved = localStorage.getItem('apothecary_calendar_notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentNote, setCurrentNote] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const noteInputRef = useRef(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Historical events database for 1680 New Spain
  const historicalEvents = useMemo(() => ({
    // June 1680
    '1680-06-03': { type: 'holiday', name: 'Corpus Christi', description: 'Major Catholic feast celebrating the Eucharist. Elaborate processions through Mexico City with the Blessed Sacrament, clergy in ornate vestments, and decorated streets.', color: 'purple' },
    '1680-06-13': { type: 'holiday', name: 'St. Anthony of Padua', description: 'Feast day of St. Anthony, patron saint of lost items and the poor. Popular devotion in New Spain.', color: 'blue' },
    '1680-06-24': { type: 'holiday', name: 'St. John the Baptist', description: 'Major feast day with bonfires, water rituals, and festivities throughout New Spain. Traditional celebration combining Catholic and indigenous customs.', color: 'purple' },
    '1680-06-29': { type: 'holiday', name: 'Sts. Peter & Paul', description: 'Feast of the apostles Peter and Paul. Important holy day with Mass obligations.', color: 'blue' },

    // July 1680
    '1680-07-16': { type: 'holiday', name: 'Our Lady of Mount Carmel', description: 'Feast of the Virgin Mary under the title of Our Lady of Mount Carmel. Carmelite confraternities hold special devotions.', color: 'blue' },
    '1680-07-25': { type: 'holiday', name: 'Santiago (St. James)', description: 'Feast of St. James the Greater, patron saint of Spain. Massive celebrations, bullfights, and processions in Mexico City. One of the most important Spanish feast days.', color: 'gold' },
    '1680-07-26': { type: 'holiday', name: 'St. Anne', description: 'Feast of St. Anne, mother of the Virgin Mary. Popular devotion, especially among women and mothers.', color: 'blue' },

    // August 1680
    '1680-08-06': { type: 'holiday', name: 'Transfiguration', description: 'Feast of the Transfiguration of Jesus. Important feast with special Mass.', color: 'blue' },
    '1680-08-10': { type: 'historical', name: 'Pueblo Revolt Begins', description: 'The Pueblo Revolt erupts in New Mexico as indigenous Puebloans rise against Spanish colonial rule. Led by Popé, they besiege Santa Fe. News will reach Mexico City in coming weeks, causing alarm among colonial authorities.', color: 'red' },
    '1680-08-11': { type: 'historical', name: 'Pueblo Revolt', description: 'Second day of Pueblo Revolt in New Mexico. Spanish settlers and missionaries flee or are killed.', color: 'red' },
    '1680-08-12': { type: 'historical', name: 'Pueblo Revolt', description: 'Third day of Pueblo Revolt. Santa Fe remains under siege.', color: 'red' },
    '1680-08-13': { type: 'historical', name: 'Pueblo Revolt', description: 'Fourth day of Pueblo Revolt in New Mexico.', color: 'red' },
    '1680-08-14': { type: 'historical', name: 'Pueblo Revolt', description: 'Fifth day of Pueblo Revolt. Spanish forces begin retreat from Santa Fe.', color: 'red' },
    '1680-08-15': { type: 'holiday', name: 'Assumption of Mary', description: 'Major feast celebrating the Assumption of the Virgin Mary into Heaven. Solemn High Mass at the Cathedral, processions, and a holy day of obligation throughout New Spain.', color: 'gold' },
    '1680-08-21': { type: 'historical', name: 'Spanish Retreat Complete', description: 'Spanish colonists complete their retreat from New Mexico to El Paso del Norte, abandoning the province to Pueblo control for the first time in 80 years.', color: 'red' },
    '1680-08-24': { type: 'holiday', name: 'St. Bartholomew', description: 'Feast of St. Bartholomew the Apostle. Special devotions and Mass.', color: 'blue' },
    '1680-08-28': { type: 'holiday', name: 'St. Augustine', description: 'Feast of St. Augustine of Hippo, great Church Father and theologian. Celebrated especially by Augustinian friars in their monasteries.', color: 'blue' },
    '1680-08-30': { type: 'holiday', name: 'St. Rose of Lima', description: 'Feast of St. Rose of Lima, first saint of the Americas. Particularly important in New Spain as a homegrown American saint.', color: 'gold' },
  }), []);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + 8, // 8px gap below button
        left: rect.left
      });
    }
  }, [isOpen]);

  // Get event for a specific date
  const getEventForDate = (year, month, day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return historicalEvents[dateKey] || null;
  };

  // Parse game date (format: "August 22, 1680")
  const parseGameDate = (dateString) => {
    const parts = dateString.split(', ');
    const [monthStr, dayStr] = parts[0].split(' ');
    const year = parts[1];

    const monthMap = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3,
      'May': 4, 'June': 5, 'July': 6, 'August': 7,
      'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    return {
      day: parseInt(dayStr),
      month: monthMap[monthStr],
      year: parseInt(year),
      monthName: monthStr
    };
  };

  const gameDate = useMemo(() => parseGameDate(date), [date]);

  // Initialize viewed month and selected date
  useEffect(() => {
    if (!viewedMonth) {
      setViewedMonth({ month: gameDate.month, year: gameDate.year });
    }
    if (!selectedDate) {
      const dateKey = `${gameDate.year}-${String(gameDate.month + 1).padStart(2, '0')}-${String(gameDate.day).padStart(2, '0')}`;
      setSelectedDate(dateKey);
      setCurrentNote(notes[dateKey] || '');
    }
  }, [gameDate, viewedMonth, selectedDate, notes]);

  // Save notes to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedDate && currentNote !== (notes[selectedDate] || '')) {
        const updated = { ...notes, [selectedDate]: currentNote };
        setNotes(updated);
        localStorage.setItem('apothecary_calendar_notes', JSON.stringify(updated));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentNote, selectedDate, notes]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen &&
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Get month name from number
  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum];
  };

  // Get day name
  const getDayName = (day, month, year) => {
    // Simplified day calculation (not historically accurate, but functional)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(year, month, day);
    return days[date.getDay()];
  };

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar grid for month view
  const generateMonthCalendar = () => {
    if (!viewedMonth) return [];

    const { month, year } = viewedMonth;
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);

    const calendar = [];
    let week = new Array(7).fill(null);

    // Fill in days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayIndex = (firstDay + day - 1) % 7;
      week[dayIndex] = day;

      if (dayIndex === 6 || day === daysInMonth) {
        calendar.push(week);
        week = new Array(7).fill(null);
      }
    }

    return calendar;
  };

  // Generate week view (7 days around current date)
  const generateWeekCalendar = () => {
    if (!viewedMonth) return [];

    const { month, year } = viewedMonth;
    const daysInMonth = getDaysInMonth(month, year);
    const currentDay = gameDate.day;

    const week = [];
    for (let offset = -3; offset <= 3; offset++) {
      const day = currentDay + offset;
      if (day >= 1 && day <= daysInMonth) {
        week.push(day);
      } else {
        week.push(null);
      }
    }

    return [week]; // Return as array of one week
  };

  // Generate year view (12 months)
  const generateYearCalendar = () => {
    if (!viewedMonth) return [];

    const months = [];
    for (let m = 0; m < 12; m++) {
      months.push({
        month: m,
        name: getMonthName(m),
        isCurrentMonth: m === gameDate.month
      });
    }

    return months;
  };

  // Handle date selection
  const handleDateClick = (day) => {
    if (!viewedMonth || !day) return;

    const dateKey = `${viewedMonth.year}-${String(viewedMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateKey);
    setCurrentNote(notes[dateKey] || '');
  };

  // Handle month change
  const navigateMonth = (direction) => {
    if (!viewedMonth) return;

    let { month, year } = viewedMonth;
    month += direction;

    if (month < 0) {
      month = 11;
      year--;
    } else if (month > 11) {
      month = 0;
      year++;
    }

    setViewedMonth({ month, year });
  };

  // Handle year change
  const navigateYear = (direction) => {
    if (!viewedMonth) return;
    setViewedMonth({ ...viewedMonth, year: viewedMonth.year + direction });
  };

  // Check if date is current game date
  const isCurrentDate = (day) => {
    if (!viewedMonth || !day) return false;
    return day === gameDate.day &&
           viewedMonth.month === gameDate.month &&
           viewedMonth.year === gameDate.year;
  };

  // Check if date is selected
  const isSelectedDateDay = (day) => {
    if (!viewedMonth || !day || !selectedDate) return false;
    const dateKey = `${viewedMonth.year}-${String(viewedMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateKey === selectedDate;
  };

  // Get selected date info
  const getSelectedDateInfo = () => {
    if (!selectedDate) return { day: gameDate.day, month: gameDate.month, year: gameDate.year };

    const parts = selectedDate.split('-');
    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]) - 1,
      day: parseInt(parts[2])
    };
  };

  const selectedDateInfo = getSelectedDateInfo();
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="relative">
      {/* Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-parchment-300 dark:border-slate-600 shadow-sm dark:shadow-dark-elevation-1 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
      >
        <svg className="w-4 h-4 text-brass-600 dark:text-amber-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-ink-800 dark:text-parchment-200 font-sans font-medium transition-colors duration-300">{date}, {time}</span>
        <svg
          className={`w-3 h-3 text-ink-600 dark:text-parchment-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel - Rendered via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-[600px] max-h-[400px] rounded-xl shadow-elevation-3 dark:shadow-dark-elevation-3 border border-parchment-300 dark:border-slate-600 overflow-hidden z-[9999] animate-fade-in"
          style={{
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
            background: isDark
              ? 'rgba(30, 41, 59, 0.92)'
              : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            animation: 'slideDown 300ms ease-out',
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 w-6 h-6 rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-center z-10"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Calendar Section */}
          <div className="flex gap-4 p-4 border-b border-parchment-200 dark:border-slate-600">
            {/* Day View - Left Column */}
            <div className="flex-shrink-0 w-48 space-y-3">
              {/* Large Date Display */}
              <div className="text-center">
                <div className="font-display text-4xl font-bold text-ink-900 dark:text-amber-400 transition-colors duration-300">
                  {selectedDateInfo.day}
                </div>
                <div className="font-serif text-sm italic text-ink-600 dark:text-parchment-300 transition-colors duration-300">
                  {getDayName(selectedDateInfo.day, selectedDateInfo.month, selectedDateInfo.year)}
                </div>
                <div className="font-serif text-sm text-ink-600 dark:text-parchment-300 transition-colors duration-300">
                  {getMonthName(selectedDateInfo.month)} {selectedDateInfo.year}
                </div>
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-xs font-sans font-semibold text-ink-700 dark:text-parchment-300 uppercase tracking-wide mb-1.5">
                  Notes
                </label>
                <textarea
                  ref={noteInputRef}
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Add notes for this day..."
                  className="w-full h-20 px-2 py-1.5 text-xs font-sans rounded-lg border border-parchment-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-ink-800 dark:text-parchment-200 placeholder-ink-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-amber-500 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Calendar View - Right Column */}
            <div className="flex-1 space-y-2">
              {/* View Toggle Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-semibold font-sans border transition-colors duration-300 ${
                      calendarView === 'month'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                        : 'bg-white dark:bg-slate-800 text-ink-600 dark:text-parchment-300 border-parchment-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarView('week')}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-semibold font-sans border transition-colors duration-300 ${
                      calendarView === 'week'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                        : 'bg-white dark:bg-slate-800 text-ink-600 dark:text-parchment-300 border-parchment-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCalendarView('year')}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-semibold font-sans border transition-colors duration-300 ${
                      calendarView === 'year'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                        : 'bg-white dark:bg-slate-800 text-ink-600 dark:text-parchment-300 border-parchment-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    Year
                  </button>
                </div>

                {/* Navigation Arrows */}
                {calendarView !== 'week' && viewedMonth && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => calendarView === 'year' ? navigateYear(-1) : navigateMonth(-1)}
                      className="p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors"
                      aria-label="Previous"
                    >
                      <svg className="w-4 h-4 text-ink-600 dark:text-parchment-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs font-sans font-semibold text-ink-700 dark:text-parchment-300 min-w-[100px] text-center">
                      {calendarView === 'year' ? viewedMonth.year : `${getMonthName(viewedMonth.month)} ${viewedMonth.year}`}
                    </span>
                    <button
                      onClick={() => calendarView === 'year' ? navigateYear(1) : navigateMonth(1)}
                      className="p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors"
                      aria-label="Next"
                    >
                      <svg className="w-4 h-4 text-ink-600 dark:text-parchment-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Calendar Grid */}
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 border border-parchment-200 dark:border-slate-600">
                {calendarView === 'month' && (
                  <div>
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-center text-[10px] font-sans font-bold text-ink-500 dark:text-parchment-400 uppercase">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Date Grid */}
                    {generateMonthCalendar().map((week, weekIdx) => (
                      <div key={weekIdx} className="grid grid-cols-7 gap-1">
                        {week.map((day, dayIdx) => {
                          const event = day && viewedMonth ? getEventForDate(viewedMonth.year, viewedMonth.month, day) : null;
                          return (
                            <button
                              key={dayIdx}
                              onClick={() => handleDateClick(day)}
                              onMouseEnter={(e) => {
                                if (event) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                                  setHoveredEvent(event);
                                }
                              }}
                              onMouseLeave={() => setHoveredEvent(null)}
                              disabled={!day}
                              className={`aspect-square flex flex-col items-center justify-center text-xs font-sans rounded-md transition-all duration-200 p-0.5 relative ${
                                !day
                                  ? 'invisible'
                                  : isCurrentDate(day)
                                  ? 'bg-emerald-500 dark:bg-amber-500 text-white font-bold ring-2 ring-emerald-600 dark:ring-amber-600'
                                  : isSelectedDateDay(day)
                                  ? 'bg-emerald-100 dark:bg-amber-900/40 text-emerald-900 dark:text-amber-300 font-semibold border-2 border-emerald-400 dark:border-amber-600'
                                  : event
                                  ? 'bg-white dark:bg-slate-700 text-ink-700 dark:text-parchment-300 hover:bg-emerald-50 dark:hover:bg-slate-600 ring-1 ring-inset ' +
                                    (event.color === 'gold' ? 'ring-amber-400/40' :
                                     event.color === 'purple' ? 'ring-purple-400/40' :
                                     event.color === 'red' ? 'ring-red-400/40' : 'ring-blue-400/40')
                                  : 'bg-white dark:bg-slate-700 text-ink-700 dark:text-parchment-300 hover:bg-emerald-50 dark:hover:bg-slate-600'
                              }`}
                            >
                              <span className={event ? 'font-semibold' : ''}>{day}</span>
                              {event && (
                                <span
                                  className="text-[7px] leading-tight text-gray-500 dark:text-gray-400 font-sans mt-0.5 line-clamp-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                  style={{
                                    color: event.color === 'gold' ? '#d97706' :
                                           event.color === 'purple' ? '#9333ea' :
                                           event.color === 'red' ? '#dc2626' : '#3b82f6'
                                  }}
                                >
                                  {event.name}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {calendarView === 'week' && (
                  <div className="grid grid-cols-7 gap-2">
                    {generateWeekCalendar()[0].map((day, idx) => {
                      const event = day && viewedMonth ? getEventForDate(viewedMonth.year, viewedMonth.month, day) : null;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleDateClick(day)}
                          onMouseEnter={(e) => {
                            if (event) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                              setHoveredEvent(event);
                            }
                          }}
                          onMouseLeave={() => setHoveredEvent(null)}
                          disabled={!day}
                          className={`aspect-square flex flex-col items-center justify-center text-sm font-sans rounded-lg transition-all duration-200 p-1 ${
                            !day
                              ? 'invisible'
                              : isCurrentDate(day)
                              ? 'bg-emerald-500 dark:bg-amber-500 text-white font-bold ring-2 ring-emerald-600 dark:ring-amber-600'
                              : isSelectedDateDay(day)
                              ? 'bg-emerald-100 dark:bg-amber-900/40 text-emerald-900 dark:text-amber-300 font-semibold border-2 border-emerald-400 dark:border-amber-600'
                              : event
                              ? 'bg-white dark:bg-slate-700 text-ink-700 dark:text-parchment-300 hover:bg-emerald-50 dark:hover:bg-slate-600 ring-1 ring-inset ' +
                                (event.color === 'gold' ? 'ring-amber-400/40' :
                                 event.color === 'purple' ? 'ring-purple-400/40' :
                                 event.color === 'red' ? 'ring-red-400/40' : 'ring-blue-400/40')
                              : 'bg-white dark:bg-slate-700 text-ink-700 dark:text-parchment-300 hover:bg-emerald-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          <span className={event ? 'font-semibold' : ''}>{day}</span>
                          {event && (
                            <span
                              className="text-[8px] leading-tight font-sans mt-0.5 line-clamp-1"
                              style={{
                                color: event.color === 'gold' ? '#d97706' :
                                       event.color === 'purple' ? '#9333ea' :
                                       event.color === 'red' ? '#dc2626' : '#3b82f6'
                              }}
                            >
                              {event.name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {calendarView === 'year' && (
                  <div className="grid grid-cols-3 gap-2">
                    {generateYearCalendar().map((monthInfo) => (
                      <button
                        key={monthInfo.month}
                        onClick={() => {
                          setViewedMonth({ month: monthInfo.month, year: viewedMonth.year });
                          setCalendarView('month');
                        }}
                        className={`px-2 py-3 text-xs font-sans rounded-lg transition-all duration-200 ${
                          monthInfo.isCurrentMonth
                            ? 'bg-emerald-500 dark:bg-amber-500 text-white font-bold'
                            : 'bg-white dark:bg-slate-700 text-ink-700 dark:text-parchment-300 hover:bg-emerald-50 dark:hover:bg-slate-600'
                        }`}
                      >
                        {monthInfo.name.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weather Section */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-parchment-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
            <div className="flex items-center justify-center gap-4 text-xs font-sans text-ink-700 dark:text-parchment-300">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-potion-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="font-medium">{weather.condition}</span>
              </div>
              <div className="w-px h-3 bg-ink-300 dark:bg-slate-600"></div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-danger-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">{weather.temperature}</span>
              </div>
              <div className="w-px h-3 bg-ink-300 dark:bg-slate-600"></div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-potion-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.586V5L7 4z" />
                </svg>
                <span className="font-medium">{weather.humidity}</span>
              </div>
              <div className="w-px h-3 bg-ink-300 dark:bg-slate-600"></div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-botanical-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="font-medium">{weather.wind}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Event Tooltip - Rendered via Portal */}
      {hoveredEvent && createPortal(
        <div
          className="fixed z-[10000] pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="px-3 py-2 rounded-lg shadow-lg max-w-xs animate-fade-in"
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.5)'}`,
            }}
          >
            {/* Event Type Badge */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: hoveredEvent.color === 'gold' ? '#fef3c7' :
                                   hoveredEvent.color === 'purple' ? '#f3e8ff' :
                                   hoveredEvent.color === 'red' ? '#fee2e2' : '#dbeafe',
                  color: hoveredEvent.color === 'gold' ? '#92400e' :
                         hoveredEvent.color === 'purple' ? '#6b21a8' :
                         hoveredEvent.color === 'red' ? '#991b1b' : '#1e40af',
                }}
              >
                {hoveredEvent.type === 'holiday' ? '⛪ Holiday' : '📜 Historical Event'}
              </span>
            </div>
            {/* Event Title */}
            <div className="font-serif font-bold text-sm mb-1 text-ink-900 dark:text-parchment-100">
              {hoveredEvent.name}
            </div>
            {/* Event Description */}
            <div className="font-sans text-xs leading-relaxed text-ink-700 dark:text-parchment-300">
              {hoveredEvent.description}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DateTimeDropdown;
