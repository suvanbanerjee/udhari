import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  friendId: string;
  amount: number;
  date: string; // ISO string
  type: 'lent' | 'received';
  description: string;
}

export type ThemeType = 'light' | 'dark' | 'amoled' | 'gray';

interface AppState {
  friends: Friend[];
  transactions: Transaction[];
  isFirstStartup: boolean;
  theme: ThemeType;
  
  // Actions
  addFriend: (name: string) => void;
  updateFriend: (id: string, name: string) => void;
  removeFriend: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransactionsByFriendId: (friendId: string) => void;
  markFirstStartupComplete: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      friends: [],
      transactions: [],
      isFirstStartup: true,
      theme: 'gray',

      addFriend: (name) => set((state) => ({
        friends: [...state.friends, { id: crypto.randomUUID(), name }]
      })),

      updateFriend: (id, name) => set((state) => ({
        friends: state.friends.map((friend) =>
          friend.id === id ? { ...friend, name } : friend
        )
      })),

      removeFriend: (id) => set((state) => ({
        friends: state.friends.filter((friend) => friend.id !== id),
        transactions: state.transactions.filter((transaction) => transaction.friendId !== id)
      })),

      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { id: crypto.randomUUID(), ...transaction }]
      })),

      removeTransactionsByFriendId: (friendId) => set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction.friendId !== friendId)
      })),

      markFirstStartupComplete: () => set({ isFirstStartup: false }),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'udhari-storage',
    }
  )
);
