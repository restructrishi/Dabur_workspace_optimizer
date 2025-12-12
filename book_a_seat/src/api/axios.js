
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || '';
let baseURL = '/api/';
if (SERVER_URL) {
  baseURL = SERVER_URL.endsWith('/') ? SERVER_URL + 'api/' : SERVER_URL + '/api/';
} else if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  baseURL = 'http://localhost:3005/api/';
}

export default axios.create({
  baseURL,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  withCredentials: true,
});
