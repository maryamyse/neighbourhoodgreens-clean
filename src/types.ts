export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  vendorId: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: string[]; // array of product IDs
  total: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface PaymentStatus {
  checkoutRequestId: string;
  orderId: string;
  phone: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  mpesaReceiptNumber?: string;
  createdAt: string;
}
