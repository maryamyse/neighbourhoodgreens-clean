import React from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../components/AuthContext';

export function Home() {
  const { user } = useAuth();
  
  if (user?.role === 'vendor') {
    return <Navigate to="/vendor" replace />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="max-w-[1024px] mx-auto w-full p-4 md:p-6 flex-grow flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-5 flex-grow min-h-[600px]">
        
        {/* Main Hero Bento */}
        <div className="md:col-span-2 md:row-span-2 bg-ng-brown rounded-[24px] p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-10 -bottom-10 w-[300px] h-[300px] bg-ng-tan opacity-20 rounded-full"></div>
          <span className="text-[12px] uppercase tracking-[2px] font-semibold opacity-80 mb-3 z-10">Fresh Delivery • Nairobi</span>
          <h1 className="text-4xl sm:text-[48px] font-extrabold leading-[1.1] mb-6 z-10 w-full relative">
            Mwea Pishori <br/>Pure White Rice
          </h1>
          <p className="text-[18px] opacity-90 mb-8 max-w-[80%] z-10">
            Premium quality aromatic rice harvested straight from the Kirinyaga plains. Standard 5KG Pack.
          </p>
          <div className="flex items-center gap-6 z-10">
            <span className="text-[32px] font-bold">KES 1,250</span>
            <Link to="/products" className="bg-white text-ng-brown px-7 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex">
              Add to Basket
            </Link>
          </div>
        </div>

        {/* Categories Bento */}
        <div className="md:col-span-1 md:row-span-1 bg-white border border-ng-tan rounded-[24px] p-6">
          <h3 className="text-[14px] font-bold text-ng-brown mb-4 uppercase tracking-[1px]">Top Categories</h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/products" className="bg-ng-brown text-white px-3.5 py-1.5 rounded-full text-[12px] hover:bg-ng-brown-dark transition-colors">Grains</Link>
            <Link to="/products" className="bg-ng-bg text-ng-brown border border-ng-tan px-3.5 py-1.5 rounded-full text-[12px] hover:bg-ng-tan/30 transition-colors">Dairy</Link>
            <Link to="/products" className="bg-ng-bg text-ng-brown border border-ng-tan px-3.5 py-1.5 rounded-full text-[12px] hover:bg-ng-tan/30 transition-colors">Fruits</Link>
            <Link to="/products" className="bg-ng-bg text-ng-brown border border-ng-tan px-3.5 py-1.5 rounded-full text-[12px] hover:bg-ng-tan/30 transition-colors">Greens</Link>
            <Link to="/products" className="bg-ng-bg text-ng-brown border border-ng-tan px-3.5 py-1.5 rounded-full text-[12px] hover:bg-ng-tan/30 transition-colors">Meat</Link>
          </div>
        </div>

        {/* Small Featured Bento 1 */}
        <div className="md:col-span-1 md:row-span-1 bg-white border border-ng-tan rounded-[24px] p-4 flex items-center gap-4 hover:shadow-sm transition-all group">
          <div className="w-16 h-16 bg-[#FDF5E6] rounded-xl flex items-center justify-center shrink-0">
             <div className="w-8 h-8 bg-ng-tan rounded-sm"></div>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-gray-900 m-0 group-hover:text-ng-brown transition-colors">Jogoo Maize Meal</h4>
            <p className="text-[12px] text-gray-600 my-0.5">2KG Packet</p>
            <p className="text-[14px] font-bold text-ng-brown m-0">KES 195</p>
          </div>
        </div>

        {/* Status Bento */}
        <div className="md:col-span-1 md:row-span-1 bg-white border border-ng-tan rounded-[24px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
              <span className="text-[11px] uppercase font-bold tracking-[1px] text-[#888]">Payment Gateway</span>
            </div>
            <p className="text-[13px] text-[#666] mb-1">Last STK Push</p>
            <p className="text-[20px] font-bold text-gray-900">M-PESA Active</p>
          </div>
          <div className="bg-ng-bg rounded-xl p-3 flex justify-between items-center mt-4">
             <span className="text-[12px] text-ng-brown">Callback received</span>
             <span className="text-[12px] font-bold text-[#4CAF50]">SUCCESS</span>
          </div>
        </div>
        
        {/* Small Featured Bento 2 */}
        <div className="md:col-span-1 md:row-span-1 bg-white border border-ng-tan rounded-[24px] p-4 flex items-center gap-4 hover:shadow-sm transition-all group">
          <div className="w-16 h-16 bg-[#E8F5E9] rounded-xl flex items-center justify-center shrink-0">
             <div className="w-9 h-5 bg-[#4CAF50] rounded-full"></div>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-gray-900 m-0 group-hover:text-ng-brown transition-colors">Sukuma Wiki</h4>
            <p className="text-[12px] text-gray-600 my-0.5">Fresh Bunch</p>
            <p className="text-[14px] font-bold text-ng-brown m-0">KES 40</p>
          </div>
        </div>

        {/* Example Recent Order Note (Long Bento) */}
        <div className="md:col-span-3 md:row-span-1 bg-white border border-ng-tan rounded-[24px] p-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-ng-bg w-[60px] h-[60px] rounded-[16px] flex items-center justify-center text-2xl">📦</div>
            <div>
              <h4 className="text-[16px] font-bold text-gray-900 mb-1">Order #NG-9402</h4>
              <p className="text-[13px] text-gray-600">2 items from Brookside & Kapa • Out for delivery</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="block text-[12px] uppercase font-bold text-ng-tan mb-1">ETA</span>
            <span className="text-[18px] font-bold text-ng-brown">14:45 PM</span>
          </div>
        </div>

        {/* Example Cart Nav Snippet (Medium Bento) */}
        <Link to="/cart" className="md:col-span-1 md:row-span-1 bg-ng-tan rounded-[24px] p-6 text-ng-brown flex flex-col justify-between hover:bg-[#c9a780] transition-colors group">
          <div>
            <h3 className="text-[18px] font-bold mb-2">My Basket</h3>
            <p className="text-[13px] font-medium opacity-80">Ready for checkout</p>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <span className="text-[11px] uppercase opacity-70 block mb-1">Status</span>
              <div className="text-[18px] font-bold">Checkout &rarr;</div>
            </div>
            <div className="w-[44px] h-[44px] bg-ng-brown rounded-full flex items-center justify-center text-white font-bold group-hover:translate-x-1 transition-transform">
              →
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
