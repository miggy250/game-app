import React, { useState } from 'react';
import { useDistributions, useCreateDistribution, useInventoryItems, useDepartments } from '@/hooks/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Send, FileDown, FileSpreadsheet, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { exportDistributionsToPDF, exportDistributionsToExcel } from '@/utils/exportUtils';
import { toast } from 'sonner';

const Distributions: React.FC = () => {
  const { canManageInventory } = useAuth();
  const { data: distributions, isLoading } = useDistributions();
  const { data: items } = useInventoryItems();
  const { data: departments } = useDepartments();
  const createDistribution = useCreateDistribution();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    item_id: '',
    department_id: '',
    quantity: 1,
    purpose: '',
    received_by: '',
  });

  const filteredDistributions = distributions?.filter((dist) => {
    const matchesSearch = 
      dist.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.department?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.received_by?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || dist.department_id === departmentFilter;
    return matchesSearch && matchesDepartment;
  }) || [];

  const selectedItem = items?.find(i => i.id === formData.item_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }

    if (formData.quantity > selectedItem.quantity_in_stock) {
      toast.error(`Only ${selectedItem.quantity_in_stock} units available in stock`);
      return;
    }

    await createDistribution.mutateAsync({
      ...formData,
      unit_price: selectedItem.unit_price,
    });
    
    setIsAddDialogOpen(false);
    setFormData({
      item_id: '',
      department_id: '',
      quantity: 1,
      purpose: '',
      received_by: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Distributions</h1>
          <p className="text-muted-foreground">Track items distributed to departments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => filteredDistributions && exportDistributionsToPDF(filteredDistributions)}
            disabled={!filteredDistributions?.length}
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => filteredDistributions && exportDistributionsToExcel(filteredDistributions)}
            disabled={!filteredDistributions?.length}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
          {canManageInventory && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Distribution
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Distribution</DialogTitle>
                  <DialogDescription>
                    Record items distributed to a department
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="item">Item *</Label>
                    <Select value={formData.item_id} onValueChange={(value) => setFormData({ ...formData, item_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {items?.filter(i => i.quantity_in_stock > 0).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.quantity_in_stock} in stock)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedItem?.quantity_in_stock || 999}
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        value={selectedItem ? `${selectedItem.unit_price.toLocaleString()} RWF` : '-'}
                        disabled
                      />
                    </div>
                  </div>
                  {selectedItem && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        Total: {(formData.quantity * selectedItem.unit_price).toLocaleString()} RWF
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="received_by">Received By</Label>
                    <Input
                      id="received_by"
                      value={formData.received_by}
                      onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
                      placeholder="Name of person receiving items"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="Reason for distribution"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createDistribution.isPending || !formData.item_id || !formData.department_id}>
                    <Send className="w-4 h-4 mr-2" />
                    Record Distribution
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search distributions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Distributions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Distribution Records ({filteredDistributions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredDistributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No distributions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Received By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributions.map((dist) => (
                  <TableRow key={dist.id}>
                    <TableCell>
                      {new Date(dist.distribution_date).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="font-medium">{dist.item?.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{dist.department?.name}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{dist.quantity}</TableCell>
                    <TableCell className="text-right">{dist.unit_price.toLocaleString()} RWF</TableCell>
                    <TableCell className="text-right font-medium">
                      {dist.total_price.toLocaleString()} RWF
                    </TableCell>
                    <TableCell>{dist.received_by || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Distributions;
