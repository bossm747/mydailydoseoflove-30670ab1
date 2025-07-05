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
  Tag,
  DollarSign,
  Barcode,
  Eye,
  Edit
} from 'lucide-react';
import { ProductForm } from './ProductForm';

interface Product {
  id: string;
  business_id?: string;
  user_id: string;
  product_code: string;
  product_name: string;
  description?: string;
  product_type: string;
  category_id?: string;
  unit_of_measure: string;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  is_trackable: boolean;
  is_sellable: boolean;
  is_purchasable: boolean;
  weight?: number;
  dimensions?: any;
  barcode?: string;
  sku?: string;
  supplier_info?: any;
  tax_rate: number;
  images?: any;
  tags?: string[];
  custom_fields?: any;
  is_active: boolean;
  created_at: string;
  category?: {
    category_name: string;
    category_code: string;
  } | null;
  inventory?: {
    current_stock: number;
    available_stock: number;
  }[];
}

interface ProductCategory {
  id: string;
  category_name: string;
  category_code: string;
  description?: string;
}

export default function ProductCatalog() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .or(`business_id.eq.${currentBusiness?.id || 'null'},business_id.is.null`)
        .eq('is_active', true)
        .order('category_name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(category_name, category_code),
          inventory(current_stock, available_stock)
        `)
        .eq('business_id', currentBusiness?.id || null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data as unknown as Product[]) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [user, currentBusiness]);

  const filteredProducts = products.filter(product => 
    searchTerm === '' || 
    product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'default';
      case 'service': return 'secondary';
      case 'digital': return 'outline';
      default: return 'secondary';
    }
  };

  const getStockStatus = (product: Product) => {
    const currentStock = product.inventory?.[0]?.current_stock || 0;
    
    if (currentStock <= 0) return { label: 'Out of Stock', color: 'destructive' };
    if (currentStock <= product.reorder_point) return { label: 'Low Stock', color: 'secondary' };
    if (currentStock <= product.min_stock_level) return { label: 'Below Min', color: 'outline' };
    return { label: 'In Stock', color: 'default' };
  };

  const getProfitMargin = (product: Product) => {
    if (product.cost_price === 0) return 0;
    return ((product.selling_price - product.cost_price) / product.cost_price * 100);
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
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Product Catalog</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your products, services, and inventory items
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-lg sm:text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-lg sm:text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Margin</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {products.length > 0 
                    ? `${(products.reduce((sum, p) => sum + getProfitMargin(p), 0) / products.length).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Barcode className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {products.filter(p => (p.inventory?.[0]?.current_stock || 0) <= p.reorder_point).length}
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
            placeholder="Search products, codes, SKUs..."
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
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm">
              Products ({products.filter(p => p.product_type === 'product').length})
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs sm:text-sm">
              Services ({products.filter(p => p.product_type === 'service').length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first product'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Product
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const profitMargin = getProfitMargin(product);
                const currentStock = product.inventory?.[0]?.current_stock || 0;

                return (
                  <Card 
                    key={product.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setEditingProduct(product)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                        <div className="truncate font-semibold">
                          {product.product_name}
                        </div>
                        <div className="flex gap-1">
                          <Badge variant={getProductTypeColor(product.product_type)} className="text-xs">
                            {product.product_type}
                          </Badge>
                          <Badge variant={stockStatus.color as any} className="text-xs">
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Code:</span>
                          <span className="font-medium">{product.product_code}</span>
                        </div>
                        {product.sku && (
                          <div className="flex justify-between">
                            <span>SKU:</span>
                            <span className="font-medium">{product.sku}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span>{product.category?.category_name || 'Uncategorized'}</span>
                        </div>
                        {product.is_trackable && (
                          <div className="flex justify-between">
                            <span>Stock:</span>
                            <span className="font-medium">{currentStock} {product.unit_of_measure}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cost:</span>
                            <span>₱{product.cost_price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Selling:</span>
                            <span className="font-medium">₱{product.selling_price.toLocaleString()}</span>
                          </div>
                          {profitMargin > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Margin:</span>
                              <span className={`font-medium ${profitMargin > 20 ? 'text-green-600' : profitMargin > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {profitMargin.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {product.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{product.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={showCreateDialog || !!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingProduct(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={editingProduct}
            categories={categories}
            onClose={() => {
              setShowCreateDialog(false);
              setEditingProduct(null);
            }}
            onSaved={fetchProducts}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}