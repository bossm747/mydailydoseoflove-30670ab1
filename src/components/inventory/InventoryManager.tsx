import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  History
} from 'lucide-react';
import { StockAdjustmentForm } from './StockAdjustmentForm';

interface InventoryItem {
  id: string;
  business_id?: string;
  user_id: string;
  product_id: string;
  location_name: string;
  current_stock: number;
  available_stock: number;
  reserved_stock: number;
  incoming_stock: number;
  last_counted_at?: string;
  last_counted_by?: string;
  notes?: string;
  created_at: string;
  product?: {
    product_name: string;
    product_code: string;
    sku?: string;
    unit_of_measure: string;
    reorder_point: number;
    min_stock_level: number;
    cost_price: number;
    selling_price: number;
  } | null;
}

interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: string;
  transaction_reference?: string;
  quantity_change: number;
  unit_cost?: number;
  total_cost?: number;
  stock_before: number;
  stock_after: number;
  location_name: string;
  reason?: string;
  notes?: string;
  transaction_date: string;
  created_by: string;
  product?: {
    product_name: string;
    product_code: string;
  };
}

export default function InventoryManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');

  const fetchInventory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(
            product_name, 
            product_code, 
            sku, 
            unit_of_measure, 
            reorder_point, 
            min_stock_level,
            cost_price,
            selling_price
          )
        `)
        .eq('business_id', currentBusiness?.id || null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory((data as unknown as InventoryItem[]) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching inventory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          product:products(product_name, product_code)
        `)
        .eq('business_id', currentBusiness?.id || null)
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions((data as unknown as InventoryTransaction[]) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching transactions",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, [user, currentBusiness]);

  const filteredInventory = inventory.filter(item => 
    searchTerm === '' || 
    item.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (item: InventoryItem) => {
    const stock = item.current_stock;
    const reorderPoint = item.product?.reorder_point || 0;
    const minLevel = item.product?.min_stock_level || 0;
    
    if (stock <= 0) return { label: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    if (stock <= reorderPoint) return { label: 'Reorder Now', color: 'secondary', icon: TrendingDown };
    if (stock <= minLevel) return { label: 'Low Stock', color: 'outline', icon: Minus };
    return { label: 'In Stock', color: 'default', icon: TrendingUp };
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => {
      const cost = item.product?.cost_price || 0;
      return total + (item.current_stock * cost);
    }, 0);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return TrendingUp;
      case 'sale': return TrendingDown;
      case 'adjustment': return Package;
      case 'transfer': return Package;
      default: return Package;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-600';
      case 'sale': return 'text-red-600';
      case 'adjustment': return 'text-blue-600';
      case 'transfer': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Inventory Management</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Track stock levels and manage inventory transactions
          </p>
        </div>
        <Button 
          onClick={() => setShowAdjustmentDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Stock Adjustment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-lg sm:text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {inventory.filter(item => item.current_stock <= (item.product?.reorder_point || 0)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {inventory.filter(item => item.current_stock <= 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-lg sm:text-2xl font-bold">
                  ₱{getTotalInventoryValue().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="inventory" className="text-xs sm:text-sm">
              Current Stock ({inventory.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">
              Recent Transactions ({transactions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inventory" className="space-y-4">
          {filteredInventory.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add products to start tracking inventory'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                const StatusIcon = status.icon;

                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <h4 className="font-medium text-base sm:text-lg">
                              {item.product?.product_name}
                            </h4>
                            <Badge variant={status.color as any} className="text-xs">
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Code:</span> {item.product?.product_code}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span> {item.location_name}
                            </div>
                            <div>
                              <span className="font-medium">Unit:</span> {item.product?.unit_of_measure}
                            </div>
                            <div>
                              <span className="font-medium">Reorder Point:</span> {item.product?.reorder_point}
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-2xl font-bold">
                            {item.current_stock}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Available: {item.available_stock}
                          </div>
                          {item.reserved_stock > 0 && (
                            <div className="text-sm text-orange-600">
                              Reserved: {item.reserved_stock}
                            </div>
                          )}
                          {item.incoming_stock > 0 && (
                            <div className="text-sm text-green-600">
                              Incoming: {item.incoming_stock}
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowAdjustmentDialog(true);
                            }}
                          >
                            Adjust Stock
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground">
                  Inventory transactions will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const TransactionIcon = getTransactionIcon(transaction.transaction_type);
                const colorClass = getTransactionColor(transaction.transaction_type);

                return (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <TransactionIcon className={`h-5 w-5 ${colorClass}`} />
                          <div>
                            <div className="font-medium">
                              {transaction.product?.product_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                              {transaction.reason && ` - ${transaction.reason}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${transaction.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.quantity_change > 0 ? '+' : ''}{transaction.quantity_change}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
          </DialogHeader>
          <StockAdjustmentForm 
            item={selectedItem}
            onClose={() => {
              setShowAdjustmentDialog(false);
              setSelectedItem(null);
            }}
            onSaved={() => {
              fetchInventory();
              fetchTransactions();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}