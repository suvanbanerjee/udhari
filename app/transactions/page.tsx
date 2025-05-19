"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '../store/useStore';
import NavBar from '../components/NavBar';
import { Button, Card, Input, Tabs } from '../components/ui';
import Link from 'next/link';
import { IoAddCircleOutline, IoArrowBack, IoTrashBinOutline } from 'react-icons/io5';
import { Dialog } from '@capacitor/dialog';

// Create a component that uses useSearchParams
function TransactionsContent() {
  const searchParams = useSearchParams();
  const friendId = searchParams.get('friend');
  const { friends, transactions, currency, removeTransaction } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Handle delete click with native confirm dialog
  const handleDeleteClick = async (transactionId: string) => {
    const { value } = await Dialog.confirm({
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      okButtonTitle: 'Delete',
      cancelButtonTitle: 'Cancel'
    });
    
    if (value) {
      removeTransaction(transactionId);
    }
  };
  
  // Filter transactions based on friend if specified
  let filteredTransactions = friendId 
    ? transactions.filter(t => t.friendId === friendId)
    : transactions;
    
  // Apply tab filter
  if (activeTab === 'lent') {
    filteredTransactions = filteredTransactions.filter(t => t.type === 'lent');
  } else if (activeTab === 'received') {
    filteredTransactions = filteredTransactions.filter(t => t.type === 'received');
  }
  
  // Apply search filter if any
  if (searchText.trim()) {
    filteredTransactions = filteredTransactions.filter(t => 
      t.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }
  
  // Sort by date (newest first)
  filteredTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Find the friend name if friendId is provided
  const friendName = friendId 
    ? friends.find(f => f.id === friendId)?.name 
    : null;

  return (
    <>
      <header className="mb-6">
        {friendId ? (
          <div className="flex items-center gap-2 mb-2">
            <Link href="/transactions" className="p-1">
              <IoArrowBack />
            </Link>
            <h1 className="text-2xl font-bold">{friendName || 'Friend'}</h1>
          </div>
        ) : (
          <h1 className="text-2xl font-bold mb-1">Transaction History</h1>
        )}
        <p className="text-foreground/70">View your payment history</p>
      </header>
      
      <div className="mb-5">
        <Tabs 
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'lent', label: 'You Paid' },
            { id: 'received', label: 'Friend Paid' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>
      
      <div className="mb-5 flex gap-3 items-center">
        <Input
          placeholder="Search transactions..."
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        
        <Link href="/transactions/add">
          <Button>
            <IoAddCircleOutline size={20} />
          </Button>
        </Link>
      </div>
      
      
      {filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map(transaction => {
            const friend = friends.find(f => f.id === transaction.friendId);
            return (
              <Card key={transaction.id}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{transaction.description}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${
                      transaction.type === 'lent' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'lent' ? '+' : '-'}{currency}{transaction.amount.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => handleDeleteClick(transaction.id)}
                      className="text-foreground/60 hover:text-red-500 transition-colors"
                      aria-label="Delete transaction"
                    >
                      <IoTrashBinOutline size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-foreground/70">
                  <span>{friend?.name}</span>
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-foreground/70 mb-4">No udhari here </p>
        </div>
      )}
    </>
  );
}

// Loading fallback component
function TransactionsLoading() {
  return <p>Loading transactions...</p>;
}

export default function TransactionsPage() {
  return (
    <div className="p-6 pb-20">
      <Suspense fallback={<TransactionsLoading />}>
        <TransactionsContent />
      </Suspense>
      <NavBar />
    </div>
  );
}
