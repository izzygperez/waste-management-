// src/pantry.js

// DOM Elements
const pantryGrid = document.getElementById('pantryGrid');
const emptyState = document.getElementById('emptyState');
const pantryActions = document.getElementById('pantryActions');
const clearBtn = document.getElementById('clearPantryBtn');
const scanBtn = document.getElementById('scanBtn');
const addBtn = document.getElementById('addBtn');
const manualInput = document.getElementById('manualInput');
const cameraOverlay = document.getElementById('cameraOverlay');
const scanStatus = document.getElementById('scanStatus');

// 1. Load Pantry
let pantry = JSON.parse(localStorage.getItem('ecoPlatePantry')) || [];

function renderPantry() {
  if (!pantryGrid) return;

  pantryGrid.innerHTML = '';
  
  if (pantry.length === 0) {
    if(emptyState) emptyState.style.display = 'block';
    if(pantryActions) pantryActions.style.display = 'none';
    if(clearBtn) clearBtn.style.display = 'none';
  } else {
    if(emptyState) emptyState.style.display = 'none';
    if(pantryActions) pantryActions.style.display = 'block';
    if(clearBtn) clearBtn.style.display = 'block';

    pantry.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'pantry-item';
      div.innerHTML = `
        <span>${capitalize(item)}</span>
        <i class="fa-solid fa-xmark remove-btn" onclick="removeItem(${index})"></i>
      `;
      pantryGrid.appendChild(div);
    });
  }
}

// 2. Helper Functions
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function saveAndRender() {
  localStorage.setItem('ecoPlatePantry', JSON.stringify(pantry));
  renderPantry();
}

function addItems(itemsStr) {
  const newItems = itemsStr.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
  pantry = [...new Set([...pantry, ...newItems])];
  saveAndRender();
}

// 3. Global Remove Function
window.removeItem = function(index) {
  pantry.splice(index, 1);
  saveAndRender();
}

// 4. Event Listeners
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if(confirm('Clear entire pantry?')) {
      pantry = [];
      saveAndRender();
    }
  });
}

if (addBtn && manualInput) {
  addBtn.addEventListener('click', () => {
    if(manualInput.value.trim()) {
      addItems(manualInput.value);
      manualInput.value = '';
    }
  });
}

// 5. SMART SCANNER LOGIC (Alert Removed)
if (scanBtn) {
  scanBtn.addEventListener('click', () => {
    cameraOverlay.classList.remove('hidden');
    scanStatus.textContent = "Connecting to Fridge Cam...";
    scanStatus.style.color = "white"; // Reset color

    setTimeout(() => { scanStatus.textContent = "Detecting Items"; }, 2000);

    setTimeout(() => {
      // Simulated detected items
      const detected = "milk, red pepper, onion, tofu";
      addItems(detected);
      
      // Update Status Text instead of Alert
      scanStatus.textContent = "Scan Complete! Adding items...";
      scanStatus.style.color = "#4caf50"; // Green text

      // Close automatically after 1.2 seconds
      setTimeout(() => {
        cameraOverlay.classList.add('hidden');
        // Scroll to bottom to show new items
        pantryGrid.scrollTop = pantryGrid.scrollHeight;
      }, 1200);
      
    }, 3500);
  });
}

// Init
renderPantry();
