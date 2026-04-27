import React from 'react';
import { useAuth } from '../components/AuthContext';
import { User, LogOut, Package, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

export function Profile() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('Successfully signed out');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 w-full">
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-ng-tan shadow-xl relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-ng-tan/20 rounded-bl-[100px] -z-10 blur-3xl"></div>
        
        <div className="flex items-center gap-6 mb-12 border-b border-ng-tan pb-8">
          <div className="w-24 h-24 bg-ng-brown text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
            {user.firstName?.[0] || user.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-500 font-medium mt-1">{user.email}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-ng-tan/30 text-ng-brown text-sm font-bold capitalize">
              {user.role} Account
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-ng-bg p-6 rounded-[24px]">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-ng-brown" /> Personal Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">First Name</p>
                <p className="font-semibold text-gray-900">{user.firstName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Name</p>
                <p className="font-semibold text-gray-900">{user.lastName || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="bg-ng-bg p-6 rounded-[24px] flex flex-col justify-center">
            {user.role === 'customer' ? (
              <button onClick={() => navigate('/orders')} className="w-full py-4 px-6 bg-white border border-ng-tan hover:border-ng-brown rounded-2xl font-bold text-ng-brown transition-colors flex items-center justify-between">
                View My Orders <ExternalLink size={20} />
              </button>
            ) : (
              <button onClick={() => navigate('/vendor')} className="w-full py-4 px-6 bg-ng-brown text-white hover:bg-[#5a3a29] rounded-2xl font-bold transition-colors shadow-md flex items-center justify-between">
                Go to Vendor Dashboard <ExternalLink size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 text-red-600 font-bold hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
