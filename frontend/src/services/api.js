import axios from 'axios';

// Central axios instance. Every request/response in the app goes through
// here so auth headers and error handling are consistent everywhere.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('savora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says our session is invalid/expired, clear it so the
// UI can redirect to login instead of getting stuck in a broken state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('savora_token');
      localStorage.removeItem('savora_user');
    }
    return Promise.reject(error);
  }
);

// Small helper so components can write:  const { data } = await apiGet('/menu')
// and get back response.data.data directly (our backend's payload field),
// or throw a readable error message string on failure.
function extractMessage(err) {
  return err.response?.data?.message || 'Something went wrong. Please try again.';
}

export default api;
export { extractMessage };
