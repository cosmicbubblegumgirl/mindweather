import type { AppState } from "@/lib/types";

export const notificationService = {
  markRead(state: AppState, id: string): AppState {
    return { ...state, notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)) };
  },
  markAllRead(state: AppState): AppState {
    return { ...state, notifications: state.notifications.map((item) => ({ ...item, read: true })) };
  },
};
