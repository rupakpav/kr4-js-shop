const featuredGrid = document.querySelector('#featured-products');
const catalogGrid = document.querySelector('#catalog-products');
const catalogPageSize = 6;
let favoriteIds = loadFavorites();

function loadFavorites() {
  const saved = readSavedValue('favorites', []);
  if (!Array.isArray(saved)) return [];
  return saved.filter((id) => findProductById(products, id));
}

function createProductCard(product) {
  const card = createNode('article', 'product-card');
  const visual = createNode('div', 'product-card__visual');
  const image = createProductImage(
    product, 'product-card__image',
    '(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw'
  );
  visual.append(image);
  if (product.discountPercent > 0) {
    visual.append(createNode('span', 'product-card__badge', '−' + product.discountPercent + '%'));
  }

  const heading = createNode('h3', 'product-card__title');
  const link = createNode('a', '', product.title);
  link.href = 'product.html#' + product.id;
  heading.append(link);

  const meta = createNode('p', 'product-card__meta', categoryNames[product.category]);
  const rating = createNode('span', 'product-card__rating', '★ ' + product.rating.toLocaleString('ru-RU'));
  rating.setAttribute('role', 'img');
  rating.setAttribute('aria-label', 'Оценка ' + product.rating.toLocaleString('ru-RU') + ' из 5');
  meta.append(rating);

  const description = createNode('p', 'product-card__description', product.description);
  const actions = createNode('div', 'product-card__actions');
  const preview = createNode('button', 'button button--quiet', 'Быстрый просмотр');
  preview.type = 'button';
  preview.dataset.previewProduct = product.id;
  preview.setAttribute('aria-haspopup', 'dialog');
  preview.setAttribute('aria-label', 'Быстрый просмотр · ' + product.title);

  const favorite = createNode('button', 'button button--quiet favorite-button', 'Избранное');
  favorite.type = 'button';
  favorite.dataset.favoriteProduct = product.id;
  favorite.setAttribute('aria-pressed', String(favoriteIds.includes(product.id)));
  favorite.setAttribute('aria-label', 'Избранное · ' + product.title);
  actions.append(createAddToCartButton(product), preview, favorite);

  card.append(visual, heading, meta, description, createProductAvailability(product), createProductPrice(product), actions);
  return card;
}

function renderProducts(container, items) {
  container.textContent = '';
  for (const product of items) {
    container.append(createProductCard(product));
  }
}

function handleProductClick(event) {
  const preview = event.target.closest('[data-preview-product]');
  if (preview) {
    const product = findProductById(products, preview.dataset.previewProduct);
    if (product) openProductDialog(product, preview);
    return;
  }

  const favorite = event.target.closest('[data-favorite-product]');
  if (!favorite) return;
  const product = findProductById(products, favorite.dataset.favoriteProduct);
  if (!product) return;

  const isFavorite = favoriteIds.includes(product.id);
  if (isFavorite) {
    favoriteIds = favoriteIds.filter((id) => id !== product.id);
  } else {
    favoriteIds.push(product.id);
  }
  saveValue('favorites', favoriteIds);
  favorite.setAttribute('aria-pressed', String(!isFavorite));

  showShopNotice(product.title + (isFavorite ? ' убрана из избранного.' : ' добавлена в избранное.'));
}

if (featuredGrid) {
  renderProducts(featuredGrid, products.filter((product) => product.featured));
  featuredGrid.addEventListener('click', handleProductClick);

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    favoriteIds = loadFavorites();
    featuredGrid.querySelectorAll('[data-favorite-product]').forEach((button) => {
      button.setAttribute('aria-pressed', String(favoriteIds.includes(button.dataset.favoriteProduct)));
    });
  });
}

if (catalogGrid) {
  const search = document.querySelector('#catalog-search');
  const category = document.querySelector('#catalog-category');
  const sort = document.querySelector('#catalog-sort');
  const onlyAvailable = document.querySelector('#catalog-available');
  const onlyFavorites = document.querySelector('#catalog-favorites');
  const reset = document.querySelector('#catalog-reset');
  const emptyReset = document.querySelector('#catalog-empty-reset');
  const summary = document.querySelector('#catalog-summary');
  const resultsHeading = document.querySelector('#catalog-results');
  const empty = document.querySelector('#catalog-empty');
  const emptyText = document.querySelector('#catalog-empty-text');
  const pages = document.querySelector('#catalog-pages');
  const previous = document.querySelector('#catalog-previous');
  const next = document.querySelector('#catalog-next');
  const pageLabel = document.querySelector('#catalog-page');
  let currentPage = 1;

  function updateCatalog() {
    let items = products;
    if (onlyAvailable.checked) items = getAvailableProducts(items);
    if (onlyFavorites.checked) items = items.filter((product) => favoriteIds.includes(product.id));

    const found = getPreparedProducts(items, search.value, category.value, sort.value);
    const pageCount = Math.max(1, Math.ceil(found.length / catalogPageSize));
    currentPage = Math.min(currentPage, pageCount);
    const start = (currentPage - 1) * catalogPageSize;

    renderProducts(catalogGrid, found.slice(start, start + catalogPageSize));
    summary.textContent = 'Найдено: ' + found.length + ' из ' + products.length;
    empty.hidden = found.length > 0;
    emptyText.textContent = onlyFavorites.checked && favoriteIds.length === 0
      ? 'Отмечайте модели кнопкой «Избранное». Они появятся здесь.'
      : 'Попробуйте изменить запрос или сбросить фильтры.';
    pages.hidden = pageCount <= 1;
    previous.disabled = currentPage === 1;
    next.disabled = currentPage === pageCount;
    pageLabel.textContent = 'Страница ' + currentPage + ' из ' + pageCount;
  }

  function restartCatalog() {
    currentPage = 1;
    updateCatalog();
  }

  function resetCatalog() {
    search.value = '';
    category.value = 'all';
    sort.value = 'default';
    onlyAvailable.checked = false;
    onlyFavorites.checked = false;
    restartCatalog();
    search.focus();
  }

  search.addEventListener('input', restartCatalog);
  for (const control of [category, sort, onlyAvailable, onlyFavorites]) {
    control.addEventListener('change', restartCatalog);
  }
  reset.addEventListener('click', resetCatalog);
  emptyReset.addEventListener('click', resetCatalog);

  function changePage(direction) {
    currentPage += direction;
    updateCatalog();
    resultsHeading.focus();
  }

  previous.addEventListener('click', () => changePage(-1));
  next.addEventListener('click', () => changePage(1));

  catalogGrid.addEventListener('click', (event) => {
    handleProductClick(event);
    if (onlyFavorites.checked && event.target.closest('[data-favorite-product]')) {
      updateCatalog();
      resultsHeading.focus();
    }
  });

  const options = document.querySelector('#catalog-options');
  const narrowScreen = window.matchMedia('(max-width: 639px)');
  options.open = !narrowScreen.matches;
  narrowScreen.addEventListener('change', () => { options.open = !narrowScreen.matches; });
  document.querySelector('#catalog-filters').hidden = false;
  updateCatalog();

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    favoriteIds = loadFavorites();
    updateCatalog();
  });
}
