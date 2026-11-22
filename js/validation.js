const orderSuccess = document.querySelector('#order-success');
const orderParams = new URLSearchParams(window.location.search);

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return /^[78]\d{10}$/.test(digits) && /^[\d+()\s-]+$/.test(value);
}

function formatPhone(value) {
  if (!isValidPhone(value)) return value;
  const digits = value.replace(/\D/g, '').slice(1);
  return '+7 (' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) +
    '-' + digits.slice(6, 8) + '-' + digits.slice(8);
}

function getFieldError(field) {
  if (field.name === 'name' && field.value.trim().length < 2) {
    return 'Введите имя из двух или более символов.';
  }
  if (field.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
    return 'Введите e-mail в формате name@example.com.';
  }
  if (field.name === 'phone' && !isValidPhone(field.value)) {
    return 'Введите 11 цифр. Номер должен начинаться на 7 или 8.';
  }
  if (field.name === 'product' && !field.value) {
    return 'Выберите модель из списка.';
  }
  if (field.name === 'agreement' && !field.checked) {
    return 'Подтвердите согласие, чтобы продолжить.';
  }
  if (field.validity.rangeUnderflow) {
    return 'Выберите сегодняшнюю дату или более позднюю.';
  }
  return field.validity.valid ? '' : field.validationMessage;
}

function showFieldError(field, message) {
  const error = document.getElementById(field.id + '-error');
  if (!error) return;
  error.textContent = message;
  error.hidden = !message;
  if (message) {
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-invalid');
  }
}

function localDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function setupOrderForm(form) {
  const select = form.elements.product;
  const productField = select.closest('.order-form__field');
  const phone = form.elements.phone;
  const comment = form.elements.comment;
  const date = form.elements.date;
  const count = form.querySelector('[data-comment-count]');
  const feedback = form.querySelector('.order-form__feedback');
  const summary = form.parentElement.querySelector('#order-cart-summary');
  const emptyCartHint = form.parentElement.querySelector('#order-empty-cart');
  const fromCart = summary && orderParams.get('from') === 'cart';
  let useCart = false;

  for (const product of getAvailableProducts(products)) {
    const option = createNode('option', '', product.title);
    option.value = product.id;
    select.append(option);
  }
  const requested = findProductById(products, orderParams.get('product'));
  if (requested && requested.isAvailable) select.value = requested.id;

  function updateOrderSummary() {
    if (!summary) return;
    useCart = fromCart && cart.length > 0;
    summary.hidden = !useCart;
    emptyCartHint.hidden = !fromCart || useCart;
    productField.hidden = useCart;
    select.disabled = useCart;
    if (!useCart) return;

    const items = summary.querySelector('#order-cart-items');
    items.textContent = '';
    for (const item of cart) {
      const product = findProductById(products, item.productId);
      items.append(createNode('li', '', product.title + ' · ' + item.quantity + ' шт.'));
    }
    const totals = calculateCartTotals();
    summary.querySelector('#order-cart-total').textContent = formatPrice(totals.total);
    summary.querySelector('#order-cart-discount').textContent = totals.discount
      ? 'Скидка по промокоду: ' + formatPrice(totals.discount) : '';
  }

  function clearFormFeedback() {
    form.querySelectorAll('[aria-invalid]').forEach((field) => showFieldError(field, ''));
    feedback.textContent = '';
    orderSuccess.hidden = true;
    count.textContent = '0 / ' + comment.maxLength;
  }

  if (date) date.min = localDate();
  form.addEventListener('reset', clearFormFeedback);
  form.addEventListener('input', (event) => {
    const field = event.target;
    if (field.hasAttribute('aria-invalid')) showFieldError(field, getFieldError(field));
    if (field === comment) count.textContent = comment.value.length + ' / ' + comment.maxLength;
    feedback.textContent = '';
    orderSuccess.hidden = true;
  });
  phone.addEventListener('change', () => {
    phone.value = formatPhone(phone.value);
    if (phone.hasAttribute('aria-invalid')) showFieldError(phone, getFieldError(phone));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    orderSuccess.hidden = true;
    phone.value = formatPhone(phone.value);
    if (date) date.min = localDate();
    const fields = Array.from(form.elements).filter((field) => field.willValidate);
    let firstInvalid = null;

    for (const field of fields) {
      const error = getFieldError(field);
      showFieldError(field, error);
      if (error && !firstInvalid) firstInvalid = field;
    }
    if (firstInvalid) {
      feedback.textContent = 'Проверьте отмеченные поля.';
      firstInvalid.focus();
      return;
    }

    let result;
    if (useCart) {
      result = cartQuantity() + ' шт. на сумму ' + formatPrice(calculateCartTotals().total);
      clearCart();
    } else {
      const product = findProductById(products, select.value);
      result = product.title + ' · ' + formatPrice(getProductPrice(product));
    }

    form.reset();
    updateOrderSummary();
    if (useCart === false && emptyCartHint) emptyCartHint.hidden = true;
    const dialog = form.closest('dialog');
    if (dialog) dialog.close();
    orderSuccess.textContent = 'Заявка подготовлена. ' + result + '. Данные остались на этой странице.';
    orderSuccess.hidden = false;
    orderSuccess.focus();
  });

  updateOrderSummary();
  form.hidden = false;

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) updateOrderSummary();
  });
}

document.querySelectorAll('[data-order-form]').forEach(setupOrderForm);
