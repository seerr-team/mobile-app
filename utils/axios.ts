import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  // Allow HTTP requests
  validateStatus: (status: number) => status >= 200 && status < 500,
});

export default axiosInstance;
