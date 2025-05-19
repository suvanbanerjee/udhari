"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useStore';
import { Button, Card, Input, Tabs } from '../../components/ui';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';

// Create a component that uses useSearchParams
function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFriendId = searchParams.get('friend');
  const isPartialPayment = searchParams.get('type') === 'partial';
  
  const { friends, addTransaction, transactions, currency } = useAppStore();
  const [transactionType, setTransactionType] = useState<'lent' | 'received'>('lent');
  const [friendId, setFriendId] = useState(preselectedFriendId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(isPartialPayment ? 'Partial Payment' : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // If it's a partial payment, determine the default transaction type
  useEffect(() => {
    if (isPartialPayment && preselectedFriendId) {
      // Calculate balance
      const lent = transactions
        .filter(t => t.friendId === preselectedFriendId && t.type === 'lent')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const received = transactions
        .filter(t => t.friendId === preselectedFriendId && t.type === 'received')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const balance = lent - received;
      
      // If balance is positive, friend owes user, so default to "received"
      // If balance is negative, user owes friend, so default to "lent"
      if (balance > 0) {
        setTransactionType('received');
      } else if (balance < 0) {
        setTransactionType('lent');
      }
    }
  }, [isPartialPayment, preselectedFriendId, transactions]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!friendId || !amount || !description || !date) {
      alert('Please fill in all fields');
      return;
    }
    
    // Add transaction
    addTransaction({
      friendId,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      type: transactionType,
      description
    });
    
    // Navigate back
    router.push(`/settle-up?id=${friendId}`);
  };

  const getSelectedFriend = () => {
    if (!preselectedFriendId) return null;
    return friends.find(f => f.id === preselectedFriendId);
  };

  const selectedFriend = getSelectedFriend();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isPartialPayment && (
        <div className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-1">Adding Partial Payment</h3>
          <p className="text-sm">
            {selectedFriend ? `Recording a partial payment with ${selectedFriend.name}` : 'Recording a partial payment'}
          </p>
        </div>
      )}
    
      <div>
        <label className="block mb-1.5 text-sm font-medium text-foreground/80">
          Transaction Type
        </label>
        <Tabs 
          tabs={[
            { id: 'lent', label: 'You Paid' },
            { id: 'received', label: 'Friend Paid' },
          ]}
          activeTab={transactionType}
          onChange={(id) => setTransactionType(id as 'lent' | 'received')}
        />
      </div>
      
      <div>
        <label className="block mb-1.5 text-sm font-medium text-foreground/80">
          Select Friend
        </label>
        <select 
          className="w-full py-2.5 px-3 rounded-lg bg-element-bg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-300"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          disabled={!!preselectedFriendId}
          required
        >
          <option value="">Select a friend</option>
          {friends.map(friend => (
            <option key={friend.id} value={friend.id}>{friend.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block mb-1.5 text-sm font-medium text-foreground/80">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70">
            {currency}
          </span>
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full py-2.5 px-3 pl-7 rounded-lg bg-element-bg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-300"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
      </div>
      
      <Input
        label="Description"
        placeholder="What was this for?"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      
      <Input
        label="Date"
        type="date"
        fullWidth
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      
      <div className="pt-4">
        <Button type="submit" fullWidth>
          {isPartialPayment ? "Add Partial Payment" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}

// Loading fallback component
function LoadingForm() {
  return <div className="p-6">Loading transaction form...</div>;
}

export default function AddTransactionPage() {
  return (
    <div className="p-6 pb-20">
      <Suspense fallback={<LoadingForm />}>
        <AddTransactionContent />
      </Suspense>
    </div>
  );
}

function AddTransactionContent() {
  const searchParams = useSearchParams();
  const isPartialPayment = searchParams.get('type') === 'partial';

  return (
    <>
      <header className="mb-6 flex items-center gap-2">
        <Link href="/transactions" className="p-1">
          <IoArrowBack />
        </Link>
        <h1 className="text-2xl font-bold">
          {isPartialPayment ? "Record Partial Payment" : "Record Transaction"}
        </h1>
      </header>
      
      <TransactionForm />
    </>
  );
}