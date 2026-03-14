'use client';

import { create } from 'zustand';

const STORAGE_KEY = 'anya_wishlist_session_v1';

export interface WishlistProduct {
  id: string;
  slug: string;
  name: string;
  has_3d_model: boolean;
  stock?: number;
  brand_name?: string | null;
  average_rating?: number | null;
  reviews_count?: number;
  images?: Array<{ url: string; alt_text?: string | null }>;
  categoryTags?: string[];
}

export interface WishlistEntry {
  id: string;
  product: WishlistProduct;
  createdAt: string;
  removedAt?: string;
}

interface WishlistSnapshot {
  active: WishlistEntry[];
  history: WishlistEntry[];
}

interface WishlistStoreState {
  active: WishlistEntry[];
  history: WishlistEntry[];
  hydrated: boolean;
  hydrate: () => void;
  add: (product: WishlistProduct) => void;
  softDelete: (entryId: string) => void;
  restore: (entryId: string) => void;
  removePermanently: (entryId: string) => void;
  isSaved: (productId: string) => boolean;
}

function readSnapshot(): WishlistSnapshot {
  if (typeof window === 'undefined') {
    return { active: [], history: [] };
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: [], history: [] };
    const parsed = JSON.parse(raw) as WishlistSnapshot;
    return {
      active: Array.isArray(parsed.active) ? parsed.active : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { active: [], history: [] };
  }
}

function writeSnapshot(snapshot: WishlistSnapshot) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export const useWishlistStore = create<WishlistStoreState>((set, get) => ({
  active: [],
  history: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const snapshot = readSnapshot();
    set({ active: snapshot.active, history: snapshot.history, hydrated: true });
  },

  add: (product) => {
    const state = get();
    const alreadyActive = state.active.some((entry) => entry.product.id === product.id);
    if (alreadyActive) return;

    const historyWithoutProduct = state.history.filter((entry) => entry.product.id !== product.id);
    const newEntry: WishlistEntry = {
      id: crypto.randomUUID(),
      product,
      createdAt: new Date().toISOString(),
    };

    const next: WishlistSnapshot = {
      active: [newEntry, ...state.active],
      history: historyWithoutProduct,
    };

    writeSnapshot(next);
    set(next);
  },

  softDelete: (entryId) => {
    const state = get();
    const target = state.active.find((entry) => entry.id === entryId);
    if (!target) return;

    const next: WishlistSnapshot = {
      active: state.active.filter((entry) => entry.id !== entryId),
      history: [{ ...target, removedAt: new Date().toISOString() }, ...state.history],
    };

    writeSnapshot(next);
    set(next);
  },

  restore: (entryId) => {
    const state = get();
    const target = state.history.find((entry) => entry.id === entryId);
    if (!target) return;

    const alreadyActive = state.active.some((entry) => entry.product.id === target.product.id);
    const restored: WishlistEntry = {
      id: crypto.randomUUID(),
      product: target.product,
      createdAt: new Date().toISOString(),
    };

    const next: WishlistSnapshot = {
      active: alreadyActive ? state.active : [restored, ...state.active],
      history: state.history.filter((entry) => entry.id !== entryId),
    };

    writeSnapshot(next);
    set(next);
  },

  removePermanently: (entryId) => {
    const state = get();
    const next: WishlistSnapshot = {
      active: state.active,
      history: state.history.filter((entry) => entry.id !== entryId),
    };
    writeSnapshot(next);
    set(next);
  },

  isSaved: (productId) => get().active.some((entry) => entry.product.id === productId),
}));
