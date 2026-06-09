import axios from 'axios';

const api = axios.create({

  baseURL: 'https://task-manager-5-pjs1.onrender.com/api'
});


// ADD TOKEN
api.interceptors.request.use((config) => {

  const token =
    localStorage.getItem('token');

  if (token) {

    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

export default api;