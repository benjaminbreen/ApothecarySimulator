import React from 'react';
import Linkify from 'react-linkify';

const CommandLinkify = ({ text, onCommandClick }) => {
  const componentDecorator = (decoratedHref, decoratedText, key) => {
    if (decoratedText.startsWith('#')) {
      const command = decoratedText.substring(1).toLowerCase(); // Lowercase for consistent command handling
      return (
        <button
          key={key}
          className="command-link"
          onClick={() => onCommandClick(command)}
        >
          {decoratedText}
        </button>
      );
    }
    return (
      <a href={decoratedHref} key={key}>
        {decoratedText}
      </a>
    );
  };

  return (
    <Linkify componentDecorator={componentDecorator}>
      {text}
    </Linkify>
  );
};

export default CommandLinkify;
