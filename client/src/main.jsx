import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Redux Setup
import { Provider } from 'react-redux';
import store from './store.js';
import axios from 'axios';
import { buildApiUrl } from './api.js';

// This is the most important line for your "Session Expired" problem
axios.defaults.withCredentials = true; 
axios.defaults.baseURL = buildApiUrl('');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
