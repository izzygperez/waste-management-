// recipes.js

const messagesEl = document.getElementById('messages');
const ingredientsInput = document.getElementById('ingredients');
const sendBtn = document.getElementById('send');
const resultsEl = document.getElementById('results');

// Hardcoded Spoonacular API key
const apiKey = "f2e067e093cd4976aaffdecc614af808";

// Add a message to the chat
function addMessage(text, cls = 'bot') {
  const li = document.createElement('li');
  li.textContent = text;
  li.className = cls;
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Fetch recipes from Spoonacular
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
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error: ${res.status} ${body}`);
  }
  return res.json();
}

// Click handler for "Find Recipes" button
sendBtn.addEventListener('click', async () => {
  const ingredients = ingredientsInput.value.trim();
  if (!ingredients) return addMessage('Please enter one or more ingredients.', 'bot');

  addMessage(ingredients, 'user');
  ingredientsInput.value = '';
  resultsEl.innerHTML = '';

  resultsEl.innerHTML = '<div class="loader">Fetching the best recipes for you...</div>';

  try {
    const data = await fetchRecipes(ingredients);
    resultsEl.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      addMessage('No recipes found for those ingredients.', 'bot');
      return;
    }

    const summary = document.createElement('div');
    summary.style.marginBottom = '0.75rem';
    summary.innerHTML = `<strong>Found ${data.length} recipes. Showing top results.</strong>`;
    resultsEl.appendChild(summary);


    data.forEach(r => {
      const div = document.createElement('div');
      div.className = 'recipe';
      div.innerHTML = `
        <strong>${escapeHtml(r.title)}</strong>
        <div>Used: ${r.usedIngredientCount} — Missing: ${r.missedIngredientCount}</div>
        <a href="https://spoonacular.com/recipes/${encodeURIComponent(r.title)}-${r.id}" target="_blank">View recipe</a>
      `;
      resultsEl.appendChild(div);
    });

  } catch (err) {
    addMessage('Error fetching recipes: ' + err.message, 'bot');
    resultsEl.innerHTML = '';
  }
});
ingredientsInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

// Escape HTML to prevent injection
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}
