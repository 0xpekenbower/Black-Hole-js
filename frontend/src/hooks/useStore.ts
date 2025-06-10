import { useState, useCallback, useEffect } from 'react';
import { DashboardService } from '@/lib/api/DashboardService';
import { BuyItemRequest, InventoryItem, StoreItemsResponse, InventoryResponse } from '@/types/Store';
import { toast } from 'sonner';
import { useLang } from '@/context/langContext';
import en from '@/i18n/en';
import fr from '@/i18n/fr';
import storeItems from '@/constants/storeItems';
import { useWallet } from '@/context/walletContext';

export interface UseStoreReturn {
  storeItems: StoreItemsResponse;
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  buyItem: (data: BuyItemRequest) => Promise<boolean>;
  fetchInventory: () => Promise<void>;
  equipItem: (data: BuyItemRequest) => Promise<boolean>;
}

export const useStore = (): UseStoreReturn => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useLang();
  const { updateBudget } = useWallet();
  const t = lang === 'en' ? en.store : fr.store;
  
  const dashboardService = new DashboardService();
  
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.getInventory();
      
      if (response.status.success) {
        if (response.data?.inventory) {
          setInventory(response.data.inventory);
        } else {
          setInventory([]);
        }        
        if (response.data?.coins !== undefined) {
          updateBudget(response.data.coins);
        }
      } else {
        setError(response.status.message || t.fetchFailed);
        toast.error(response.status.message || t.fetchFailed);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.fetchFailed;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [t, updateBudget]);
  
  const buyItem = useCallback(async (data: BuyItemRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.buyItem(data);
      if (response.status.success) {
        toast.success(t.purchaseSuccess);
        await fetchInventory(); // Refresh inventory after purchase
        return true;
      } else {
        setError(response.status.message || t.purchaseFailed);
        toast.error(response.status.message || t.purchaseFailed);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.purchaseFailed;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchInventory, t]);

  const equipItem = useCallback(async (data: BuyItemRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement equip item logic (still not implemented from backend)
      // Emotes packs after purchase will be available automatically in chat conversations
      console.log(`Equipping item: ${data.item_id} of type: ${data.item_type}`);      
      toast.success('Item equipped successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to equip item';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);
  
  return {
    storeItems,
    inventory,
    isLoading,
    error,
    buyItem,
    fetchInventory,
    equipItem
  };
}; 