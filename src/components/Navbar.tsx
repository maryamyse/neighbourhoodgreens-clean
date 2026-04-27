import { ShoppingCart, Menu, X, User as UserIcon, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from './AuthContext';

export function Navbar({ cartCount }: { cartCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-ng-tan px-4 sm:px-8 h-16 flex items-center justify-between shrink-0 absolute top-0 w-full z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-ng-brown rounded-md flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg leading-none">N</span>
        </div>
        <Link to="/" className="text-xl font-bold text-ng-brown tracking-tight hidden sm:block whitespace-nowrap">
          Neighbourhood Greens
        </Link>
      </div>

      <div className="hidden md:flex gap-8 text-sm font-medium text-ng-brown h-full items-end">
        <Link to="/" className={`pb-[21px] border-b-2 ${isActive('/') ? 'border-ng-brown opacity-100' : 'border-transparent opacity-70 hover:opacity-100'} transition-all`}>Home</Link>
        <Link to="/products" className={`pb-[21px] border-b-2 ${isActive('/products') ? 'border-ng-brown opacity-100' : 'border-transparent opacity-70 hover:opacity-100'} transition-all`}>Products</Link>
        
        {user?.role === 'vendor' ? (
           <Link to="/vendor" className={`pb-[21px] border-b-2 ${isActive('/vendor') ? 'border-ng-brown opacity-100' : 'border-transparent opacity-70 hover:opacity-100'} transition-all`}>Dashboard</Link>
        ) : user?.role === 'admin' ? (
           <Link to="/admin" className={`pb-[21px] border-b-2 ${isActive('/admin') ? 'border-ng-brown opacity-100' : 'border-transparent opacity-70 hover:opacity-100'} transition-all`}>Dashboard</Link>
        ) : (
          <>
            <Link to="/cart" className={`pb-[21px] flex items-center gap-1 border-b-2 ${isActive('/cart') ? 'border-ng-brown opacity-100' : 'border-transparent opacity-70 hover:opacity-100'} transition-all`}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <Link to="/orders" className={`pb-[21px] border-b-2 ${isActive('/orders') ? 'border-ng-brown opacity-100' : 'border-transparent opacity-70 hover:opacity-100'} transition-all`}>Orders</Link>
          </>
        )}
      </div>

      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-ng-bg transition-colors group">
              <div className="w-8 h-8 bg-ng-brown text-white rounded-full flex items-center justify-center font-bold text-sm">
                {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
              </div>
              <span className="text-sm font-bold text-ng-brown group-hover:text-[#5a3a29]">{user.firstName || 'Profile'}</span>
            </Link>
            <button onClick={() => { logout(); }} className="text-sm font-bold text-gray-500 hover:text-ng-brown transition-colors">Sign Out</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
             <Link to="/login" className="text-sm font-bold text-ng-brown hover:opacity-70 transition-opacity">Login</Link>
             <Link to="/register" className="px-4 py-2 bg-ng-brown text-white text-sm font-bold rounded-full hover:bg-[#5a3a29] transition-colors">Sign Up</Link>
          </div>
        )}
      </div>

      {/* ... previous Mobile Menu ... */}
      <div className="md:hidden flex items-center gap-4">
        {user?.role !== 'vendor' && (
          <Link to="/cart" className="relative text-ng-brown">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="text-ng-brown focus:outline-none">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b border-ng-tan px-4 pt-2 pb-4 space-y-1 md:hidden shadow-lg">
          <Link to="/" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/') ? 'bg-ng-bg text-ng-brown' : 'text-ng-brown hover:bg-ng-bg'}`}>Home</Link>
          <Link to="/products" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/products') ? 'bg-ng-bg text-ng-brown' : 'text-ng-brown hover:bg-ng-bg'}`}>Products</Link>
          {user?.role === 'vendor' ? (
            <Link to="/vendor" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/vendor') ? 'bg-ng-bg text-ng-brown' : 'text-ng-brown hover:bg-ng-bg'}`}>Dashboard</Link>
          ) : user?.role === 'admin' ? (
            <Link to="/admin" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/admin') ? 'bg-ng-bg text-ng-brown' : 'text-ng-brown hover:bg-ng-bg'}`}>Dashboard</Link>
          ) : (
            <Link to="/orders" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/orders') ? 'bg-ng-bg text-ng-brown' : 'text-ng-brown hover:bg-ng-bg'}`}>Orders</Link>
          )}
          <hr className="border-ng-tan my-2" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/profile') ? 'bg-ng-bg text-ng-brown' : 'text-ng-brown hover:bg-ng-bg'}`}>My Profile</Link>
              <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/login') ? 'bg-ng-bg text-ng-brown' : 'text-ng-brown hover:bg-ng-bg'}`}>Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/register') ? 'bg-ng-bg text-ng-brown' : 'text-ng-brown hover:bg-ng-bg'}`}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
