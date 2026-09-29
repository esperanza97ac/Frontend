(() => {
  const { el } = window.UI;

  const dom = {
    grid: document.getElementById('recipes-grid'),
    pills: document.getElementById('category-pills'),
  };

  /* ---------- CATEGORÍAS (pills) ---------- */
  function renderCategories(categories, active, onChange) {
    if (!dom.pills) return;
    dom.pills.replaceChildren();
    const names = ['Todas', ...categories.map((c) => c.name ?? c)];
    names.forEach((name) => {
      const btn = el('button', {
        type: 'button',
        role: 'tab',
        class: 'pill' + (name === active ? ' is-active' : ''),
        'aria-selected': name === active,
        onclick: () => onChange(name),
      }, name);
      dom.pills.appendChild(btn);
    });
  }

  /* ---------- RECETAS (grid de tarjetas) ---------- */
  function renderRecipes(recipes, onSelect) {
    if (!dom.grid) return;
    dom.grid.replaceChildren();
    recipes.forEach((r) => {
      const card = el('article', {
        class: 'recipe-card',
        role: 'listitem',
        tabindex: '0',
        'aria-label': `Ver receta: ${r.title}`,
        onclick: () => onSelect(r),
        onkeydown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(r);
          }
        },
      }, [
        el('div', { class: 'recipe-card__media' }, '🍰'),
        el('div', { class: 'recipe-card__body' }, [
          el('div', { class: 'recipe-card__meta' }, [
            el('span', { class: 'accent' }, r.difficulty || '—'),
            el('span', {}, '·'),
            el('span', {}, `${(r.ingredients?.length ?? 0)} ingredientes`),
          ]),
          el('h3', { class: 'recipe-card__title' }, r.title),
          el('p', { class: 'recipe-card__desc' }, r.description || ''),
          el('div', { class: 'recipe-card__footer' }, [
            el('span', {}, r.category?.name ?? r.category ?? ''),
            el('span', { class: 'link' }, 'Ver receta →'),
          ]),
        ]),
      ]);
      dom.grid.appendChild(card);
    });
  }

  window.Render = { renderCategories, renderRecipes };
})();