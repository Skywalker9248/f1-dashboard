import axios from 'axios';

// This automatically picks the right URL:
// Localhost when you run on your PC, Render URL when on Vercel
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

export default API;
