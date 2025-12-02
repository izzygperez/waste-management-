// recipes.js

const messagesEl = document.getElementById('messages');
const ingredientsInput = document.getElementById('ingredients');
const sendBtn = document.getElementById('send');
const resultsEl = document.getElementById('results');
const impactCountEl = document.getElementById('impactCount');
const usePantryLink = document.getElementById('usePantryLink');
const pantryStatus = document.getElementById('pantryStatus');

// Modal Elements
const recipeModal = document.getElementById('recipeModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close-modal');

const apiKey = "f2e067e093cd4976aaffdecc614af808";

// 1. Load Impact Score
let itemsSaved = parseInt(localStorage.getItem('ecoPlateScore')) || 0;
if(impactCountEl) impactCountEl.textContent = itemsSaved;

function updateScore(count) {
  itemsSaved += count;
  localStorage.setItem('ecoPlateScore', itemsSaved);
  if(impactCountEl) impactCountEl.textContent = itemsSaved;
}

// 2. Chat Helper
function addMessage(text, cls = 'bot') {
  const li = document.createElement('li');
  li.innerHTML = text;
  li.className = cls;
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// 3. Load From Pantry
function loadPantryIngredients() {
  const pantry = JSON.parse(localStorage.getItem('ecoPlatePantry')) || [];
  if(pantry.length === 0) {
    addMessage("Your pantry is empty! Go to the <a href='/pantry.html'>Pantry Page</a> to scan items.", 'bot');
    return;
  }
  
  const ingredientsStr = pantry.join(', ');
  ingredientsInput.value = ingredientsStr;
  addMessage(`I grabbed these from your pantry: <strong>${ingredientsStr}</strong>`, 'bot');
  pantryStatus.innerHTML = `<i class="fa-solid fa-check"></i> Loaded ${pantry.length} items from pantry`;
  setTimeout(() => sendBtn.click(), 800);
}

if(usePantryLink) {
  usePantryLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadPantryIngredients();
  });
}

const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get('usePantry') === 'true') {
  loadPantryIngredients();
}

// 4. Fetch Search Results
async function fetchRecipes(ingredients) {
  const params = new URLSearchParams({
    ingredients,
    number: '6',
    ranking: '1',
    ignorePantry: 'true',
    apiKey
  });

  const url = `https://api.spoonacular.com/recipes/findByIngredients?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// 5. Fetch Full Recipe Details (NEW)
async function getRecipeDetails(id) {
  // Show Modal with Loader
  recipeModal.classList.remove('hidden');
  modalBody.innerHTML = '<div class="loader"><i class="fa-solid fa-spinner fa-spin"></i> Fetching cooking instructions...</div>';

  try {
    const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    // Format the data into HTML
    modalBody.innerHTML = `
      <img src="${data.image}" class="modal-img" alt="${data.title}">
      <h2>${data.title}</h2>
      
      <div class="recipe-meta">
        <span><i class="fa-solid fa-clock"></i> ${data.readyInMinutes} mins</span>
        <span><i class="fa-solid fa-utensils"></i> ${data.servings} servings</span>
        <span><i class="fa-solid fa-leaf"></i> ${data.vegetarian ? 'Vegetarian' : 'Non-Veg'}</span>
      </div>

      <div class="recipe-cols">
        <div class="ing-col">
          <h3>Ingredients</h3>
          <ul>
            ${data.extendedIngredients.map(ing => `<li>• ${ing.original}</li>`).join('')}
          </ul>
        </div>
        <div class="inst-col">
          <h3>Instructions</h3>
          <ol>
            ${data.analyzedInstructions.length > 0 
                ? data.analyzedInstructions[0].steps.map(s => `<li>${s.step}</li>`).join('') 
                : '<p>No instructions provided.</p>'}
          </ol>
        </div>
      </div>
      
      <a href="${data.sourceUrl}" target="_blank" class="primary-btn small-btn" style="margin-top:2rem;">View Original Source</a>
    `;

  } catch (err) {
    modalBody.innerHTML = `<p style="color:red">Error loading details. <a href="#" onclick="recipeModal.classList.add('hidden')">Close</a></p>`;
  }
}

// 6. Main Search Logic
sendBtn.addEventListener('click', async () => {
  const ingredients = ingredientsInput.value.trim();
  if (!ingredients) return;

  addMessage(ingredients, 'user');
  resultsEl.innerHTML = '<div class="loader"><i class="fa-solid fa-spinner fa-spin"></i> Checking database...</div>';

  try {
    const data = await fetchRecipes(ingredients);
    resultsEl.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      addMessage('I couldn\'t find any recipes for that. Try simpler ingredients.', 'bot');
      return;
    }

    const savedCount = data[0].usedIngredientCount;
    updateScore(savedCount);
    addMessage(`Found ${data.length} recipes!`, 'bot');

    data.forEach(r => {
      const div = document.createElement('div');
      div.className = 'recipe';
      div.innerHTML = `
        <img src="${r.image}" alt="${r.title}" loading="lazy">
        <div class="recipe-info">
          <h3>${r.title}</h3>
          <p class="stats">
            <span style="color:green">✅ Uses ${r.usedIngredientCount}</span>
            <span style="color:red">❌ Needs ${r.missedIngredientCount}</span>
          </p>
          <!-- Changed Link to Button with OnClick -->
          <button class="view-btn" onclick="getRecipeDetails(${r.id})">View Recipe</button>
        </div>
      `;
      resultsEl.appendChild(div);
    });

  } catch (err) {
    addMessage('Sorry, I had trouble reaching the recipe database.', 'bot');
    resultsEl.innerHTML = '';
  }
});

ingredientsInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// Modal Close Logic
closeModal.addEventListener('click', () => {
  recipeModal.classList.add('hidden');
});

// Close when clicking outside content
window.addEventListener('click', (e) => {
  if (e.target == recipeModal) {
    recipeModal.classList.add('hidden');
  }
});