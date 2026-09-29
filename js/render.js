(() => {
  const { el } = window.UI;

  const dom = {
    grid: document.getElementById('recipes-grid'),
  };

  /* ---------- RECETAS (grid de tarjetas) ---------- */
  function countIngredients(ingredients) {
    if (!ingredients) return 0;
    const lines = String(ingredients).split('\n').map((s) => s.trim()).filter(Boolean);
    return lines.length > 1 ? lines.length : String(ingredients).split(',').map((s) => s.trim()).filter(Boolean).length || 0;
  }

  function shortText(text, max = 120) {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    return t.length > max ? `${t.slice(0, max)}…` : t;
  }

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
            el('span', {}, `${countIngredients(r.ingredients)} ingredientes`),
          ]),
          el('h3', { class: 'recipe-card__title' }, r.title),
          el('p', { class: 'recipe-card__desc' }, shortText(r.instructions)),
          el('div', { class: 'recipe-card__footer' }, [
            el('span', {}, r.category?.name ?? r.category ?? ''),
            el('span', { class: 'link' }, 'Ver receta →'),
          ]),
        ]),
      ]);
      dom.grid.appendChild(card);
    });
  }

window.UI = Object.assign(window.UI || {}, { renderRecipes });
})();