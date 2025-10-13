import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

function Journal({ journal, isOpen, toggleJournal, customJournalEntry, setCustomJournalEntry, handleJournalEntrySubmit }) {
  const [isCustomEntryOpen, setIsCustomEntryOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        toggleJournal(); // Close the journal when "Escape" is pressed
      }
    };

    // Attach the event listener when the component mounts
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleJournal]); // Re-run effect if `isOpen` changes

  // Function to convert journal entries to plain text and trigger download
  const handleSaveJournal = () => {
    const textContent = journal.map(entry => entry.content).join('\n\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journal.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleCustomEntry = () => {
    setIsCustomEntryOpen(!isCustomEntryOpen);
  };

  return (
    <div className={`fixed top-0 h-full w-[300px] bg-parchment-50 dark:bg-ink-800 border-l border-parchment-300 dark:border-ink-600 transition-all duration-700 ease-in-out z-[1000] p-5 shadow-elevation-3 overflow-y-auto custom-scrollbar ${isOpen ? 'right-0' : '-right-[300px]'}`}>

      {/* Button Container */}
      <div className="flex flex-col gap-2 mb-4">
        <button
          onClick={toggleJournal}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white p-2 rounded transition-colors duration-300"
        >
          Close Journal
        </button>

        <button
          onClick={handleSaveJournal}
          className="bg-botanical-500 hover:bg-botanical-600 dark:bg-botanical-600 dark:hover:bg-botanical-700 text-white p-2 rounded transition-colors duration-300"
        >
          Save Journal
        </button>
      </div>

      {/* Toggle button for custom entry */}
      <button
        className="bg-ink-600 hover:bg-ink-700 dark:bg-ink-700 dark:hover:bg-ink-800 text-white px-2.5 py-1.5 rounded border-none w-[94%] cursor-pointer transition-colors duration-300 block mx-auto mb-4"
        onClick={toggleCustomEntry}
      >
        {isCustomEntryOpen ? 'Close without submitting' : 'Create Custom Entry'}
      </button>

      {/* Custom Entry Section */}
      <div
        className={`overflow-hidden transition-all duration-400 pb-5 ${
          isCustomEntryOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <textarea
          value={customJournalEntry}
          onChange={(e) => setCustomJournalEntry(e.target.value)}
          placeholder="Write here to add your own notes to the auto-generated summary of events."
          className="w-full mt-2.5 p-2 border border-parchment-300 dark:border-ink-600 rounded text-lg resize-none h-[100px] bg-white dark:bg-ink-900 text-ink-900 dark:text-parchment-100"
        />
        <button
          onClick={() => {
            handleJournalEntrySubmit();
            toggleCustomEntry();
          }}
          className="bg-botanical-500 hover:bg-botanical-600 dark:bg-botanical-600 dark:hover:bg-botanical-700 text-white px-3 py-2 rounded border-none cursor-pointer transition-colors duration-300 w-full mt-2"
        >
          Submit Journal Entry
        </button>
      </div>

      {/* Header */}
      <h2 className="font-display text-3xl uppercase tracking-wide border-b-2 border-ink-400 dark:border-ink-600 pb-2.5 mb-5 text-ink-900 dark:text-parchment-50 text-center">
        Journal
      </h2>

      {/* Journal Entries */}
      {journal && journal.length > 0 ? (
        journal.map((entry, index) => (
          <div key={index}>
            <div
              className={`mb-4 pb-2.5 border-b border-parchment-300 dark:border-ink-600 ${
                entry.type === 'human'
                  ? 'font-sans normal-case text-ink-900 dark:text-parchment-100'
                  : 'italic font-serif text-sm text-ink-700 dark:text-parchment-300'
              }`}
            >
              <ReactMarkdown
                components={{
                  code: ({ node, ...props }) => (
                    <code
                      className="font-sans uppercase bg-transparent text-ink-700 dark:text-ink-500 not-italic text-xs font-semibold tracking-tight"
                      {...props}
                    />
                  ),
                }}
              >
                {entry.content}
              </ReactMarkdown>
            </div>

            {index < journal.length - 1 && (
              <hr className="border-0 h-px bg-parchment-300 dark:bg-ink-600 my-5" />
            )}
          </div>
        ))
      ) : (
        <p className="text-ink-700 dark:text-parchment-300">No entries yet.</p>
      )}
    </div>
  );
}

export default Journal;
