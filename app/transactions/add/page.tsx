"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useStore';
import { Button, Card, Input, Tabs, ConfirmDialog } from '../../components/ui';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';
import { IoMdPerson, IoMdPeople } from 'react-icons/io';
import { FaEquals, FaPercentage, FaBalanceScale } from 'react-icons/fa';
import { TbMathSymbols } from 'react-icons/tb';
import Avatar from '../../components/Avatar';
import { BsPersonFillAdd } from 'react-icons/bs';

// Create a component that uses useSearchParams
function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFriendId = searchParams.get('friend');
  const isPartialPayment = searchParams.get('type') === 'partial';
  
  const { friends, addTransaction, transactions, currency } = useAppStore();
  const [transactionType, setTransactionType] = useState<'lent' | 'received'>('lent');
  const [isGroupExpense, setIsGroupExpense] = useState<boolean>(false);
  const [friendId, setFriendId] = useState(preselectedFriendId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(isPartialPayment ? 'Partial Payment' : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Common expense category suggestions
  const descriptionSuggestions = [
    'Food', 'Groceries', 'Rent', 'Utilities', 'Transport', 
    'Entertainment', 'Shopping', 'Travel', 'Medical', 'Bills',
    'Gift', 'Coffee', 'Restaurant', 'Movie', 'Subscription'
  ];
  
  // Group expense related states
  const [selectedFriends, setSelectedFriends] = useState<string[]>(preselectedFriendId ? [preselectedFriendId] : []);
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'ratio' | 'exact'>('equal');
  const [customSplits, setCustomSplits] = useState<{[key: string]: number}>({});
  const [shouldSplitWithYou, setShouldSplitWithYou] = useState<boolean>(true);

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
  
  // Reset the selected friends when toggling group expense
  useEffect(() => {
    if (isGroupExpense) {
      if (friendId) {
        setSelectedFriends([friendId]);
      } else {
        setSelectedFriends([]);
      }
      setFriendId('');
    } else {
      if (selectedFriends.length > 0) {
        setFriendId(selectedFriends[0]);
        setSelectedFriends([]);
      }
    }
  }, [isGroupExpense, friendId]);
  
  // Calculate the splits based on the selected split type
  const calculateSplits = (): {[key: string]: number} => {
    if (!amount || selectedFriends.length === 0) return {};
    
    const totalAmount = parseFloat(amount);
    const splits: {[key: string]: number} = {};
    
    // Number of people to split with (including you if shouldSplitWithYou is true)
    const numPeople = shouldSplitWithYou ? selectedFriends.length + 1 : selectedFriends.length;
    
    switch (splitType) {
      case 'equal':
        const equalShare = parseFloat((totalAmount / numPeople).toFixed(2));
        selectedFriends.forEach(id => {
          splits[id] = equalShare;
        });
        break;
        
      case 'percentage':
        // Use the custom percentages provided
        let totalPercentage = 0;
        selectedFriends.forEach(id => {
          totalPercentage += customSplits[id] || 0;
        });
        
        if (shouldSplitWithYou) {
          // Calculate your percentage as the remaining
          const remainingPercentage = Math.max(0, 100 - totalPercentage);
          // Your share doesn't need to be in splits
          
          if (totalPercentage > 100) {
            // Adjust the percentages proportionally
            const factor = 100 / totalPercentage;
            selectedFriends.forEach(id => {
              splits[id] = parseFloat(((customSplits[id] || 0) * factor * totalAmount / 100).toFixed(2));
            });
          } else {
            selectedFriends.forEach(id => {
              splits[id] = parseFloat(((customSplits[id] || 0) * totalAmount / 100).toFixed(2));
            });
          }
        } else {
          if (totalPercentage !== 100) {
            // Adjust the percentages proportionally
            const factor = 100 / totalPercentage;
            selectedFriends.forEach(id => {
              splits[id] = parseFloat(((customSplits[id] || 0) * factor * totalAmount / 100).toFixed(2));
            });
          } else {
            selectedFriends.forEach(id => {
              splits[id] = parseFloat(((customSplits[id] || 0) * totalAmount / 100).toFixed(2));
            });
          }
        }
        break;
        
      case 'ratio':
        // Use the custom ratios provided
        let totalRatio = 0;
        selectedFriends.forEach(id => {
          totalRatio += customSplits[id] || 1; // Default ratio is 1
        });
        
        if (shouldSplitWithYou) {
          // Add your ratio (default 1)
          totalRatio += 1;
        }
        
        selectedFriends.forEach(id => {
          const ratio = customSplits[id] || 1;
          splits[id] = parseFloat(((ratio / totalRatio) * totalAmount).toFixed(2));
        });
        break;
        
      case 'exact':
        // Use the exact amounts provided
        selectedFriends.forEach(id => {
          splits[id] = customSplits[id] || 0;
        });
        break;
    }
    
    return splits;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if ((!friendId && !isGroupExpense) || !amount || !description || !date) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (isGroupExpense && selectedFriends.length === 0) {
      alert('Please select at least one friend to split with');
      return;
    }
    
    // Additional validation for percentage split
    if (isGroupExpense && splitType === 'percentage') {
      const totalPercentage = Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0);
      if (!shouldSplitWithYou && Math.abs(totalPercentage - 100) > 0.01) {
        alert('Percentages must add up to 100%');
        return;
      } else if (shouldSplitWithYou && totalPercentage > 100) {
        alert('Total percentages cannot exceed 100%');
        return;
      }
    }
    
    // Additional validation for exact split to match the total amount
    if (isGroupExpense && splitType === 'exact' && !shouldSplitWithYou) {
      const totalFromSplits = calculateTotalFromSplits();
      const totalAmount = parseFloat(amount || '0');
      if (Math.abs(totalFromSplits - totalAmount) > 0.01) {
        alert(`The sum of all shares (${totalFromSplits.toFixed(2)}) must equal the total amount (${totalAmount.toFixed(2)})`);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    if (isGroupExpense) {
      // Calculate the splits
      const splitAmounts = calculateSplits();
      
      // Create a transaction for each friend
      Object.entries(splitAmounts).forEach(([friendId, amount]) => {
        addTransaction({
          friendId,
          amount,
          type: transactionType,
          description: `${description} (Group)`,
          date: new Date(date).toISOString(),
        });
      });
      
      setShowSuccess(true);
      
      // Navigate back to transactions after a short delay
      setTimeout(() => {
        router.push('/transactions');
      }, 1500);
    } else {
      // Regular transaction
      addTransaction({
        friendId,
        amount: parseFloat(amount),
        type: transactionType,
        description,
        date: new Date(date).toISOString(),
      });
      
      setShowSuccess(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.push(`/settle-up?id=${friendId}`);
      }, 1500);
    }
  };

  // Toggle friend selection for group expense
  const toggleFriendSelection = (id: string) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(prev => prev.filter(fid => fid !== id));
      // Also remove from custom splits
      const newSplits = {...customSplits};
      delete newSplits[id];
      setCustomSplits(newSplits);
    } else {
      setSelectedFriends(prev => [...prev, id]);
      // Initialize custom split values
      if (splitType === 'percentage') {
        setCustomSplits(prev => ({...prev, [id]: 0}));
      } else if (splitType === 'ratio') {
        setCustomSplits(prev => ({...prev, [id]: 1}));
      } else if (splitType === 'exact') {
        setCustomSplits(prev => ({...prev, [id]: 0}));
      }
    }
  };
  
  // Update custom split values
  const updateCustomSplit = (friendId: string, value: number) => {
    setCustomSplits(prev => ({
      ...prev,
      [friendId]: value
    }));
  };

  const getSelectedFriend = () => {
    if (!preselectedFriendId) return null;
    return friends.find(f => f.id === preselectedFriendId);
  };

  const selectedFriend = getSelectedFriend();
  
  // Calculate total from custom splits
  const calculateTotalFromSplits = () => {
    if (splitType === 'exact') {
      return Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0);
    }
    return parseFloat(amount || '0');
  };
  
  // Calculate remaining amount in custom splits
  const calculateRemainingAmount = () => {
    if (!amount) return 0;
    
    const totalAmount = parseFloat(amount);
    const totalAssigned = Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0);
    
    if (splitType === 'exact') {
      return totalAmount - totalAssigned;
    } else if (splitType === 'percentage') {
      const totalPercentage = Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0);
      return shouldSplitWithYou ? 100 - totalPercentage : 100 - totalPercentage;
    }
    
    return 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      {isPartialPayment && (
        <div className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100 p-4 rounded-lg mb-4 shadow-sm">
          <h3 className="font-medium mb-1">Adding Partial Payment</h3>
          <p className="text-sm">
            {selectedFriend ? `Recording a partial payment with ${selectedFriend.name}` : 'Recording a partial payment'}
          </p>
        </div>
      )}
      
      <div>
        <div className="grid grid-cols-2 gap-3">
          <div
        onClick={() => setIsGroupExpense(false)}
        className={`flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer shadow-sm transition-all duration-200 ${
          !isGroupExpense 
            ? 'bg-green-50 border-green-500 text-green-700 shadow-md translate-y-[-2px]' 
            : 'border-element-border hover:bg-background/80'
        }`}
          >
        <IoMdPerson className="h-5 w-5" />
        <span className="font-medium">Individual</span>
          </div>
          <div
        onClick={() => setIsGroupExpense(true)}
        className={`flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer shadow-sm transition-all duration-200 ${
          isGroupExpense 
            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md translate-y-[-2px]' 
            : 'border-element-border hover:bg-background/80'
        }`}
          >
        <IoMdPeople className="h-5 w-5" />
        <span className="font-medium">Group</span>
          </div>
        </div>
      </div>
    
      <div>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setTransactionType('lent')}
            className={`flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer shadow-sm transition-all duration-200 ${
              transactionType === 'lent' 
                ? 'bg-green-50 border-green-500 text-green-700 shadow-md translate-y-[-2px]' 
                : 'border-element-border hover:bg-background/80'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">You Paid</span>
          </div>
          <div
            onClick={() => setTransactionType('received')}
            className={`flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer shadow-sm transition-all duration-200 ${
              transactionType === 'received' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md translate-y-[-2px]' 
                : 'border-element-border hover:bg-background/80'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Friend Paid</span>
          </div>
        </div>
      </div>
      
      {!isGroupExpense ? (
        <div>
          <label className="block mb-1.5 text-sm font-medium text-foreground/80">
            Select Friend
          </label>
          {!preselectedFriendId ? (
            <div className="bg-element-bg rounded-lg p-2 max-h-40 overflow-y-auto">
              {friends.map(friend => (
                <div 
                  key={friend.id}
                  onClick={() => setFriendId(friend.id)}
                  className={`flex items-center gap-3 p-3 rounded cursor-pointer mb-1 transition-all ${
                  friendId === friend.id ? 'text-red-700' : 'hover:bg-background'
                  }`}
                >
                  <Avatar 
                  seed={friend.name} 
                  size={36} 
                  className={`rounded-full shadow-sm ${friendId === friend.id ? 'border-2 border-red-500' : ''}`} 
                  />
                  <span className={friendId === friend.id ? 'font-medium' : ''}>{friend.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-element-bg rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
                {friends.find(f => f.id === preselectedFriendId)?.name.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="font-medium">{friends.find(f => f.id === preselectedFriendId)?.name || 'Unknown Friend'}</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-medium text-foreground/80">Select Friends to Split With</span>
            <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">{selectedFriends.length} selected</span>
          </label>
          
          {/* Quick buttons */}
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              className="text-xs bg-accent/10 px-3 py-1.5 rounded-full text-accent hover:bg-accent/20 transition-colors"
              onClick={() => {
                if (friends.length > 0 && selectedFriends.length !== friends.length) {
                  setSelectedFriends(friends.map(f => f.id));
                  // Initialize custom split values for all
                  const newSplits = {...customSplits};
                  friends.forEach(f => {
                    if (splitType === 'percentage') {
                      newSplits[f.id] = 0;
                    } else if (splitType === 'ratio') {
                      newSplits[f.id] = 1;
                    } else if (splitType === 'exact') {
                      newSplits[f.id] = 0;
                    }
                  });
                  setCustomSplits(newSplits);
                }
              }}
            >
              Select All
            </button>
            <button
              type="button"
              className="text-xs bg-accent/10 px-3 py-1.5 rounded-full text-accent hover:bg-accent/20 transition-colors"
              onClick={() => {
                setSelectedFriends([]);
                setCustomSplits({});
              }}
            >
              Clear All
            </button>
          </div>
          
          <div className="bg-element-bg rounded-lg p-2 max-h-48 overflow-y-auto shadow-sm">
            {friends.map(friend => (
              <div 
                key={friend.id}
                onClick={() => toggleFriendSelection(friend.id)}
                className={`flex items-center gap-3 p-3 rounded cursor-pointer mb-1 transition-all ${
                  selectedFriends.includes(friend.id) ? 'bg-accent/10 border-accent shadow-sm' : 'hover:bg-background/80'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={selectedFriends.includes(friend.id)}
                  onChange={() => {}} // Handled by onClick on parent
                  className="h-4 w-4 accent-accent"
                />
                <Avatar 
                  seed={friend.name} 
                  size={36} 
                  className={`rounded-full shadow-sm ${friendId === friend.id ? 'border-2 border-red-500' : ''}`} 
                  />
                <span className={selectedFriends.includes(friend.id) ? 'font-medium' : ''}>{friend.name}</span>
              </div>
            ))}
            
            {friends.length === 0 && (
              <div className="p-3 text-center text-foreground/60">
                You don't have any friends yet. Add friends in settings.
              </div>
            )}
          </div>
        </div>
      )}
      
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
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || parseFloat(value) >= 0) {
                setAmount(value);
              }
            }}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {['10', '50', '100', '500', '1000'].map((quickAmount) => (
            <span 
              key={quickAmount}
              className="inline-block px-3 py-1 bg-accent/10 text-sm rounded-full cursor-pointer hover:bg-accent/20 transition-colors"
              onClick={() => setAmount(quickAmount)}
            >
              {currency}{quickAmount}
            </span>
          ))}
        </div>
      </div>
      
      {isGroupExpense && selectedFriends.length > 0 && (
        <div>
          <label className="block mb-1.5 text-sm font-medium text-foreground/80">
            Split Method
          </label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              onClick={() => setSplitType('equal')}
              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                splitType === 'equal' 
                  ? 'bg-accent/10 border-accent shadow-md translate-y-[-2px]' 
                  : 'border-element-border hover:bg-background/80 shadow-sm'
              }`}
            >
              <FaEquals className={`text-xl ${splitType === 'equal' ? 'text-accent' : 'text-foreground/70'}`} />
              <div>
                <span className={splitType === 'equal' ? 'font-medium' : ''}>Equal</span>
                <p className="text-xs text-foreground/60 mt-0.5">Everyone pays the same</p>
              </div>
            </div>
            <div
              onClick={() => setSplitType('percentage')}
              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                splitType === 'percentage' 
                  ? 'bg-accent/10 border-accent shadow-md translate-y-[-2px]' 
                  : 'border-element-border hover:bg-background/80 shadow-sm'
              }`}
            >
              <FaPercentage className={`text-xl ${splitType === 'percentage' ? 'text-accent' : 'text-foreground/70'}`} />
              <div>
                <span className={splitType === 'percentage' ? 'font-medium' : ''}>Percentage</span>
                <p className="text-xs text-foreground/60 mt-0.5">Split by percentages</p>
              </div>
            </div>
            <div
              onClick={() => setSplitType('ratio')}
              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                splitType === 'ratio' 
                  ? 'bg-accent/10 border-accent shadow-md translate-y-[-2px]' 
                  : 'border-element-border hover:bg-background/80 shadow-sm'
              }`}
            >
              <FaBalanceScale className={`text-xl ${splitType === 'ratio' ? 'text-accent' : 'text-foreground/70'}`} />
              <div>
                <span className={splitType === 'ratio' ? 'font-medium' : ''}>Ratio</span>
                <p className="text-xs text-foreground/60 mt-0.5">Split by proportions</p>
              </div>
            </div>
            <div
              onClick={() => setSplitType('exact')}
              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                splitType === 'exact' 
                  ? 'bg-accent/10 border-accent shadow-md translate-y-[-2px]' 
                  : 'border-element-border hover:bg-background/80 shadow-sm'
              }`}
            >
              <TbMathSymbols className={`text-xl ${splitType === 'exact' ? 'text-accent' : 'text-foreground/70'}`} />
              <div>
                <span className={splitType === 'exact' ? 'font-medium' : ''}>Exact</span>
                <p className="text-xs text-foreground/60 mt-0.5">Set specific amounts</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="splitWithYou"
                checked={shouldSplitWithYou}
                onChange={(e) => setShouldSplitWithYou(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <label htmlFor="splitWithYou" className="text-sm">Include yourself in the split</label>
            </div>
            
            <button
              type="button"
              className="text-xs bg-accent/10 px-3 py-1.5 rounded-full text-accent flex items-center gap-1"
              onClick={() => {
                setSplitType('equal');
              }}
            >
              <FaEquals className="text-xs" />
              Split equally
            </button>
          </div>
          
          {/* Show custom split options based on the split type */}
          {splitType !== 'equal' && (
            <div className="bg-element-bg rounded-lg p-3 mb-3">
              <h3 className="font-medium mb-2">
                {splitType === 'percentage' ? 'Percentages' : splitType === 'ratio' ? 'Ratio' : 'Amounts'}
              </h3>
              
              {shouldSplitWithYou && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span>You</span>
                  <span className="text-sm">
                    {splitType === 'percentage' && `${calculateRemainingAmount().toFixed(0)}%`}
                    {splitType === 'ratio' && '1'}
                    {splitType === 'exact' && `${currency}${(parseFloat(amount || '0') - calculateTotalFromSplits()).toFixed(2)}`}
                  </span>
                </div>
              )}
              
              {selectedFriends.map(friendId => {
                const friend = friends.find(f => f.id === friendId);
                if (!friend) return null;
                
                return (
                  <div key={friendId} className="flex items-center justify-between py-2 border-b">
                    <span>{friend.name}</span>
                    <div className="flex items-center">
                      {splitType === 'percentage' && (
                        <>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={customSplits[friendId] || 0}
                            onChange={(e) => updateCustomSplit(friendId, parseFloat(e.target.value) || 0)}
                            className="mr-2 w-24 accent-accent"
                          />
                          <div className="flex items-center">
                            <input
                              type="number"
                              className="w-16 py-1 px-2 rounded bg-background"
                              value={customSplits[friendId] || ''}
                              onChange={(e) => updateCustomSplit(friendId, parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              step="1"
                            />
                            <span className="ml-1">%</span>
                          </div>
                        </>
                      )}
                      
                      {splitType === 'ratio' && (
                        <div className="flex items-center">
                          <button 
                            className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold"
                            onClick={() => updateCustomSplit(friendId, Math.max(1, (customSplits[friendId] || 1) - 1))}
                            type="button"
                          >-</button>
                          <input
                            type="number"
                            className="w-16 py-1 px-2 mx-2 rounded bg-background text-center"
                            value={customSplits[friendId] || '1'}
                            onChange={(e) => updateCustomSplit(friendId, parseFloat(e.target.value) || 1)}
                            min="1"
                            step="1"
                          />
                          <button 
                            className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold"
                            onClick={() => updateCustomSplit(friendId, (customSplits[friendId] || 1) + 1)}
                            type="button"
                          >+</button>
                        </div>
                      )}
                      
                      {splitType === 'exact' && (
                        <div className="flex items-center">
                          <span className="mr-1">{currency}</span>
                          <input
                            type="number"
                            className="w-20 py-1 px-2 rounded bg-background"
                            value={customSplits[friendId] || ''}
                            onChange={(e) => updateCustomSplit(friendId, parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {splitType === 'exact' && (
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className={`${
                      shouldSplitWithYou
                        ? 'text-accent'
                        : Math.abs(calculateTotalFromSplits() - parseFloat(amount || '0')) > 0.01
                          ? 'text-red-500'
                          : 'text-accent'
                    }`}>
                      {currency}{calculateTotalFromSplits().toFixed(2)} / {currency}{amount || '0'}
                    </span>
                  </div>
                  
                  {amount && (
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded overflow-hidden">
                      <div 
                        className={`h-full ${
                          shouldSplitWithYou
                            ? 'bg-accent'
                            : Math.abs(calculateTotalFromSplits() - parseFloat(amount)) > 0.01
                              ? 'bg-red-500'
                              : 'bg-accent'
                        }`}
                        style={{width: `${Math.min(100, (calculateTotalFromSplits() / parseFloat(amount || '1')) * 100)}%`}}
                      ></div>
                    </div>
                  )}
                  
                  {!shouldSplitWithYou && amount && Math.abs(calculateTotalFromSplits() - parseFloat(amount)) > 0.01 && (
                    <p className="text-xs text-red-500 mt-1">
                      The sum of all shares must equal the total amount
                    </p>
                  )}
                  
                  {shouldSplitWithYou && (
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span>Your share:</span>
                      <span className="font-medium">
                        {currency}{Math.max(0, parseFloat(amount || '0') - calculateTotalFromSplits()).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      className="text-xs bg-accent/10 px-2 py-1 rounded text-accent"
                      onClick={() => {
                        if (!amount) return;
                        
                        const equalShare = parseFloat((parseFloat(amount) / selectedFriends.length).toFixed(2));
                        const newSplits = {...customSplits};
                        
                        selectedFriends.forEach(id => {
                          newSplits[id] = equalShare;
                        });
                        
                        setCustomSplits(newSplits);
                      }}
                    >
                      Split Equally
                    </button>
                    
                    {!shouldSplitWithYou && (
                      <button
                        type="button"
                        className="text-xs bg-accent/10 px-2 py-1 rounded text-accent"
                        onClick={() => {
                          if (!amount) return;
                          
                          const totalAmount = parseFloat(amount);
                          const currentTotal = calculateTotalFromSplits();
                          const diff = totalAmount - currentTotal;
                          
                          if (Math.abs(diff) < 0.01 || selectedFriends.length === 0) return;
                          
                          // Distribute the difference evenly
                          const diffPerFriend = diff / selectedFriends.length;
                          const newSplits = {...customSplits};
                          
                          selectedFriends.forEach(id => {
                            newSplits[id] = (newSplits[id] || 0) + diffPerFriend;
                          });
                          
                          setCustomSplits(newSplits);
                        }}
                      >
                        Balance
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {splitType === 'percentage' && (
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className={`${
                      shouldSplitWithYou
                        ? Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0) > 100
                          ? 'text-red-500'
                          : 'text-accent'
                        : Math.abs(Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0) - 100) > 0.01
                          ? 'text-red-500'
                          : 'text-accent'
                    }`}>
                      {Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0).toFixed(0)}% / 100%
                    </span>
                  </div>
                  
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded overflow-hidden">
                    <div 
                      className={`h-full ${
                        shouldSplitWithYou
                          ? Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0) > 100
                            ? 'bg-red-500'
                            : 'bg-accent'
                          : Math.abs(Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0) - 100) > 0.01
                            ? 'bg-red-500'
                            : 'bg-accent'
                      }`}
                      style={{width: `${Math.min(100, Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0))}%`}}
                    ></div>
                  </div>
                  
                  {!shouldSplitWithYou && Math.abs(Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0) - 100) > 0.01 && (
                    <p className="text-xs text-red-500 mt-1">
                      Percentages must add up to exactly 100%
                    </p>
                  )}
                  
                  {shouldSplitWithYou && Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0) > 100 && (
                    <p className="text-xs text-red-500 mt-1">
                      Total percentages cannot exceed 100%
                    </p>
                  )}
                  
                  {shouldSplitWithYou && (
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span>Your percentage:</span>
                      <span className="font-medium">
                        {Math.max(0, 100 - Object.values(customSplits).reduce((sum, val) => sum + (val as number), 0)).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {splitType === 'equal' && (
            <div className="bg-element-bg rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center">
                <span>Each person pays:</span>
                <span className="font-medium">
                  {currency}{amount && (parseFloat(amount) / (selectedFriends.length + (shouldSplitWithYou ? 1 : 0))).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div>
        <label className="block mb-1.5 text-sm font-medium text-foreground/80">Description</label>
        <div>
          <input
            list="description-suggestions"
            className="w-full py-2.5 px-3 rounded-lg bg-element-bg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-300"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <datalist id="description-suggestions">
            {descriptionSuggestions.map((suggestion, index) => (
              <option key={index} value={suggestion} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {descriptionSuggestions.slice(0, 6).map((suggestion, index) => (
            <span 
              key={index}
              className="inline-block px-3 py-1 bg-accent/10 text-sm rounded-full cursor-pointer hover:bg-accent/20 transition-colors"
              onClick={() => setDescription(suggestion)}
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block mb-1.5 text-sm font-medium text-foreground/80">Date</label>
        <div className="relative">
          <input
            type="date"
            className="w-full py-2.5 px-3 rounded-lg bg-element-bg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-300"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <span 
              className="inline-block px-3 py-1 bg-accent/10 text-sm rounded-full cursor-pointer hover:bg-accent/20 transition-colors"
              onClick={() => setDate(new Date().toISOString().split('T')[0])}
            >
              Today
            </span>
            <span 
              className="inline-block px-3 py-1 bg-accent/10 text-sm rounded-full cursor-pointer hover:bg-accent/20 transition-colors"
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setDate(yesterday.toISOString().split('T')[0]);
              }}
            >
              Yesterday
            </span>
          </div>
        </div>
      </div>
      
      <div className="pt-4 sticky bottom-0 pb-4 bg-background shadow-lg -mx-6 px-6 mt-8">
        <div className="max-w-lg mx-auto">
          <Button 
            type="submit" 
            fullWidth
            className="py-3 text-base font-semibold shadow-md relative overflow-hidden transition-all hover:shadow-xl"
          >
            {isPartialPayment ? "Add Partial Payment" : isGroupExpense ? "Add Group Expense" : "Add Transaction"}
            {isSubmitting && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v5l4.293-4.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6A1 1 0 014 7.293L8.293 12H4z"></path>
                </svg>
              </span>
            )}
          </Button>
          
          {showSuccess && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Transaction recorded successfully!
            </div>
          )}
        </div>
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
    <div className="pb-20">
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
      <header className="sticky top-0 z-10 bg-background p-4 shadow-sm mb-4 flex items-center gap-2">
        <Link href="/transactions" className="p-2 hover:bg-accent/10 rounded-full transition-colors">
          <IoArrowBack className="text-xl" />
        </Link>
        <h1 className="text-xl font-bold">
          {isPartialPayment ? "Record Partial Payment" : "Record Transaction"}
        </h1>
      </header>
      
      <div className="px-6">
        <TransactionForm />
      </div>
    </>
  );
}
