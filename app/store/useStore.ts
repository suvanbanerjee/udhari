import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  name: string;
}

export interface SplitDetail {
  friendId: string;
  amount: number;
}

export interface Transaction {
  id: string;
  friendId: string;
  amount: number;
  date: string; // ISO string
  type: 'lent' | 'received';
  description: string;
  isGroupExpense?: boolean;
  splitDetails?: SplitDetail[];
}

export type ThemeType = 'light' | 'dark' | 'amoled' | 'gray';

interface AppState {
  friends: Friend[];
  transactions: Transaction[];
  isFirstStartup: boolean;
  theme: ThemeType;
  currency: string;
  showAppName: boolean;
  customMessage: string;
  upiVpa: string;
  enableUpiPayment: boolean;
  
  // Actions
  addFriend: (name: string) => void;
  updateFriend: (id: string, name: string) => void;
  removeFriend: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  removeTransactionsByFriendId: (friendId: string) => void;
  markFirstStartupComplete: () => void;
  setTheme: (theme: ThemeType) => void;
  setCurrency: (currency: string) => void;
  setShowAppName: (show: boolean) => void;
  setCustomMessage: (message: string) => void;
  setUpiVpa: (vpa: string) => void;
  setEnableUpiPayment: (enable: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      friends: [],
      transactions: [],
      isFirstStartup: true,
      theme: 'gray',
      currency: '₹', // Default to rupee
      showAppName: true,
      customMessage: '',
      upiVpa: '',
      enableUpiPayment: false,

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

      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction.id !== id)
      })),
      
      removeTransactionsByFriendId: (friendId) => set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction.friendId !== friendId)
      })),

      markFirstStartupComplete: () => set({ isFirstStartup: false }),

      setTheme: (theme) => set({ theme }),
      
      setCurrency: (currency) => set({ currency }),
      
      setShowAppName: (show) => set({ showAppName: show }),
      
      setCustomMessage: (message) => set({ customMessage: message }),
      
      setUpiVpa: (vpa) => set({ upiVpa: vpa }),
      
      setEnableUpiPayment: (enable) => set({ enableUpiPayment: enable }),
    }),
    {
      name: 'udhari-storage',
    }
  )
);
