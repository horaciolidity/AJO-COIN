import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TelegramProvider } from './context/TelegramContext';
import { Web3Provider } from './context/Web3Context';
import { GameProvider } from './context/GameContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TelegramProvider>
        <Web3Provider>
          <GameProvider>
            <App />
          </GameProvider>
        </Web3Provider>
      </TelegramProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
