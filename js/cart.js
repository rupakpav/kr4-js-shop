const promoCode = 'MOUSE10';
const promoPercent = 10;
const maxCartQuantity = 99;
const cartCounter = document.querySelector('#cart-count');
const cartList = document.querySelector('#cart-items');
let cart = loadCart();
let activePromo = loadPromo();

function loadCart() {
  const saved = readSavedValue('cart', []);
  const items = [];
  if (!Array.isArray(saved)) return items;

  for (const entry of saved) {
    if (!entry || !Number.isInteger(entry.quantity) || entry.quantity < 1) continue;
    const product = findProductById(products, entry.productId);
    if (!product || !product.isAvailable || items.some((item) => item.productId === product.id)) continue;
    items.push({ productId: product.id, quantity: Math.min(maxCartQuantity, entry.quantity) });
  }
  return items;
}

function loadPromo() {
  return cart.length > 0 && readSavedValue('promo', '') === promoCode ? promoCode : '';
}

function cartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function calculateCartTotals() {
  const subtotal = cart.reduce((sum, item) => {
    const product = findProductById(products, item.productId);
    return sum + getProductPrice(product) * item.quantity;
  }, 0);
  const percent = activePromo === promoCode ? promoPercent : 0;
  return {
    subtotal,
    discount: calculateDiscount(subtotal, percent),
    total: calculateFinalPrice(subtotal, percent)
  };
}

function updateCartCounter() {
  if (cartCounter) cartCounter.textContent = cartQuantity();
}

function saveCart() {
  if (cart.length === 0) activePromo = '';
  saveValue('cart', cart);
  saveValue('promo', activePromo);
  updateCartCounter();
  if (cartList) renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
}

function addToCart(productId) {
  const product = findProductById(products, productId);
  if (!product || !product.isAvailable) return 0;

  const item = cart.find((entry) => entry.productId === productId);
  if (item) {
    if (item.quantity >= maxCartQuantity) return 0;
    item.quantity += 1;
    saveCart();
    return item.quantity;
  }

  cart.push({ productId, quantity: 1 });
  saveCart();
  return 1;
}

function createAddToCartButton(product) {
  const label = 'В корзину';
  const button = createNode('button', 'button button--primary', label);
  button.type = 'button';
  button.dataset.addToCart = product.id;
  button.disabled = !product.isAvailable;
  button.setAttribute('aria-label', label + ' · ' + product.title);
  return button;
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-to-cart]');
  if (!button || button.disabled) return;

  const product = findProductById(products, button.dataset.addToCart);
  if (!product || !product.isAvailable) return;
  const quantity = addToCart(product.id);
  const message = quantity
    ? product.title + ' в корзине · ' + quantity + ' шт.'
    : 'Для одной модели можно выбрать до ' + maxCartQuantity + ' шт.';

  const dialog = button.closest('dialog');
  const dialogStatus = dialog && dialog.querySelector('#preview-status');
  if (dialogStatus) {
    dialogStatus.textContent = message;
  } else {
    showShopNotice(message);
  }
});

function createQuantityButton(product, action, label, accessibleName) {
  const button = createNode('button', 'button button--quiet', label);
  button.type = 'button';
  button.dataset.cartAction = action;
  button.setAttribute('aria-label', accessibleName + ' · ' + product.title);
  return button;
}

function renderCart() {
  const panel = document.querySelector('#cart-panel');
  const empty = document.querySelector('#cart-empty');
  const totals = calculateCartTotals();

  panel.hidden = cart.length === 0;
  empty.hidden = cart.length > 0;
  cartList.textContent = '';

  for (const item of cart) {
    const product = findProductById(products, item.productId);
    const row = createNode('li', 'cart-item');
    row.dataset.productId = product.id;

    const image = createProductImage(product, 'cart-item__image');
    image.alt = '';
    const content = createNode('div', 'cart-item__content');
    const name = createNode('a', 'cart-item__name', product.title);
    name.href = 'product.html#' + product.id;
    const unitPrice = createNode('p', 'cart-item__unit', formatPrice(getProductPrice(product)) + ' за шт.');
    content.append(name, unitPrice);

    const controls = createNode('div', 'cart-item__controls');
    const decrease = createQuantityButton(product, 'decrease', '−', 'Уменьшить количество');
    decrease.disabled = item.quantity <= 1;
    const increase = createQuantityButton(product, 'increase', '+', 'Увеличить количество');
    increase.disabled = item.quantity >= maxCartQuantity;
    const quantity = createNode('span', 'cart-item__quantity', item.quantity);
    const remove = createQuantityButton(product, 'remove', 'Удалить', 'Удалить из корзины');
    controls.append(decrease, quantity, increase, remove);
    content.append(controls);

    const linePrice = createNode('strong', 'cart-item__total', formatPrice(getProductPrice(product) * item.quantity));
    row.append(image, content, linePrice);
    cartList.append(row);
  }

  document.querySelector('#cart-subtotal').textContent = formatPrice(totals.subtotal);
  document.querySelector('#cart-discount').textContent = formatPrice(totals.discount);
  document.querySelector('#cart-total').textContent = formatPrice(totals.total);
  document.querySelector('#promo-remove').hidden = !activePromo;
}

updateCartCounter();

if (cartList) {
  const cartStatus = document.querySelector('#cart-status');
  const promoForm = document.querySelector('#promo-form');
  const promoInput = document.querySelector('#promo-code');
  const promoStatus = document.querySelector('#promo-status');
  const removePromo = document.querySelector('#promo-remove');

  promoInput.value = activePromo;
  renderCart();

  cartList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button || button.disabled) return;
    const productId = button.closest('.cart-item').dataset.productId;
    const index = cart.findIndex((item) => item.productId === productId);
    if (index < 0) return;
    const action = button.dataset.cartAction;

    if (action === 'remove') {
      cart.splice(index, 1);
      cartStatus.textContent = 'Товар удалён. В корзине ' + cartQuantity() + ' шт.';
    } else {
      const change = action === 'increase' ? 1 : -1;
      cart[index].quantity += change;
      cartStatus.textContent = 'Количество изменено. В корзине ' + cartQuantity() + ' шт.';
    }

    saveCart();
    const row = cartList.children[Math.min(index, cart.length - 1)];
    if (row) {
      const sameAction = row.querySelector('[data-cart-action="' + action + '"]:not(:disabled)');
      (sameAction || row.querySelector('[data-cart-action="remove"]')).focus();
    } else {
      promoInput.value = '';
      promoStatus.textContent = '';
      promoInput.removeAttribute('aria-invalid');
      document.querySelector('#cart-empty a').focus();
    }
  });

  promoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (promoInput.value.trim().toUpperCase() !== promoCode) {
      promoInput.setAttribute('aria-invalid', 'true');
      promoStatus.textContent = 'Введите действующий промокод MOUSE10.';
      promoInput.focus();
      return;
    }
    activePromo = promoCode;
    promoInput.value = promoCode;
    promoInput.removeAttribute('aria-invalid');
    promoStatus.textContent = 'Промокод применён. Скидка 10%.';
    saveCart();
  });

  promoInput.addEventListener('input', () => {
    promoInput.removeAttribute('aria-invalid');
    promoStatus.textContent = '';
  });

  removePromo.addEventListener('click', () => {
    activePromo = '';
    promoInput.value = '';
    promoInput.removeAttribute('aria-invalid');
    promoStatus.textContent = 'Промокод снят.';
    saveCart();
    promoInput.focus();
  });
}

window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  cart = loadCart();
  activePromo = loadPromo();
  updateCartCounter();
  if (cartList) {
    document.querySelector('#promo-code').value = activePromo;
    renderCart();
  }
});
