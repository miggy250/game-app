export type AppRole = 'admin' | 'secretary' | 'department_head';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  head_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  unit_price: number;
  quantity_in_stock: number;
  minimum_stock_level: number;
  date_entered: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: ItemCategory;
}

export interface StockEntry {
  id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  entered_by: string | null;
  date_entered: string;
  created_at: string;
  item?: InventoryItem;
}

export interface Distribution {
  id: string;
  item_id: string;
  department_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  purpose: string | null;
  distributed_by: string | null;
  received_by: string | null;
  distribution_date: string;
  created_at: string;
  item?: InventoryItem;
  department?: Department;
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  totalDistributed: number;
  lowStockItems: number;
  departmentsCount: number;
  categoriesCount: number;
}
