import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { VendorDashboard } from './pages/VendorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Product, CartItem } from './types';
import { Splash } from './components/Splash';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null; // Let AppContent handle splash/loading
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function AppContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  // If opening the app at root without login, go to login after splash
  useEffect(() => {
    if (!showSplash && !isLoading && !user) {
      if (window.location.pathname === '/') {
         navigate('/login', { replace: true });
      }
    }
  }, [showSplash, isLoading, user, navigate]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
       removeItem(productId);
       return;
    }
    setCartItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const location = useLocation();

  if (showSplash || isLoading) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/forgot-password' || 
                     location.pathname.startsWith('/reset-password');

  return (
    <div className="min-h-screen bg-ng-bg font-sans flex flex-col overflow-x-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#fff', color: '#111827', borderRadius: '12px', border: '1px solid #e5e7eb' } }} />
      {!isAuthPage && <Navbar cartCount={cartCount} />}
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products onAddToCart={handleAddToCart} /></ProtectedRoute>} />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart 
                cartItems={cartItems} 
                updateQuantity={updateQuantity} 
                removeItem={removeItem} 
                clearCart={clearCart} 
              />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/vendor" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
          <Route path="/reset-password/:token" element={user ? <Navigate to="/" replace /> : <ResetPassword />} />
        </Routes>
      </main>
      
      {!isAuthPage && (
        <footer className="h-12 bg-white border-t border-ng-tan flex items-center justify-center text-xs text-gray-500 shrink-0 mt-auto w-full">
          Built for Kenya with ❤️ • Neighbourhood Greens Marketplace • Secure M-PESA Daraja Integrated
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}


