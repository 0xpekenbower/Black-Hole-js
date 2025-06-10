/**
 * Store types
 */

// Item types
export enum ItemType {
  AVATAR = 1,
  BACKGROUND = 2,
  EMOTE_PACK = 3
}

// Store items
export interface StoreItem {
  id: number;
  name?: string;
  price: number;
  image_path: string;
  type: ItemType;
}

// Avatar item
export interface Avatar extends StoreItem {
  type: ItemType.AVATAR;
}

// Background item
export interface Background extends StoreItem {
  type: ItemType.BACKGROUND;
  name: string;
}

// Emote pack item
export interface EmotePack extends StoreItem {
  type: ItemType.EMOTE_PACK;
  name: string;
}

// Inventory item
export interface InventoryItem {
  item_id: string;
  item_type: string;
}

// Buy request
export interface BuyItemRequest {
  item_id: string;
  item_type: string;
}

// API responses
export interface InventoryResponse {
  inventory: InventoryItem[];
  coins: number;
}

export interface StoreItemsResponse {
  avatars: Avatar[];
  backgrounds: Background[];
  emote_packs: EmotePack[];
} 