import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { initialProducts } from './src/product_data.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Path to the JSON database
const dbPath = path.join(process.cwd(), 'db.json');

// Default Database Structure
const initialDb = {
  users: [
    { id: 'u1', email: 'test@example.com', password: 'password', role: 'customer', firstName: 'Test', lastName: 'User', isVerified: true },
    { id: 'u2', email: 'vendor@example.com', password: 'password', role: 'vendor', firstName: 'Jane', lastName: 'Doe', isVerified: true, shopName: 'Fresh Farms', location: 'Nairobi' },
    { id: 'u3', email: 'maryambasa06@gmail.com', password: 'Ambasa1928', role: 'admin', firstName: 'Mary', lastName: 'Ambasa', isVerified: true }
  ],
  vendors: [{ id: 'v1', name: 'Neighbourhood Farms' }, { id: 'v2', name: 'Nairobi Grocers' }],
  products: initialProducts,
  orders: [],
  payments: [],
  commissions: [],
  vendorPayouts: []
};

let db: typeof initialDb;

// Load db from file, or initialize it
if (fs.existsSync(dbPath)) {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(fileContent);
    
    if (!db.commissions) db.commissions = [];
    if (!db.vendorPayouts) db.vendorPayouts = [];
    if (!db.payments) db.payments = [];
    if (!db.orders) db.orders = [];

    // Update products if they are completely missing or empty, but allow 
    // modifications to persist otherwise. Since initialProducts grows in tasks, 
    // if the loaded products are fewer than initialProducts, we should merge or re-sync them.
    if (!db.products || db.products.length < initialProducts.length) {
       // Merge initial products that don't exist yet into db.products
       if (!db.products) db.products = [];
       const existingIds = new Set(db.products.map(p => p.id));
       initialProducts.forEach(p => {
         if (!existingIds.has(p.id)) {
           db.products.push(p);
         }
       });
       saveDb();
    }
  } catch (error) {
    console.error("Failed to parse db.json, using fallback", error);
    db = { ...initialDb };
    saveDb();
  }
} else {
  db = { ...initialDb };
  saveDb();
}

function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}



function extractToken(req: any) {
  let token = req.params?.token || req.headers?.authorization;
  if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
}

// API Routes

// ---- Auth Endpoints (Mocking Django DRF behavior) ----
app.post('/api/auth/register', (req, res) => {
  const { email, password, role, firstName, lastName, shopName, location } = req.body;
  if (!email || !password) {
    return res.status(400).json({ email: ['This field is required.'] });
  }
  
  if (db.users.find(u => u.email === email)) {
     return res.status(400).json({ email: ['User with this email already exists.'] });
  }

  const newUser = {
    id: `u${db.users.length + 1}`,
    email,
    password, // In a real app this is hashed
    role: role || 'customer',
    firstName,
    lastName,
    shopName,
    location,
    isVerified: false
  };
  
  db.users.push(newUser);
  saveDb();
  
  return res.status(201).json({
    user: newUser,
    access: `mock-access-token-${newUser.id}`,
    refresh: `mock-refresh-token-${newUser.id}`
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ detail: 'No active account found with the given credentials' });
  }
  
  return res.json({
    access: `mock-access-token-${user.id}`,
    refresh: `mock-refresh-token-${user.id}`,
    user
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(200).json({ detail: 'If an account with that email exists, we sent a password reset link.' });
  }

  const resetToken = `reset-${user.id}-${Date.now()}`;
  (user as any).resetToken = resetToken;
  (user as any).resetTokenExpires = Date.now() + 3600000; // 1 hour
  saveDb();

  console.log(`[Email Simulation] Password reset link for ${email}: /reset-password/${resetToken}`);

  return res.status(200).json({ 
    detail: 'If an account with that email exists, we sent a password reset link.', 
    _demoLink: `/reset-password/${resetToken}` 
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  
  const user = db.users.find((u: any) => u.resetToken === token);
  if (!user || !(user as any).resetTokenExpires || Date.now() > (user as any).resetTokenExpires) {
    return res.status(400).json({ detail: 'Invalid or expired reset token.' });
  }

  user.password = newPassword;
  delete (user as any).resetToken;
  delete (user as any).resetTokenExpires;
  saveDb();

  return res.status(200).json({ detail: 'Password has been reset successfully.' });
});

app.get('/api/auth/profile/:token?', (req, res) => {
  const token = extractToken(req);
  console.log('[Auth Profile Endpoint] Received token:', token);

  if (!token) {
    console.error('[Auth Profile] No valid token provided');
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }
  
  const userId = token.split('-').pop() || '';
  console.log('[Auth Profile] Extracted userId:', userId);
  let user = db.users.find(u => u.id === userId);
  
  // To survive dev server restarts where memory db is wiped, 
  // provide a fallback for properly formatted tokens
  if (!user && token.startsWith('mock-access-token-')) {
    console.log('[Auth Profile] User not found, but token format is valid. Creating fallback user.');
    user = {
      id: userId,
      email: `${userId}@example.com`,
      firstName: 'Demo',
      lastName: 'User',
      role: 'customer',
      password: 'password123',
      isVerified: true
    };
    db.users.push(user);
    saveDb();
  }
  
  if (!user) {
    console.error('[Auth Profile] Token valid but user does not exist for ID:', userId);
    return res.status(401).json({ detail: 'Token is invalid or user deleted.' });
  }
  
  console.log('[Auth Profile] User authenticated successfully. Role:', user.role);
  return res.json(user);
});

app.get('/api/vendors/dashboard/:token?', (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }
  
  const userId = token.split('-').pop() || '';
  let user = db.users.find(u => u.id === userId);
  
  if (!user && token.startsWith('mock-access-token-')) {
    user = {
      id: userId,
      email: `${userId}@example.com`,
      firstName: 'Vendor',
      lastName: 'Demo',
      role: 'vendor',
      shopName: 'Demo Shop',
      location: 'Nairobi',
      password: 'password123',
      isVerified: true
    };
    db.users.push(user);
    saveDb();
  }
  
  if (!user || user.role !== 'vendor') {
    return res.status(403).json({ detail: 'You do not have permission to perform this action.' });
  }

  const vendorProducts = db.products.filter(p => user.role === 'admin' || p.vendorId === user.id || (user.id === 'u2' && p.vendorId === 'v1'));
  const vendorOrders = db.orders.filter(order => {
    // Return all for demo, in a real system we filter by order items vendorId
    return true; 
  });

  const totalRevenue = vendorOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = vendorOrders.filter(o => o.status === 'pending').length;
  const completedOrders = vendorOrders.filter(o => o.status === 'delivered').length;
  const awaitingDelivery = vendorOrders.filter(o => o.status === 'accepted' || o.status === 'processing' || o.status === 'out_for_delivery').length;

  const codOrdersList = vendorOrders.filter(o => o.paymentMethod === 'cod' && o.status !== 'delivered' && o.status !== 'cancelled');
  const codCount = codOrdersList.length;
  const codAmount = codOrdersList.reduce((sum, o) => sum + o.total, 0);

  const currentVendorId = user.id === 'u2' ? 'v1' : user.id;
  const vendorCommissions = db.commissions.filter((c: any) => user.role === 'admin' ? true : c.vendorId === currentVendorId);
  const totalNetEarnings = vendorCommissions.reduce((sum, c: any) => sum + c.vendorEarnings, 0);
  const totalCommissionsDeducted = vendorCommissions.reduce((sum, c: any) => sum + c.commissionAmount, 0);

  return res.json({
    profile: {
      shop_name: user.shopName || 'Vendor Shop',
      location: user.location || 'Unknown',
      is_verified: user.isVerified
    },
    stats: {
      total_products: vendorProducts.length,
      total_orders: vendorOrders.length,
      total_revenue: totalRevenue,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      awaiting_delivery: awaitingDelivery,
      cod_orders: codCount,
      cod_amount: codAmount,
      total_commissions_deducted: totalCommissionsDeducted,
      net_earnings: totalNetEarnings
    },
    recentOrders: vendorOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50).map(o => ({
       ...o,
       items: o.items.map((i: any) => {
         const pId = typeof i === 'string' ? i : i.productId;
         const p = db.products.find(prod => prod.id === pId);
         return {
           ...(typeof i === 'object' ? i : { productId: pId, quantity: 1, price: p?.price }),
           name: p?.name || 'Unknown Product',
           image: p?.image || ''
         };
       })
    }))
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }
  
  const userId = token.split('-').pop() || '';
  const user = db.users.find(u => u.id === userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ detail: 'Only admins can view this.' });
  }

  const totalPlatformRevenue = db.commissions.reduce((sum, c: any) => sum + c.commissionAmount, 0);
  const totalVendorPayouts = db.commissions.reduce((sum, c: any) => sum + c.vendorEarnings, 0);
  const totalCompletedOrders = db.orders.filter(o => o.status === 'delivered').length;

  res.json({
    totalPlatformRevenue,
    totalCommissionsEarned: totalPlatformRevenue,
    totalVendorPayouts,
    totalCompletedOrders,
    commissions: db.commissions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100),
    users: db.users
  });
});

app.get('/api/products', (req, res) => {
  res.json(db.products);
});

// Update product stock (for vendors)
app.put('/api/products/:id/stock', (req, res) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  
  const userId = token.split('-').pop();
  const user = db.users.find(u => u.id === userId);
  
  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    return res.status(403).json({ detail: 'Only vendors and admins can update products.' });
  }

  const { stockQuantity } = req.body;
  const productId = req.params.id;
  
  const productIndex = db.products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ detail: 'Product not found.' });
  }
  
  if (user.role === 'vendor') {
    const isOwner = db.products[productIndex].vendorId === user.id || (user.id === 'u2' && db.products[productIndex].vendorId === 'v1');
    if (!isOwner) return res.status(403).json({ detail: 'You can only edit your own products.' });
  }
  
  db.products[productIndex].stock = stockQuantity;
  saveDb();
  res.json(db.products[productIndex]);
});

// Create product
app.post('/api/products', (req, res) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  
  const userId = token.split('-').pop();
  const user = db.users.find(u => u.id === userId);
  
  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    return res.status(403).json({ detail: 'Only vendors and admins can create products.' });
  }

  const { name, category, price, description, image, stock } = req.body;
  
  const newProduct = {
    id: `p${db.products.length + 1}`,
    name,
    category,
    price: Number(price),
    description,
    image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
    stock: Number(stock),
    vendorId: user.role === 'admin' ? 'v1' : (user.id === 'u2' ? 'v1' : user.id)
  };
  
  db.products.push(newProduct);
  saveDb();
  res.status(201).json(newProduct);
});

// Delete product
app.put('/api/products/:id', (req, res) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  
  const userId = token.split('-').pop();
  const user = db.users.find(u => u.id === userId);
  
  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    return res.status(403).json({ detail: 'Only vendors and admins can update products.' });
  }

  const productId = req.params.id;
  const productIndex = db.products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ detail: 'Product not found.' });
  }

  if (user.role === 'vendor') {
    const isOwner = db.products[productIndex].vendorId === user.id || (user.id === 'u2' && db.products[productIndex].vendorId === 'v1');
    if (!isOwner) return res.status(403).json({ detail: 'You can only edit your own products.' });
  }

  const { name, category, price, description, image, stock } = req.body;
  
  // Update fields if provided
  
  if (name) db.products[productIndex].name = name;
  if (category) db.products[productIndex].category = category;
  if (price !== undefined) db.products[productIndex].price = Number(price);
  if (description) db.products[productIndex].description = description;
  if (image) db.products[productIndex].image = image;
  if (stock !== undefined) db.products[productIndex].stock = Number(stock);
  
  saveDb();
  res.json(db.products[productIndex]);
});

app.delete('/api/products/:id', (req, res) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  
  const userId = token.split('-').pop();
  const user = db.users.find(u => u.id === userId);
  
  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    return res.status(403).json({ detail: 'Only vendors and admins can delete products.' });
  }

  const productId = req.params.id;
  const productIndex = db.products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ detail: 'Product not found.' });
  }

  if (user.role === 'vendor') {
    const isOwner = db.products[productIndex].vendorId === user.id || (user.id === 'u2' && db.products[productIndex].vendorId === 'v1');
    if (!isOwner) return res.status(403).json({ detail: 'You can only delete your own products.' });
  }

  db.products.splice(productIndex, 1);
  saveDb();
  res.status(204).send();
});

// Helper for Real M-Pesa API
async function getMpesaToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  
  if (!consumerKey || !consumerSecret) throw new Error("M-Pesa credentials not configured");
  
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`
    }
  });
  
  if (!response.ok) throw new Error("Failed to get M-Pesa token");
  const data: any = await response.json();
  return data.access_token;
}

// M-PESA STK Push Endpoint
app.post('/api/payments/stk-push', async (req, res) => {
  const { phone, amount, orderIds } = req.body;
  
  if (!phone || !amount) {
    return res.status(400).json({ error: 'Phone and amount are required.' });
  }

  // Create Order
  const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
    const newOrder = { id: orderId, items: orderIds || [], total: amount, status: 'pending', createdAt: new Date() };
  db.orders.push(newOrder);
  saveDb();

  // Check if we have M-Pesa configuration
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const appUrl = process.env.APP_URL;

  if (shortcode && passkey && appUrl) {
    try {
      const token = await getMpesaToken();
      
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
      
      const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.ceil(amount), // M-Pesa requires integers
          PartyA: phone,
          PartyB: shortcode,
          PhoneNumber: phone,
          CallBackURL: `${appUrl.replace(/\/$/, '')}/api/payments/callback`,
          AccountReference: orderId,
          TransactionDesc: "Grocery Payment"
        })
      });
      
      const stkData: any = await stkResponse.json();
      
      if (stkData.ResponseCode === '0') {
        const checkoutRequestId = stkData.CheckoutRequestID;
        const newPayment = {
          checkoutRequestId,
          orderId,
          phone,
          amount,
          status: 'pending',
          createdAt: new Date()
        };
        db.payments.push(newPayment);
        saveDb();
        
        return res.json({
          ...stkData,
          Order: newOrder
        });
      } else {
        return res.status(400).json({ error: 'Failed to initiate STK Push', details: stkData });
      }
    } catch (err: any) {
      console.error('M-Pesa Real API Error:', err);
      return res.status(500).json({ error: err.message || 'M-Pesa API integration error' });
    }
  } else {
    // ---- Fallback to Mock Behavior ---- //
    console.warn("M-Pesa environment variables not complete! Falling back to mock behavior.");
    const checkoutRequestId = `ws_CO_${crypto.randomBytes(8).toString('hex')}`;
    const newPayment = {
      checkoutRequestId,
      orderId,
      phone,
      amount,
      status: 'pending',
      createdAt: new Date()
    };
    db.payments.push(newPayment);
    saveDb();

    // Simulate Daraja API processing & Callback
    setTimeout(() => {
      const paymentIdx = db.payments.findIndex(p => p.checkoutRequestId === checkoutRequestId);
      if (paymentIdx > -1) {
        db.payments[paymentIdx].status = 'completed';
        db.payments[paymentIdx].mpesaReceiptNumber = `QAZ${Math.floor(Math.random() * 10000000).toString(16).toUpperCase()}`;
        
        const orderIdx = db.orders.findIndex(o => o.id === orderId);
        if (orderIdx > -1) {
          db.orders[orderIdx].status = 'completed';
          db.orders[orderIdx].paymentStatus = 'paid';
        }
        saveDb();
        if (orderIdx > -1) {
           processOrderCommission(orderId);
        }
      }
    }, 15000); // 15 seconds simulation

    return res.json({
      MerchantRequestID: "29115-34620561-1",
      CheckoutRequestID: checkoutRequestId,
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: "Success. Request accepted for processing",
      Order: newOrder
    });
  }
});

app.post('/api/orders', (req, res) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ detail: 'Unauthorized' });
  const userId = token.split('-').pop() || '';
  
  const { items, amount, paymentMethod, deliveryLocation, customerName, customerPhone } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ detail: 'No items provided' });
  }

  const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
  const newOrder = {
    id: orderId,
    userId,
    items, // {productId, quantity, price}
    total: amount,
    status: 'pending', // pending, accepted, processing, out_for_delivery, delivered, cancelled
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'cod' ? 'cash_on_delivery' : 'pending_payment',
    deliveryLocation,
    customerName,
    customerPhone,
    createdAt: new Date().toISOString()
  };

  // Reduce product stock
  items.forEach((item: any) => {
    const pIdx = db.products.findIndex(p => p.id === item.productId);
    if (pIdx > -1 && db.products[pIdx].stock >= item.quantity) {
      db.products[pIdx].stock -= item.quantity;
    }
  });

  db.orders.push(newOrder);
  saveDb();
  res.status(201).json(newOrder);
});

app.get('/api/orders', (req, res) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ detail: 'Unauthorized' });
  const userId = token.split('-').pop();

  const user = db.users.find(u => u.id === userId);
  
  if (user?.role === 'vendor') {
    // For simplicity of this demo, vendor sees all orders that have their products
    const vendorOrders = db.orders.map(order => {
      // Find items that belong to vendor
      // Since products list might have vendorId, let's assume we map simple
      const vendorItems = (order.items || []).filter((i: any) => {
         const p = db.products.find(prod => prod.id === (i.productId || i));
         // In demo, check if it's 'v1' or just return all for simplicity
         return true; // Return all for now to demonstrate
      });
      return vendorItems.length > 0 ? order : null;
    }).filter(Boolean);
    
    return res.json(vendorOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  // Customer orders
  const userOrders = db.orders.filter(o => o.userId === userId).sort((a: any,b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const ordersWithDetails = userOrders.map(order => ({
    ...order,
    items: (order.items || []).map((i: any) => {
      const pId = typeof i === 'string' ? i : i.productId;
      const p = db.products.find(prod => prod.id === pId);
      return {
        ...(typeof i === 'object' ? i : { productId: pId, quantity: 1, price: p?.price }),
        name: p?.name || 'Unknown Product'
      };
    })
  }));
  
  res.json(ordersWithDetails);
});

function processOrderCommission(orderId: string) {
  const order = db.orders.find((o: any) => o.id === orderId);
  if (!order) return;

  // Check if commission already processed for this order
  if (db.commissions.some((c: any) => c.orderId === orderId)) return;

  // We should process if status is delivered or payment is successful.
  if (order.status !== 'delivered' && order.status !== 'completed' && order.paymentStatus !== 'paid' && order.paymentStatus !== 'completed') {
    return;
  }

  // Calculate gross by vendor based on items
  const vendorTotals: Record<string, number> = {};
  
  (order.items || []).forEach((item: any) => {
    // Find the product to get vendor ID
    const pId = typeof item === 'string' ? item : item.productId;
    const product = db.products.find(p => p.id === pId);
    // Assume v1 as default vendor if not set
    const vendorId = product?.vendorId || 'v1'; 
    const itemTotal = (item.price || product?.price || 0) * (item.quantity || 1);
    
    if (!vendorTotals[vendorId]) {
      vendorTotals[vendorId] = 0;
    }
    vendorTotals[vendorId] += itemTotal;
  });

  // Create commission records per vendor for this order
  Object.keys(vendorTotals).forEach(vendorId => {
    const grossAmount = vendorTotals[vendorId];
    // 5% Platform Commission
    const commissionAmount = grossAmount * 0.05;
    // 95% Vendor Payout
    const vendorEarnings = grossAmount - commissionAmount;

    db.commissions.push({
      id: `COM-${crypto.randomBytes(4).toString('hex')}`,
      orderId: order.id,
      vendorId,
      grossAmount,
      commissionAmount,
      vendorEarnings,
      createdAt: new Date().toISOString()
    });
  });
  
  saveDb();
}

app.put('/api/orders/:id/status', (req, res) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ detail: 'Unauthorized' });
  
  const { status, paymentStatus } = req.body;
  const orderIndex = db.orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) return res.status(404).json({ detail: 'Order not found' });
  
  if (status) db.orders[orderIndex].status = status;
  if (paymentStatus) db.orders[orderIndex].paymentStatus = paymentStatus;
  
  saveDb();
  
  // Try to process commission if status qualifies
  processOrderCommission(db.orders[orderIndex].id);
  
  res.json(db.orders[orderIndex]);
});


// Check Payment Status endpoint
app.get('/api/payments/status/:checkoutRequestId', (req, res) => {
  const payment = db.payments.find(p => p.checkoutRequestId === req.params.checkoutRequestId);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

// Real Daraja Callback Endpoint (Mocked handling)
app.post('/api/payments/callback', (req, res) => {
  const callbackData = req.body?.Body?.stkCallback;
  if (!callbackData) return res.status(400).json({ error: 'Invalid callback payload' });

  const checkoutRequestId = callbackData.CheckoutRequestID;
  const resultCode = callbackData.ResultCode; // 0 means success
  
  const paymentIdx = db.payments.findIndex(p => p.checkoutRequestId === checkoutRequestId);
  if (paymentIdx > -1) {
    if (resultCode === 0) {
      db.payments[paymentIdx].status = 'completed';
      // Find mpesa receipt number in Item array
      const receiptItem = callbackData.CallbackMetadata?.Item?.find((i: any) => i.Name === 'MpesaReceiptNumber');
      if (receiptItem) {
         db.payments[paymentIdx].mpesaReceiptNumber = receiptItem.Value;
      }
      
      const orderIdx = db.orders.findIndex(o => o.id === db.payments[paymentIdx].orderId);
      if (orderIdx > -1) {
        db.orders[orderIdx].status = 'completed';
        db.orders[orderIdx].paymentStatus = 'paid';
      }
    } else {
       db.payments[paymentIdx].status = 'failed';
       const orderIdx = db.orders.findIndex(o => o.id === db.payments[paymentIdx].orderId);
       if (orderIdx > -1) {
         db.orders[orderIdx].status = 'failed';
         db.orders[orderIdx].paymentStatus = 'failed';
       }
    }
    saveDb();
    if (resultCode === 0) {
      processOrderCommission(db.payments[paymentIdx].orderId);
    }
  }
  
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const path = await import('path');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
