import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useInventoryItems, useDistributions } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, TrendingDown, Building2, Tags, AlertTriangle, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { profile, isAdmin, isSecretary } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: items } = useInventoryItems();
  const { data: distributions } = useDistributions();

  const lowStockItems = items?.filter(item => item.quantity_in_stock <= item.minimum_stock_level) || [];
  const recentDistributions = distributions?.slice(0, 5) || [];

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    variant = 'default',
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    variant?: 'default' | 'warning' | 'success';
  }) => (
    <Card className={variant === 'warning' ? 'border-warning/50' : variant === 'success' ? 'border-success/50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${variant === 'warning' ? 'text-warning' : variant === 'success' ? 'text-success' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        {statsLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your inventory management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items in Stock"
          value={stats?.totalItems?.toLocaleString() || 0}
          description="Across all categories"
          icon={Package}
        />
        <StatCard
          title="Total Stock Value"
          value={`${(stats?.totalValue || 0).toLocaleString()} RWF`}
          description="Current inventory value"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Total Distributed"
          value={`${(stats?.totalDistributed || 0).toLocaleString()} RWF`}
          description="Value distributed to departments"
          icon={Building2}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats?.lowStockItems || 0}
          description="Items below minimum level"
          icon={AlertTriangle}
          variant={stats?.lowStockItems ? 'warning' : 'default'}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Departments"
          value={stats?.departmentsCount || 0}
          description="Active departments"
          icon={Users}
        />
        <StatCard
          title="Categories"
          value={stats?.categoriesCount || 0}
          description="Item categories"
          icon={Tags}
        />
      </div>

      {/* Low Stock & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Items
            </CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                All items are well stocked! ✓
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category?.name || 'Uncategorized'}</p>
                    </div>
                    <Badge variant="destructive">
                      {item.quantity_in_stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Distributions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Recent Distributions
            </CardTitle>
            <CardDescription>Latest items distributed to departments</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDistributions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No distributions yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentDistributions.map((dist) => (
                  <div key={dist.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{dist.item?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {dist.department?.name} • {new Date(dist.distribution_date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      x{dist.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Badge */}
      <div className="flex gap-2">
        {isAdmin && <Badge className="bg-primary">Admin</Badge>}
        {isSecretary && <Badge className="bg-success text-success-foreground">Secretary</Badge>}
      </div>
    </div>
  );
};

export default Dashboard;
