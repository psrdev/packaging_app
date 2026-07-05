import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Environment Settings - Uncomment/Comment to switch:
// export const API_URL = 'http://192.168.29.207:8000/api'; // Local Testing
export const API_URL = 'https://pack.awadhcrafts.com/api'; // Live Production

const client = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Accept': 'application/json',
  },
});

// Interceptor to load Bearer token dynamically
client.interceptors.request.use(
  async (config) => {
    // Resolve authentication token
    const token = await AsyncStorage.getItem('AUTH_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
