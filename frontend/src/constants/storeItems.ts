import { Avatar, Background, EmotePack, ItemType, StoreItemsResponse } from '@/types/Store';

// Avatars
const avatars: Avatar[] = [
  { id: 1, price: 100, image_path: '/data/avatars/1.png', type: ItemType.AVATAR },
  { id: 2, price: 100, image_path: '/data/avatars/2.png', type: ItemType.AVATAR },
  { id: 3, price: 100, image_path: '/data/avatars/3.png', type: ItemType.AVATAR },
  { id: 4, price: 100, image_path: '/data/avatars/4.png', type: ItemType.AVATAR },
  { id: 5, price: 100, image_path: '/data/avatars/5.png', type: ItemType.AVATAR },
  { id: 6, price: 100, image_path: '/data/avatars/6.png', type: ItemType.AVATAR },
  { id: 7, price: 100, image_path: '/data/avatars/7.png', type: ItemType.AVATAR },
  { id: 8, price: 100, image_path: '/data/avatars/8.png', type: ItemType.AVATAR },
  { id: 9, price: 100, image_path: '/data/avatars/9.png', type: ItemType.AVATAR },
  { id: 10, price: 100, image_path: '/data/avatars/10.png', type: ItemType.AVATAR },
  { id: 11, price: 100, image_path: '/data/avatars/11.png', type: ItemType.AVATAR },
  { id: 12, price: 100, image_path: '/data/avatars/12.png', type: ItemType.AVATAR },
  { id: 13, price: 100, image_path: '/data/avatars/13.png', type: ItemType.AVATAR },
  { id: 14, price: 100, image_path: '/data/avatars/14.png', type: ItemType.AVATAR },
  { id: 15, price: 100, image_path: '/data/avatars/15.png', type: ItemType.AVATAR },
  { id: 16, price: 100, image_path: '/data/avatars/16.png', type: ItemType.AVATAR },
  { id: 17, price: 100, image_path: '/data/avatars/17.png', type: ItemType.AVATAR },
  { id: 18, price: 100, image_path: '/data/avatars/18.png', type: ItemType.AVATAR },
  { id: 19, price: 100, image_path: '/data/avatars/19.png', type: ItemType.AVATAR },
  { id: 20, price: 100, image_path: '/data/avatars/20.png', type: ItemType.AVATAR },
  { id: 21, price: 100, image_path: '/data/avatars/21.png', type: ItemType.AVATAR },
  { id: 22, price: 100, image_path: '/data/avatars/22.png', type: ItemType.AVATAR },
  { id: 23, price: 100, image_path: '/data/avatars/23.png', type: ItemType.AVATAR },
  { id: 24, price: 100, image_path: '/data/avatars/24.png', type: ItemType.AVATAR },
  { id: 25, price: 100, image_path: '/data/avatars/25.png', type: ItemType.AVATAR },
  { id: 26, price: 100, image_path: '/data/avatars/26.png', type: ItemType.AVATAR },
  { id: 27, price: 100, image_path: '/data/avatars/27.png', type: ItemType.AVATAR },
  { id: 28, price: 100, image_path: '/data/avatars/28.png', type: ItemType.AVATAR },
  { id: 29, price: 100, image_path: '/data/avatars/29.png', type: ItemType.AVATAR },
  { id: 30, price: 100, image_path: '/data/avatars/30.png', type: ItemType.AVATAR },
  { id: 31, price: 100, image_path: '/data/avatars/31.png', type: ItemType.AVATAR },
  { id: 32, price: 100, image_path: '/data/avatars/32.png', type: ItemType.AVATAR },
  { id: 33, price: 100, image_path: '/data/avatars/33.png', type: ItemType.AVATAR },
  { id: 34, price: 100, image_path: '/data/avatars/34.png', type: ItemType.AVATAR },
  { id: 35, price: 100, image_path: '/data/avatars/35.png', type: ItemType.AVATAR },
];

// Backgrounds
const backgrounds: Background[] = [
  { id: 1, name: 'Space', price: 500, image_path: '/data/backgrounds/Space.png', type: ItemType.BACKGROUND },
  { id: 2, name: 'Forest', price: 500, image_path: '/data/backgrounds/Forest.png', type: ItemType.BACKGROUND },
  { id: 3, name: 'Neon', price: 500, image_path: '/data/backgrounds/Neon.png', type: ItemType.BACKGROUND },
  { id: 4, name: 'Ocean', price: 500, image_path: '/data/backgrounds/Ocean.png', type: ItemType.BACKGROUND },
];

const emotePacks: EmotePack[] = [
  { id: 1, name: 'Geometry Pack', price: 500, image_path: '/data/emotes/geometry/preview.png', type: ItemType.EMOTE_PACK },
  { id: 2, name: 'Luna Pack', price: 500, image_path: '/data/emotes/luna/preview.png', type: ItemType.EMOTE_PACK },
  { id: 3, name: 'Sanrio Pack', price: 500, image_path: '/data/emotes/sanrio/preview.png', type: ItemType.EMOTE_PACK },
];

export const storeItems: StoreItemsResponse = {
  avatars,
  backgrounds,
  emote_packs: emotePacks
};

export default storeItems; 