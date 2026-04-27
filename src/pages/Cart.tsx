import React, { useState, useEffect } from 'react';
import { CartItem, PaymentStatus } from '../types';
import { Trash2, Smartphone, Loader2, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router';
import { useAuth } from '../components/AuthContext';
import toast from 'react-hot-toast';

export function Cart({ 
  cartItems, 
  updateQuantity, 
  removeItem, 
  clearCart 
}: { 
  cartItems: CartItem[], 
  updateQuantity: (id: string, q: number) => void,
  removeItem: (id: string) => void,
  clearCart: () => void
}) {
  const { token, user } = useAuth();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cod'>('mpesa');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentState, setPaymentState] = useState<'idle' | 'stk_sent' | 'completed' | 'failed'>('idle');
  const [checkoutReqId, setCheckoutReqId] = useState('');
  const [mpesaReceipt, setMpesaReceipt] = useState('');

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
       toast.error("Please log in to checkout.");
       return;
    }
    if (!address) {
       toast.error("Please enter a delivery location.");
       return;
    }

    if (paymentMethod === 'mpesa' && (!phone || phone.length < 10)) {
      toast.error("Please enter a valid M-Pesa number (e.g. 0712345678)");
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderData = {
        amount: total,
        items: cartItems.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
        paymentMethod,
        deliveryLocation: address,
        customerName: (user?.firstName || '') + ' ' + (user?.lastName || '').trim() || 'Customer',
        customerPhone: phone
      };

      if (paymentMethod === 'cod') {
        const res = await axios.post('/api/orders', orderData, {
           headers: { Authorization: `Bearer ${token}` }
        });
        setPaymentState('completed');
        setMpesaReceipt('COD-' + res.data.id);
        clearCart();
        toast.success("Order placed successfully with Cash on Delivery!");
      } else {
        let formattedPhone = phone;
        if (phone.startsWith('0')) formattedPhone = '254' + phone.slice(1);
        else if (phone.startsWith('+')) formattedPhone = phone.slice(1);
        
        const mpesaData = {
            ...orderData,
            phone: formattedPhone
        }
        
        // 1. Trigger STK Push
        const res = await axios.post('/api/payments/stk-push', mpesaData, {
           headers: { Authorization: `Bearer ${token}` }
        });
        
        setCheckoutReqId(res.data.CheckoutRequestID);
        setPaymentState('stk_sent');
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment");
      setPaymentState('failed');
    } finally {
       if (paymentMethod === 'cod') setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentState === 'stk_sent' && checkoutReqId) {
      // Poll for payment status
      interval = setInterval(async () => {
        try {
          const res = await axios.get<PaymentStatus>(`/api/payments/status/${checkoutReqId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'completed') {
            setPaymentState('completed');
            setMpesaReceipt(res.data.mpesaReceiptNumber || 'CONFIRMED');
            clearCart();
            setIsProcessing(false);
            clearInterval(interval);
            toast.success("Payment successful!");
          } else if (res.data.status === 'failed') {
            setPaymentState('failed');
            setIsProcessing(false);
            clearInterval(interval);
            toast.error("Payment failed. Please try again.");
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [paymentState, checkoutReqId, token]);

  if (cartItems.length === 0 && paymentState === 'idle') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your basket is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any groceries yet.</p>
        <Link to="/products" className="bg-ng-brown text-white px-6 py-3 rounded-full font-medium hover:bg-ng-brown-dark transition-colors shadow-md">
          Start Shopping
        </Link>
      </div>
    );
  }

  if (paymentState === 'completed') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
        <p className="font-mono bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-gray-800 mb-8 font-semibold inline-block">
          Order Ref: {mpesaReceipt}
        </p>
        <br/>
        <Link to="/orders" className="bg-ng-brown text-white px-6 py-3 rounded-full font-bold hover:bg-[#5a3a29] transition-colors shadow-md">
          Track Order
        </Link>
      </div>
    );
  }

  if (paymentState === 'failed') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-8">You may have cancelled the STK push or have insufficient funds.</p>
        <button onClick={() => { setPaymentState('idle'); setIsProcessing(false); }} className="bg-ng-brown text-white px-6 py-3 rounded-full font-bold hover:bg-[#5a3a29] transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Basket</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.product.id} className="bg-white rounded-3xl p-4 border border-ng-tan/50 shadow-sm flex flex-col sm:flex-row items-center gap-4 transition-colors hover:border-ng-brown/30">
              <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-2xl" />
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-bold text-lg text-gray-900">{item.product.name}</h3>
                <p className="text-gray-500 text-sm mb-1">{item.product.category}</p>
                <p className="text-ng-brown font-bold">KES {item.product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-ng-bg rounded-xl border border-ng-tan">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1 font-bold text-gray-600 hover:text-ng-brown">-</button>
                  <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-3 py-1 font-bold text-gray-600 hover:text-ng-brown">+</button>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#FAF8F5] border border-ng-tan/50 rounded-3xl p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="flex justify-between mb-4 font-medium text-gray-600">
              <span>Subtotal</span>
              <span className="text-gray-900">KES {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-6 font-medium text-gray-600">
              <span>Delivery</span>
              <span className="text-gray-900">Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-extrabold text-2xl mb-8 border-t border-ng-tan pt-4 text-gray-900">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>

            {paymentState === 'idle' ? (
              <form onSubmit={handleCheckout} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="pl-10 block w-full border border-ng-tan bg-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-ng-brown focus:border-transparent text-sm"
                      placeholder="e.g. Westlands, Nairobi"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer rounded-xl border flex flex-col items-center justify-center p-3 text-sm font-bold transition-colors ${paymentMethod === 'mpesa' ? 'border-[#4CAF50] bg-green-50 text-[#4CAF50]' : 'border-ng-tan bg-white text-gray-600 hover:bg-gray-50'}`}>
                      <input type="radio" className="sr-only" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                      M-Pesa
                    </label>
                    <label className={`cursor-pointer rounded-xl border flex flex-col items-center justify-center p-3 text-sm font-bold transition-colors ${paymentMethod === 'cod' ? 'border-ng-brown bg-[#f4f1ea] text-ng-brown' : 'border-ng-tan bg-white text-gray-600 hover:bg-gray-50'}`}>
                      <input type="radio" className="sr-only" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      Cash on Delivery
                    </label>
                  </div>
                </div>

                {paymentMethod === 'mpesa' && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">M-Pesa Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required={paymentMethod === 'mpesa'}
                        className="pl-10 block w-full border border-ng-tan bg-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-ng-brown focus:border-transparent text-sm"
                        placeholder="0712 345 678"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-base font-bold text-white transition-all disabled:opacity-70 ${paymentMethod === 'mpesa' ? 'bg-[#4CAF50] hover:bg-[#43a047]' : 'bg-ng-brown hover:bg-[#5a3a29]'}`}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Processing...</>
                  ) : paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Place Order Now'}
                </button>
              </form>
            ) : (
               <div className="bg-white border border-ng-tan rounded-2xl p-6 text-center animate-in fade-in">
                 <Loader2 className="w-8 h-8 text-[#4CAF50] animate-spin mx-auto mb-4" />
                 <h3 className="font-bold text-gray-900 mb-1">Check your phone</h3>
                 <p className="text-sm text-gray-500">We've sent an M-Pesa STK push to {phone}. Enter your PIN to complete the payment.</p>
               </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
