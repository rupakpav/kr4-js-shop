const detailList = document.querySelector('#product-details');
const productIndex = document.querySelector('#product-index');

function createSpecificationTable(product) {
  const table = createNode('table', 'product-table');
  const caption = createNode('caption', 'visually-hidden', 'Характеристики ' + product.title);
  const head = createNode('thead');
  const headerRow = createNode('tr');
  for (const label of ['Параметр', 'Значение']) {
    const heading = createNode('th', '', label);
    heading.scope = 'col';
    headerRow.append(heading);
  }
  head.append(headerRow);

  const body = createNode('tbody');
  const specs = [
    ['Производитель', product.brand],
    ['Тип', categoryNames[product.category]],
    ['Подключение', product.connection],
    ['Учебная оценка', product.rating.toLocaleString('ru-RU') + ' из 5']
  ];
  for (const [label, value] of specs) {
    const row = createNode('tr');
    const heading = createNode('th', '', label);
    heading.scope = 'row';
    row.append(heading, createNode('td', '', value));
    body.append(row);
  }
  table.append(caption, head, body);
  return table;
}

function createProductDetail(product) {
  const detail = createNode('article', 'product-detail');
  detail.id = product.id;
  const image = createProductImage(
    product, 'product-detail__image', '(min-width: 1280px) 460px, (min-width: 900px) 40vw, 90vw'
  );
  const content = createNode('div', 'product-detail__content');
  const title = createNode('h2', 'product-detail__title', product.title);
  const description = createNode('p', 'product-detail__description', product.description);
  const actions = createNode('div', 'action-row');
  actions.append(createAddToCartButton(product));
  if (product.isAvailable) {
    const orderLink = createNode('a', 'button button--secondary', 'Оставить заявку');
    orderLink.href = 'order.html?product=' + encodeURIComponent(product.id);
    actions.append(orderLink);
  }

  content.append(
    title, description, createProductAvailability(product), createProductPrice(product),
    createSpecificationTable(product), actions
  );
  detail.append(image, content);
  return detail;
}

if (detailList) {
  for (const product of products) {
    const link = createNode('a', 'product-index__link', product.title);
    link.href = '#' + product.id;
    productIndex.append(link);
    detailList.append(createProductDetail(product));
  }

  // Якоря появляются после выполнения скрипта.
  const selected = findProductById(products, window.location.hash.slice(1));
  if (selected) document.getElementById(selected.id).scrollIntoView();
}
