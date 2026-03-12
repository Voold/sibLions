import type { Product } from '../types/shop.types.js';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Худи 'Backend Wizard'",
    description: "Теплая толстовка для тех, кто не боится дедлайнов",
    price: 2500,
    image: null,
    points: 100
  },
  {
    id: 2,
    name: "Кружка 'I code, you judge'",
    description: "Объем 0.5л для бесконечного кофе",
    price: 800,
    image: "https://example.com/mug.png",
    points: 30
  }
];

export const getAllProducts = async () => MOCK_PRODUCTS;

export const getProductById = async (id: number) => 
  MOCK_PRODUCTS.find(p => p.id === id);