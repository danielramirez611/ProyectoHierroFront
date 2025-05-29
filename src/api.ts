import axios from 'axios';

// Crear instancia base de axios
const api = axios.create({
  baseURL: 'https://localhost:7268/api'
});

// Agregar interceptor para incluir el token JWT en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
