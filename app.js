// Emoji map for dish categories/names (placeholder until real images)
const DISH_EMOJI = {
  // Составные блюда
  'макароны с фаршем': '🍝', 'рис с морепродуктами': '🦐',
  'свинина в air fryer': '🥩', 'капустный салат': '🥗',
  'куриные ноги': '🍗', 'домашняя шаурма': '🌯',
  'гречка по-тбилисски': '🫘', 'салат вальдорф': '🥗',
  'киш с брокколи': '🥧', 'капустно-куриный': '🥧',
  'кура в соусе': '🍗', 'свинина в духовке': '🥩',
  // Целые блюда
  'холодец': '🍖', 'котлеты': '🥩', 'свинина': '🥩', 'фарш': '🥩',
  'кура': '🍗', 'паштет': '🫕', 'exponenta': '🥤',
  'милкшейк': '🥛', 'сырники': '🧁', 'омлет': '🍳', 'яичница': '🍳',
  'творог': '🧀', 'йогурт': '🥛', 'гречка': '🫘', 'рис': '🍚',
  'картошка': '🥔', 'макароны': '🍝', 'горошек': '🫛', 'пюре': '🥔',
  'гренки': '🍞', 'капуст': '🥬', 'овощи': '🥬', 'салат': '🥗',
  'борщ': '🍲', 'чечевич': '🍲', 'пельмени': '🥟', 'тунец': '🐟',
  'фо': '🍜', 'шаурма': '🌯', 'киш': '🥧', 'бигус': '🥘',
  'пирог': '🥧', 'тортилья': '🌮', 'морепродукт': '🦐', 'рагу': '🥘',
  'сэндвич': '🥪', 'бутер': '🥪', 'овсянка': '🥣', 'запеканка': '🍰',
  'banana': '🍌', 'гранола': '🥣', 'egg': '🥚', 'лобио': '🫘',
  'врап': '🌯', 'пудинг': '🍮', 'шакшука': '🍳', 'оладьи': '🥞',
  'плов': '🍛', 'помидор': '🍅', 'огурц': '🥒', 'филе': '🍗',
  'от бабушки': '🎁', 'от оли': '🎁',
};

function getDishEmoji(name) {
  const lower = name.toLowerCase();
  const sorted = Object.entries(DISH_EMOJI).sort((a, b) => b[0].length - a[0].length);
  for (const [key, emoji] of sorted) {
    if (lower.includes(key)) return emoji;
  }
  return '🍽';
}

function getCookClass(cook) {
  const c = cook.toLowerCase().trim();
  if (c.includes('тима') || c === 'т') return 'tima';
  if (c.includes('катя') || c === 'к') return 'katya';
  if (c.includes('все') || c.includes('вместе')) return 'all';
  if (c.includes('бабушк') || c.includes('оля')) return 'olya';
  return 'a';
}

function getCookLabel(cook) {
  const c = cook.toLowerCase().trim();
  if (c.includes('тима') || c === 'т') return 'Тима';
  if (c.includes('катя') || c === 'к') return 'Катя';
  if (c.includes('все') || c.includes('вместе')) return 'Все вместе';
  if (c.includes('бабушк') || c.includes('оля')) return 'Оля';
  if (c === 'а' || c.includes('мам')) return 'А';
  return cook;
}

function getTodayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function findDish(dishes, mealName) {
  if (!mealName) return null;
  const lower = mealName.toLowerCase();
  return dishes.find(d => {
    const dLower = d.name.toLowerCase();
    return lower.includes(dLower) || dLower.includes(lower) ||
      lower.split(/\s*[+,]\s*/).some(part => dLower.includes(part.trim()));
  });
}

function scoreClass(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '';
  if (n >= 7) return 'high';
  if (n >= 4) return 'mid';
  return 'low';
}

// --- Edit mode ---
let editMode = false;

function toggleEditMode() {
  editMode = !editMode;
  document.body.classList.toggle('edit-mode', editMode);
  const btn = document.getElementById('editModeBtn');
  if (btn) btn.textContent = editMode ? 'Готово' : 'Изменить';
  renderMenu(window._data);
}

// --- Meal actions ---
function removeMeal(dayIdx, meal, mealIdx) {
  const day = window._data.plan.days[dayIdx];
  if (day[meal]) {
    day[meal].splice(mealIdx, 1);
  }
  saveLocal();
  renderMenu(window._data);
}

function toggleDone(dayIdx, meal, mealIdx) {
  const day = window._data.plan.days[dayIdx];
  if (day[meal] && day[meal][mealIdx]) {
    const item = day[meal][mealIdx];
    item.status = item.status === 'done' ? '' : 'done';
  }
  saveLocal();
  renderMenu(window._data);
}

// --- localStorage ---
function saveLocal() {
  try {
    localStorage.setItem('familyKitchenPlan', JSON.stringify(window._data.plan));
  } catch (e) { /* ignore */ }
}

function loadLocal() {
  try {
    const saved = localStorage.getItem('familyKitchenPlan');
    return saved ? JSON.parse(saved) : null;
  } catch (e) { return null; }
}

function resetLocal() {
  localStorage.removeItem('familyKitchenPlan');
  location.reload();
}

// Render a single meal item with action buttons
function renderMealItem(m, dishes, dayIdx, meal, mealIdx) {
  const dish = findDish(dishes, m.name);
  const emoji = getDishEmoji(m.name);
  const macros = dish ? `${dish.kcal} ккал / Б${dish.protein} Ж${dish.fat} У${dish.carbs}` : '';
  const isDone = m.status === 'done';
  const isLeftover = m.leftover;

  const doneBtn = `<button class="meal-btn meal-btn-done ${isDone ? 'active' : ''}" onclick="toggleDone(${dayIdx},'${meal}',${mealIdx})" title="Готово">&#10003;</button>`;
  const removeBtn = editMode ? `<button class="meal-btn meal-btn-remove" onclick="removeMeal(${dayIdx},'${meal}',${mealIdx})" title="Убрать">&#10005;</button>` : '';
  const dragHandle = editMode ? '<span class="drag-handle">&#9776;</span>' : '';

  return `
    <div class="meal-item ${isDone ? 'done' : ''} ${isLeftover ? 'leftover' : ''}"
         data-day="${dayIdx}" data-meal="${meal}" data-idx="${mealIdx}">
      ${dragHandle}
      <span class="meal-emoji">${emoji}</span>
      <div class="meal-info">
        <span class="meal-name">${m.name}</span>
        ${macros ? `<span class="meal-macros">${macros}</span>` : ''}
      </div>
      ${isLeftover ? '<span class="leftover-badge">остатки</span>' : ''}
      ${m.cook && !isLeftover ? `<span class="cook-badge ${getCookClass(m.cook)}">${getCookLabel(m.cook)}</span>` : ''}
      <div class="meal-actions">
        ${doneBtn}
        ${removeBtn}
      </div>
    </div>
  `;
}

// Render a meal section (lunch or dinner)
function renderMealSection(label, items, dishes, dayIdx, meal) {
  if (!items || items.length === 0) {
    // In edit mode, show empty drop zone
    if (editMode) {
      return `
        <div class="meal-section">
          <div class="meal-section-label">${label}</div>
          <div class="meals-list" data-day="${dayIdx}" data-meal="${meal}"></div>
        </div>
      `;
    }
    return '';
  }
  const html = items.map((m, i) => renderMealItem(m, dishes, dayIdx, meal, i)).join('');
  return `
    <div class="meal-section">
      <div class="meal-section-label">${label}</div>
      <div class="meals-list" data-day="${dayIdx}" data-meal="${meal}">${html}</div>
    </div>
  `;
}

// Render functions
function renderMenu(data) {
  const grid = document.getElementById('menuGrid');
  const todayIdx = getTodayIndex();
  const { plan, dishes } = data;

  document.getElementById('weekLabel').textContent =
    `Неделя ${plan.week.replace('2026-W', '')} — ${new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`;

  grid.innerHTML = plan.days.map((day, i) => {
    const isToday = i === todayIdx;
    const allItems = [...(day.lunch || []), ...(day.dinner || [])];
    const allDone = allItems.length > 0 && allItems.every(m => m.status === 'done');
    const hasAny = allItems.length > 0;

    const lunchHTML = renderMealSection('Обед', day.lunch, dishes, i, 'lunch');
    const dinnerHTML = renderMealSection('Ужин', day.dinner, dishes, i, 'dinner');

    let contentHTML;
    if (editMode) {
      // Always show both sections in edit mode for drop targets
      contentHTML = (lunchHTML || renderMealSection('Обед', [], dishes, i, 'lunch'))
                  + (dinnerHTML || renderMealSection('Ужин', [], dishes, i, 'dinner'));
    } else {
      contentHTML = hasAny ? lunchHTML + dinnerHTML : '<div class="empty-meal">Не запланировано</div>';
    }

    return `
      <div class="day-card ${isToday ? 'today' : ''} ${allDone ? 'done' : ''}">
        <div class="day-label">${day.day}</div>
        <div class="day-content">
          ${contentHTML}
          ${day.prep ? `<div class="day-prep"><span class="prep-badge">${day.prep}</span></div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Initialize drag & drop if in edit mode
  if (editMode) {
    initSortable();
  }
}

// --- SortableJS ---
let sortableInstances = [];

function initSortable() {
  // Destroy previous instances
  sortableInstances.forEach(s => s.destroy());
  sortableInstances = [];

  document.querySelectorAll('.meals-list').forEach(list => {
    const s = new Sortable(list, {
      group: 'meals',
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'drag-ghost',
      chosenClass: 'drag-chosen',
      dragClass: 'drag-active',
      fallbackOnBody: true,
      swapThreshold: 0.65,
      onEnd: function(evt) {
        const fromDay = parseInt(evt.from.dataset.day);
        const fromMeal = evt.from.dataset.meal;
        const toDay = parseInt(evt.to.dataset.day);
        const toMeal = evt.to.dataset.meal;
        const oldIdx = evt.oldIndex;
        const newIdx = evt.newIndex;

        const plan = window._data.plan.days;

        // Remove from source
        const srcArr = plan[fromDay][fromMeal] || [];
        const [moved] = srcArr.splice(oldIdx, 1);
        if (!moved) return;

        // If moved to different meal type, clear leftover flag
        if (fromMeal !== toMeal || fromDay !== toDay) {
          moved.leftover = false;
        }

        // Insert into destination
        if (!plan[toDay][toMeal]) plan[toDay][toMeal] = [];
        plan[toDay][toMeal].splice(newIdx, 0, moved);

        saveLocal();
        renderMenu(window._data);
      }
    });
    sortableInstances.push(s);
  });
}

// --- Pantry ---
const PANTRY_ITEMS = [
  { id: 'филе', label: 'Филе', emoji: '🍗' },
  { id: 'сыр', label: 'Сыр', emoji: '🧀' },
  { id: 'хлеб', label: 'Хлеб', emoji: '🍞' },
  { id: 'кетчуп', label: 'Кетчуп', emoji: '🟥' },
  { id: 'майонез', label: 'Майонез', emoji: '⬜' },
  { id: 'яйца', label: 'Яйца', emoji: '🥚' },
  { id: 'масло', label: 'Масло', emoji: '🧈' },
  { id: 'молоко', label: 'Молоко', emoji: '🥛' },
];

function loadPantry() {
  try {
    const saved = localStorage.getItem('familyKitchenPantry');
    return saved ? JSON.parse(saved) : {};
  } catch (e) { return {}; }
}

function savePantry(pantry) {
  try {
    localStorage.setItem('familyKitchenPantry', JSON.stringify(pantry));
  } catch (e) { /* ignore */ }
}

function togglePantryItem(id) {
  const pantry = loadPantry();
  pantry[id] = !(pantry[id] !== false); // default true → toggle
  savePantry(pantry);
  renderPantry();
}
window.togglePantryItem = togglePantryItem;

function renderPantry() {
  const grid = document.getElementById('pantryGrid');
  if (!grid) return;
  const pantry = loadPantry();

  grid.innerHTML = PANTRY_ITEMS.map(item => {
    const have = pantry[item.id] !== false; // default: have it
    return `
      <button class="pantry-item ${have ? 'have' : 'need'}" onclick="togglePantryItem('${item.id}')">
        <span class="pantry-emoji">${item.emoji}</span>
        <span class="pantry-label">${item.label}</span>
        <span class="pantry-status">${have ? '✓' : '!'}</span>
      </button>
    `;
  }).join('');
}

// --- Shopping & Dishes ---

function renderShopping(data) {
  const list = document.getElementById('shoppingList');
  const section = document.getElementById('shoppingSection');

  const items = data.plan.days
    .filter(d => d.prep && d.prep !== '—' && d.prep !== '')
    .map(d => ({ name: d.prep, forMeal: [...(d.lunch || []), ...(d.dinner || [])].filter(m => !m.leftover).map(m => m.name).join(' + ') }));

  if (items.length === 0) {
    section.style.display = 'none';
    return;
  }

  list.innerHTML = items.map((item, i) => `
    <li data-idx="${i}" onclick="toggleShopItem(this)">
      <div class="checkbox"></div>
      <span class="shop-item-name">${item.name}</span>
      <span class="shop-item-for">${item.forMeal}</span>
    </li>
  `).join('');
}

function renderDishes(data) {
  const list = document.getElementById('dishesList');
  const count = document.getElementById('dishCount');
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';

  const filtered = activeFilter === 'all'
    ? data.dishes
    : data.dishes.filter(d => d.category === activeFilter);

  count.textContent = `(${filtered.length})`;

  const sorted = [...filtered].sort((a, b) => avgTaste(b) - avgTaste(a));

  list.innerHTML = sorted.map(d => {
    const avg = avgTaste(d);
    const tasteT = d.hearts.T;
    return `
      <div class="dish-item">
        <div class="dish-item-left">
          <div class="dish-item-name">${getDishEmoji(d.name)} ${d.name}</div>
          <div class="dish-item-meta">${d.kcal} ккал | Б${d.protein} Ж${d.fat} У${d.carbs} | ${d.category}</div>
        </div>
        <div class="dish-item-scores">
          <span class="score-pill ${scoreClass(avg)}" title="Средний вкус">${avg > 0 ? avg.toFixed(1) : '—'}</span>
          <span class="score-pill ${scoreClass(tasteT)}" title="Тима">${tasteT !== '—' ? 'Т' + tasteT : ''}</span>
        </div>
      </div>
    `;
  }).join('');
}

function avgTaste(dish) {
  const vals = [dish.taste['А'], dish.taste['Н'], dish.taste['Т'], dish.taste['К']]
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v));
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

// Toggle shopping item
window.toggleShopItem = function(el) {
  el.classList.toggle('checked');
  const checkbox = el.querySelector('.checkbox');
  checkbox.innerHTML = el.classList.contains('checked') ? '✓' : '';
};

// Expose functions to window for inline onclick
window.toggleDone = toggleDone;
window.removeMeal = removeMeal;
window.toggleEditMode = toggleEditMode;
window.resetLocal = resetLocal;

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const view = btn.dataset.view;
    const menuGrid = document.getElementById('menuGrid');
    const shopSection = document.getElementById('shoppingSection');
    const dishesView = document.getElementById('dishesView');
    const main = document.querySelector('main');
    const editBar = document.getElementById('editBar');

    main.style.display = view === 'dishes' ? 'none' : '';
    menuGrid.style.display = view === 'menu' ? '' : 'none';
    shopSection.style.display = view === 'shop' ? '' : 'none';
    dishesView.classList.toggle('hidden', view !== 'dishes');
    if (editBar) editBar.style.display = view === 'menu' ? '' : 'none';
  });
});

// Dish filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderDishes(window._data);
  });
});

// Load data
async function init() {
  try {
    const resp = await fetch('data.json?v=' + Date.now());
    const data = await resp.json();

    // Check localStorage for local edits
    const localPlan = loadLocal();
    if (localPlan && localPlan.week === data.plan.week) {
      data.plan = localPlan;
    }

    window._data = data;
    renderMenu(data);
    renderShopping(data);
    renderDishes(data);
    renderPantry();
    document.getElementById('shoppingSection').style.display = 'none';
  } catch (e) {
    console.error('Failed to load data:', e);
    document.getElementById('menuGrid').innerHTML =
      '<p style="text-align:center;padding:40px;color:#8a8580;">Не удалось загрузить данные</p>';
  }
}

init();
