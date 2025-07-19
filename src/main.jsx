import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './components/ThemeContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.js';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <I18nextProvider i18n={i18n}>
    <ThemeProvider>
      <App />
      <ToastContainer />
    </ThemeProvider>
  </I18nextProvider>
  // </StrictMode>,
);