const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

function formatPrice(price) {
  return priceFormatter.format(price);
}

function calculateDiscount(price, discountPercent) {
  return Math.round(price * discountPercent) / 100;
}

function calculateFinalPrice(price, discountPercent) {
  return price - calculateDiscount(price, discountPercent);
}

function getProductPrice(product) {
  return calculateFinalPrice(product.price, product.discountPercent);
}

function getProductStatus(product) {
  return product.isAvailable ? 'В наличии' : 'Нет в наличии';
}

function createProductSummary(product) {
  return product.title + ' · ' + formatPrice(getProductPrice(product)) + ' · ' + getProductStatus(product);
}

function getProductTitles(items) {
  return items.map((product) => product.title);
}

function getAvailableProducts(items) {
  return items.filter((product) => product.isAvailable);
}

function searchProducts(items, query) {
  const text = query.trim().toLowerCase();
  return items.filter((product) => product.title.toLowerCase().includes(text));
}

function filterProductsByCategory(items, category) {
  if (category === 'all') return items;
  return items.filter((product) => product.category === category);
}

function sortProductsByPrice(items, direction = 'asc') {
  const copy = [...items];
  if (direction === 'desc') {
    return copy.sort((a, b) => getProductPrice(b) - getProductPrice(a));
  }
  return copy.sort((a, b) => getProductPrice(a) - getProductPrice(b));
}

function findProductById(items, id) {
  return items.find((product) => product.id === id);
}

function calculateTotalPrice(items) {
  return items.reduce((sum, product) => sum + product.price, 0);
}

function countAvailableProducts(items) {
  return getAvailableProducts(items).length;
}

function calculateAveragePrice(items) {
  return items.length ? calculateTotalPrice(items) / items.length : 0;
}

function getPreparedProducts(items, query, category, sort) {
  const found = filterProductsByCategory(searchProducts(items, query), category);
  if (sort === 'asc' || sort === 'desc') return sortProductsByPrice(found, sort);
  if (sort === 'title') return [...found].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  return found;
}

function createNode(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createProductImage(product, className, sizes) {
  const image = createNode('img', className);
  const path = 'images/' + product.id;
  image.src = path + '-480.jpg';
  if (sizes) {
    image.srcset = path + '-480.jpg 480w, ' + path + '-960.jpg 960w';
    image.sizes = sizes;
  }
  image.alt = 'Чёрная мышь ' + product.title;
  image.width = 960;
  image.height = 720;
  image.loading = 'lazy';
  return image;
}

function createProductPrice(product) {
  const price = createNode('p', 'product-price');
  price.append(createNode('strong', '', formatPrice(getProductPrice(product))));
  if (product.discountPercent > 0) {
    price.append(createNode('del', 'product-price__old', formatPrice(product.price)));
  }
  return price;
}

function createProductAvailability(product) {
  const label = createNode('span', 'availability', getProductStatus(product));
  if (!product.isAvailable) label.classList.add('availability--unavailable');
  return label;
}

const themeButton = document.querySelector('#theme-toggle');

function applyTheme(isDark) {
  document.documentElement.classList.toggle('theme-dark', isDark);
  if (themeButton) themeButton.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
}

applyTheme(readSavedValue('theme', 'light') === 'dark');

if (themeButton) {
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    const isDark = !document.documentElement.classList.contains('theme-dark');
    applyTheme(isDark);
    saveValue('theme', isDark ? 'dark' : 'light');
  });
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) applyTheme(readSavedValue('theme', 'light') === 'dark');
});

const shopNotice = document.querySelector('#shop-notice');
let noticeTimer;

function showShopNotice(message) {
  if (!shopNotice) return;
  clearTimeout(noticeTimer);
  shopNotice.textContent = message;
  noticeTimer = setTimeout(() => { shopNotice.textContent = ''; }, 3800);
}
