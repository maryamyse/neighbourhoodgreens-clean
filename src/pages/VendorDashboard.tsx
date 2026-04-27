import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Package, DollarSign, ShoppingCart, Plus, TrendingUp, Edit2, Trash2, Check, X, Search, Image as ImageIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const mockSalesData = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5500, orders: 35 },
  { name: 'Thu', revenue: 4500, orders: 28 },
  { name: 'Fri', revenue: 7000, orders: 42 },
  { name: 'Sat', revenue: 9000, orders: 55 },
  { name: 'Sun', revenue: 8500, orders: 50 },
];

const mockProductPerformance = [
  { name: 'Pishori Rice', sales: 120 },
  { name: 'Maize Flour', sales: 98 },
  { name: 'Cooking Oil', sales: 86 },
  { name: 'Sugar', sales: 75 },
  { name: 'Fresh Milk', sales: 65 },
];

export function VendorDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [editingStockProduct, setEditingStockProduct] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Product creation state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: 'Vegetables', description: '', image: '' });

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const [dashboardRes, productsRes] = await Promise.all([
          axios.get('/api/vendors/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/products') // In real app, filter for vendor's products
        ]);
        setData(dashboardRes.data);
        
        // Filter to only show the vendor's own products
        const myProducts = productsRes.data.filter((p: any) => user.role === 'admin' || p.vendorId === user.id || (user.id === 'u2' && p.vendorId === 'v1'));
        setProducts(myProducts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, navigate, token]);

  if (loading) {
     return <div className="p-8 text-center text-ng-brown font-medium">Loading dashboard...</div>;
  }

  if (!data) return null;

  const handleUpdateStock = async (productId: string) => {
    try {
      await axios.put(`/api/products/${productId}/stock`, { stockQuantity: Number(newStockValue) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProducts(products.map(p => p.id === productId ? { ...p, stock: Number(newStockValue) } : p));
      setEditingStockProduct(null);
    } catch (error) {
      console.error("Failed to update stock", error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts([...products, res.data]);
      setIsAddingProduct(false);
      setNewProduct({ name: '', price: '', stock: '', category: 'Vegetables', description: '', image: '' });
      setData({
        ...data,
        stats: { ...data.stats, total_products: data.stats.total_products + 1 }
      });
    } catch (error) {
      console.error("Failed to create product", error);
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/products/${editingProduct.id}`, editingProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to edit product", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== productId));
      setData({
        ...data,
        stats: { ...data.stats, total_products: Math.max(0, data.stats.total_products - 1) }
      });
    } catch (error) {
       console.error("Failed to delete product", error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh dashboard data
      const dashboardRes = await axios.get('/api/vendors/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      setData(dashboardRes.data);
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 font-medium mt-1">Manage your store: {data.profile.shop_name}</p>
        </div>
        <button 
          onClick={() => setIsAddingProduct(!isAddingProduct)}
          className="bg-ng-brown text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#5a3a29] transition-colors shadow-md flex items-center gap-2"
        >
          {isAddingProduct ? <X size={20} /> : <Plus size={20} />} 
          {isAddingProduct ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {isAddingProduct && (
        <div className="bg-white rounded-3xl border border-ng-tan shadow-sm p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Package size={20} /> New Product Details</h2>
          <form onSubmit={handleCreateProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown">
                  <option>Vegetables</option>
                  <option>Fruits</option>
                  <option>Dairy</option>
                  <option>Grains</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
                <input required type="number" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock Quantity</label>
                <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown"></textarea>
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                 <div className="flex gap-2">
                   <input required type="url" placeholder="https://..." value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="flex-grow px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown" />
                 </div>
                 <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><ImageIcon size={12}/> In a real Django app this would be a file upload (FormData).</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddingProduct(false)} className="px-6 py-2 border border-ng-tan text-gray-700 font-bold rounded-xl hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-ng-brown text-white font-bold rounded-xl hover:bg-[#5a3a29] shadow-md">Create Product</button>
            </div>
          </form>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-ng-tan shadow-xl p-6 w-full max-w-2xl animate-in fade-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Edit2 size={20} /> Edit Product</h2>
            <form onSubmit={handleEditProductSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown">
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Dairy</option>
                    <option>Grains</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
                  <input required type="number" min="0" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input required type="number" min="0" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea required rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown"></textarea>
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                   <div className="flex gap-2">
                     <input required type="url" placeholder="https://..." value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="flex-grow px-4 py-2 bg-ng-bg border border-ng-tan rounded-xl focus:outline-none focus:ring-2 focus:ring-ng-brown" />
                   </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-2 border border-ng-tan text-gray-700 font-bold rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-ng-brown text-white font-bold rounded-xl hover:bg-[#5a3a29] shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-ng-tan shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-shadow">
          <p className="text-gray-500 font-medium text-xs lg:text-sm">Total Products</p>
          <p className="text-xl lg:text-2xl font-extrabold text-gray-900">{data.stats.total_products}</p>
        </div>
        
        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-ng-tan shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-shadow">
          <p className="text-gray-500 font-medium text-xs lg:text-sm">Total Orders</p>
          <p className="text-xl lg:text-2xl font-extrabold text-gray-900">{data.stats.total_orders}</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-ng-tan shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-shadow">
          <p className="text-gray-500 font-medium text-xs lg:text-sm">Gross Sales</p>
          <p className="text-lg lg:text-xl font-extrabold text-gray-900 font-mono">KES {data.stats.total_revenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-red-200 bg-red-50/30 shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-shadow">
          <p className="text-red-700 font-medium text-xs lg:text-sm">Commissions (5%)</p>
          <p className="text-lg lg:text-xl font-extrabold text-red-600 font-mono">-KES {data.stats.total_commissions_deducted?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-emerald-200 bg-emerald-50/30 shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-shadow">
          <p className="text-emerald-700 font-medium text-xs lg:text-sm">Net Earnings (95%)</p>
          <p className="text-lg lg:text-xl font-extrabold text-emerald-600 font-mono">KES {data.stats.net_earnings?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-ng-tan shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-shadow">
           <p className="text-gray-500 font-medium text-xs lg:text-sm">Awaiting / COD</p>
           <p className="text-xl lg:text-2xl font-extrabold text-gray-900">{data.stats.awaiting_delivery} / {data.stats.cod_orders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-ng-tan shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-ng-brown" /> Revenue Overview
            </h2>
            <select className="bg-ng-bg border border-ng-tan text-sm rounded-xl px-3 py-1.5 focus:outline-none">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6F4E37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6F4E37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #D2B48C', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#6F4E37', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6F4E37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-ng-tan shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Products</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProductPerformance} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} width={80} />
                <Tooltip cursor={{ fill: '#f4f1ea' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="sales" fill="#D2B48C" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-ng-tan shadow-sm overflow-hidden">
        <div className="p-6 border-b border-ng-tan flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Package size={20}/> Inventory Management</h2>
          <div className="relative">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Search products..." className="pl-9 pr-4 py-2 border border-ng-tan rounded-full text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ng-brown" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f4f1ea] text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">Product</th>
                <th className="p-4 font-semibold whitespace-nowrap">Category</th>
                <th className="p-4 font-semibold whitespace-nowrap">Price (KES)</th>
                <th className="p-4 font-semibold whitespace-nowrap">Stock Quantity</th>
                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ng-tan">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    You haven't added any products yet.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-ng-tan" />
                        <span className="font-bold text-gray-900 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 font-mono font-medium text-gray-900">{product.price.toLocaleString()}</td>
                    <td className="p-4">
                      {editingStockProduct === product.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0"
                            className="w-20 px-2 py-1 border border-ng-brown rounded text-center focus:outline-none focus:ring-2 focus:ring-ng-brown/50 bg-white"
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(e.target.value)}
                            autoFocus
                          />
                          <button onClick={() => handleUpdateStock(product.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={() => setEditingStockProduct(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`font-mono font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}</span>
                            {product.stock <= 5 && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap">
                                Low Stock
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              setEditingStockProduct(product.id);
                              setNewStockValue(product.stock.toString());
                            }}
                            className="text-gray-400 hover:text-ng-brown transition-colors"
                            title="Edit Stock"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                       <button onClick={() => setEditingProduct(product)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Full Product">
                         <Edit2 size={18} />
                       </button>
                       <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete Product">
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Management */}
      <div className="bg-white rounded-3xl border border-ng-tan shadow-sm overflow-hidden mt-12">
        <div className="p-6 border-b border-ng-tan flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ShoppingCart size={20}/> Customer Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f4f1ea] text-gray-600">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ng-tan">
              {data.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No recent orders found.</td>
                </tr>
              ) : (
                data.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-ng-brown">{order.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="p-4 text-gray-700">{order.deliveryLocation}</td>
                    <td className="p-4 text-gray-700 text-xs">
                      {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="p-4 font-bold">KES {order.total.toLocaleString()}</td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded inline-block text-[10px] font-bold uppercase tracking-wider ${order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                         {order.paymentMethod}
                       </span>
                    </td>
                    <td className="p-4">
                      <select 
                        className={`text-xs font-bold px-2 py-1 rounded border-none focus:ring-1 focus:ring-ng-brown bg-gray-100 ${order.status === 'delivered' ? 'text-green-700' : order.status === 'cancelled' ? 'text-red-700' : 'text-blue-700'}`}
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      >
                         <option value="pending">Pending</option>
                         <option value="accepted">Accepted</option>
                         <option value="processing">Processing</option>
                         <option value="out_for_delivery">Out for Delivery</option>
                         <option value="delivered">Delivered</option>
                         <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                       {/* Action buttons could go here */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
