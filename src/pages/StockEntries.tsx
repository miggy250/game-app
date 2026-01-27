import React, { useState } from 'react';
import { useStockEntries, useCreateStockEntry, useInventoryItems } from '@/hooks/useInventory';
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
import { Plus, Search, PackagePlus, FileDown, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { exportStockEntriesToPDF, exportStockEntriesToExcel } from '@/utils/exportUtils';

const StockEntries: React.FC = () => {
  const { canManageInventory } = useAuth();
  const { data: entries, isLoading } = useStockEntries();
  const { data: items } = useInventoryItems();
  const createEntry = useCreateStockEntry();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    item_id: '',
    quantity: 1,
    unit_price: 0,
    notes: '',
  });

  const filteredEntries = entries?.filter((entry) => {
    const matchesSearch = 
      entry.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const selectedItem = items?.find(i => i.id === formData.item_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createEntry.mutateAsync({
      ...formData,
      unit_price: formData.unit_price || selectedItem?.unit_price || 0,
    });
    
    setIsAddDialogOpen(false);
    setFormData({
      item_id: '',
      quantity: 1,
      unit_price: 0,
      notes: '',
    });
  };

  const handleItemSelect = (itemId: string) => {
    const item = items?.find(i => i.id === itemId);
    setFormData({
      ...formData,
      item_id: itemId,
      unit_price: item?.unit_price || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Entries</h1>
          <p className="text-muted-foreground">Record new stock received</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => filteredEntries && exportStockEntriesToPDF(filteredEntries)}
            disabled={!filteredEntries?.length}
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => filteredEntries && exportStockEntriesToExcel(filteredEntries)}
            disabled={!filteredEntries?.length}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
          {canManageInventory && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Stock Entry</DialogTitle>
                  <DialogDescription>
                    Add new stock received for an existing item
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="item">Item *</Label>
                    <Select value={formData.item_id} onValueChange={handleItemSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {items?.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} (Current: {item.quantity_in_stock})
                          </SelectItem>
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
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit_price">Unit Price (RWF) *</Label>
                      <Input
                        id="unit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                  {formData.quantity && formData.unit_price ? (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        Total Value: {(formData.quantity * formData.unit_price).toLocaleString()} RWF
                      </p>
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional notes about this stock entry"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createEntry.isPending || !formData.item_id}>
                    <PackagePlus className="w-4 h-4 mr-2" />
                    Add to Stock
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stock entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Stock Entry Records ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PackagePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No stock entries found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.date_entered).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="font-medium">{entry.item?.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default" className="bg-success text-success-foreground">
                        +{entry.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{entry.unit_price.toLocaleString()} RWF</TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.total_price.toLocaleString()} RWF
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{entry.notes || '-'}</TableCell>
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

export default StockEntries;
