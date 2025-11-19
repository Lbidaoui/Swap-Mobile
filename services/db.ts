
import { Item, Offer, Message } from '../types';
import { INITIAL_INVENTORY } from '../constants';

const KEYS = {
  INVENTORY: 'swipeswap_inventory',
  OFFERS: 'swipeswap_offers',
  CHATS: 'swipeswap_chats',
  ACTIVE_ITEM: 'swipeswap_active_item_id'
};

// Simulate network delay for realistic "Full Stack" feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  init: () => {
    if (!localStorage.getItem(KEYS.INVENTORY)) {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    }
    if (!localStorage.getItem(KEYS.OFFERS)) {
      localStorage.setItem(KEYS.OFFERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.CHATS)) {
      localStorage.setItem(KEYS.CHATS, JSON.stringify({}));
    }
  },

  getInventory: async (): Promise<Item[]> => {
    await delay(300);
    return JSON.parse(localStorage.getItem(KEYS.INVENTORY) || '[]');
  },

  saveItem: async (item: Item): Promise<void> => {
    await delay(300);
    const items = JSON.parse(localStorage.getItem(KEYS.INVENTORY) || '[]');
    const existingIndex = items.findIndex((i: Item) => i.id === item.id);
    
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.unshift(item);
    }
    
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(items));
  },

  deleteItem: async (itemId: string): Promise<void> => {
    await delay(200);
    const items = JSON.parse(localStorage.getItem(KEYS.INVENTORY) || '[]');
    const newItems = items.filter((i: Item) => i.id !== itemId);
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(newItems));
  },

  getActiveItemId: (): string | null => {
    return localStorage.getItem(KEYS.ACTIVE_ITEM);
  },

  setActiveItemId: (id: string) => {
    localStorage.setItem(KEYS.ACTIVE_ITEM, id);
  },

  getOffers: async (): Promise<Offer[]> => {
    await delay(300);
    return JSON.parse(localStorage.getItem(KEYS.OFFERS) || '[]');
  },

  saveOffer: async (offer: Offer): Promise<void> => {
    await delay(200);
    const offers = JSON.parse(localStorage.getItem(KEYS.OFFERS) || '[]');
    const existingIndex = offers.findIndex((o: Offer) => o.id === offer.id);
    
    if (existingIndex >= 0) {
      offers[existingIndex] = offer;
    } else {
      offers.unshift(offer);
    }
    
    localStorage.setItem(KEYS.OFFERS, JSON.stringify(offers));
  },

  getMessages: async (chatId: string): Promise<Message[]> => {
    await delay(100);
    const chats = JSON.parse(localStorage.getItem(KEYS.CHATS) || '{}');
    return chats[chatId] || [];
  },

  saveMessage: async (chatId: string, message: Message): Promise<void> => {
    await delay(100);
    const chats = JSON.parse(localStorage.getItem(KEYS.CHATS) || '{}');
    if (!chats[chatId]) {
      chats[chatId] = [];
    }
    chats[chatId].push(message);
    localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
  },

  reset: () => {
    localStorage.clear();
    window.location.reload();
  }
};
