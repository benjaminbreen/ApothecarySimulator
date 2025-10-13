import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import ReactMarkdown from 'react-markdown';
import Draggable from 'react-draggable';
import { requestDalleImage } from './core/services/api';
import './CommonplaceBook.css';

const CommonplaceBook = ({ isOpen, toggleCommonplaceBook }) => {
  const [pages, setPages] = useState([{ leftContent: "", rightContent: "" }]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const savedPages = localStorage.getItem('commonplaceBookPages');
    if (savedPages) {
      setPages(JSON.parse(savedPages));
    }
  }, []);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'inventoryItem',
    drop: async (item) => await addItemToPage(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addItemToPage = async (item) => {
    const imageUrl = await requestDalleImage(item.name);
    const imageMarkdown = imageUrl ? `![${item.name}](${imageUrl})` : '';
    const newContent = `${item.name}: ${item.description}\n\n${imageMarkdown}\n\n`;

    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPage] = {
        ...newPages[currentPage],
        rightContent: newPages[currentPage].rightContent + newContent // Adds to rightContent instead of leftContent
      };
      return newPages;
    });
  };

  const handleLeftPageChange = (e) => {
    const { value } = e.target;
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPage] = {
        ...newPages[currentPage],
        rightContent: value // Updates rightContent instead of leftContent
      };
      return newPages;
    });
  };

  const handleRightPageChange = (e) => {
    const { value } = e.target;
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPage] = {
        ...newPages[currentPage],
        leftContent: value // Updates leftContent instead of rightContent
      };
      return newPages;
    });
  };

  const saveContent = () => {
    localStorage.setItem('commonplaceBookPages', JSON.stringify(pages));
  };

  const exportToText = () => {
    const textContent = pages.map((page, index) => 
      `Page ${index + 1}:\nLeft Page:\n${page.leftContent}\n\nRight Page:\n${page.rightContent}`
    ).join('\n\n');
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commonplace_book.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setPages([...pages, { leftContent: "", rightContent: "" }]);
      setCurrentPage(pages.length);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const eraseCurrentPage = () => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPage] = { leftContent: "", rightContent: "" };
      return newPages;
    });
  };

  if (!isOpen) return null;

  return (
    <Draggable>
      <div className="commonplace-book-container" ref={drop}>
        <div className="book-content">
          {/* Left Page - Text Entry */}
          <div className="left-page">
            <div className="page-content">
              <textarea
                className="page-text"
                value={pages[currentPage].leftContent} // Refers to leftContent
                onChange={handleRightPageChange} // Handles change to rightContent (swap)
                placeholder="Write here..."
              />
            </div>
          </div>

          {/* Right Page */}
          <div className="right-page">
            <div className="page-content">
              <ReactMarkdown className="page-text">
                {pages[currentPage].rightContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="commonplace-book-controls">
          <div>
            <button onClick={prevPage}>Previous Page</button>
            <button onClick={nextPage}>Next Page</button>
            <button onClick={saveContent}>Save</button>
            <button onClick={exportToText}>Export text</button>
            <button onClick={eraseCurrentPage}>Erase Page</button> {/* New Erase button */}
          </div>
          <div>
            <button className="close-button" onClick={toggleCommonplaceBook}>Close book</button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default CommonplaceBook;
