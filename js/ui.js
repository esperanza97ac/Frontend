const UI = (() => {
  /* ---------- Helper: crear elementos ---------- */
  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' || typeof c === 'number'
        ? document.createTextNode(String(c))
        : c);
    });
    return node;
  };

  /* ---------- Referencias DOM ---------- */
  const dom = {
    skeleton: document.getElementById('skeleton-container'),
    grid: document.getElementById('recipes-grid'),
    empty: document.getElementById('empty-state'),
    pagination: document.getElementById('pagination'),
    toasts: document.getElementById('toast-container'),
    dialogForm: document.getElementById('recipe-form-dialog'),
    dialogDetail: document.getElementById('recipe-detail-dialog'),
    dialogDelete: document.getElementById('delete-confirm-dialog'),
  };

  /* ---------- TOASTS ---------- */
  function showToast(message, type = 'success', title = '') {
    const t = el('div', { class: `toast toast--${type}`, role: 'status' }, [
      el('div', { class: 'toast__content' }, [
        title ? el('p', { class: 'toast__title' }, title) : null,
        el('p', { class: 'toast__msg' }, message),
      ]),
      el('button', {
        class: 'toast__close', type: 'button',
        'aria-label': 'Cerrar notificación',
        onclick: () => t.remove(),
      }, '✕'),
    ]);
    dom.toasts?.appendChild(t);
    setTimeout(() => t.remove(), 3600);
  }

  /* ---------- LOADER (SKELETON) ---------- */
  function showLoader(count = 6) {
    if (dom.grid) dom.grid.hidden = true;
    if (!dom.skeleton) return;
    dom.skeleton.hidden = false;
    dom.skeleton.replaceChildren();
    for (let i = 0; i < count; i++) {
      dom.skeleton.appendChild(
        el('div', { class: 'skeleton-card' }, [
          el('div', { class: 'skeleton-card__media' }),
          el('div', { class: 'skeleton-card__body' }, [
            el('div', { class: 'sk-line sk-line--sm' }),
            el('div', { class: 'sk-line sk-line--lg' }),
            el('div', { class: 'sk-line sk-line--md' }),
            el('div', { class: 'sk-line sk-line--lg' }),
          ]),
        ])
      );
    }
  }

  function hideLoader() {
    if (dom.skeleton) dom.skeleton.hidden = true;
    if (dom.grid) dom.grid.hidden = false;
  }

  /* ---------- EMPTY STATE ---------- */
  function renderEmptyState(title, description, actions = []) {
    if (!dom.empty) return;
    if (dom.grid) dom.grid.hidden = true;
    dom.empty.hidden = false;
    dom.empty.replaceChildren(
      el('div', { class: 'empty-state__icon' }, '🍓'),
      el('h3', {}, title),
      el('p', {}, description),
      el('div', { class: 'empty-state__actions' },
        actions.map((a) => el('button', {
          type: 'button',
          class: `btn ${a.variant === 'ghost' ? 'btn--ghost' : 'btn--primary'}`,
          onclick: a.onClick,
        }, a.label))
      )
    );
  }

  function hideEmptyState() {
    if (dom.empty) dom.empty.hidden = true;
  }

  /* ---------- PAGINACIÓN ---------- */
  function renderPagination(current, total, onChange) {
    if (!dom.pagination) return;
    if (total <= 1) {
      dom.pagination.hidden = true;
      dom.pagination.replaceChildren();
      return;
    }
    dom.pagination.hidden = false;
    dom.pagination.replaceChildren();

    const mk = (label, page, opts = {}) => el('button', {
      type: 'button',
      class: 'pagination__btn' + (opts.active ? ' is-active' : ''),
      'aria-label': opts.aria || `Página ${label}`,
      disabled: !!opts.disabled,
      onclick: () => !opts.disabled && onChange(page),
    }, label);

    dom.pagination.appendChild(mk('‹', current - 1, { disabled: current === 1, aria: 'Anterior' }));
    for (let i = 1; i <= total; i++) {
      dom.pagination.appendChild(mk(String(i), i, { active: i === current }));
    }
    dom.pagination.appendChild(mk('›', current + 1, { disabled: current === total, aria: 'Siguiente' }));
  }

  /* ---------- MODALES ---------- */
  function openModal(dialog, contentNode) {
    if (!dialog) return;
    dialog.replaceChildren(contentNode);
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
  }

  function closeModal(dialog) {
    if (dialog?.open) dialog.close();
    document.body.style.overflow = '';
  }

  function buildDialogShell({ title, onClose, bodyNode, footerNode }) {
    return el('div', { class: 'dialog__content' }, [
      el('header', { class: 'dialog__header' }, [
        el('h2', { class: 'dialog__title' }, title),
        el('button', {
          type: 'button',
          class: 'dialog__close',
          'aria-label': 'Cerrar',
          onclick: onClose,
        }, '✕'),
      ]),
      el('div', { class: 'dialog__body' }, bodyNode),
      footerNode ? el('footer', { class: 'dialog__footer' }, footerNode) : null,
    ]);
  }

  return {
    el,
    showToast,
    showLoader, hideLoader,
    renderEmptyState, hideEmptyState,
    renderPagination,
    openModal, closeModal,
    buildDialogShell,
    dialogs: {
      form: dom.dialogForm,
      detail: dom.dialogDetail,
      remove: dom.dialogDelete,
    },
  };
})();

window.UI = UI;