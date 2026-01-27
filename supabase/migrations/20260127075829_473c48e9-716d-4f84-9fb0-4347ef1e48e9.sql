-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'secretary', 'department_head');

-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create item categories table
CREATE TABLE public.item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.item_categories (name, description) VALUES
  ('Office Supplies', 'Stationery, paper, folders, pens, etc.'),
  ('IT Equipment', 'Computers, printers, accessories'),
  ('Furniture', 'Desks, chairs, cabinets');

-- Create inventory items table (stock)
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.item_categories(id) ON DELETE SET NULL,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock_level INTEGER NOT NULL DEFAULT 0,
  date_entered TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock transactions table (items entering stock)
CREATE TABLE public.stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  entered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date_entered TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create distribution table (items given to departments)
CREATE TABLE public.distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  purpose TEXT,
  distributed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  received_by TEXT,
  distribution_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's department (for department heads)
CREATE OR REPLACE FUNCTION public.get_user_department_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.departments WHERE head_user_id = _user_id LIMIT 1
$$;

-- Create function to check if user is admin or secretary
CREATE OR REPLACE FUNCTION public.is_admin_or_secretary(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'secretary')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for departments
CREATE POLICY "All authenticated users can view departments" ON public.departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and secretary can manage departments" ON public.departments
  FOR ALL USING (public.is_admin_or_secretary(auth.uid()));

-- RLS Policies for item_categories
CREATE POLICY "All authenticated users can view categories" ON public.item_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and secretary can manage categories" ON public.item_categories
  FOR ALL USING (public.is_admin_or_secretary(auth.uid()));

-- RLS Policies for inventory_items
CREATE POLICY "All authenticated users can view inventory" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and secretary can manage inventory" ON public.inventory_items
  FOR ALL USING (public.is_admin_or_secretary(auth.uid()));

-- RLS Policies for stock_entries
CREATE POLICY "All authenticated users can view stock entries" ON public.stock_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and secretary can manage stock entries" ON public.stock_entries
  FOR ALL USING (public.is_admin_or_secretary(auth.uid()));

-- RLS Policies for distributions
CREATE POLICY "Admin and secretary can view all distributions" ON public.distributions
  FOR SELECT USING (public.is_admin_or_secretary(auth.uid()));

CREATE POLICY "Department heads can view their department distributions" ON public.distributions
  FOR SELECT USING (
    department_id = public.get_user_department_id(auth.uid())
  );

CREATE POLICY "Admin and secretary can manage distributions" ON public.distributions
  FOR ALL USING (public.is_admin_or_secretary(auth.uid()));

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to update stock when items are distributed
CREATE OR REPLACE FUNCTION public.update_stock_on_distribution()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.inventory_items
  SET quantity_in_stock = quantity_in_stock - NEW.quantity
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_distribution_created
  AFTER INSERT ON public.distributions
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_distribution();

-- Create trigger to update stock when new stock is entered
CREATE OR REPLACE FUNCTION public.update_stock_on_entry()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.inventory_items
  SET quantity_in_stock = quantity_in_stock + NEW.quantity,
      unit_price = NEW.unit_price
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;