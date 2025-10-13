// HomePage.jsx
// Modern, clean landing page with 2025 UI/UX principles

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { scenarioLoader } from '../core/services/scenarioLoader';

// Import character portraits statically
import mariaNormal from '../assets/marianormal.jpg';
import mariaHappy from '../assets/mariahappy.jpg';
import mariaSad from '../assets/mariasad.jpg';
import mariaWorried from '../assets/mariaworried.jpg';
import mariaDetermined from '../assets/mariadetermined.jpg';
import mariaCurious from '../assets/mariacurious.jpg';

const portraitMap = {
  'marianormal.jpg': mariaNormal,
  'mariahappy.jpg': mariaHappy,
  'mariasad.jpg': mariaSad,
  'mariaworried.jpg': mariaWorried,
  'mariadetermined.jpg': mariaDetermined,
  'mariacurious.jpg': mariaCurious,
};

export default function HomePage() {
  const navigate = useNavigate();
  const scenarios = scenarioLoader.getAllScenarios();

  const handleSelectScenario = (scenarioId) => {
    navigate(`/play/${scenarioId}`);
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-ink-900 text-ink-900 dark:text-parchment-50
                    font-sans antialiased flex items-center justify-center p-8 sm:p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-serif text-5xl sm:text-4xl font-semibold text-ink-900 dark:text-parchment-50
                         mb-3 tracking-tight">
            Apothecary Simulator
          </h1>
          <p className="text-base sm:text-[15px] text-ink-600 dark:text-parchment-300 leading-relaxed
                        max-w-2xl mx-auto">
            Practice medicine across history. Diagnose patients, craft remedies, and navigate the challenges of pre-modern healthcare.
          </p>
        </header>

        {/* Scenarios */}
        <section className="mb-10">
          {scenarios.map(scenario => (
            <div
              key={scenario.id}
              className="bg-parchment-100 dark:bg-ink-800 border-2 border-parchment-300 dark:border-ink-700
                         rounded-xl p-8 sm:p-6 cursor-pointer transition-all duration-200
                         shadow-elevation-1 hover:shadow-elevation-3 hover:-translate-y-0.5
                         hover:border-brass-600 dark:hover:border-brass-500 active:translate-y-0"
              onClick={() => handleSelectScenario(scenario.id)}
            >
              <div className="w-[120px] h-[120px] rounded-lg overflow-hidden border-2
                              border-parchment-300 dark:border-ink-600 mx-auto mb-6
                              shadow-elevation-2">
                <img
                  src={portraitMap[scenario.character.portraits.normal] || mariaNormal}
                  alt={scenario.character.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-ink-600 dark:text-parchment-400
                                font-semibold mb-2">
                  {scenario.name}
                </div>
                <h3 className="font-serif text-[1.75rem] font-semibold text-ink-900 dark:text-parchment-50 mb-3">
                  {scenario.character.name}
                </h3>
                <p className="text-base text-ink-600 dark:text-parchment-300 leading-relaxed mb-5">
                  {scenario.description}
                </p>
                <div className="flex justify-center gap-8 sm:flex-col sm:gap-3 mb-6 pt-5
                                border-t border-parchment-300 dark:border-ink-700">
                  <div className="flex flex-col sm:flex-row sm:justify-center gap-1 sm:gap-2 items-center">
                    <span className="text-sm text-ink-600 dark:text-parchment-300 font-medium">
                      {scenario.startLocation.split(',')[0]}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-center gap-1 sm:gap-2 items-center">
                    <span className="text-sm text-ink-600 dark:text-parchment-300 font-medium">
                      {scenario.startingWealth} {scenario.currency}
                    </span>
                  </div>
                </div>
                <button className="w-full max-w-[300px] mx-auto block px-8 py-4
                                   bg-brass-600 dark:bg-brass-500 text-white border-none rounded-lg
                                   text-base font-semibold font-sans cursor-pointer
                                   transition-all duration-200 shadow-sm
                                   hover:bg-brass-700 dark:hover:bg-brass-600
                                   hover:shadow-md hover:-translate-y-px
                                   active:translate-y-0">
                  Begin Story
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-6 sm:gap-4 mb-10">
          {/* How to Play */}
          <div className="bg-white dark:bg-ink-800 border border-parchment-300 dark:border-ink-700
                          rounded-lg p-6">
            <h2 className="text-xs uppercase tracking-widest text-ink-600 dark:text-parchment-400
                           font-semibold mb-4">
              How to Play
            </h2>
            <ul className="list-none flex flex-col gap-2.5">
              <li className="text-sm leading-normal text-ink-900 dark:text-parchment-100">
                Chat naturally or use <code className="bg-parchment-100 dark:bg-ink-900
                                                     px-1.5 py-0.5 rounded font-mono text-[13px]
                                                     text-brass-700 dark:text-brass-400
                                                     border border-parchment-300 dark:border-ink-600">
                  #diagnose
                </code> to examine
              </li>
              <li className="text-sm leading-normal text-ink-900 dark:text-parchment-100">
                Mix medicines with <code className="bg-parchment-100 dark:bg-ink-900
                                                    px-1.5 py-0.5 rounded font-mono text-[13px]
                                                    text-brass-700 dark:text-brass-400
                                                    border border-parchment-300 dark:border-ink-600">
                  #mix
                </code>
              </li>
              <li className="text-sm leading-normal text-ink-900 dark:text-parchment-100">
                Buy ingredients with <code className="bg-parchment-100 dark:bg-ink-900
                                                      px-1.5 py-0.5 rounded font-mono text-[13px]
                                                      text-brass-700 dark:text-brass-400
                                                      border border-parchment-300 dark:border-ink-600">
                  #buy
                </code>
              </li>
              <li className="text-sm leading-normal text-ink-900 dark:text-parchment-100">
                Prescribe with <code className="bg-parchment-100 dark:bg-ink-900
                                                px-1.5 py-0.5 rounded font-mono text-[13px]
                                                text-brass-700 dark:text-brass-400
                                                border border-parchment-300 dark:border-ink-600">
                  #prescribe
                </code>
              </li>
              <li className="text-sm leading-normal text-ink-900 dark:text-parchment-100">
                Gather herbs with <code className="bg-parchment-100 dark:bg-ink-900
                                                   px-1.5 py-0.5 rounded font-mono text-[13px]
                                                   text-brass-700 dark:text-brass-400
                                                   border border-parchment-300 dark:border-ink-600">
                  #forage
                </code>
              </li>
              <li className="text-sm leading-normal text-ink-900 dark:text-parchment-100">
                Rest with <code className="bg-parchment-100 dark:bg-ink-900
                                          px-1.5 py-0.5 rounded font-mono text-[13px]
                                          text-brass-700 dark:text-brass-400
                                          border border-parchment-300 dark:border-ink-600">
                  #sleep
                </code>
              </li>
            </ul>
          </div>

          {/* Credits */}
          <div className="bg-white dark:bg-ink-800 border border-parchment-300 dark:border-ink-700
                          rounded-lg p-6">
            <h2 className="text-xs uppercase tracking-widest text-ink-600 dark:text-parchment-400
                           font-semibold mb-4">
              Credits
            </h2>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-0.5">
                <div className="text-[11px] uppercase tracking-widest text-ink-600 dark:text-parchment-400
                                font-semibold">
                  Created by
                </div>
                <div className="text-sm text-ink-900 dark:text-parchment-100 leading-snug">
                  <a href="https://benjaminbreen.com"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-brass-700 dark:text-brass-400 no-underline
                                transition-colors duration-150
                                hover:text-brass-800 dark:hover:text-brass-300 hover:underline">
                    Benjamin Breen
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[11px] uppercase tracking-widest text-ink-600 dark:text-parchment-400
                                font-semibold">
                  Development
                </div>
                <div className="text-sm text-ink-900 dark:text-parchment-100 leading-snug">
                  Built with React and Claude Code
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[11px] uppercase tracking-widest text-ink-600 dark:text-parchment-400
                                font-semibold">
                  AI
                </div>
                <div className="text-sm text-ink-900 dark:text-parchment-100 leading-snug">
                  Powered by Google Gemini
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-parchment-300 dark:border-ink-700">
          <p className="text-[13px] text-ink-600 dark:text-parchment-400">
            © 2025 Benjamin Breen · An educational game about the history of medicine
          </p>
        </footer>
      </div>
    </div>
  );
}
