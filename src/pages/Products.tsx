import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { CATEGORIES } from '../lib/utils';

export function Products({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    // Assuming backend runs on the same host (port 3000 mapping handles it)
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Could not fetch products", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-ng-brown font-medium">Loading local groceries...</div>;
  }

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Fresh Market Products</h1>
        <p className="text-gray-600 font-medium mb-6">The best Kenyan groceries sourced directly from local vendors.</p>
        
        <div className="flex flex-wrap gap-2">
          <button 
             onClick={() => setSelectedCategory('All')}
             className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${selectedCategory === 'All' ? 'bg-ng-brown text-white' : 'bg-white border border-ng-tan text-ng-brown hover:bg-ng-bg'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${selectedCategory === cat ? 'bg-ng-brown text-white' : 'bg-white border border-ng-tan text-ng-brown hover:bg-ng-bg'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-[24px] overflow-hidden border border-ng-tan flex flex-col hover:border-ng-brown transition-colors p-[8px]">
            <div className="relative h-48 rounded-[16px] overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold text-ng-brown shadow-sm backdrop-blur-sm">
                KES {product.price}
              </div>
            </div>
            <div className="p-4 pt-5 flex flex-col flex-grow">
              <span className="text-[11px] font-bold text-ng-tan uppercase tracking-widest mb-1.5">{product.category}</span>
              <h3 className="text-[16px] font-bold text-gray-900 mb-1 leading-tight">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
              
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-gray-500 bg-ng-bg px-2.5 py-1.5 rounded-md">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                <button 
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock === 0}
                  className="bg-ng-bg text-ng-brown border border-ng-tan hover:bg-ng-brown hover:text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
                >
                  <ShoppingCart className="w-4 h-4 mr-1"/>
                  Add <span className="group-hover:translate-x-1 transition-transform inline-block ml-1">→</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
