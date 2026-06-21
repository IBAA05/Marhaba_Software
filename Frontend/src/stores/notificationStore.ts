import { create } from "zustand";
import type { NotificationLog } from "@/types";

interface NotificationState {
  items: NotificationLog[];
  unreadCount: number;
  panelOpen: boolean;
  setItems: (items: NotificationLog[]) => void;
  setUnreadCount: (count: number) => void;
  markRead: (id: number) => void;
  togglePanel: (open?: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  panelOpen: false,
  setItems: (items) =>
    set({
      items,
      unreadCount: items.filter((i) => !i.is_read).length,
    }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  markRead: (id) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, is_read: true } : i,
    );
    set({ items, unreadCount: items.filter((i) => !i.is_read).length });
  },
  togglePanel: (open) => set({ panelOpen: open ?? !get().panelOpen }),
}));
