import './style.css';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from './counter.js';

// Inject Eco Plate themed content
document.querySelector('#app').innerHTML = `
  <div class="vite-section">
    <div class="logos">
      <a href="https://vite.dev" target="_blank">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
      </a>
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
        <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
      </a>
    </div>
    <h1>Welcome to Eco Plate!</h1>
    <p class="read-the-docs">Click the button to track your eco-friendly actions:</p>
    <div class="card eco-card">
      <button id="counter" type="button">0 Actions Completed</button>
    </div>
  </div>
`;

setupCounter(document.querySelector('#counter'));
