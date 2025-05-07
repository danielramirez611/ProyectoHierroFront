import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7268/api' // ← Ajusta según tu backend
});

export default api;
