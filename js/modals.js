/* ==========================================================================
Diálogos, formularios y documentación
   ========================================================================== */

async function openRecipeDetail(recipe) {
  showLoader(3);
  try {
    const full = await API.recipes.get(recipe.id);
    renderDetailModal(full);
  } catch (err) {
    showToast(err.message, 'error', 'Detalle');
  } finally {
    hideLoader();
  }
}

function renderDetailModal(r) {
  const close = () => closeModal(dialogs.detail);

  const body = el('div', {}, [
    el('p', { class: 'detail-desc' }, r.description || ''),
    el('h3', {}, 'Ingredientes'),
    el('p', { class: 'detail-desc', style: 'white-space: pre-line' }, r.ingredients || ''),
    el('h3', {}, 'Instrucciones'),
    el('div', { style: 'white-space: pre-line' }, r.instructions || ''),
  ]);

  const footer = [
    el('button', {
      type: 'button', class: 'btn btn--ghost',
      onclick: () => { close(); openRecipeForm(r); },
    }, 'Editar'),
    el('button', {
      type: 'button', class: 'btn btn--danger',
      onclick: () => { close(); openDeleteConfirm(r); },
    }, 'Eliminar'),
  ];

  openModal(dialogs.detail, buildDialogShell({
    title: r.title,
    subtitle: r.category?.name,
    onClose: close,
    bodyNode: body,
    footerNode: footer,
  }));
}

/* ==========================================================================
   FORM CREAR / EDITAR
   ========================================================================== */
function openRecipeForm(recipe) {
  const isEdit = !!recipe;
  const close = () => closeModal(dialogs.form);

  const titleInput = el('input', {
    type: 'text', maxlength: '100', required: 'true',
    value: recipe?.title ?? '',
  });

  const ingredientsInput = el('textarea', {
    rows: '5', maxlength: '500', required: 'true',
    placeholder: 'Un ingrediente por línea',
  }, recipe?.ingredients ?? '');

  const instructionsInput = el('textarea', {
    rows: '6', required: 'true',
    placeholder: 'Un paso por línea',
  }, recipe?.instructions ?? '');

  const catSelect = el('select', { required: 'true' },
    state.categories.map((c) => {
      const opt = el('option', { value: c.id }, c.name);
      if (recipe?.category?.id === c.id || recipe?.category_id === c.id) opt.selected = true;
      return opt;
    })
  );

  const diffInput = el('input', {
    type: 'number', min: '1', max: '20', required: 'true',
    value: recipe?.difficulty ?? 1,
  });

  const body = el('div', { class: 'recipe-form' }, [
    el('div', { class: 'form-field' }, [el('label', {}, 'Título *'), titleInput]),
    el('div', { class: 'form-row' }, [
      el('div', { class: 'form-field' }, [el('label', {}, 'Categoría *'), catSelect]),
      el('div', { class: 'form-field' }, [el('label', {}, 'Dificultad (1-20) *'), diffInput]),
    ]),
    el('div', { class: 'form-field' }, [el('label', {}, 'Ingredientes *'), ingredientsInput]),
    el('div', { class: 'form-field' }, [el('label', {}, 'Instrucciones *'), instructionsInput]),
  ]);

  const footer = [
    el('button', { type: 'button', class: 'btn btn--ghost', onclick: close }, 'Cancelar'),
    el('button', {
      type: 'button', class: 'btn btn--primary',
      onclick: () => submitRecipeForm({
        isEdit, recipe, titleInput, ingredientsInput, instructionsInput,
        catSelect, diffInput, close,
      }),
    }, isEdit ? 'Guardar cambios' : 'Crear receta'),
  ];

  openModal(dialogs.form, buildDialogShell({
    title: isEdit ? 'Editar receta' : 'Nueva receta',
    onClose: close,
    bodyNode: body,
    footerNode: footer,
  }));
}

async function submitRecipeForm({
  isEdit, recipe, titleInput, ingredientsInput, instructionsInput,
  catSelect, diffInput, close,
}) {
  const title = titleInput.value.trim();
  const ingredients = ingredientsInput.value.trim();
  const instructions = instructionsInput.value.trim();
  const difficulty = Number(diffInput.value);
  const category_id = Number(catSelect.value);

  if (title.length < 1 || title.length > 100) {
    showToast('El título debe tener entre 1 y 100 caracteres.', 'error', 'Validación');
    return;
  }
  if (ingredients.length < 1 || ingredients.length > 500) {
    showToast('Los ingredientes deben tener entre 1 y 500 caracteres.', 'error', 'Validación');
    return;
  }
  if (instructions.length < 1) {
    showToast('Las instrucciones no pueden estar vacías.', 'error', 'Validación');
    return;
  }
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 20) {
    showToast('La dificultad debe estar entre 1 y 20.', 'error', 'Validación');
    return;
  }
  if (!Number.isInteger(category_id) || category_id < 1) {
    showToast('Selecciona una categoría válida.', 'error', 'Validación');
    return;
  }

  const payload = {
    title,
    ingredients,
    instructions,
    difficulty,
    category_id,
  };

  showLoader(3);
  try {
    if (isEdit) {
      await API.recipes.update(recipe.id, payload);
      showToast('Receta actualizada correctamente.', 'success', 'Guardado');
    } else {
      await API.recipes.create(payload);
      showToast('Receta creada correctamente.', 'success', 'Guardado');
    }
    close();
    await loadRecipes();
  } catch (err) {
    showToast(err.message, 'error', 'Error al guardar');
  } finally {
    hideLoader();
  }
}

/* ==========================================================================
   ELIMINAR
   ========================================================================== */
function openDeleteConfirm(recipe) {
  const close = () => closeModal(dialogs.remove);

  const body = el('p', {},
    `¿Seguro que quieres eliminar "${recipe.title}"? Esta acción no se puede deshacer.`
  );

  const footer = [
    el('button', { type: 'button', class: 'btn btn--ghost', onclick: close }, 'Cancelar'),
    el('button', {
      type: 'button', class: 'btn btn--danger',
      onclick: async () => {
        showLoader(3);
        try {
          await API.recipes.remove(recipe.id);
          showToast('Receta eliminada.', 'success', 'Hecho');
          close();
          await loadRecipes();
        } catch (err) {
          showToast(err.message, 'error', 'Error al eliminar');
        } finally {
          hideLoader();
        }
      },
    }, 'Sí, eliminar'),
  ];

  openModal(dialogs.remove, buildDialogShell({
    title: 'Confirmar eliminación',
    onClose: close,
    bodyNode: body,
    footerNode: footer,
  }));
}

/* ==========================================================================
   SECCIÓN #docs (endpoints + curl + Swagger)
   ========================================================================== */
function renderDocs() {
  let section = document.getElementById('docs');
  if (!section) {
    section = el('section', { id: 'docs', class: 'docs' });
    document.querySelector('.main-content')?.appendChild(section);
  }

  const endpoints = [
    { method: 'GET',    route: '/recipes/',                  desc: 'Listar recetas (paginado)' },
    { method: 'GET',    route: '/recipes/search/',           desc: 'Buscar recetas por texto' },
    { method: 'GET',    route: '/recipes/category/{id}',     desc: 'Listar recetas por categoría' },
    { method: 'GET',    route: '/recipes/{id}',              desc: 'Obtener receta con ingredientes' },
    { method: 'POST',   route: '/recipes/',                  desc: 'Crear receta' },
    { method: 'PATCH',  route: '/recipes/{id}',              desc: 'Actualizar receta' },
    { method: 'DELETE', route: '/recipes/{id}',              desc: 'Eliminar receta' },
    { method: 'GET',    route: '/categories/',               desc: 'Listar categorías' },
  ];

  const table = el('table', { class: 'docs__table' }, [
    el('thead', {}, el('tr', {}, [
      el('th', {}, 'Método'), el('th', {}, 'Ruta'), el('th', {}, 'Descripción'),
    ])),
    el('tbody', {}, endpoints.map((e) => el('tr', {}, [
      el('td', {}, el('code', { class: `method method--${e.method.toLowerCase()}` }, e.method)),
      el('td', {}, el('code', {}, e.route)),
      el('td', {}, e.desc),
    ]))),
  ]);

  const curl = `curl -X GET "${API.baseURL}/recipes/?limit=10" -H "Accept: application/json"`;

  section.replaceChildren(
    el('h2', {}, 'Documentación de la API'),
    el('p', {}, 'Endpoints disponibles en el backend FastAPI.'),
    table,
    el('h3', {}, 'Ejemplo cURL'),
    el('pre', { class: 'docs__code' }, el('code', {}, curl)),
    el('p', {}, [
      'Documentación interactiva: ',
      el('a', { href: `${API.baseURL}/docs`, target: '_blank', rel: 'noopener' }, `${API.baseURL}/docs`),
    ])
  );
}