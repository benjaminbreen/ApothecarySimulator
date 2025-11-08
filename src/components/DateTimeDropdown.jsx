import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import InteractiveClock from './InteractiveClock';
import { isSafari } from '../utils/browserDetection';
import { safeLocalStorage } from '../utils/safeLocalStorage';

const DateTimeDropdown = ({
  time = '8:00 AM',
  date = 'August 22, 1680',
  weather = {
    condition: 'Clear',
    temperature: '72°F',
    humidity: '45%',
    wind: 'Light breeze'
  },
  // Condensed stats props (shown when CharacterCard is collapsed)
  showCondensedStats = false,
  health = 85,
  energy = 62,
  wealth = 11,
  // Time control props
  onTimeChange = null // Callback when time is changed via clock
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mainView, setMainView] = useState('calendar'); // 'calendar' | 'clock'
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'year'
  const [viewedMonth, setViewedMonth] = useState(null); // { month, year } for calendar navigation
  const [selectedDate, setSelectedDate] = useState(null); // Currently viewed date
  const [notes, setNotes] = useState(() => {
    // Load notes from localStorage
    const saved = safeLocalStorage.getItem('apothecary_calendar_notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentNote, setCurrentNote] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const noteInputRef = useRef(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Safari performance optimization
  const isSafariBrowser = isSafari();

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
        safeLocalStorage.setItem('apothecary_calendar_notes', JSON.stringify(updated));
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
    <div className="relative flex items-center gap-3">
      {/* Button - Safari: no backdrop-blur */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 ${isSafariBrowser ? '' : 'backdrop-blur-sm'} border border-parchment-300 dark:border-slate-600 shadow-sm dark:shadow-dark-elevation-1 transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}
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

      {/* Condensed Stats (shown when CharacterCard is collapsed) - Safari: no backdrop-blur */}
      {showCondensedStats && (
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 ${isSafariBrowser ? '' : 'backdrop-blur-sm'} border border-parchment-300 dark:border-slate-600 shadow-sm dark:shadow-dark-elevation-1`}>
          {/* Health */}
          <div className="flex items-center gap-1.5">
            <span className="text-base" title="Health">❤️</span>
            <span className="text-sm font-semibold font-sans text-success-700 dark:text-success-400 transition-colors duration-300">{health}</span>
          </div>

          <div className="w-px h-4 bg-parchment-300 dark:bg-slate-600"></div>

          {/* Energy */}
          <div className="flex items-center gap-1.5">
            <span className="text-base" title="Energy">⚡</span>
            <span className="text-sm font-semibold font-sans text-potion-700 dark:text-potion-400 transition-colors duration-300">{energy}</span>
          </div>

          <div className="w-px h-4 bg-parchment-300 dark:bg-slate-600"></div>

          {/* Wealth */}
          <div className="flex items-center gap-1.5">
            <span className="text-base" title="Reales">💰</span>
            <span className="text-sm font-semibold font-sans text-warning-700 dark:text-warning-400 transition-colors duration-300">{wealth}</span>
          </div>
        </div>
      )}

      {/* Dropdown Panel - Rendered via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={`fixed rounded-xl shadow-elevation-3 dark:shadow-dark-elevation-3 border border-parchment-300 dark:border-slate-600 overflow-hidden z-[9999] animate-fade-in ${
            mainView === 'clock' ? 'w-[600px] max-h-[700px]' : 'w-[900px] max-h-[650px]'
          }`}
          style={{
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
            background: isDark
              ? 'rgba(30, 41, 59, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
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

          {/* Main View Toggle */}
          <div className="flex items-center justify-center gap-2 p-3 border-b border-parchment-200 dark:border-slate-600">
            <button
              onClick={() => setMainView('calendar')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                mainView === 'calendar'
                  ? 'bg-emerald-500 dark:bg-amber-500 text-white dark:text-slate-900 shadow-md'
                  : 'bg-white/60 dark:bg-slate-800/60 text-ink-600 dark:text-parchment-300 hover:bg-emerald-50 dark:hover:bg-amber-900/20 border border-parchment-300 dark:border-slate-600'
              }`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setMainView('clock')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                mainView === 'clock'
                  ? 'bg-emerald-500 dark:bg-amber-500 text-white dark:text-slate-900 shadow-md'
                  : 'bg-white/60 dark:bg-slate-800/60 text-ink-600 dark:text-parchment-300 hover:bg-emerald-50 dark:hover:bg-amber-900/20 border border-parchment-300 dark:border-slate-600'
              }`}
            >
              🕐 Change Time
            </button>
          </div>

          {/* Calendar Section */}
          {mainView === 'calendar' && (
            <div className="flex gap-6 p-6 border-b border-parchment-200 dark:border-slate-600">
              {/* Day View - Left Column */}
              <div className="flex-shrink-0 w-64 space-y-4">
                {/* Large Date Display */}
                <div className="text-center bg-gradient-to-br from-parchment-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border-2 border-parchment-300 dark:border-amber-600/30 shadow-lg">
                  <div className="font-display text-6xl font-bold text-ink-900 dark:text-amber-400 transition-colors duration-300 mb-2">
                    {selectedDateInfo.day}
                  </div>
                  <div className="font-serif text-base italic text-ink-600 dark:text-parchment-300 transition-colors duration-300 mb-1">
                    {getDayName(selectedDateInfo.day, selectedDateInfo.month, selectedDateInfo.year)}
                  </div>
                  <div className="font-serif text-lg font-semibold text-ink-700 dark:text-parchment-200 transition-colors duration-300">
                    {getMonthName(selectedDateInfo.month)} {selectedDateInfo.year}
                  </div>
                </div>

                {/* Historical Event for Selected Date */}
                {(() => {
                  const event = getEventForDate(selectedDateInfo.year, selectedDateInfo.month, selectedDateInfo.day);
                  return event ? (
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700/40 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{event.type === 'holiday' ? '⛪' : '📜'}</span>
                        <span className="font-serif font-bold text-sm text-amber-900 dark:text-amber-300">
                          {event.name}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-amber-800 dark:text-amber-200 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* Notes Textarea */}
                <div>
                  <label className="block text-sm font-sans font-bold text-ink-700 dark:text-parchment-300 mb-2">
                    📝 Notes for this Day
                  </label>
                  <textarea
                    ref={noteInputRef}
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Write your notes here..."
                    className="w-full h-32 px-3 py-2 text-sm font-sans rounded-lg border-2 border-parchment-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-ink-800 dark:text-parchment-200 placeholder-ink-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-amber-500 focus:border-emerald-500 dark:focus:border-amber-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Calendar View - Right Column */}
              <div className="flex-1 space-y-3">
              {/* View Toggle Buttons */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`text-sm px-4 py-2 rounded-lg font-semibold font-sans border-2 transition-all duration-300 ${
                      calendarView === 'month'
                        ? 'bg-emerald-500 dark:bg-amber-500 text-white dark:text-slate-900 border-emerald-600 dark:border-amber-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-ink-600 dark:text-parchment-300 border-parchment-300 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-amber-900/20 hover:border-emerald-300 dark:hover:border-amber-700'
                    }`}
                  >
                    📅 Month
                  </button>
                  <button
                    onClick={() => setCalendarView('week')}
                    className={`text-sm px-4 py-2 rounded-lg font-semibold font-sans border-2 transition-all duration-300 ${
                      calendarView === 'week'
                        ? 'bg-emerald-500 dark:bg-amber-500 text-white dark:text-slate-900 border-emerald-600 dark:border-amber-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-ink-600 dark:text-parchment-300 border-parchment-300 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-amber-900/20 hover:border-emerald-300 dark:hover:border-amber-700'
                    }`}
                  >
                    📆 Week
                  </button>
                  <button
                    onClick={() => setCalendarView('year')}
                    className={`text-sm px-4 py-2 rounded-lg font-semibold font-sans border-2 transition-all duration-300 ${
                      calendarView === 'year'
                        ? 'bg-emerald-500 dark:bg-amber-500 text-white dark:text-slate-900 border-emerald-600 dark:border-amber-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-ink-600 dark:text-parchment-300 border-parchment-300 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-amber-900/20 hover:border-emerald-300 dark:hover:border-amber-700'
                    }`}
                  >
                    🗓️ Year
                  </button>
                </div>

                {/* Navigation Arrows */}
                {calendarView !== 'week' && viewedMonth && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => calendarView === 'year' ? navigateYear(-1) : navigateMonth(-1)}
                      className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-amber-900/30 transition-all border border-transparent hover:border-emerald-300 dark:hover:border-amber-700"
                      aria-label="Previous"
                    >
                      <svg className="w-5 h-5 text-ink-700 dark:text-parchment-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-base font-serif font-bold text-ink-800 dark:text-amber-400 min-w-[160px] text-center">
                      {calendarView === 'year' ? viewedMonth.year : `${getMonthName(viewedMonth.month)} ${viewedMonth.year}`}
                    </span>
                    <button
                      onClick={() => calendarView === 'year' ? navigateYear(1) : navigateMonth(1)}
                      className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-amber-900/30 transition-all border border-transparent hover:border-emerald-300 dark:hover:border-amber-700"
                      aria-label="Next"
                    >
                      <svg className="w-5 h-5 text-ink-700 dark:text-parchment-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Calendar Grid */}
              <div className="bg-gradient-to-br from-white/80 to-parchment-50/80 dark:from-slate-800/80 dark:to-slate-900/80 rounded-xl p-4 border-2 border-parchment-200 dark:border-slate-600 shadow-inner">
                {calendarView === 'month' && (
                  <div>
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                        <div key={day} className="text-center text-xs font-sans font-bold text-ink-600 dark:text-amber-400 uppercase tracking-wider py-2">
                          {day.slice(0, 3)}
                        </div>
                      ))}
                    </div>
                    {/* Date Grid */}
                    {generateMonthCalendar().map((week, weekIdx) => (
                      <div key={weekIdx} className="grid grid-cols-7 gap-2 mb-2">
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
                              className={`aspect-square flex flex-col items-center justify-center text-base font-sans rounded-xl transition-all duration-200 p-2 relative shadow-sm hover:shadow-md ${
                                !day
                                  ? 'invisible'
                                  : isCurrentDate(day)
                                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-amber-500 dark:to-amber-600 text-white font-bold ring-4 ring-emerald-300 dark:ring-amber-300 scale-105 shadow-lg'
                                  : isSelectedDateDay(day)
                                  ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-amber-900/50 dark:to-amber-900/30 text-emerald-900 dark:text-amber-300 font-bold border-3 border-emerald-500 dark:border-amber-500 scale-102'
                                  : event
                                  ? 'bg-white dark:bg-slate-700 text-ink-800 dark:text-parchment-200 hover:bg-emerald-50 dark:hover:bg-slate-600 font-semibold ring-2 ring-inset hover:ring-emerald-300 dark:hover:ring-amber-500 ' +
                                    (event.color === 'gold' ? 'ring-amber-400/60' :
                                     event.color === 'purple' ? 'ring-purple-400/60' :
                                     event.color === 'red' ? 'ring-red-400/60' : 'ring-blue-400/60')
                                  : 'bg-white dark:bg-slate-700/50 text-ink-700 dark:text-parchment-300 hover:bg-emerald-50 dark:hover:bg-slate-600 hover:scale-105 font-medium'
                              }`}
                            >
                              <span className={`${event ? 'font-bold' : ''} text-sm`}>{day}</span>
                              {event && (
                                <div className="absolute top-1 right-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    event.color === 'gold' ? 'bg-amber-500' :
                                    event.color === 'purple' ? 'bg-purple-500' :
                                    event.color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                                  }`} />
                                </div>
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
          )}

          {/* Clock Section */}
          {mainView === 'clock' && (
            <div className="p-4 border-b border-parchment-200 dark:border-slate-600 overflow-y-auto max-h-[600px]">
              <InteractiveClock
                currentTime={time}
                onTimeChange={(newTime) => {
                  console.log('[DateTimeDropdown] onTimeChange callback called with:', newTime);
                  console.log('[DateTimeDropdown] onTimeChange prop:', onTimeChange);
                  if (onTimeChange) {
                    console.log('[DateTimeDropdown] Calling parent onTimeChange');
                    onTimeChange(newTime);
                    setIsOpen(false); // Close dropdown after setting time
                  } else {
                    console.error('[DateTimeDropdown] onTimeChange prop is not defined!');
                  }
                }}
                onClose={() => {
                  setMainView('calendar'); // Return to calendar view
                }}
              />
            </div>
          )}

          {/* Weather Section - Only show in calendar mode */}
          {mainView === 'calendar' && (
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
          )}
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

// Memoize to prevent unnecessary re-renders (ALL BROWSERS performance optimization)
export default React.memo(DateTimeDropdown);
