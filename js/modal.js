const productDialog = document.querySelector('#product-dialog');
let previewOpener;

function openProductDialog(product, button) {
  if (!productDialog) return;
  previewOpener = button;
  const title = productDialog.querySelector('#preview-title');
  const content = productDialog.querySelector('#preview-content');
  const status = productDialog.querySelector('#preview-status');

  title.textContent = product.title;
  content.textContent = '';
  status.textContent = '';

  const image = createProductImage(product, 'preview__image', '(min-width: 640px) 540px, 85vw');
  const description = createNode('p', 'preview__description', product.description);
  const connection = createNode('p', 'preview__connection', 'Подключение: ' + product.connection);
  const details = createNode('a', 'button button--secondary', 'Все характеристики');
  details.href = 'product.html#' + product.id;
  const actions = createNode('div', 'action-row');
  actions.append(createAddToCartButton(product), details);

  content.append(image, description, connection, createProductAvailability(product), createProductPrice(product), actions);
  productDialog.showModal();
}

if (productDialog) {
  productDialog.querySelector('[data-close-preview]').addEventListener('click', () => productDialog.close());
  productDialog.addEventListener('close', () => {
    if (previewOpener && previewOpener.isConnected) previewOpener.focus();
  });
}

const requestDialog = document.querySelector('#order-dialog');
if (requestDialog) {
  const quickOrder = document.querySelector('#quick-order');
  const form = requestDialog.querySelector('.order-form');
  const message = document.querySelector('#order-success');
  quickOrder.hidden = false;

  quickOrder.addEventListener('click', () => {
    form.reset();
    form.elements.product.value = quickOrder.dataset.orderProduct;
    requestDialog.showModal();
  });

  requestDialog.querySelector('[data-close-order]').addEventListener('click', () => requestDialog.close());
  requestDialog.addEventListener('close', () => {
    if (message.hidden) quickOrder.focus();
  });
}
