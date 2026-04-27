import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { Package, Truck, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      axios.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setOrders(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) return <div className="p-8 text-center text-ng-brown">Loading orders...</div>;

  const STATUS_STEPS = ['pending', 'accepted', 'processing', 'out_for_delivery', 'delivered'];
  
  const getStepProgress = (status: string) => {
    if (status === 'cancelled') return 0;
    const index = STATUS_STEPS.indexOf(status);
    return index !== -1 ? index : 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History & Tracking</h1>
      
      {!token ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-ng-tan/50">
          <p className="text-gray-500 font-medium">Please log in to view your orders.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-ng-tan/50">
          <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
             const currentStepIndex = getStepProgress(order.status);
             const isExpanded = expandedOrderId === order.id;

             return (
              <div key={order.id} className="bg-white rounded-3xl p-6 border border-ng-tan/50 shadow-sm transition-colors group">
                <div 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-ng-bg w-[48px] h-[48px] rounded-[16px] flex items-center justify-center text-xl shrink-0 group-hover:bg-ng-tan transition-colors">
                      <Package className="text-ng-brown w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[16px] text-gray-900 mb-0.5">Order {order.id}</h4>
                      <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex flex-col sm:items-end gap-1 text-left sm:text-right">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-[18px] text-ng-brown">KES {order.total?.toLocaleString() || 0}</span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-[8px] text-[11px] font-bold uppercase tracking-wider
                          ${order.status === 'delivered' ? 'bg-[#E8F5E9] text-[#4CAF50]' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-50 text-blue-700'}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2">
                    
                    {/* Progress Bar */}
                    {order.status !== 'cancelled' ? (
                      <div className="mb-8">
                        <div className="overflow-hidden bg-gray-100 rounded-full h-2 w-full mb-4">
                          <div 
                            className="h-full bg-[#4CAF50] transition-all duration-1000 ease-in-out"
                            style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                           <span className={currentStepIndex >= 0 ? 'text-ng-brown' : ''}>Pending</span>
                           <span className={currentStepIndex >= 1 ? 'text-ng-brown' : ''}>Accepted</span>
                           <span className={currentStepIndex >= 2 ? 'text-ng-brown' : ''}>Processing</span>
                           <span className={currentStepIndex >= 3 ? 'text-ng-brown' : ''}>Delivery</span>
                           <span className={currentStepIndex >= 4 ? 'text-[#4CAF50]' : ''}>Delivered</span>
                        </div>
                      </div>
                    ) : (
                       <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-medium text-sm">
                         This order was cancelled.
                       </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h5 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">Order Items</h5>
                        <ul className="space-y-3">
                          {order.items?.map((item: any, idx: number) => (
                            <li key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600"><span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}</span>
                              <span className="font-medium text-gray-900">KES {(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-ng-tan/50">
                        <h5 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">Delivery Details</h5>
                        <div className="space-y-2 text-sm">
                          <p className="flex justify-between"><span className="text-gray-500">Address:</span> <span className="font-bold text-gray-900">{order.deliveryLocation || 'N/A'}</span></p>
                          <p className="flex justify-between"><span className="text-gray-500">Payment Method:</span> <span className="font-bold text-gray-900 uppercase">{order.paymentMethod}</span></p>
                          <p className="flex justify-between"><span className="text-gray-500">Payment Status:</span> <span className="font-bold text-gray-900 capitalize">{order.paymentStatus?.replace(/_/g, ' ')}</span></p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-ng-tan flex justify-between">
                           <button className="text-ng-brown font-bold text-sm hover:underline">Download Invoice</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
