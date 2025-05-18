"use client";

import React, { useState } from 'react';
import { useAppStore, ThemeType } from '../store/useStore';
import NavBar from '../components/NavBar';
import { Button, Card, Input } from '../components/ui';
import { IoPersonAdd, IoTrashOutline, IoSaveOutline, IoSunnyOutline, IoMoonOutline, IoColorPaletteOutline } from 'react-icons/io5';

export default function SettingsPage() {
  const { friends, addFriend, updateFriend, removeFriend, theme, setTheme } = useAppStore();
  const [newFriendName, setNewFriendName] = useState('');
  const [editMode, setEditMode] = useState<{[key: string]: string}>({});
  
  const handleAddFriend = () => {
    if (newFriendName.trim()) {
      addFriend(newFriendName.trim());
      setNewFriendName('');
    }
  };
  
  const startEdit = (id: string, name: string) => {
    setEditMode({
      ...editMode,
      [id]: name
    });
  };
  
  const cancelEdit = (id: string) => {
    const updated = { ...editMode };
    delete updated[id];
    setEditMode(updated);
  };
  
  const saveEdit = (id: string) => {
    const newName = editMode[id];
    if (newName && newName.trim()) {
      updateFriend(id, newName.trim());
      cancelEdit(id);
    }
  };
  
  const handleDeleteFriend = (id: string) => {
    if (confirm('Are you sure you want to delete this friend? All related transactions will also be deleted.')) {
      removeFriend(id);
    }
  };

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <header className="mb-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-foreground/70 text-sm">Manage your friends and preferences</p>
      </header>
      
      <Card className="mb-6 p-4">
      <h2 className="text-lg font-semibold mb-3">App Theme</h2>
      <div className="flex flex-col gap-2">
        <select
        className="w-full p-2 rounded-md"
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value as ThemeType)}
        >
        <option value="light">Light</option>
        <option value="amoled">AMOLED</option>
        <option value="gray">Gray</option>
        </select>
        <div className="text-xs text-foreground/70 mt-1">
        Select your preferred theme appearance
        </div>
      </div>
      </Card>
      
      <Card className="mb-6 p-4">
        <h2 className="text-lg font-semibold mb-3">Add Friend</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Friend's name"
            fullWidth
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
          />
          <Button onClick={handleAddFriend} aria-label="Add friend">
            <IoPersonAdd />
          </Button>
        </div>
      </Card>
      
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Manage Friends</h2>
        
        {friends.length > 0 ? (
          <div className="space-y-2">
            {friends.map(friend => (
              <div key={friend.id} className="p-3 bg-foreground/5 rounded-lg">
                {editMode[friend.id] !== undefined ? (
                  <div className="flex gap-2">
                    <Input
                      fullWidth
                      value={editMode[friend.id]}
                      onChange={(e) => setEditMode({
                        ...editMode, 
                        [friend.id]: e.target.value
                      })}
                    />
                    <Button 
                      variant="secondary"
                      onClick={() => saveEdit(friend.id)}
                      className="p-2"
                      aria-label="Save"
                    >
                      <IoSaveOutline />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => cancelEdit(friend.id)}
                      className="p-2"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{friend.name}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary"
                        onClick={() => startEdit(friend.id, friend.name)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger"
                        onClick={() => handleDeleteFriend(friend.id)}
                        aria-label="Delete"
                      >
                        <IoTrashOutline />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-foreground/70 py-3">No friends added yet</p>
        )}
      </Card>
      
      <NavBar />
    </div>
  );
}

interface ThemeButtonProps {
  name: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
  border: string;
}

const ThemeButton = ({ name, active, onClick, icon, color, border }: ThemeButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center rounded-lg transition-all flex-shrink-0 min-w-[80px] shadow-sm ${
        active ? 'ring-2 ring-accent shadow-md' : ''
      }`}
    >
      <div className={`w-full h-12 rounded-t-lg ${color} flex items-center justify-center text-white shadow-inner`}>
        {icon}
      </div>
      <div className={`w-full py-2 px-3 text-center bg-element-bg rounded-b-lg ${active ? 'bg-element-hover font-medium' : ''}`}>
        <span className="text-xs">{name}</span>
      </div>
    </button>
  );
};
