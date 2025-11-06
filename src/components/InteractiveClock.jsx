/**
 * InteractiveClock.jsx - Interactive analog clock for time control
 *
 * Allows player to click and set the time by dragging clock hands
 * Triggers narration agent with "wait until [time]" when time is changed
 */

import React, { useState, useRef, useEffect } from 'react';

const InteractiveClock = ({
  currentTime = '8:00 AM',
  onTimeChange,
  onClose
}) => {
  // Parse current time
  const parseTime = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return { hours: 8, minutes: 0 };

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  };

  const formatTime = (hours, minutes) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const initialTime = parseTime(currentTime);
  const [selectedHours, setSelectedHours] = useState(initialTime.hours);
  const [selectedMinutes, setSelectedMinutes] = useState(initialTime.minutes);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'hours' or 'minutes'
  const clockRef = useRef(null);

  // Calculate hand angles
  const getHourAngle = (hours, minutes) => {
    return ((hours % 12) * 30) + (minutes * 0.5); // 30° per hour + 0.5° per minute
  };

  const getMinuteAngle = (minutes) => {
    return minutes * 6; // 6° per minute
  };

  // Convert mouse position to angle
  const getAngleFromMouse = (e) => {
    if (!clockRef.current) return 0;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; // Adjust so 0° is at top

    return angle;
  };

  // Handle mouse down on clock face
  const handleMouseDown = (e, mode) => {
    e.preventDefault();
    setIsDragging(true);
    setDragMode(mode);
    updateTimeFromMouse(e, mode);
  };

  // Update time based on mouse position
  const updateTimeFromMouse = (e, mode) => {
    const angle = getAngleFromMouse(e);

    if (mode === 'hours') {
      // Convert angle to hour (0-23)
      let hour = Math.round(angle / 30);
      if (hour === 0) hour = 12;

      // Preserve AM/PM from current selection
      const isPM = selectedHours >= 12;
      if (hour === 12) {
        hour = isPM ? 12 : 0;
      } else {
        hour = isPM ? hour + 12 : hour;
      }

      setSelectedHours(hour);
    } else if (mode === 'minutes') {
      // Convert angle to minutes (0-59)
      const minutes = Math.round(angle / 6) % 60;
      setSelectedMinutes(minutes);
    }
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && dragMode) {
        updateTimeFromMouse(e, dragMode);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragMode, selectedHours, selectedMinutes]);

  // Handle click on clock face (quick set)
  const handleClockClick = (e) => {
    if (isDragging) return;

    const angle = getAngleFromMouse(e);
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const distance = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2));
    const radius = Math.min(centerX, centerY) * 0.8;

    // Determine if click is closer to hour hand or minute hand position
    const hourAngle = getHourAngle(selectedHours, selectedMinutes);
    const minuteAngle = getMinuteAngle(selectedMinutes);

    const angleDiffHour = Math.min(Math.abs(angle - hourAngle), 360 - Math.abs(angle - hourAngle));
    const angleDiffMinute = Math.min(Math.abs(angle - minuteAngle), 360 - Math.abs(angle - minuteAngle));

    // If click is in outer ring, set minutes; if inner, set hours
    if (distance > radius * 0.6) {
      updateTimeFromMouse(e, 'minutes');
    } else {
      updateTimeFromMouse(e, 'hours');
    }
  };

  // Toggle AM/PM
  const toggleAMPM = () => {
    setSelectedHours(prev => {
      if (prev < 12) return prev + 12;
      return prev - 12;
    });
  };

  // Apply time change
  const handleApply = () => {
    const newTime = formatTime(selectedHours, selectedMinutes);
    console.log('[InteractiveClock] handleApply called:', { newTime, selectedHours, selectedMinutes });
    console.log('[InteractiveClock] onTimeChange prop:', onTimeChange);

    if (onTimeChange) {
      console.log('[InteractiveClock] Calling onTimeChange with:', newTime);
      onTimeChange(newTime);
    } else {
      console.error('[InteractiveClock] onTimeChange is not defined!');
    }
  };

  const hourAngle = getHourAngle(selectedHours, selectedMinutes);
  const minuteAngle = getMinuteAngle(selectedMinutes);
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Clock Face */}
      <div className="relative">
        <svg
          ref={clockRef}
          width="240"
          height="240"
          viewBox="0 0 240 240"
          className="cursor-pointer select-none"
          onClick={handleClockClick}
          style={{ userSelect: 'none' }}
        >
          {/* Clock circle */}
          <circle
            cx="120"
            cy="120"
            r="110"
            fill={isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'}
            stroke={isDark ? '#d97706' : '#8a7149'}
            strokeWidth="3"
          />

          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const outerX = 120 + Math.cos(angle) * 95;
            const outerY = 120 + Math.sin(angle) * 95;
            const innerX = 120 + Math.cos(angle) * 85;
            const innerY = 120 + Math.sin(angle) * 85;
            const isCurrentHour = (i === 0 ? 12 : i) === (selectedHours % 12 === 0 ? 12 : selectedHours % 12);

            return (
              <g key={i}>
                <line
                  x1={outerX}
                  y1={outerY}
                  x2={innerX}
                  y2={innerY}
                  stroke={isDark ? '#d97706' : '#8a7149'}
                  strokeWidth={isCurrentHour ? '3' : '2'}
                />
                {/* Hour numbers */}
                <text
                  x={120 + Math.cos(angle) * 75}
                  y={120 + Math.sin(angle) * 75}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight={isCurrentHour ? 'bold' : 'normal'}
                  fill={isDark ? (isCurrentHour ? '#fbbf24' : '#d1d5db') : (isCurrentHour ? '#92400e' : '#6b7280')}
                  style={{ fontFamily: 'serif', userSelect: 'none', pointerEvents: 'none' }}
                >
                  {i === 0 ? 12 : i}
                </text>
              </g>
            );
          })}

          {/* Center dot */}
          <circle
            cx="120"
            cy="120"
            r="5"
            fill={isDark ? '#d97706' : '#8a7149'}
          />

          {/* Hour hand (shorter, thicker) */}
          <line
            x1="120"
            y1="120"
            x2={120 + Math.sin(hourAngle * Math.PI / 180) * 50}
            y2={120 - Math.cos(hourAngle * Math.PI / 180) * 50}
            stroke={isDark ? '#fbbf24' : '#92400e'}
            strokeWidth="6"
            strokeLinecap="round"
            onMouseDown={(e) => handleMouseDown(e, 'hours')}
            style={{ cursor: 'grab', pointerEvents: 'stroke' }}
          />

          {/* Minute hand (longer, thinner) */}
          <line
            x1="120"
            y1="120"
            x2={120 + Math.sin(minuteAngle * Math.PI / 180) * 80}
            y2={120 - Math.cos(minuteAngle * Math.PI / 180) * 80}
            stroke={isDark ? '#d97706' : '#8a7149'}
            strokeWidth="4"
            strokeLinecap="round"
            onMouseDown={(e) => handleMouseDown(e, 'minutes')}
            style={{ cursor: 'grab', pointerEvents: 'stroke' }}
          />
        </svg>

        {/* Instructions */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-ink-600 dark:text-parchment-400 italic">
            Click or drag to set time
          </p>
        </div>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-3 mt-4">
        <div className="text-center bg-white/60 dark:bg-slate-800/60 rounded-lg px-4 py-2 border border-parchment-300 dark:border-slate-600">
          <div className="text-2xl font-bold font-sans text-ink-900 dark:text-amber-400">
            {formatTime(selectedHours, selectedMinutes)}
          </div>
          <div className="text-xs text-ink-600 dark:text-parchment-400 italic">
            Selected Time
          </div>
        </div>

        {/* AM/PM Toggle */}
        <button
          onClick={toggleAMPM}
          className="px-3 py-2 bg-brass-500 hover:bg-brass-600 dark:bg-brass-600 dark:hover:bg-brass-700 text-ink-900 dark:text-parchment-50 rounded-lg font-semibold text-sm transition-colors duration-200"
        >
          Toggle AM/PM
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleApply}
          className="flex-1 px-8 py-3.5 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 dark:from-amber-600 dark:to-amber-700 dark:hover:from-amber-500 dark:hover:to-amber-600 text-white dark:text-slate-900 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          ⏰ Jump to This Time
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3.5 bg-gray-500 hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors duration-200"
        >
          Cancel
        </button>
      </div>

      {/* Help Text */}
      <div className="max-w-md text-center bg-parchment-100/50 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-parchment-300 dark:border-slate-600">
        <p className="text-xs text-ink-700 dark:text-parchment-300 leading-relaxed">
          <span className="font-semibold">Click</span> the clock face to set the time quickly, or{' '}
          <span className="font-semibold">drag</span> the hands for precise control.
          The hour hand (short) sets hours, the minute hand (long) sets minutes.
          Changing the time will trigger a narrative showing what happens as Maria waits.
        </p>
      </div>
    </div>
  );
};

export default InteractiveClock;
