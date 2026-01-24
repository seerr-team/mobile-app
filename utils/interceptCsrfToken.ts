import axios, { type AxiosRequestHeaders } from 'axios';

let csrfToken: string | null = null;
axios.interceptors.response.use((response) => {
  const cookies = response.headers['set-cookie'] || [];
  for (const cookie of cookies) {
    if (cookie.startsWith(response.config.xsrfCookieName || 'XSRF-TOKEN')) {
      csrfToken = cookie.split(';')[0].split('=')[1];
      break;
    }
  }
  return response;
});
axios.interceptors.request.use((config) => {
  if (csrfToken) {
    const csrfHeaderName = config.xsrfHeaderName || 'X-XSRF-TOKEN';
    config.headers = {
      ...config.headers,
      [csrfHeaderName]: csrfToken,
    } as AxiosRequestHeaders;
  }
  return config;
});
