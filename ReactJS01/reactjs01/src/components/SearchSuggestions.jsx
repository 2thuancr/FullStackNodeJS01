import React, { useState, useEffect, useMemo } from 'react';
import { AutoComplete, Input, Spin, Typography, Tag, Space } from 'antd';
import { SearchOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { getSearchSuggestionsApi } from '../util/api';

const { Text } = Typography;
const { Search } = Input;

const SearchSuggestions = ({ 
  onSearch, 
  onSuggestionSelect,
  placeholder = "Tìm kiếm sản phẩm...",
  size = "large",
  style = {},
  showSearchButton = true,
  allowClear = true
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestionsCache, setSuggestionsCache] = useState({});

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (query) => {
    if (!query || query.trim().length === 0) return;
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Fetch suggestions from API
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Check cache first
    if (suggestionsCache[query]) {
      setSuggestions(suggestionsCache[query]);
      return;
    }

    setLoading(true);
    try {
      const response = await getSearchSuggestionsApi({ 
        q: query, 
        limit: 8 
      });
      
      if (response.data.success) {
        const apiSuggestions = response.data.data.map(item => ({
          value: item.text,
          label: item.text,
          type: 'api',
          score: item.score
        }));

        // Combine with search history
        const historySuggestions = searchHistory
          .filter(item => 
            item.toLowerCase().includes(query.toLowerCase()) && 
            !apiSuggestions.some(s => s.value === item)
          )
          .map(item => ({
            value: item,
            label: item,
            type: 'history'
          }));

        const allSuggestions = [...apiSuggestions, ...historySuggestions].slice(0, 10);
        
        setSuggestions(allSuggestions);
        
        // Cache the results
        setSuggestionsCache(prev => ({
          ...prev,
          [query]: allSuggestions
        }));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to history suggestions
      const historySuggestions = searchHistory
        .filter(item => item.toLowerCase().includes(query.toLowerCase()))
        .map(item => ({
          value: item,
          label: item,
          type: 'history'
        }));
      setSuggestions(historySuggestions);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useMemo(() => {
    let timeoutId;
    return (query) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchSuggestions(query);
      }, 200);
    };
  }, [searchHistory, suggestionsCache]);

  // Handle input change
  const handleInputChange = (value) => {
    setSearchInput(value);
    setShowSuggestions(value.length >= 2);
    
    if (value.length >= 2) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    const query = value || searchInput;
    if (query && query.trim().length > 0) {
      saveToHistory(query.trim());
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query.trim());
      }
    }
  };

  // Handle suggestion select
  const handleSuggestionSelect = (value) => {
    setSearchInput(value);
    setShowSuggestions(false);
    saveToHistory(value);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(value);
    }
    
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle clear
  const handleClear = () => {
    setSearchInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Generate options for AutoComplete
  const generateOptions = () => {
    if (suggestions.length === 0 && searchInput.length < 2) {
      // Show search history when no input
      return searchHistory.slice(0, 5).map(item => ({
        value: item,
        label: (
          <Space>
            <ClockCircleOutlined style={{ color: '#999' }} />
            <Text>{item}</Text>
          </Space>
        ),
        type: 'history'
      }));
    }

    return suggestions.map(suggestion => ({
      value: suggestion.value,
      label: (
        <Space>
          {suggestion.type === 'api' ? (
            <FireOutlined style={{ color: '#ff4d4f' }} />
          ) : (
            <ClockCircleOutlined style={{ color: '#999' }} />
          )}
          <Text>{suggestion.label}</Text>
          {suggestion.type === 'api' && suggestion.score && (
            <Tag size="small" color="blue">
              {Math.round(suggestion.score * 100)}%
            </Tag>
          )}
        </Space>
      ),
      type: suggestion.type
    }));
  };

  return (
    <AutoComplete
      value={searchInput}
      options={generateOptions()}
      onSearch={handleInputChange}
      onSelect={handleSuggestionSelect}
      onBlur={() => {
        setTimeout(() => setShowSuggestions(false), 200);
      }}
      onFocus={() => {
        if (searchInput.length >= 2) {
          setShowSuggestions(true);
        }
      }}
      style={{ width: '100%', ...style }}
      dropdownStyle={{
        maxHeight: 300,
        overflow: 'auto'
      }}
      filterOption={(inputValue, option) =>
        option.value.toLowerCase().includes(inputValue.toLowerCase())
      }
      notFoundContent={
        loading ? (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <Spin size="small" /> Đang tải gợi ý...
          </div>
        ) : searchInput.length >= 2 ? (
          <div style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
            Không tìm thấy gợi ý cho "{searchInput}"
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
            Nhập ít nhất 2 ký tự để tìm kiếm
          </div>
        )
      }
    >
      {showSearchButton ? (
        <Input.Search
          onSearch={handleSearch}
          enterButton
          size={size}
          placeholder={placeholder}
          allowClear={allowClear}
          onClear={handleClear}
          style={{ width: '100%' }}
        />
      ) : (
        <Input
          size={size}
          placeholder={placeholder}
          allowClear={allowClear}
          onClear={handleClear}
          style={{ width: '100%' }}
        />
      )}
    </AutoComplete>
  );
};

export default SearchSuggestions;
