// Цены, наличие и рейтинг используются для учебной демонстрации.
const categoryNames = {
  wired: 'Проводная',
  wireless: 'Беспроводная'
};

const products = [
  {
    id: 'g305',
    title: 'Logitech G305',
    brand: 'Logitech',
    category: 'wireless',
    price: 3900,
    discountPercent: 10,
    rating: 4.8,
    isAvailable: true,
    featured: true,
    connection: 'LIGHTSPEED, USB-приёмник',
    description: 'Компактная игровая мышь для тех, кто предпочитает свободный стол без провода.'
  },
  {
    id: 'g102',
    title: 'Logitech G102',
    brand: 'Logitech',
    category: 'wired',
    price: 1900,
    discountPercent: 0,
    rating: 4.7,
    isAvailable: true,
    featured: true,
    connection: 'USB',
    description: 'Симметричный корпус и привычная раскладка кнопок для повседневных задач и игр.'
  },
  {
    id: 'deathadder',
    title: 'Razer DeathAdder Essential',
    brand: 'Razer',
    category: 'wired',
    price: 2900,
    discountPercent: 0,
    rating: 4.6,
    isAvailable: true,
    featured: false,
    connection: 'USB',
    description: 'Проводная игровая модель с корпусом под правую руку и боковыми кнопками.'
  },
  {
    id: 'm650',
    title: 'Logitech Signature M650',
    brand: 'Logitech',
    category: 'wireless',
    price: 4200,
    discountPercent: 0,
    rating: 4.8,
    isAvailable: true,
    featured: false,
    connection: 'Bluetooth или USB-приёмник Logi Bolt',
    description: 'Графитовая мышь среднего размера с тихими кнопками и колесом SmartWheel.'
  },
  {
    id: 'rival-3',
    title: 'SteelSeries Rival 3',
    brand: 'SteelSeries',
    category: 'wired',
    price: 5000,
    discountPercent: 0,
    rating: 4.5,
    isAvailable: false,
    featured: false,
    connection: 'USB',
    description: 'Игровая проводная мышь с симметричным корпусом и боковыми кнопками.'
  },
  {
    id: 'basilisk-v3',
    title: 'Razer Basilisk V3',
    brand: 'Razer',
    category: 'wired',
    price: 5900,
    discountPercent: 10,
    rating: 4.9,
    isAvailable: true,
    featured: true,
    connection: 'USB',
    description: 'Мышь под правую руку с упором для большого пальца и переключаемым режимом прокрутки.'
  },
  {
    id: 'haste-2',
    title: 'HyperX Pulsefire Haste 2',
    brand: 'HyperX',
    category: 'wired',
    price: 6900,
    discountPercent: 0,
    rating: 4.8,
    isAvailable: true,
    featured: false,
    connection: 'USB',
    description: 'Лёгкая проводная мышь с гибким кабелем для быстрых движений.'
  },
  {
    id: 'orochi-v2',
    title: 'Razer Orochi V2',
    brand: 'Razer',
    category: 'wireless',
    price: 5600,
    discountPercent: 0,
    rating: 4.7,
    isAvailable: false,
    featured: false,
    connection: 'Bluetooth или USB-приёмник HyperSpeed',
    description: 'Компактная беспроводная игровая мышь, которую удобно брать с ноутбуком.'
  }
];
