import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllUsers, useAssignRole, useRemoveRole } from '@/hooks/useUserManagement';
import { useDashboardStats, useCategories, useDepartments, useCreateCategory, useCreateDepartment } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, Users, Package, Building2, Tags, TrendingUp, 
  AlertTriangle, DollarSign, Plus, UserPlus, UserMinus 
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import type { AppRole } from '@/types/inventory';

const AdminDashboard: React.FC = () => {
  const { isAdmin, profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: categories } = useCategories();
  const { data: departments } = useDepartments();
  const createCategory = useCreateCategory();
  const createDepartment = useCreateDepartment();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const [newCategory, setNewCategory] = React.useState({ name: '', description: '' });
  const [newDepartment, setNewDepartment] = React.useState({ name: '', description: '' });
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = React.useState(false);

  // Redirect non-admins
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategory.mutateAsync(newCategory);
    setNewCategory({ name: '', description: '' });
    setCategoryDialogOpen(false);
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDepartment.mutateAsync(newDepartment);
    setNewDepartment({ name: '', description: '' });
    setDepartmentDialogOpen(false);
  };

  const handleAssignRole = async (userId: string, role: AppRole) => {
    await assignRole.mutateAsync({ userId, role });
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    await removeRole.mutateAsync({ userId, role });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'secretary': return 'secondary';
      case 'department_head': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome, {profile?.full_name} - Full System Control</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalItems.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalValue.toLocaleString()} RWF</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Distributed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalDistributed.toLocaleString()} RWF</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-destructive">{stats?.lowStockItems}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge 
                              key={role} 
                              variant={getRoleBadgeVariant(role)}
                              className="cursor-pointer"
                              onClick={() => handleRemoveRole(user.user_id, role as AppRole)}
                            >
                              {role}
                              <UserMinus className="w-3 h-3 ml-1" />
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => handleAssignRole(user.user_id, value as AppRole)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Add role" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="department_head">Dept Head</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No users found</p>
          )}
        </CardContent>
      </Card>

      {/* Categories & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Categories ({categories?.length || 0})
              </CardTitle>
              <CardDescription>Item categories for organization</CardDescription>
            </div>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
                  <DialogDescription>Create a new item category</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Name</Label>
                    <Input
                      id="cat-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g., Office Supplies"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-desc">Description</Label>
                    <Input
                      id="cat-desc"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createCategory.isPending}>
                    Create Category
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-sm">
                  {cat.name}
                </Badge>
              ))}
              {(!categories || categories.length === 0) && (
                <p className="text-muted-foreground text-sm">No categories yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Departments ({departments?.length || 0})
              </CardTitle>
              <CardDescription>Organizational departments</CardDescription>
            </div>
            <Dialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Department</DialogTitle>
                  <DialogDescription>Create a new department</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDepartment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept-name">Name</Label>
                    <Input
                      id="dept-name"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      placeholder="e.g., Finance"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept-desc">Description</Label>
                    <Input
                      id="dept-desc"
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createDepartment.isPending}>
                    Create Department
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {departments?.map((dept) => (
                <Badge key={dept.id} variant="outline" className="text-sm">
                  {dept.name}
                </Badge>
              ))}
              {(!departments || departments.length === 0) && (
                <p className="text-muted-foreground text-sm">No departments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;