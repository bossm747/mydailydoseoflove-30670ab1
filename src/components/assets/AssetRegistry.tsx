import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Home, Car, Laptop, Gem, Palette, Package, Plus, Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';

interface Asset {
  id: string;
  asset_name: string;
  asset_type: string;
  estimated_value: number;
  purchase_date?: string;
  purchase_price?: number;
  depreciation_rate?: number;
  location?: string;
  condition: string;
  insurance_value?: number;
  description?: string;
  serial_number?: string;
  warranty_expiry?: string;
  tags?: string[];
  created_at: string;
}

const ASSET_TYPES = [
  { value: 'real_estate', label: 'Real Estate', icon: Home, color: 'bg-blue-100 text-blue-800' },
  { value: 'vehicle', label: 'Vehicle', icon: Car, color: 'bg-green-100 text-green-800' },
  { value: 'electronics', label: 'Electronics', icon: Laptop, color: 'bg-purple-100 text-purple-800' },
  { value: 'jewelry', label: 'Jewelry', icon: Gem, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'art', label: 'Art & Collectibles', icon: Palette, color: 'bg-pink-100 text-pink-800' },
  { value: 'equipment', label: 'Equipment', icon: Package, color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', icon: Package, color: 'bg-gray-100 text-gray-800' }
];

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' }
];

export default function AssetRegistry() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchAssets = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching assets",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAssets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean) || [];
    
    const assetData = {
      user_id: user.id,
      asset_name: formData.get('asset_name') as string,
      asset_type: formData.get('asset_type') as string,
      estimated_value: parseFloat(formData.get('estimated_value') as string),
      purchase_date: formData.get('purchase_date') as string || null,
      purchase_price: formData.get('purchase_price') ? parseFloat(formData.get('purchase_price') as string) : null,
      depreciation_rate: formData.get('depreciation_rate') ? parseFloat(formData.get('depreciation_rate') as string) / 100 : null,
      location: formData.get('location') as string || null,
      condition: formData.get('condition') as string,
      insurance_value: formData.get('insurance_value') ? parseFloat(formData.get('insurance_value') as string) : null,
      description: formData.get('description') as string || null,
      serial_number: formData.get('serial_number') as string || null,
      warranty_expiry: formData.get('warranty_expiry') as string || null,
      tags: tags.length > 0 ? tags : null
    };

    let result;
    if (editingAsset) {
      result = await supabase
        .from('assets')
        .update(assetData)
        .eq('id', editingAsset.id);
    } else {
      result = await supabase
        .from('assets')
        .insert([assetData]);
    }

    if (result.error) {
      toast({
        title: "Error saving asset",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingAsset ? "Asset updated" : "Asset added",
        description: `${assetData.asset_name} has been ${editingAsset ? 'updated' : 'added'} successfully.`,
      });
      setIsDialogOpen(false);
      setEditingAsset(null);
      fetchAssets();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting asset",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Asset deleted",
        description: "Asset has been deleted successfully.",
      });
      fetchAssets();
    }
  };

  const getAssetIcon = (type: string) => {
    const assetType = ASSET_TYPES.find(t => t.value === type);
    return assetType?.icon || Package;
  };

  const getAssetTypeColor = (type: string) => {
    const assetType = ASSET_TYPES.find(t => t.value === type);
    return assetType?.color || 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition: string) => {
    const conditionData = CONDITIONS.find(c => c.value === condition);
    return conditionData?.color || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const filteredAssets = selectedType === 'all' 
    ? assets 
    : assets.filter(asset => asset.asset_type === selectedType);

  const totalValue = assets.reduce((sum, asset) => sum + asset.estimated_value, 0);
  const assetsByType = ASSET_TYPES.map(type => ({
    ...type,
    count: assets.filter(asset => asset.asset_type === type.value).length,
    value: assets.filter(asset => asset.asset_type === type.value)
      .reduce((sum, asset) => sum + asset.estimated_value, 0)
  })).filter(type => type.count > 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Most Valuable</p>
                <p className="text-xl font-bold">
                  {assets.length > 0 ? 
                    formatCurrency(Math.max(...assets.map(a => a.estimated_value))) : 
                    '₱0'
                  }
                </p>
              </div>
              <Gem className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{assetsByType.length}</p>
              </div>
              <Palette className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Asset Registry</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {ASSET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingAsset(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="asset_name">Asset Name</Label>
                        <Input
                          id="asset_name"
                          name="asset_name"
                          defaultValue={editingAsset?.asset_name}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="asset_type">Asset Type</Label>
                        <Select name="asset_type" defaultValue={editingAsset?.asset_type}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSET_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="estimated_value">Current Value (₱)</Label>
                        <Input
                          id="estimated_value"
                          name="estimated_value"
                          type="number"
                          step="0.01"
                          defaultValue={editingAsset?.estimated_value}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Select name="condition" defaultValue={editingAsset?.condition || 'good'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITIONS.map((condition) => (
                              <SelectItem key={condition.value} value={condition.value}>
                                {condition.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="purchase_date">Purchase Date</Label>
                        <Input
                          id="purchase_date"
                          name="purchase_date"
                          type="date"
                          defaultValue={editingAsset?.purchase_date}
                        />
                      </div>

                      <div>
                        <Label htmlFor="purchase_price">Purchase Price (₱)</Label>
                        <Input
                          id="purchase_price"
                          name="purchase_price"
                          type="number"
                          step="0.01"
                          defaultValue={editingAsset?.purchase_price}
                        />
                      </div>

                      <div>
                        <Label htmlFor="insurance_value">Insurance Value (₱)</Label>
                        <Input
                          id="insurance_value"
                          name="insurance_value"
                          type="number"
                          step="0.01"
                          defaultValue={editingAsset?.insurance_value}
                        />
                      </div>

                      <div>
                        <Label htmlFor="depreciation_rate">Depreciation Rate (%/year)</Label>
                        <Input
                          id="depreciation_rate"
                          name="depreciation_rate"
                          type="number"
                          step="0.01"
                          placeholder="5.0"
                          defaultValue={editingAsset?.depreciation_rate ? (editingAsset.depreciation_rate * 100).toFixed(2) : ''}
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="Home, Office, Storage, etc."
                          defaultValue={editingAsset?.location}
                        />
                      </div>

                      <div>
                        <Label htmlFor="serial_number">Serial Number</Label>
                        <Input
                          id="serial_number"
                          name="serial_number"
                          defaultValue={editingAsset?.serial_number}
                        />
                      </div>

                      <div>
                        <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                        <Input
                          id="warranty_expiry"
                          name="warranty_expiry"
                          type="date"
                          defaultValue={editingAsset?.warranty_expiry}
                        />
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          name="tags"
                          placeholder="valuable, insured, business"
                          defaultValue={editingAsset?.tags?.join(', ')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        rows={3}
                        defaultValue={editingAsset?.description}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingAsset ? 'Update' : 'Add'} Asset
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assets found</p>
              <p className="text-sm">Add your first asset to start tracking your valuables</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => {
                const Icon = getAssetIcon(asset.asset_type);
                return (
                  <Card key={asset.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{asset.asset_name}</h3>
                          <div className="flex items-center space-x-1 mt-1">
                            <Badge className={getAssetTypeColor(asset.asset_type)}>
                              {ASSET_TYPES.find(t => t.value === asset.asset_type)?.label}
                            </Badge>
                            <Badge className={getConditionColor(asset.condition)}>
                              {asset.condition}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAsset(asset);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this asset?')) {
                              handleDelete(asset.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Value:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(asset.estimated_value)}
                        </span>
                      </div>

                      {asset.purchase_price && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Purchase Price:</span>
                          <span className="text-sm">{formatCurrency(asset.purchase_price)}</span>
                        </div>
                      )}

                      {asset.location && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Location:</span>
                          <span className="text-sm">{asset.location}</span>
                        </div>
                      )}

                      {asset.warranty_expiry && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Warranty:</span>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-sm">
                              {new Date(asset.warranty_expiry).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {asset.tags && asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {asset.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {asset.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {asset.description}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}