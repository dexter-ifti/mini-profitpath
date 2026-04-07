// src/data/seed.js
// Run: node src/data/seed.js  (or npm run seed)

const { productStore } = require('./store');

const mockProducts = [
  {
    asin: 'B09G9FPHY6',
    title: 'USB-C Hub 7-in-1 Multiport Adapter',
    category: 'electronics',
    supplier: 'TechWholesale UK',
    supplierCostGBP: 8.50,
    weightKg: 0.18,
    amazonPrices: { UK: 24.99, DE: 29.99, FR: 27.99, IT: 28.99, ES: 26.99 },
  },
  {
    asin: 'B08N5WRWNW',
    title: 'Wireless Earbuds Bluetooth 5.0',
    category: 'electronics',
    supplier: 'TechWholesale UK',
    supplierCostGBP: 12.00,
    weightKg: 0.08,
    amazonPrices: { UK: 19.99, DE: 23.99, FR: 22.99, IT: 24.99, ES: 21.99 },
  },
  {
    asin: 'B07XJ8C8F7',
    title: 'Resistance Bands Set (5 Levels)',
    category: 'sports',
    supplier: 'FitSupplies Direct',
    supplierCostGBP: 4.20,
    weightKg: 0.35,
    amazonPrices: { UK: 15.99, DE: 18.99, FR: 17.99, IT: 16.99, ES: 15.99 },
  },
  {
    asin: 'B08BHXG144',
    title: 'Bamboo Cutting Board Set of 3',
    category: 'home',
    supplier: 'HomeGoods Pro',
    supplierCostGBP: 7.80,
    weightKg: 1.20,
    amazonPrices: { UK: 22.99, DE: 27.99, FR: 25.99, IT: 26.99, ES: 24.99 },
  },
  {
    asin: 'B093B3CDDD',
    title: 'Kids Building Blocks 120pcs',
    category: 'toys',
    supplier: 'ToyMart Wholesale',
    supplierCostGBP: 9.00,
    weightKg: 0.65,
    amazonPrices: { UK: 21.99, DE: 25.99, FR: 24.99, IT: 23.99, ES: 22.99 },
  },
  {
    asin: 'B07PXGQC1Q',
    title: 'Reusable Shopping Bags Set of 5',
    category: 'home',
    supplier: 'HomeGoods Pro',
    supplierCostGBP: 2.10,
    weightKg: 0.20,
    amazonPrices: { UK: 9.99, DE: 11.99, FR: 10.99, IT: 11.49, ES: 10.49 },
  },
  {
    asin: 'B08L5NP6NG',
    title: 'Phone Stand Adjustable Desktop Holder',
    category: 'electronics',
    supplier: 'TechWholesale UK',
    supplierCostGBP: 3.40,
    weightKg: 0.12,
    amazonPrices: { UK: 12.99, DE: 15.99, FR: 14.49, IT: 14.99, ES: 13.99 },
  },
  {
    asin: 'B09BRDQRTH',
    title: 'Stainless Steel Water Bottle 750ml',
    category: 'sports',
    supplier: 'FitSupplies Direct',
    supplierCostGBP: 5.50,
    weightKg: 0.30,
    amazonPrices: { UK: 16.99, DE: 19.99, FR: 18.99, IT: 18.49, ES: 17.99 },
  },
  {
    asin: 'B07ZPKBL9V',
    title: 'LED Strip Lights 5m RGB Smart',
    category: 'home',
    supplier: 'HomeGoods Pro',
    supplierCostGBP: 6.90,
    weightKg: 0.22,
    amazonPrices: { UK: 18.99, DE: 22.99, FR: 21.99, IT: 23.49, ES: 20.99 },
  },
  {
    asin: 'B08FT5NH56',
    title: 'Face Moisturiser SPF 50 100ml',
    category: 'beauty',
    supplier: 'BeautyWholesale Ltd',
    supplierCostGBP: 4.80,
    weightKg: 0.15,
    amazonPrices: { UK: 14.99, DE: 17.99, FR: 16.49, IT: 17.49, ES: 15.99 },
  },
];

mockProducts.forEach(p => productStore.create(p));

console.log(`✅ Seeded ${productStore.count()} products`);
console.log('Products:', productStore.getAll().map(p => `  [${p.asin}] ${p.title}`).join('\n'));
