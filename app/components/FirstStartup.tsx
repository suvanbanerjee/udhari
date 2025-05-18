"use client";

import React, { useState } from 'react';
import { Button, Card, Input } from './ui';
import { IoPersonAdd } from 'react-icons/io5';
import { useAppStore } from '../store/useStore';

export default function FirstStartup() {
  const [friendName, setFriendName] = useState('');
  const [friends, setFriends] = useState<{id: string; name: string}[]>([]);
  const { addFriend, markFirstStartupComplete } = useAppStore();
  
  const handleAddFriend = () => {
    if (friendName.trim()) {
      const newFriend = { id: crypto.randomUUID(), name: friendName.trim() };
      setFriends([...friends, newFriend]);
      setFriendName('');
    }
  };

  const handleRemoveFriend = (id: string) => {
    setFriends(friends.filter(friend => friend.id !== id));
  };

  const handleComplete = () => {
    // Add all friends to the store
    friends.forEach(friend => {
      addFriend(friend.name);
    });
    
    // Mark first startup as complete
    markFirstStartupComplete();
  };

  return (
    <div className="min-h-screen flex flex-col p-6 pb-8">
      <div className="flex-grow">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to <span className="gradient-text">Udhari</span>! 🎉</h1>
          <p className="text-foreground/70">Let's add your squad to get started</p>
        </div>
      
        <Card className="mb-5">
          <div className="flex gap-3">
            <Input
              placeholder="Friend's name"
              fullWidth
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
            />
            <Button onClick={handleAddFriend}>
              <IoPersonAdd />
            </Button>
          </div>
        </Card>
        
        {friends.length > 0 && (
          <Card className="mb-5 max-h-[40vh] overflow-y-auto">
            <h2 className="text-sm font-medium text-foreground/70 mb-3">Friends added</h2>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div 
                  key={friend.id} 
                  className="flex items-center justify-between p-3 bg-element-bg rounded-lg"
                >
                  <span>{friend.name}</span>
                  <button
                    className="text-foreground/60 hover:text-red-500"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      
      <div className="sticky bottom-0 pt-4 w-full">
        <Button 
          fullWidth 
          onClick={handleComplete}
          disabled={friends.length === 0}
          className="shadow-md"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
