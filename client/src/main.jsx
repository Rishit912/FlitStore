import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Redux Setup
import { Provider } from 'react-redux';
import store from './store.js';
import axios from 'axios';

// This is the most important line for your "Session Expired" problem
axios.defaults.withCredentials = true; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
