import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { config } from './config/portfolio';
import './styles.css';
if (/^#[0-9a-f]{6}$/i.test(config.accentColor))
  document.documentElement.style.setProperty('--accent', config.accentColor);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
