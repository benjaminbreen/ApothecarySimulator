// HomePage.jsx
// Landing page with tab navigation matching game aesthetic

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scenarioLoader } from '../core/services/scenarioLoader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import sources for Content Guide
import primarySource1 from '../assets/humors.jpg';
import primarySource2 from '../assets/codex.jpg';
import primarySource3 from '../assets/medicinapractica.jpg';
import primarySource4 from '../assets/mariacoelho.jpeg';

// Portrait map - using direct URLs from public folder
const portraitMap = {
  'marianormal.jpg': '/maria/marianormal.jpg',
  'mariahappy.jpg': '/maria/mariahappy.jpg',
  'mariasad.jpg': '/maria/mariasad.jpg',
  'mariaworried.jpg': '/maria/mariaworried.jpg',
  'mariadetermined.jpg': '/maria/mariadetermined.jpg',
  'mariacurious.jpg': '/maria/mariacurious.jpg',
};

export default function HomePage() {
  const navigate = useNavigate();
  const scenarios = scenarioLoader.getAllScenarios();
  const [activeTab, setActiveTab] = useState('home');

  const handleSelectScenario = (scenarioId) => {
    navigate(`/play/${scenarioId}`);
  };

  // Content Guide markdown
  const contentGuideMarkdown = `
# Historical Context & Content Guide

## What is the historical context for this?

Apothecaries were the historical predecessors to today's pharmacists. But the medicines they crafted were far stranger and surprising than what you might find in a pharmacy today. The practice of apothecaries in the 17th century was rooted in a blend of empirical knowledge, classical Greek, Roman, Muslim, and medieval Christian traditional medicine, and practices involving astrology, alchemy, and natural magic that veered toward the mystical. Maria de Lima, the "playable character" in this game and an adaptation of the real-life female apothecary Maria Coelho, is a semi-fictional apothecary in colonial Mexico City in the year 1680, a time when medicine was changing more rapidly than ever before.

## The Role of Apothecaries

The apothecaries of the 17th century occupied a unique and precarious position. On the one hand, they were critical figures in their communities, acting as front-line healers for clientele who might not be able to afford to visit physicians, while also creating drugs for physicians to prescribe. On the other hand, their involvement in the lucrative but controversial trade in medicinal drugs exposed them to accusations of fraud, heresy, and professional malpractice.

At the heart of the apothecaries' trade was their intimate knowledge of drugs, referred to as "simples" when in their raw, unprocessed state. Apothecaries like Maria Coelho, the daughter of a Jewish convert (*converso*) family in Portugal, mastered the art of transforming these simples into potent "compound remedies."

![A depiction of the four humors from a 16th century German printed book](${primarySource1})

## Gameplay Mechanics

**Chat Naturally:** Type what you'd say or do. The AI responds to context and remembers your choices.

**Mix Medicines:** Combine historical ingredients using period methods—distillation, decoction, confection, calcination. Study humoral properties to create effective treatments.

**Diagnose Patients:** Examine symptoms through the lens of humoral medicine. Click on patients to view detailed information and prescribe treatments.

**Manage Resources:** Balance health, energy, wealth, and reputation. Actions consume resources—mix medicines (10 energy, 2 hours), forage herbs (15 energy, 4 hours), sleep to restore energy.

**Interactive Elements:** Click highlighted text (patients in red, NPCs in green, items in purple) to open detailed panels.

**Question the AI:** This game uses AI to generate narratives. Notice what it gets right—and wrong. Think critically about historical narratives.

## The Real Maria de Lima

Maria de Lima is based on Maria Coelho, who lived in 17th-century Coimbra, Portugal. Maria Coelho was part of a converso apothecary family—descendants of Sephardic Jews forced to convert to Christianity.

Maria Coelho's Inquisition file survives in the Portuguese national archives. On January 8, 1666, she was arrested and delivered to the Inquisition prison. After a trial lasting over three years, she was declared guilty of heresy and sentenced to exile in Brazil. She confessed on May 14, 1669, but her ultimate fate remains unknown.

![Possible depiction of Maria and Joseph Coelho](${primarySource4})
*A possible depiction of Maria and Jozeph Coelho from the Pharmaca de Jozeph Coelho (1668)*

## Further Reading

**Primary Sources:**
- João Curvo Semedo, *Observaçoens medicas* (1707)
- Juan de Esteyneffer, *Florilegia Medicinal* (1712)
- Francisco Sanz de Dios y Guadalupe, *Medicina practica de Guadalupe* (1734)

**Secondary Sources:**
- De Vos, Paula, *Compound Remedies: Galenic Pharmacy in Colonial Mexico* (2010)
- Gómez, Pablo F., *The Experiential Caribbean* (2017)
- Breen, Benjamin, *The Age of Intoxication* (2019)
- Roselló Soberón, Estela, *Enfermar y curar* (2018)
`;

  const renderContent = () => {
    if (activeTab === 'colophon') {
      return (
        <div className="prose prose-lg max-w-none">
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-parchment-50 mb-4">Colophon</h2>
          <p className="text-lg text-ink-700 dark:text-parchment-200 leading-relaxed mb-4">
            This game was created by <a href="https://benjaminbreen.com" target="_blank" rel="noopener noreferrer"
            className="text-amber-700 dark:text-amber-400 hover:underline">Benjamin Breen</a> in 2024-2025 using React.js,
            with code assistance from GPT-4o and Claude, and images by DALLE-3 and Midjourney.
          </p>
          <p className="text-lg text-ink-700 dark:text-parchment-200 leading-relaxed mb-4">
            The purpose of this project is to create a historically immersive simulation, allowing users to explore
            the life and practices of a 17th-century apothecary in Mexico City, while also inviting them to question
            where the simulation breaks down.
          </p>
          <h3 className="font-serif text-xl font-bold text-ink-900 dark:text-parchment-50 mb-3 mt-6">Methodology</h3>
          <p className="text-lg text-ink-700 dark:text-parchment-200 leading-relaxed mb-4">
            The "engines" of the game are the language models GPT-4o and Google Gemini 2.0, which have been fed detailed
            prompts with historical information and primary sources relevant to the setting. Different instances power
            the main simulation, drug mixing validation, patient diagnosis, and narrative generation.
          </p>
          <p className="text-lg text-ink-700 dark:text-parchment-200 leading-relaxed mb-4">
            This is an ongoing project developed as an educational tool. The goal is to develop this into not only the
            best apothecary simulator ever, but to also make it a jumping-off point for other educational simulation games.
          </p>
          <h3 className="font-serif text-xl font-bold text-ink-900 dark:text-parchment-50 mb-3 mt-6">About the Creator</h3>
          <p className="text-lg text-ink-700 dark:text-parchment-200 leading-relaxed mb-4">
            Benjamin Breen is a historian and writer focused on the history of science, medicine, technology, and
            globalization. He is an associate professor at UC Santa Cruz. This application grew out of an ongoing
            collaboration with Pranav Anand and Zac Zimmer at UCSC.
          </p>
          <p className="text-sm text-ink-700 dark:text-parchment-200 leading-relaxed">
            Contact: bebreen at ucsc dot edu
          </p>
        </div>
      );
    }

    if (activeTab === 'content-guide') {
      return (
        <div className="prose prose-lg max-w-none markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentGuideMarkdown}</ReactMarkdown>
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-parchment-50 mb-6">Settings</h2>

          <div className="space-y-6">
            {/* Load Game */}
            <div className="bg-parchment-100 dark:bg-slate-800/50 rounded-lg p-4 border border-ink-200 dark:border-ink-700">
              <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-parchment-100 mb-3">Save Games</h3>
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-600 dark:hover:bg-amber-700
                                 text-white rounded-lg font-semibold transition-colors">
                Load Saved Game
              </button>
              <p className="text-xs text-ink-600 dark:text-parchment-300 mt-2 italic">
                Placeholder - Save/load functionality coming soon
              </p>
            </div>

            {/* Future Settings */}
            <div className="bg-parchment-100 dark:bg-slate-800/50 rounded-lg p-4 border border-ink-200 dark:border-ink-700">
              <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-parchment-100 mb-3">Game Options</h3>
              <div className="space-y-3 text-sm text-ink-600 dark:text-parchment-300">
                <div className="flex items-center justify-between">
                  <span>Difficulty Level</span>
                  <span className="italic">Coming soon</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Historical Accuracy Mode</span>
                  <span className="italic">Coming soon</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>AI Model Selection</span>
                  <span className="italic">Coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Home tab content
    return scenarios.map(scenario => (
      <div key={scenario.id}>
        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* Left Column: Portrait + Character Info */}
          <div>
            <div className="w-56 h-56 rounded-lg overflow-hidden border-2 border-ink-300 dark:border-ink-600
                            shadow-lg mb-6 mx-auto md:mx-0">
              <img
                src={portraitMap[scenario.character.portraits.normal] || mariaNormal}
                alt={scenario.character.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center md:text-left">
              <div className="text-xs uppercase tracking-widest text-ink-500 dark:text-parchment-400
                              font-bold mb-2">
                {scenario.name}
              </div>
              <h2 className="font-serif text-3xl font-bold text-ink-900 dark:text-parchment-50 mb-4">
                {scenario.character.name}
              </h2>

              {/* Based on GameIntro text */}
              <div className="space-y-3 text-lg text-ink-700 dark:text-parchment-200 leading-relaxed">
                <p>
                  Step into the shoes of <strong>Maria de Lima</strong>, an apothecary living in 17th-century
                  Mexico City who faces a moment of crisis due to her mounting debts. In this AI-enabled educational
                  historical simulation, you'll face the challenges of running an apothecary shop while navigating
                  the complex social world of colonial Mexico.
                </p>
                <p>
                  As a converso in colonial Mexico, Maria is caught between economic pressures and her own ethics.
                  Your remedies blend Indigenous, African, and European traditions—knowledge that could save lives
                  or condemn you. Balance survival with service while avoiding the scrutiny of the Inquisition.
                </p>
              </div>

              {/* Historical Figure Note */}
              <div className="mt-6 pt-4 border-t border-ink-200 dark:border-ink-700">
                <p className="text-sm text-ink-600 dark:text-parchment-300 leading-relaxed italic">
                  <strong>Historical Note:</strong> Maria de Lima is based on Maria Coelho, a real apothecary
                  who lived in Portugal in the 1660s. She was arrested by the Inquisition, found guilty of
                  heresy, and sentenced to exile in Brazil. Afterward, she disappeared from the historical
                  record. This game imagines where she might have ended up.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: What You Need to Know */}
          <div className="bg-gradient-to-br from-amber-50 to-parchment-100 dark:from-slate-800 dark:to-slate-900
                          rounded-xl border-2 border-amber-300 dark:border-amber-700/50 shadow-lg p-8 min-h-[500px]">
            <h3 className="font-serif text-2xl font-bold text-ink-900 dark:text-parchment-50 mb-6">
              How It Works
            </h3>

            <div className="space-y-4 text-lg text-ink-700 dark:text-parchment-200">
              <div className="flex items-start gap-3">
                <span className="text-amber-700 dark:text-amber-400 text-xl flex-shrink-0">💬</span>
                <div>
                  <strong className="text-ink-900 dark:text-parchment-100">Chat Naturally:</strong> Type
                  what you'd say or do. The AI responds to context and remembers your choices. Think of it
                  as an interactive book.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-amber-700 dark:text-amber-400 text-xl flex-shrink-0">⚗️</span>
                <div>
                  <strong className="text-ink-900 dark:text-parchment-100">Mix Medicines:</strong> Combine
                  historical ingredients using period methods—distillation, decoction, confection, calcination.
                  Study humoral properties (hot, cold, wet, dry) to create effective treatments.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-amber-700 dark:text-amber-400 text-xl flex-shrink-0">🩺</span>
                <div>
                  <strong className="text-ink-900 dark:text-parchment-100">Diagnose Patients:</strong> Examine
                  symptoms through the lens of humoral medicine. Click on patients to view details and prescribe
                  treatments.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-amber-700 dark:text-amber-400 text-xl flex-shrink-0">⚖️</span>
                <div>
                  <strong className="text-ink-900 dark:text-parchment-100">Manage Resources:</strong> Balance
                  health, energy, wealth, and reputation. Actions have costs—rest when needed. Survival requires
                  careful planning.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-amber-700 dark:text-amber-400 text-xl flex-shrink-0">🤔</span>
                <div>
                  <strong className="text-ink-900 dark:text-parchment-100">Question the AI:</strong> Notice
                  what it gets right—and wrong—about the past. Think critically about historical narratives and
                  algorithmic assumptions.
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-ink-300 dark:border-ink-700">
                <p className="text-xs italic text-ink-600 dark:text-parchment-300">
              
                  Your story adapts to your choices. This is designed to be challenging—think carefully.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={() => handleSelectScenario(scenario.id)}
          className="w-full max-w-lg mx-auto block px-10 py-5 bg-gradient-to-r from-amber-700 to-amber-600
                     hover:from-amber-800 hover:to-amber-700 dark:from-amber-600 dark:to-amber-500
                     dark:hover:from-amber-700 dark:hover:to-amber-600 text-white border-none rounded-lg
                     text-lg font-bold font-serif cursor-pointer transition-all duration-200 shadow-lg
                     hover:shadow-xl hover:scale-105 active:scale-100">
          Enter 1680 Mexico City
        </button>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-ink-900">
      {/* Header - Match game nav exactly */}
      <header className="border-b-2 border-parchment-400 dark:border-amber-600/30 bg-gradient-to-b from-parchment-50 to-white/70 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - matching Header.js exactly */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-parchment-200 to-parchment-300 dark:from-amber-600/20 dark:to-amber-700/30 border-2 border-parchment-400 dark:border-amber-600/40 flex items-center justify-center shadow-md">
                <span className="text-xl">⚗️</span>
              </div>
              <div>
                <h1 className="font-bold text-ink-800 dark:text-amber-400 tracking-wide" style={{
                  fontSize: '1.2rem',
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.1em',
                  lineHeight: '1.1',
                  textTransform: 'uppercase'
                }}>
                  The Apothecary
                </h1>
                <p className="text-sm text-ink-500 dark:text-slate-400 font-serif italic mt-0.5 leading-none">
                  A Medical History Educational Game
                </p>
              </div>
            </div>

            {/* Tab Buttons - styled like location/date dropdowns */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-xl font-sans text-sm font-medium transition-all duration-200
                           ${activeTab === 'home'
                             ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md'
                             : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-parchment-300 dark:border-slate-600 text-ink-800 dark:text-parchment-200 hover:bg-parchment-100 dark:hover:bg-slate-700'}`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('content-guide')}
                className={`px-4 py-2 rounded-xl font-sans text-sm font-medium transition-all duration-200
                           ${activeTab === 'content-guide'
                             ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md'
                             : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-parchment-300 dark:border-slate-600 text-ink-800 dark:text-parchment-200 hover:bg-parchment-100 dark:hover:bg-slate-700'}`}
              >
                Content Guide
              </button>
              <button
                onClick={() => setActiveTab('colophon')}
                className={`px-4 py-2 rounded-xl font-sans text-sm font-medium transition-all duration-200
                           ${activeTab === 'colophon'
                             ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md'
                             : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-parchment-300 dark:border-slate-600 text-ink-800 dark:text-parchment-200 hover:bg-parchment-100 dark:hover:bg-slate-700'}`}
              >
                Colophon
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl font-sans text-sm font-medium transition-all duration-200
                           ${activeTab === 'settings'
                             ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md'
                             : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-parchment-300 dark:border-slate-600 text-ink-800 dark:text-parchment-200 hover:bg-parchment-100 dark:hover:bg-slate-700'}`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Image visible as border around content */}
      <div
        className="relative min-h-[calc(100vh-100px)] p-8 sm:p-4"
        style={{
          backgroundImage: 'url(/ui/boticabedroom.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Centered content panel - image visible around it */}
        <div className="max-w-5xl mx-auto bg-parchment-50 dark:bg-ink-900 rounded-2xl shadow-2xl p-8 sm:p-6">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-ink-600 dark:text-parchment-400 mb-2">
            Created by <a href="https://benjaminbreen.com" target="_blank" rel="noopener noreferrer"
                          className="text-amber-700 dark:text-amber-400 hover:underline">Benjamin Breen</a>
          </p>
          <p className="text-xs text-ink-500 dark:text-parchment-500">
            Built with React & Claude Code · Powered by Google Gemini · © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
