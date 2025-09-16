import React, { useState } from 'react';
import { Card, Button, Typography, Space, List, Tag } from 'antd';
import { getViewedProductsApi, getGuestViewedProductsApi } from '../util/api';

const { Title, Text } = Typography;

const TestViewedProducts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing viewed products API...');
      
      // Check both token keys
      const accessToken = localStorage.getItem("access_token");
      const token = localStorage.getItem("token");
      console.log('Access token:', accessToken ? accessToken.substring(0, 20) + '...' : 'No access_token');
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('Using token:', accessToken || token || 'None');
      
      // Test with correct parameters as per your documentation
      const testCases = [
        { name: 'User API (correct params)', api: () => getViewedProductsApi({ page: 1, limit: 10, days: 30 }) },
        { name: 'User API (with sortBy)', api: () => getViewedProductsApi({ page: 1, limit: 10, sortBy: 'viewedAt', sortOrder: 'DESC', days: 30 }) },
        { name: 'Guest API', api: () => getGuestViewedProductsApi({ page: 1, limit: 10, days: 30 }) }
      ];
      
      for (const testCase of testCases) {
        try {
          console.log(`Testing ${testCase.name}...`);
          const response = await testCase.api();
          console.log(`${testCase.name} success:`, response?.data);
          
          if (response?.data?.success && response?.data?.data?.viewedProducts?.length > 0) {
            setData({ 
              success: true, 
              api: testCase.name,
              data: response?.data,
              token: token ? 'Present' : 'Missing',
              count: response?.data?.data?.viewedProducts?.length
            });
            return;
          } else {
            console.log(`${testCase.name} returned empty data:`, response?.data);
          }
        } catch (error) {
          console.log(`${testCase.name} failed:`, error.response?.status, error.message);
        }
      }
      
      setData({ 
        error: 'Both APIs returned empty data or failed',
        token: token ? 'Present' : 'Missing',
        note: 'Check if userId is NULL in database'
      });
    } catch (error) {
      console.error('API Error:', error);
      setData({ 
        error: error.message, 
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        token: localStorage.getItem("access_token") ? 'Present' : 'Missing'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="🔧 Test Viewed Products API" style={{ margin: '16px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button type="primary" onClick={testAPI} loading={loading}>
          Test API Call
        </Button>
        
        {data && (
          <div>
            <Title level={4}>API Response:</Title>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default TestViewedProducts;
