import React, { useState } from 'react';
import { useDepartments, useCreateDepartment, useCategories, useCreateCategory } from '@/hooks/useInventory';
import { useAllUsers, useAssignRole, useRemoveRole } from '@/hooks/useUserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Tags, Users, Shield, UserCog, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppRole } from '@/types/inventory';

const SettingsPage: React.FC = () => {
  const { canManageInventory, isAdmin, profile, roles } = useAuth();
  const { data: departments, isLoading: deptLoading } = useDepartments();
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const createDepartment = useCreateDepartment();
  const createCategory = useCreateCategory();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDepartment.mutateAsync(deptForm);
    setIsDeptDialogOpen(false);
    setDeptForm({ name: '', description: '' });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategory.mutateAsync(catForm);
    setIsCatDialogOpen(false);
    setCatForm({ name: '', description: '' });
  };

  const handleAssignRole = async (userId: string, role: AppRole) => {
    await assignRole.mutateAsync({ userId, role });
    setSelectedRole('');
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    await removeRole.mutateAsync({ userId, role });
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'secretary':
        return <Badge variant="default"><UserCog className="w-3 h-3 mr-1" />Secretary</Badge>;
      case 'department_head':
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Dept. Head</Badge>;
      default:
        return null;
    }
  };

  const currentRole = isAdmin ? 'Administrator' : roles.includes('secretary') ? 'Secretary' : roles.includes('department_head') ? 'Department Head' : 'No Role Assigned';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration</p>
      </div>

      {/* Profile Card - Always visible */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile?.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{currentRole}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB') : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Departments Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Departments
              </CardTitle>
              <CardDescription>RTB departments</CardDescription>
            </div>
            {canManageInventory && (
              <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Department</DialogTitle>
                    <DialogDescription>Create a new department</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dept-name">Name *</Label>
                      <Input
                        id="dept-name"
                        value={deptForm.name}
                        onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                        placeholder="e.g., Finance Department"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept-desc">Description</Label>
                      <Textarea
                        id="dept-desc"
                        value={deptForm.description}
                        onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={createDepartment.isPending}>
                      Create Department
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {deptLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : departments?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No departments yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {departments?.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{dept.name}</p>
                      {dept.description && (
                        <p className="text-xs text-muted-foreground">{dept.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Categories
              </CardTitle>
              <CardDescription>Item categories</CardDescription>
            </div>
            {canManageInventory && (
              <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>Create a new item category</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Name *</Label>
                      <Input
                        id="cat-name"
                        value={catForm.name}
                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                        placeholder="e.g., Cleaning Supplies"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-desc">Description</Label>
                      <Textarea
                        id="cat-desc"
                        value={catForm.description}
                        onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={createCategory.isPending}>
                      Create Category
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {catLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : categories?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories?.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Management - Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Assign roles to users (Admin only)</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : users?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ? (
                            <Badge variant="outline">No Role</Badge>
                          ) : (
                            user.roles.map((role) => (
                              <div key={role} className="flex items-center gap-1">
                                {getRoleBadge(role)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveRole(user.user_id, role)}
                                >
                                  ×
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value=""
                            onValueChange={(value: AppRole) => handleAssignRole(user.user_id, value)}
                          >
                            <SelectTrigger className="w-36 h-8">
                              <SelectValue placeholder="Add role..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              {!user.roles.includes('admin') && (
                                <SelectItem value="admin">Admin</SelectItem>
                              )}
                              {!user.roles.includes('secretary') && (
                                <SelectItem value="secretary">Secretary</SelectItem>
                              )}
                              {!user.roles.includes('department_head') && (
                                <SelectItem value="department_head">Dept. Head</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
