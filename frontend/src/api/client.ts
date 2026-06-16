import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo, localhost works for iOS simulator, but for Android or physical devices
// we should use the machine's IP address or the ngrok tunnel if provided.
// Since we have ngrok or standard dev, we can point to the dev machine's IP for now
// Update this to match your backend's IP and port
const API_URL = 'http://192.168.1.9:5000/api/v1'; 

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      const { useAuthStore } = await import('../store/authStore');
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
