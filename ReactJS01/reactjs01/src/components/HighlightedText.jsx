import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const HighlightedText = ({ 
  text, 
  highlights = [], 
  searchTerm = '', 
  maxLength = 200,
  className = '',
  style = {}
}) => {
  // If no highlights provided, do simple highlighting
  if (!highlights || highlights.length === 0) {
    if (!searchTerm) return <Text className={className} style={style}>{text}</Text>;
    
    // Simple case-insensitive highlighting
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <Text className={className} style={style}>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <Text key={index} mark style={{ backgroundColor: '#fff2e8', color: '#d4380d' }}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  }

  // Process Elasticsearch highlights
  const processHighlights = (originalText, highlightArray) => {
    if (!highlightArray || highlightArray.length === 0) {
      return originalText;
    }

    // Get the first highlight (usually the most relevant)
    const highlight = highlightArray[0];
    
    // Split by <em> tags and process
    const parts = highlight.split(/(<em>.*?<\/em>)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('<em>') && part.endsWith('</em>')) {
        // Remove <em> tags and highlight the content
        const content = part.replace(/<\/?em>/g, '');
        return (
          <Text key={index} mark style={{ backgroundColor: '#fff2e8', color: '#d4380d', fontWeight: 'bold' }}>
            {content}
          </Text>
        );
      }
      return part;
    });
  };

  // Truncate text if too long
  const truncatedText = text && text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;

  return (
    <Text className={className} style={style}>
      {processHighlights(truncatedText, highlights)}
    </Text>
  );
};

export default HighlightedText;