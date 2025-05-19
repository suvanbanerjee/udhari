"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../store/useStore';
import { Button, Card } from '../components/ui';
import Link from 'next/link';
import { IoArrowBack, IoLogoWhatsapp, IoShareOutline } from 'react-icons/io5';
import { Share } from '@capacitor/share';
import { Dialog } from '@capacitor/dialog';

// Create a separate component that uses useSearchParams
function SettleUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendId = searchParams?.get('id');
  const { friends, transactions, removeTransactionsByFriendId, currency, showAppName, customMessage } = useAppStore();
  const friend = friends.find(f => f.id === friendId);
  
  // If friend not found, redirect to home
  useEffect(() => {
    if (!friendId || !friend) {
      router.push('/');
    }
  }, [friendId, friend, router]);
  
  // If friend is not loaded yet or not found, show loading or redirect
  if (!friend) {
    return null;
  }
  
  // Calculate totals
  const lent = transactions
    .filter(t => t.friendId === friendId && t.type === 'lent')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const received = transactions
    .filter(t => t.friendId === friendId && t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = lent - received;
  const isPositive = balance > 0;
  const isNegative = balance < 0;
  const absBalance = Math.abs(balance);
  
  // Get recent transactions
  const recentTransactions = [...transactions]
    .filter(t => t.friendId === friendId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Function to share settlement details via WhatsApp
  const shareViaWhatsApp = async () => {
    try {
      const message = `Hey ${friend.name}! 

Here's our money status:

${isPositive ? 'You owe me' : 'I owe you'}: ${currency}${absBalance.toFixed(2)}

Transaction history:
${recentTransactions.map(t => 
  `• ${new Date(t.date).toLocaleDateString()}: ${t.description} - ${currency}${t.amount.toFixed(2)} (${t.type === 'lent' ? 'I paid' : 'You paid'})`
).join('\n')}

${customMessage ? customMessage + '\n' : ''}${showAppName ? 'Sent from Udhari app' : ''}`;

      await Share.share({
        title: `Settlement with ${friend.name}`,
        text: message,
        dialogTitle: 'Share settlement details',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Function to clear all transactions with this friend using Capacitor Dialog
  const handleShowClearDebtConfirm = async () => {
    const { value } = await Dialog.confirm({
      title: 'Clear All Debt?',
      message: `This will remove all transactions with ${friend.name}. This action cannot be undone.`,
      okButtonTitle: 'Clear All',
      cancelButtonTitle: 'Cancel'
    });
    
    if (value) {
      removeTransactionsByFriendId(friendId as string);
      router.push('/');
    }
  };

  return (
    <div className="p-4 pb-20">
      <header className="mb-4 flex items-center gap-2">
        <Link href="/" className="p-1">
          <IoArrowBack />
        </Link>
        <h1 className="text-2xl font-bold">Settle Up</h1>
      </header>
      
      <Card className="mb-5 p-4 relative overflow-hidden">
        {/* Friend name and status text */}
        <h2 className="text-lg font-semibold mb-1">{friend.name}</h2>
        <p className="text-sm text-foreground/70 mb-4">
          {isPositive ? `${friend.name} owes you` : 
           isNegative ? `You owe ${friend.name}` : 
           'All settled up!'}
        </p>
        
        {/* Big balance display */}
        <div className={`flex justify-center mb-4 ${
          isPositive ? 'text-green-600 dark:text-green-400' : 
          isNegative ? 'text-red-600 dark:text-red-400' : 
          'text-gray-400 dark:text-gray-400'
        }`}>
          <div className="text-center">
            <span className="text-3xl font-bold">{currency}{absBalance.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Payment summary */}
        <div className="flex justify-between items-center text-sm bg-foreground/5 p-3 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-xs text-foreground/70">You paid</span>
            <span className="font-medium">{currency}{lent.toFixed(2)}</span>
          </div>
          
          <div className="h-8 border-r border-foreground/20"></div>
          
          <div className="flex flex-col items-center">
            <span className="text-xs text-foreground/70">Friend paid</span>
            <span className="font-medium">{currency}{received.toFixed(2)}</span>
          </div>
        </div>
      </Card>
      
      {/* Always show payment instructions */}
      <div className="p-3 rounded-lg mb-5">
        <h3 className="font-medium mb-1">Payment Instructions</h3>
        <p className="text-sm mb-1">
          1. Share payment details with your friend via WhatsApp, SMS or any other app
        </p>
        <p className="text-sm mb-1">
          2. After payment is complete, mark the debt as settled or add a partial payment
        </p>
        <p className="text-sm">
          3. Always keep track of your transactions for future reference
        </p>
      </div>
      
      <div className="space-y-2 mb-5">
        <h3 className="text-sm font-medium text-foreground/70">Transaction History</h3>
        
        {recentTransactions.length > 0 ? (
          recentTransactions.map(transaction => (
            <div 
              key={transaction.id} 
              className="flex justify-between items-center p-2 bg-foreground/5 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium">{transaction.description}</p>
                <p className="text-xs text-foreground/70">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <p className={`text-sm font-medium ${
                transaction.type === 'lent' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'lent' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-foreground/70 py-3">No transactions yet</p>
        )}
      </div>
      
      {absBalance === 0 && (
        <div className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100 p-3 rounded-lg mb-5">
          <h3 className="font-medium mb-1">All Settled!</h3>
          <p className="text-sm">
            You and {friend.name} are all squared up. There are no outstanding debts between you.
          </p>
        </div>
      )}
      
      {absBalance > 0 && (
        <div className="space-y-3">
          <p className="text-l text-center text-foreground/70 mb-2">
        Share Udaari with {friend.name}
          </p>
          <div className="grid grid-cols-2 gap-3">
        <Button
          fullWidth
          onClick={shareViaWhatsApp}
          className="flex items-center justify-center gap-1 py-2 h-auto"
        >
          <IoLogoWhatsapp size={24} />
        </Button>
        
        <Button
          variant="outline"
          fullWidth
          onClick={shareViaWhatsApp}
          className="flex items-center justify-center gap-2 h-auto"
        >
          <IoShareOutline size={18} />
        </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
        <Link href={`/transactions/add?friend=${friendId}&type=partial`} className="block">
          <Button 
            variant="outline" 
            fullWidth
          >
            Add Partial Payment
          </Button>
        </Link>
        
        <Link href={`/transactions/add?friend=${friendId}`} className="block">
          <Button 
            variant="secondary" 
            fullWidth
          >
            Add Transaction
          </Button>
        </Link>
          </div>
          
          <Button
        variant="danger"
        fullWidth
        className="mt-3"
        onClick={handleShowClearDebtConfirm}
          >
        Clear Debt
          </Button>
        </div>
      )}
    </div>
  );
}

// Main component with Suspense
export default function SettleUpPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SettleUpContent />
    </Suspense>
  );
}
