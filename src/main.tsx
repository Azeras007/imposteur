import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppStore } from './store/AppStore';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStore>
      <App />
    </AppStore>
  </StrictMode>,
);
