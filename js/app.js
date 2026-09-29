/* ==========================================================================
   app.js — Lógica principal (FastAPI + UI) - Núcleo
   ========================================================================== */
const {
  el,
  showToast, showLoader, hideLoader,
  renderCategories, renderRecipes,
  renderEmptyState, hideEmptyState,
  renderPagination,
  openModal, closeModal, buildDialogShell,
  dialogs,
} = UI;

/* ---------- Estado global ---------- */
const state = {
  recipes: [],
  categories: [],
  total: 0,
  page: 1,
  limit: 6,
  search: '',
  category: 'Todas',
  categoryId: null,
  difficulty: 'all',
};

let searchDebounce;

/* ==========================================================================
   INIT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  await Promise.all([loadCategories(), loadRecipes()]);
  renderDocs();
});

/* ==========================================================================
   EVENTOS GLOBALES
   ========================================================================== */
function bindEvents() {
  document.getElementById('btn-new-recipe')
    ?.addEventListener('click', () => openRecipeForm(null));

  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    if (searchClear) searchClear.hidden = !e.target.value;
    searchDebounce = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      toggleResetVisibility();
      loadRecipes();
    }, 300);
  });

  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.hidden = true;
    state.search = '';
    state.page = 1;
    toggleResetVisibility();
    loadRecipes();
  });

  const difficultySelect = document.getElementById('difficulty-filter');
  difficultySelect?.addEventListener('change', (e) => {
    state.difficulty = e.target.value;
    state.page = 1;
    toggleResetVisibility();
    loadRecipes();
  });

  document.getElementById('filters-reset')
    ?.addEventListener('click', resetFilters);

  Object.values(dialogs).forEach((d) => {
    d?.addEventListener('close', () => { document.body.style.overflow = ''; });
  });
}

function toggleResetVisibility() {
  const reset = document.getElementById('filters-reset');
  if (!reset) return;
  const active = state.difficulty !== 'all' || !!state.search || state.category !== 'Todas';
  reset.hidden = !active;
}

/* ==========================================================================
   CARGA DE DATOS
   ========================================================================== */
async function loadCategories() {
  try {
    const res = await API.categories.list();
    state.categories = Array.isArray(res) ? res : (res.items ?? []);
    renderCategories(state.categories, state.category, selectCategory);
  } catch (err) {
    showToast(err.message, 'error', 'Categorías');
  }
}

async function loadRecipes() {
  showLoader();
  hideEmptyState();
  try {
    const params = { skip: 0, limit: 100 };
    let res;
    if (state.search)                  res = await API.recipes.search(state.search, params);
    else if (state.categoryId != null) res = await API.recipes.byCategory(state.categoryId, params);
    else                               res = await API.recipes.list(params);

    let all = Array.isArray(res) ? res : (res.items ?? []);
    if (state.difficulty !== 'all') {
      all = all.filter((r) => String(r.difficulty) === String(state.difficulty));
    }

    state.total = all.length;
    const start = (state.page - 1) * state.limit;
    const pageItems = all.slice(start, start + state.limit);
    state.recipes = pageItems;

    updateHeader();

    if (pageItems.length === 0) {
      renderEmptyState(
        state.search
          ? `Sin resultados para "${state.search}"`
          : 'No hay recetas todavía',
        'Prueba a cambiar los filtros o crea tu primera receta.',
        [
          { label: 'Limpiar filtros', variant: 'ghost', onClick: resetFilters },
          { label: 'Crear receta', onClick: () => openRecipeForm(null) },
        ]
      );
      renderPagination(1, 1, () => {});
      return;
    }

    renderRecipes(pageItems, openRecipeDetail);

    const totalPages = Math.max(1, Math.ceil(state.total / state.limit));
    renderPagination(state.page, totalPages, (p) => {
      state.page = p;
      loadRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } catch (err) {
    showToast(err.message, 'error', 'Recetas');
  } finally {
    hideLoader();
  }
}

function updateHeader() {
  const titleEl = document.getElementById('recipes-title');
  const countEl = document.getElementById('recipes-count');
  if (titleEl) {
    titleEl.textContent = state.category === 'Todas'
      ? 'Todas las recetas'
      : `Recetas de ${state.category}`;
  }
  if (countEl) countEl.textContent = `(${state.total})`;
}

function selectCategory(name, id) {
  state.category = name;
  state.categoryId = id;
  state.page = 1;
  renderCategories(state.categories, name, selectCategory);
  toggleResetVisibility();
  loadRecipes();
}

function resetFilters() {
  state.search = '';
  state.category = 'Todas';
  state.categoryId = null;
  state.difficulty = 'all';
  state.page = 1;

  const s = document.getElementById('search-input');
  if (s) s.value = '';
  const sc = document.getElementById('search-clear');
  if (sc) sc.hidden = true;
  const d = document.getElementById('difficulty-filter');
  if (d) d.value = 'all';

  toggleResetVisibility();
  renderCategories(state.categories, 'Todas', selectCategory);
  loadRecipes();
}