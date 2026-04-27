import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { Loader2, DollarSign, Users, ShoppingBag, Percent } from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token) {
      axios.get('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setData(res.data))
        .catch(err => console.error("Failed to load admin dashboard", err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) return (
    <div className="flex-grow flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-10 h-10 animate-spin text-ng-brown" />
    </div>
  );

  if (!data) return (
    <div className="flex-grow flex items-center justify-center min-h-[50vh]">
      <div className="text-center p-8 bg-white rounded-3xl border border-ng-tan max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">You must be an administrator to view this page.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Admin Platform Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform-wide overview & commissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-ng-tan shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1 text-sm">Platform Total Revenue</p>
            <p className="text-xl font-extrabold text-gray-900 font-mono">KES {data.totalPlatformRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-ng-tan shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <Percent size={28} />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1 text-sm">Commissions Earned (5%)</p>
            <p className="text-xl font-extrabold text-[#4CAF50] font-mono">KES {data.totalCommissionsEarned?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-ng-tan shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1 text-sm">Vendor Payouts (95%)</p>
            <p className="text-xl font-extrabold text-gray-900 font-mono">KES {data.totalVendorPayouts?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-ng-tan shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1 text-sm">Completed Orders</p>
            <p className="text-2xl font-extrabold text-gray-900">{data.totalCompletedOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-ng-tan shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-ng-tan flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><DollarSign size={20}/> Recent Commission Logs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f4f1ea] text-gray-600">
               <tr>
                <th className="p-4 font-semibold">Comm ID</th>
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Vendor ID</th>
                <th className="p-4 font-semibold text-right">Gross Amount</th>
                <th className="p-4 font-semibold text-right">Commission (5%)</th>
                <th className="p-4 font-semibold text-right">Vendor Net (95%)</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {data.commissions?.length === 0 ? (
                 <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">No commission records yet. Wait for an order to be delivered or paid.</td>
                 </tr>
               ) : (
                  data.commissions?.map((comm: any) => (
                    <tr key={comm.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="p-4 font-mono font-medium text-gray-900">{comm.id}</td>
                       <td className="p-4 font-mono text-ng-brown font-bold">{comm.orderId}</td>
                       <td className="p-4 text-gray-700">{comm.vendorId}</td>
                       <td className="p-4 text-right font-medium">KES {comm.grossAmount.toLocaleString()}</td>
                       <td className="p-4 text-right font-bold text-green-700">+KES {comm.commissionAmount.toLocaleString()}</td>
                       <td className="p-4 text-right font-medium text-gray-700">KES {comm.vendorEarnings.toLocaleString()}</td>
                       <td className="p-4 text-gray-500 text-xs">{new Date(comm.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
               )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-3xl border border-ng-tan shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-ng-tan flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users size={20}/> Platform Users</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ng-cream)] text-gray-700 uppercase text-xs tracking-wider">
               <tr>
                <th className="p-4 font-semibold border-b border-ng-tan">User ID</th>
                <th className="p-4 font-semibold border-b border-ng-tan">Name (Username)</th>
                <th className="p-4 font-semibold border-b border-ng-tan">Email Address</th>
                <th className="p-4 font-semibold border-b border-ng-tan">Password</th>
                <th className="p-4 font-semibold border-b border-ng-tan">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {data.users?.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                 </tr>
               ) : (
                  data.users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="p-4 font-mono font-medium text-gray-900 text-xs">{u.id}</td>
                       <td className="p-4 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                       <td className="p-4 text-gray-600">{u.email}</td>
                       <td className="p-4 font-mono text-gray-500">{u.password}</td>
                       <td className="p-4">
                         <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                           ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                             u.role === 'vendor' ? 'bg-blue-100 text-blue-700' : 
                             'bg-green-100 text-green-700'}`}>
                           {u.role}
                         </span>
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
