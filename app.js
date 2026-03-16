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
};

function getDishEmoji(name) {
  const lower = name.toLowerCase();
  // Sort keys by length descending so longer matches take priority
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
  return 'a';
}

function getCookLabel(cook) {
  const c = cook.toLowerCase().trim();
  if (c.includes('тима') || c === 'т') return 'Тима';
  if (c.includes('катя') || c === 'к') return 'Катя';
  if (c.includes('все') || c.includes('вместе')) return 'Все вместе';
  if (c === 'а' || c.includes('мам')) return 'А';
  return cook;
}

function getTodayIndex() {
  const d = new Date().getDay();
  // JS: 0=Sun, 1=Mon...6=Sat → we need 0=Mon...6=Sun
  return d === 0 ? 6 : d - 1;
}

function findDish(dishes, mealName) {
  if (!mealName) return null;
  const lower = mealName.toLowerCase();
  return dishes.find(d => {
    const dLower = d.name.toLowerCase();
    // Try exact or partial match
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

// Render a single meal item
function renderMealItem(m, dishes) {
  const dish = findDish(dishes, m.name);
  const emoji = getDishEmoji(m.name);
  const macros = dish ? `${dish.kcal} ккал / Б${dish.protein} Ж${dish.fat} У${dish.carbs}` : '';
  const isDone = m.status === 'done';
  const isLeftover = m.leftover;

  return `
    <div class="meal-item ${isDone ? 'done' : ''} ${isLeftover ? 'leftover' : ''}">
      <span class="meal-emoji">${emoji}</span>
      <div class="meal-info">
        <span class="meal-name">${m.name}</span>
        ${macros ? `<span class="meal-macros">${macros}</span>` : ''}
      </div>
      ${isLeftover ? '<span class="leftover-badge">остатки</span>' : ''}
      ${m.cook && !isLeftover ? `<span class="cook-badge ${getCookClass(m.cook)}">${getCookLabel(m.cook)}</span>` : ''}
      ${isDone ? '<span class="status-done">✓</span>' : ''}
    </div>
  `;
}

// Render a meal section (lunch or dinner)
function renderMealSection(label, items, dishes) {
  if (!items || items.length === 0) return '';
  const html = items.map(m => renderMealItem(m, dishes)).join('');
  return `
    <div class="meal-section">
      <div class="meal-section-label">${label}</div>
      <div class="meals-list">${html}</div>
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

    const lunchHTML = renderMealSection('Обед', day.lunch, dishes);
    const dinnerHTML = renderMealSection('Ужин', day.dinner, dishes);
    const contentHTML = hasAny ? lunchHTML + dinnerHTML : '<div class="empty-meal">Не запланировано</div>';

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
}

function renderShopping(data) {
  const list = document.getElementById('shoppingList');
  const section = document.getElementById('shoppingSection');

  // Generate shopping list from plan items with prep
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

  // Sort by average taste descending
  const sorted = [...filtered].sort((a, b) => {
    const avgA = avgTaste(a);
    const avgB = avgTaste(b);
    return avgB - avgA;
  });

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

    // Show main for menu and shop views
    main.style.display = view === 'dishes' ? 'none' : '';
    // Toggle individual sections within main
    menuGrid.style.display = view === 'menu' ? '' : 'none';
    shopSection.style.display = view === 'shop' ? '' : 'none';
    // Toggle dishes view (outside main)
    dishesView.classList.toggle('hidden', view !== 'dishes');
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
    const resp = await fetch('data.json?v=3');
    const data = await resp.json();
    window._data = data;
    renderMenu(data);
    renderShopping(data);
    renderDishes(data);
    // Default: menu view — hide shopping
    document.getElementById('shoppingSection').style.display = 'none';
  } catch (e) {
    console.error('Failed to load data:', e);
    document.getElementById('menuGrid').innerHTML =
      '<p style="text-align:center;padding:40px;color:#8a8580;">Не удалось загрузить данные</p>';
  }
}

init();
