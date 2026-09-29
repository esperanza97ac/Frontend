/* ==========================================================================
   api.js — Cliente Axios centralizado para FastAPI
   Tablas 1:M (categorías → recetas, recetas → ingredientes)
   ========================================================================== */

const API_BASE_URL =
  window.__API_URL__ ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : window.location.origin);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/* --------------------------------------------------------------------------
   INTERCEPTORES: normalizar errores del backend (422, 404, 409, 500)
   -------------------------------------------------------------------------- */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Ha ocurrido un error inesperado.';

    if (error.response) {
      const { status, data } = error.response;
      const detail = data?.detail;

      switch (status) {
        case 400: message = detail || 'Solicitud inválida.'; break;
        case 401: message = 'No autorizado.'; break;
        case 403: message = 'Acción no permitida.'; break;
        case 404: message = detail || 'Recurso no encontrado.'; break;
        case 409: message = detail || 'Conflicto: el recurso ya existe.'; break;
        case 422:
          // FastAPI devuelve errores de validación como array
          if (Array.isArray(detail)) {
            message = detail
              .map((e) => `${e.loc?.slice(-1)[0] || 'campo'}: ${e.msg}`)
              .join(' · ');
          } else {
            message = detail || 'Datos inválidos.';
          }
          break;
        case 500: message = 'Error interno del servidor.'; break;
        default:  message = detail || `Error ${status}.`;
      }
    } else if (error.request) {
      message = 'No se pudo conectar con el servidor. Revisa tu conexión.';
    } else {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

/* --------------------------------------------------------------------------
   API: CATEGORÍAS
   -------------------------------------------------------------------------- */
const categoriesApi = {
  list: () => apiClient.get('/categories'),
  get:  (id) => apiClient.get(`/categories/${id}`),
};

/* --------------------------------------------------------------------------
   API: RECETAS (1:M con categorías e ingredientes)
   -------------------------------------------------------------------------- */
const recipesApi = {
  /**
   * @param {Object} params
   * @param {number} [params.skip]
   * @param {number} [params.limit]
   * @param {string} [params.q]          búsqueda
   * @param {string} [params.category]   filtro categoría
   * @param {string} [params.difficulty] filtro dificultad
   */
  list: (params = {}) => apiClient.get('/recipes', { params }),
  get:  (id)        => apiClient.get(`/recipes/${id}`),
  create: (payload) => apiClient.post('/recipes', payload),
  update: (id, payload) => apiClient.patch(`/recipes/${id}`, payload), // PATCH, no PUT
  remove: (id)      => apiClient.delete(`/recipes/${id}`),
};

/* --------------------------------------------------------------------------
   API: INGREDIENTES (relación 1:M de receta)
   -------------------------------------------------------------------------- */
const ingredientsApi = {
  listByRecipe: (recipeId) => apiClient.get(`/recipes/${recipeId}/ingredients`),
  create:       (recipeId, payload) =>
    apiClient.post(`/recipes/${recipeId}/ingredients`, payload),
  update:       (ingredientId, payload) =>
    apiClient.patch(`/ingredients/${ingredientId}`, payload),
  remove:       (ingredientId) =>
    apiClient.delete(`/ingredients/${ingredientId}`),
};

/* --------------------------------------------------------------------------
   EXPORTS GLOBALES (uso vanilla JS, sin módulos ES)
   -------------------------------------------------------------------------- */
window.API = {
  client: apiClient,
  baseURL: API_BASE_URL,
  categories: categoriesApi,
  recipes: recipesApi,
  ingredients: ingredientsApi,
};