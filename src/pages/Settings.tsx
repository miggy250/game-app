import React, { useState } from 'react';
import { useDepartments, useCreateDepartment, useCategories, useCreateCategory } from '@/hooks/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Building2, Tags, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SettingsPage: React.FC = () => {
  const { canManageInventory, isAdmin, profile } = useAuth();
  const { data: departments, isLoading: deptLoading } = useDepartments();
  const { data: categories, isLoading: catLoading } = useCategories();
  const createDepartment = useCreateDepartment();
  const createCategory = useCreateCategory();

  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '' });

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage departments and categories</p>
      </div>

      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Departments</CardTitle>
                <CardDescription>RTB departments that receive inventory items</CardDescription>
              </div>
              {canManageInventory && (
                <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Department</DialogTitle>
                      <DialogDescription>Create a new department</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateDepartment} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dept-name">Department Name *</Label>
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
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : departments?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No departments yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments?.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell className="text-muted-foreground">{dept.description || '-'}</TableCell>
                        <TableCell>{new Date(dept.created_at).toLocaleDateString('en-GB')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Item Categories</CardTitle>
                <CardDescription>Categories for organizing inventory items</CardDescription>
              </div>
              {canManageInventory && (
                <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Category</DialogTitle>
                      <DialogDescription>Create a new item category</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cat-name">Category Name *</Label>
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
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : categories?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No categories yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-muted-foreground">{cat.description || '-'}</TableCell>
                        <TableCell>{new Date(cat.created_at).toLocaleDateString('en-GB')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{profile?.email || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Account Created</Label>
                  <p className="font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB') : 'Unknown'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <p className="font-medium">
                    {isAdmin ? 'Administrator' : canManageInventory ? 'Secretary' : 'Department Head'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
