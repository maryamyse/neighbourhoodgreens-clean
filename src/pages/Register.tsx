import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { Wheat } from 'lucide-react';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register', { 
        email, 
        password, 
        role, 
        firstName, 
        lastName, 
        ...(role === 'vendor' && { shopName }) 
      });
      login(res.data.access, res.data.user);
      
      if(role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if(err.response?.data?.email) {
         setError(err.response.data.email[0]);
      } else {
         setError('An error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 w-full py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl border border-ng-tan/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-ng-brown text-white rounded-full flex items-center justify-center mb-4">
            <Wheat size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join Neighbourhood Greens</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 text-center">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`w-full py-2 rounded-2xl border-2 font-bold transition-colors ${role === 'customer' ? 'border-ng-brown bg-ng-brown text-white' : 'border-ng-tan text-gray-600 bg-white hover:bg-ng-bg'}`}
              >
                Customer
              </button>
            </div>
            <div className="flex-1 text-center">
              <button
                 type="button"
                 onClick={() => setRole('vendor')}
                 className={`w-full py-2 rounded-2xl border-2 font-bold transition-colors ${role === 'vendor' ? 'border-ng-brown bg-ng-brown text-white' : 'border-ng-tan text-gray-600 bg-white hover:bg-ng-bg'}`}
              >
                Vendor
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-ng-tan focus:outline-none focus:ring-2 focus:ring-ng-brown transition-shadow bg-ng-bg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-ng-tan focus:outline-none focus:ring-2 focus:ring-ng-brown transition-shadow bg-ng-bg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-ng-tan focus:outline-none focus:ring-2 focus:ring-ng-brown transition-shadow bg-ng-bg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-ng-tan focus:outline-none focus:ring-2 focus:ring-ng-brown transition-shadow bg-ng-bg"
            />
          </div>

          {role === 'vendor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input
                type="text"
                required={role === 'vendor'}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-ng-tan focus:outline-none focus:ring-2 focus:ring-ng-brown transition-shadow bg-ng-bg"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ng-brown text-white py-3 px-4 rounded-2xl font-bold mt-4 text-lg hover:bg-[#5a3a29] transition-colors shadow-lg disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-ng-brown hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
