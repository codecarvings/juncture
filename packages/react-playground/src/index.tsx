import { Engine } from '@codecarvings/juncture';
import { JunctureProvider } from '@codecarvings/react-juncture';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Primary } from './state/primary';

const engine = new Engine();
engine.startService({ id: 'primary', juncture: Primary });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <JunctureProvider engine={engine}>
      <App />
    </JunctureProvider>
  </React.StrictMode>
);

setTimeout(() => {
  // root.unmount();
}, 10000);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
