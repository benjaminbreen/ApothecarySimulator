/**
 * PerformanceMonitor - Developer tool for debugging performance issues
 *
 * Features:
 * - Real-time FPS counter in upper right corner
 * - Click to expand detailed performance metrics
 * - Tracks: FPS, memory, DOM elements, particles, render times
 * - Identifies performance bottlenecks
 *
 * Usage: Enable "Test Mode" in Settings → Dev Panel
 */

import React, { useState, useEffect, useRef } from 'react';
import { isSafari } from '../utils/browserDetection';

export default function PerformanceMonitor({ weatherEnabled = false, particleCount = 0 }) {
  const [fps, setFps] = useState(60);
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState({
    avgFps: 60,
    minFps: 60,
    maxFps: 60,
    memory: { used: 0, total: 0 },
    domNodes: 0,
    particles: 0,
    renderTime: 0,
    idleTime: 0,
    weather: false,
    browser: 'Unknown'
  });

  // FPS calculation
  const frameTimesRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);

  // Performance tracking
  const renderStartRef = useRef(0);
  const fpsHistoryRef = useRef([]);

  // Calculate FPS
  useEffect(() => {
    const calculateFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Calculate instantaneous FPS
      const instantFps = Math.round(1000 / delta);

      // Keep rolling window of last 60 frames (1 second at 60fps)
      frameTimesRef.current.push(instantFps);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculate average FPS
      const avgFps = Math.round(
        frameTimesRef.current.reduce((sum, fps) => sum + fps, 0) / frameTimesRef.current.length
      );

      setFps(avgFps);

      // Track FPS history for min/max
      fpsHistoryRef.current.push(avgFps);
      if (fpsHistoryRef.current.length > 300) { // 5 seconds of history
        fpsHistoryRef.current.shift();
      }

      rafIdRef.current = requestAnimationFrame(calculateFPS);
    };

    rafIdRef.current = requestAnimationFrame(calculateFPS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Update detailed metrics every second
  useEffect(() => {
    const updateMetrics = () => {
      const now = performance.now();
      const renderTime = now - renderStartRef.current;
      renderStartRef.current = now;

      // Calculate min/max FPS
      const minFps = fpsHistoryRef.current.length > 0
        ? Math.min(...fpsHistoryRef.current)
        : fps;
      const maxFps = fpsHistoryRef.current.length > 0
        ? Math.max(...fpsHistoryRef.current)
        : fps;

      // Get memory info (if available)
      let memory = { used: 0, total: 0, percentage: 0 };
      if (performance.memory) {
        memory = {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
          percentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
        };
      }

      // Count DOM nodes
      const domNodes = document.getElementsByTagName('*').length;

      // Detect browser
      const browser = isSafari() ? 'Safari' : 'Other';

      setMetrics({
        avgFps: fps,
        minFps,
        maxFps,
        memory,
        domNodes,
        particles: particleCount,
        renderTime: Math.round(renderTime),
        idleTime: Math.max(0, Math.round((1000 / 60) - renderTime)),
        weather: weatherEnabled,
        browser
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [fps, weatherEnabled, particleCount]);

  // FPS color based on performance
  const getFpsColor = (fps) => {
    if (fps >= 55) return '#10b981'; // Green - Good
    if (fps >= 40) return '#f59e0b'; // Amber - Warning
    if (fps >= 25) return '#f97316'; // Orange - Poor
    return '#ef4444'; // Red - Critical
  };

  // Memory color based on usage
  const getMemoryColor = (percentage) => {
    if (percentage < 60) return '#10b981'; // Green
    if (percentage < 80) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <>
      {/* Compact FPS Counter - Always Visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed top-2 right-2 z-[9999] cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${getFpsColor(fps)}`,
          borderRadius: '8px',
          padding: '8px 12px',
          fontFamily: "'Courier New', monospace",
          fontSize: '14px',
          fontWeight: 'bold',
          color: getFpsColor(fps),
          boxShadow: `0 0 20px ${getFpsColor(fps)}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getFpsColor(fps),
            boxShadow: `0 0 8px ${getFpsColor(fps)}`,
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          {fps} FPS
        </div>
      </div>

      {/* Expanded Performance Panel */}
      {isExpanded && (
        <div
          className="fixed top-16 right-2 z-[9999] transition-all duration-300 animate-scale-in"
          style={{
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            width: '320px',
            maxHeight: '80vh',
            overflow: 'auto',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
            color: '#e5e7eb',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
              ⚡ Performance Monitor
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                color: '#ef4444',
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>

          {/* FPS Section */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>
              📊 Frame Rate
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <MetricCard label="Current" value={`${metrics.avgFps}`} unit="fps" color={getFpsColor(metrics.avgFps)} />
              <MetricCard label="Min" value={`${metrics.minFps}`} unit="fps" color="#94a3b8" />
              <MetricCard label="Max" value={`${metrics.maxFps}`} unit="fps" color="#94a3b8" />
            </div>
          </div>

          {/* Memory Section */}
          {metrics.memory.total > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>
                🧠 Memory Usage
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                padding: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: getMemoryColor(metrics.memory.percentage), fontWeight: 'bold' }}>
                    {metrics.memory.used} MB
                  </span>
                  <span style={{ color: '#94a3b8' }}> / {metrics.memory.total} MB</span>
                </div>
                <div style={{
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${metrics.memory.percentage}%`,
                    background: getMemoryColor(metrics.memory.percentage),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ marginTop: '4px', fontSize: '10px', color: '#94a3b8' }}>
                  {metrics.memory.percentage}% used
                </div>
              </div>
            </div>
          )}

          {/* System Section */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>
              🖥️ System
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <MetricCard label="DOM Nodes" value={metrics.domNodes} color="#8b5cf6" />
              <MetricCard label="Particles" value={metrics.particles} color="#06b6d4" />
            </div>
          </div>

          {/* Render Performance */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>
              ⏱️ Render Time
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <MetricCard label="Work" value={`${metrics.renderTime}`} unit="ms" color="#f59e0b" />
              <MetricCard label="Idle" value={`${metrics.idleTime}`} unit="ms" color="#10b981" />
            </div>
          </div>

          {/* Features */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>
              🎮 Active Features
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <FeatureCard label="Weather" active={metrics.weather} />
              <FeatureCard label="Safari" active={metrics.browser === 'Safari'} />
            </div>
          </div>

          {/* Performance Tips */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '11px',
            color: '#93c5fd'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>💡 Performance Tips:</div>
            {metrics.avgFps < 30 && (
              <div>• FPS Critical: Disable weather or reduce particles</div>
            )}
            {metrics.memory.percentage > 80 && (
              <div>• High memory: Refresh page to clear</div>
            )}
            {metrics.domNodes > 5000 && (
              <div>• High DOM count: {metrics.domNodes} nodes</div>
            )}
            {metrics.avgFps >= 55 && metrics.memory.percentage < 80 && (
              <div>✓ Performance is good!</div>
            )}
          </div>

          {/* Browser Info */}
          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '10px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            Browser: {metrics.browser} | {window.innerWidth}x{window.innerHeight}
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

// Helper component for metric cards
function MetricCard({ label, value, unit = '', color = '#3b82f6' }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${color}40`,
      borderRadius: '6px',
      padding: '8px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color }}>
        {value}{unit && <span style={{ fontSize: '10px', marginLeft: '2px' }}>{unit}</span>}
      </div>
    </div>
  );
}

// Helper component for feature status
function FeatureCard({ label, active }) {
  return (
    <div style={{
      background: active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
      border: `1px solid ${active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
      borderRadius: '6px',
      padding: '8px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color: active ? '#10b981' : '#64748b'
      }}>
        {active ? '✓ ON' : '✗ OFF'}
      </div>
    </div>
  );
}
