import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { InventoryItem, ItemCategory, Department, StockEntry, Distribution, DashboardStats } from '@/types/inventory';
import { toast } from 'sonner';

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as ItemCategory[];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('item_categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Departments
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Department[];
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (department: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .insert(department)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Inventory Items
export const useInventoryItems = () => {
  return useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:item_categories(*)
        `)
        .order('name');
      
      if (error) throw error;
      return data as (InventoryItem & { category: ItemCategory | null })[];
    },
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: {
      name: string;
      description?: string;
      category_id?: string;
      unit_price: number;
      quantity_in_stock: number;
      minimum_stock_level?: number;
    }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Item added to inventory');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Stock Entries
export const useStockEntries = () => {
  return useQuery({
    queryKey: ['stock-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_entries')
        .select(`
          *,
          item:inventory_items(*)
        `)
        .order('date_entered', { ascending: false });
      
      if (error) throw error;
      return data as (StockEntry & { item: InventoryItem })[];
    },
  });
};

export const useCreateStockEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entry: {
      item_id: string;
      quantity: number;
      unit_price: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('stock_entries')
        .insert(entry)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-entries'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Stock entry recorded');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Distributions
export const useDistributions = () => {
  return useQuery({
    queryKey: ['distributions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('distributions')
        .select(`
          *,
          item:inventory_items(*),
          department:departments(*)
        `)
        .order('distribution_date', { ascending: false });
      
      if (error) throw error;
      return data as (Distribution & { item: InventoryItem; department: Department })[];
    },
  });
};

export const useCreateDistribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (distribution: {
      item_id: string;
      department_id: string;
      quantity: number;
      unit_price: number;
      purpose?: string;
      received_by?: string;
    }) => {
      const { data, error } = await supabase
        .from('distributions')
        .insert(distribution)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Distribution recorded');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Dashboard Stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [itemsResult, distributionsResult, departmentsResult, categoriesResult] = await Promise.all([
        supabase.from('inventory_items').select('*'),
        supabase.from('distributions').select('total_price'),
        supabase.from('departments').select('id'),
        supabase.from('item_categories').select('id'),
      ]);

      if (itemsResult.error) throw itemsResult.error;
      if (distributionsResult.error) throw distributionsResult.error;

      const items = itemsResult.data || [];
      const distributions = distributionsResult.data || [];
      const departments = departmentsResult.data || [];
      const categories = categoriesResult.data || [];

      const totalItems = items.reduce((sum, item) => sum + item.quantity_in_stock, 0);
      const totalValue = items.reduce((sum, item) => sum + (item.quantity_in_stock * item.unit_price), 0);
      const totalDistributed = distributions.reduce((sum, d) => sum + (d.total_price || 0), 0);
      const lowStockItems = items.filter(item => item.quantity_in_stock <= item.minimum_stock_level).length;

      return {
        totalItems,
        totalValue,
        totalDistributed,
        lowStockItems,
        departmentsCount: departments.length,
        categoriesCount: categories.length,
      };
    },
  });
};
