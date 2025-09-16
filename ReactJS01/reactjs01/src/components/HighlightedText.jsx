import React from 'react';

const HighlightedText = ({ text, highlights = [] }) => {
  if (!highlights || highlights.length === 0) {
    return <span>{text}</span>;
  }

  // Combine all highlight arrays into one
  const allHighlights = highlights.flat();
  
  if (allHighlights.length === 0) {
    return <span>{text}</span>;
  }

  // Find the first highlight that matches the text
  const matchingHighlight = allHighlights.find(highlight => 
    text.includes(highlight.replace(/<[^>]*>/g, '')) // Remove HTML tags for comparison
  );

  if (!matchingHighlight) {
    return <span>{text}</span>;
  }

  // Parse the highlight HTML and create React elements
  const parseHighlight = (highlight) => {
    const parts = highlight.split(/(<[^>]*>)/);
    return parts.map((part, index) => {
      if (part.startsWith('<') && part.endsWith('>')) {
        // This is an HTML tag, skip it
        return null;
      } else if (part.trim()) {
        // This is text content
        return (
          <span 
            key={index}
            style={{
              backgroundColor: '#fff3cd',
              padding: '1px 2px',
              borderRadius: '2px',
              fontWeight: 'bold'
            }}
          >
            {part}
          </span>
        );
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <span>
      {parseHighlight(matchingHighlight)}
    </span>
  );
};

export default HighlightedText;





