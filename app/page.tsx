"use client";

import React, { useState } from 'react';
import { useAppStore } from './store/useStore';
import FirstStartup from './components/FirstStartup';
import NavBar from './components/NavBar';
import { Button, Card } from './components/ui';
import Avatar from './components/Avatar';
import Link from 'next/link';
import { IoAddCircleOutline, IoSearch } from 'react-icons/io5';
import { motion } from 'framer-motion';

export default function Home() {
  const { isFirstStartup, friends, transactions } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check if it's first startup
  if (isFirstStartup) {
    return <FirstStartup />;
  }

  // Calculate overall stats
  const totalLent = transactions
    .filter(t => t.type === 'lent')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalReceived = transactions
    .filter(t => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const overallBalance = totalLent - totalReceived;

  // Filter friends based on search term
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pb-20">
      <motion.header 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold" data-text="Friends">Your Squad</h1>
        </div>

        {/* Search Input */}
        <div className="relative mb-4 flex gap-2 items-center">
          <div className="flex-1 relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Card className="py-1.5 px-3 flex items-center gap-2">
            <div className="text-xs font-mono">
              <span className="text-green-600">₹{totalLent.toFixed(2)}</span>
              <span className="mx-1">/</span>
              <span className="text-red-600">₹{totalReceived.toFixed(2)}</span>
            </div>
          </Card>
        </div>
      </motion.header>

      {filteredFriends.length > 0 ? (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {filteredFriends.map((friend, index) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (index + 1), duration: 0.5 }}
            >
              <FriendCard 
                id={friend.id} 
                name={friend.name} 
                transactions={transactions.filter(t => t.friendId === friend.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : friends.length > 0 ? (
        <div className="mt-8 text-center">
          <p className="text-foreground/70">No friends match your search</p>
        </div>
      ) : (
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div 
            className="mb-6 w-24 h-24 mx-auto bg-foreground/5 rounded-full flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="dot-pattern absolute inset-0 opacity-10 rounded-full"></div>
            <IoAddCircleOutline size={48} className="text-foreground/50" />
          </motion.div>
          <p className="text-foreground/70 mb-4 font-mono">Your squad list is empty! 🙈</p>
          <Link href="/settings">
            <Button>Add Your Squad</Button>
          </Link>
        </motion.div>
      )}
      
      <NavBar />
    </div>
  );
}

interface FriendCardProps {
  id: string;
  name: string;
  transactions: Array<{
    id: string;
    friendId: string;
    amount: number;
    date: string;
    type: 'lent' | 'received';
    description: string;
  }>;
}

function FriendCard({ id, name, transactions }: FriendCardProps) {
  // Calculate total amount lent to this friend
  const lent = transactions
    .filter(t => t.type === 'lent')
    .reduce((sum, t) => sum + t.amount, 0);
    
  // Calculate total amount received from this friend
  const received = transactions
    .filter(t => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);
    
  // Calculate balance
  const balance = lent - received;
  
  return (
    <Card className="relative overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium text-lg flex items-center gap-3">
          <Avatar seed={name} size={36} className="rounded-full shadow-sm" />
          <span>{name}</span>
        </div>
        <Link href={`/transactions/add?friend=${id}`}>
          <motion.div whileTap={{ scale: 0.95 }}>
              <IoAddCircleOutline size={18} />
          </motion.div>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div 
          className="rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
          style={{
            backgroundColor: 'var(--element-bg)',
            boxShadow: '0 2px 4px var(--card-shadow)'
          }}
        >
          <p className="text-xs text-foreground/70 mb-1 font-mono">You Paid</p>
          <p className="font-medium font-mono">₹{lent.toFixed(2)}</p>
        </div>
        
        <div 
          className="rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
          style={{
            backgroundColor: 'var(--element-bg)',
            boxShadow: '0 2px 4px var(--card-shadow)'
          }}
        >
          <p className="text-xs text-foreground/70 mb-1 font-mono">Overall</p>
          <p className={`font-medium font-mono ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : ''}`}>
            ₹{Math.abs(balance).toFixed(2)}
            <span className="text-xs ml-1">{balance > 0 ? `${name} owes` : balance < 0 ? 'you owe' : ''}</span>
          </p>
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <Link href={`/transactions?friend=${id}`} className="flex-1">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button variant="outline" fullWidth className="py-1.5">
              Transaction History
            </Button>
          </motion.div>
        </Link>
        <Link href={`/settle-up?id=${id}`} className="flex-1">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button fullWidth className="py-1.5" variant='primary'>
              Square Up
            </Button>
          </motion.div>
        </Link>
      </div>
    </Card>
  );
}
