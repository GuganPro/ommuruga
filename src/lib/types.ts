export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'COD';
  orderDate: string;
  shipped: boolean;
}
