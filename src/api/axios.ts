import axios from 'axios';

const api = axios.create({
  baseURL: 'https://frontend-take-home-service.fetch.com',
  withCredentials: true, // send and receive auth cookie
});

export default api;
