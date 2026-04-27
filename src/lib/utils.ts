import { Product } from '../types';

export const CATEGORIES = ['Grains', 'Greens', 'Meat', 'Dairy', 'Fruits', 'Vegetables', 'Staples'];

export const filterByCategory = (products: Product[], category: string) => {
    if (!category || category === 'All') return products;
    return products.filter(p => p.category === category);
};
