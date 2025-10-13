import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mmap from '../../../assets/mexicomap.jpg';
import wmap from '../../../assets/worldmap.jpg';
import { createChatCompletion } from '../../../core/services/llmService';

const Map = ({ isOpen, onClose, previousOutput, lat = 19.4326, lon = -99.1332 }) => {
  const [mapOutput, setMapOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ASCII map generation
  useEffect(() => {
    if (isOpen && previousOutput) {
      generateMap(previousOutput);
    }
  }, [isOpen, previousOutput]);

  const generateMap = async (previousOutput) => {
    setIsLoading(true);
    try {
      const mapPrompt = `
        Create a detailed ASCII map of Maria de Lima's surroundings for a historical simulation which begins in Mexico City in 1680 but can move to other locations (for instance, you might make a map of a house, the hold of a ship at sea, a desolate landscape, an ocean, or even a continent). Use the following guidelines:
        - Use a consistent width for all lines (e.g., 60 characters).
        - Use '|' for vertical borders and '-' for horizontal borders.
        - Pad shorter lines with spaces to maintain rectangular shape.
        - Use emojis and ASCII characters for landmarks and objects.
        - Include a legend below the map.
        
        Ensure the map includes:
        - Named or mentioned NPCs
        - Any other relevant landmarks or features mentioned in the narrative

        Base the map on this description of the surroundings:
        ${previousOutput}

        Format the output as a code block for proper rendering.
      `;

      const response = await createChatCompletion([
            { role: 'system', content: 'You are an expert in creating detailed ASCII maps. Always format your map output as a code block by wrapping it in triple backticks (```).' },
            { role: 'user', content: mapPrompt },
          ], 1.0, 1000);

      const mapText = response.choices[0].message.content;
      setMapOutput(mapText);
    } catch (error) {
      console.error("Error generating map:", error);
      setMapOutput("An error occurred while generating the map.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 dark:bg-black/85 flex justify-center items-center z-[1000]">
      <div className="relative bg-parchment-50 dark:bg-ink-800 rounded-xl shadow-elevation-4 w-full max-w-6xl max-h-[95vh] overflow-y-auto p-8 md:p-10 text-ink-900 dark:text-parchment-50 font-serif custom-scrollbar">
        <div className="text-left">
          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wider border-b-2 border-ink-400 dark:border-ink-600 pb-2 mb-5 text-ink-900 dark:text-parchment-50 text-center" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)' }}>
            Map
          </h2>

          {/* Flexbox container for maps */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-5">
            {/* Static map for Mexico City closeup */}
            <div className="relative h-[450px] border border-parchment-300 dark:border-ink-600 rounded-2xl overflow-hidden w-full md:w-[38%]">
              <h3 className="font-display text-xl md:text-2xl uppercase tracking-wider border-b-2 border-ink-400 dark:border-ink-600 pb-2 pt-4 mb-4 text-ink-900 dark:text-parchment-50 text-center">
                Mexico City Area
              </h3>
              <img
                src={mmap}
                alt="Map of Mexico City"
                className="w-full h-full object-cover"
              />
              {/* Marker */}
              <div
                className="absolute w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white z-[10000]"
                style={{
                  top: `${lat}%`,
                  left: `${lon}%`,
                }}
              ></div>
            </div>

            {/* Static map for World Map */}
            <div className="relative h-[450px] border border-parchment-300 dark:border-ink-600 rounded-2xl overflow-hidden w-full md:w-[60%]">
              <h3 className="font-display text-xl md:text-2xl uppercase tracking-wider border-b-2 border-ink-400 dark:border-ink-600 pb-2 pt-4 mb-4 text-ink-900 dark:text-parchment-50 text-center">
                World Map
              </h3>
              <img
                src={wmap}
                alt="World Map"
                className="w-full h-full object-cover"
              />
              {/* Marker */}
              <div
                className="absolute w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white z-[10000]"
                style={{
                  top: `${lat}%`,
                  left: `${lon}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Vertical divider between insets and ASCII map */}
          <div className="border-t-2 border-parchment-300 dark:border-ink-600 my-5"></div>

          {/* ASCII map below the static maps */}
          {isLoading ? (
            <p className="text-base text-ink-700 dark:text-parchment-300 mb-5">Loading ASCII map...</p>
          ) : (
            <pre className="font-mono text-xs md:text-sm leading-tight whitespace-pre overflow-x-auto bg-parchment-100 dark:bg-ink-900 p-5 rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{mapOutput}</ReactMarkdown>
            </pre>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-none px-5 py-2.5 rounded cursor-pointer transition-colors duration-300"
            style={{ boxShadow: '0px 0px 10px rgba(255, 0, 0, 0.6)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Map;
