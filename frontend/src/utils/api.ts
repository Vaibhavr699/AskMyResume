import axios from 'axios';
import Router from 'next/router';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Failed to read token from localStorage:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('token');
      } catch (err) {
        console.error('Failed to remove token from localStorage:', err);
      }

      if (typeof window !== 'undefined') {
        Router.push('/auth/login');
      }
    }

    return Promise.reject(error);
  }
);

export const clearChatData = () => {
  try {
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (key.startsWith('chat_messages_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear chat data from localStorage:', error);
  }
};

export default api;
