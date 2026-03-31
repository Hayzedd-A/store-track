// User Types
export interface IUser {
  _id?: string;
  email: string;
  password?: string;
  name: string;
  createdAt?: Date;
}

// Category Types
export interface ICategory {
  _id?: string;
  name: string;
  color: string;
  image?: string;
  createdAt?: Date;
}

// Unit Configuration
export interface IUnitConfig {
  saleUnit: string;
  restockUnit: string;
  unitsPerRestock: number;
}

// Product Types
export interface IProduct {
  _id: string;
  name: string;
  categoryId?: string | ICategory;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  quantity: number;
  image?: string;
  publicId?: string; // Add publicId property
  minStock: number;
  shelfNo?: string;
  unitConfig: IUnitConfig;
  createdAt: Date;
  updatedAt: Date;
}

// Sale Item Types
export interface ISaleItem {
  _id: string;
  productId: string | IProduct;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
  subtotal: number;
}

// Sale Types
export interface ISale {
  _id: string;
  totalAmount: number;
  paymentMethod: 'cash';
  status: 'completed' | 'cancelled' | 'refunded';
  items: ISaleItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Stock History Types
export interface IStockHistory {
  _id: string;
  productId: string | IProduct;
  changeType: 'restock' | 'sale' | 'adjustment' | 'return';
  quantityChange: number;
  previousQty: number;
  newQty: number;
  currentPrice?: Number;
  notes?: string;
  createdAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Cart Types
export interface ICartItem {
  product: IProduct;
  quantity: number;
  subtotal: number;
}

export interface ICart {
  items: ICartItem[];
  totalAmount: number;
  totalItems: number;
}

// Dashboard Stats
export interface IDashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  todayRevenue: number;
  totalSales: number;
  totalRevenue: number;
}

// Report Filter
export interface IReportFilter {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}

