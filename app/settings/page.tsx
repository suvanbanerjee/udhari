"use client";

import React, { useState } from 'react';
import { useAppStore, ThemeType } from '../store/useStore';
import NavBar from '../components/NavBar';
import { Button, Card, Input } from '../components/ui';
import { IoPersonAdd, IoTrashOutline, IoSaveOutline, IoCashOutline, IoCheckmarkCircleOutline, IoEyeOutline } from 'react-icons/io5';

export default function SettingsPage() {
  const { 
    friends, 
    addFriend, 
    updateFriend, 
    removeFriend, 
    theme, 
    setTheme, 
    currency, 
    setCurrency, 
    showAppName, 
    setShowAppName, 
    customMessage, 
    setCustomMessage 
  } = useAppStore();
  
  const [newFriendName, setNewFriendName] = useState('');
  const [editMode, setEditMode] = useState<{[key: string]: string}>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewFriendName, setPreviewFriendName] = useState('Friend');
  const [previewAmount, setPreviewAmount] = useState('500');
  
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

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const getMessagePreview = () => {
    const message = `Hey ${previewFriendName}! 

Here's our money status:

You owe me: ${currency}${previewAmount}

Transaction history:
• ${new Date().toLocaleDateString()}: Dinner - ${currency}${previewAmount} (I paid)

${customMessage ? customMessage + '\n' : ''}${showAppName ? 'Sent from Udhari app' : ''}`;

    return message;
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
        <h2 className="text-lg font-semibold mb-3">Currency Settings</h2>
        <div className="flex flex-col gap-2">
          <select
            className="w-full p-2 rounded-md"
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
          >
            <option value="₹">Indian Rupee (₹)</option>
            <option value="$">US Dollar ($)</option>
            <option value="€">Euro (€)</option>
            <option value="£">British Pound (£)</option>
            <option value="¥">Japanese Yen (¥)</option>
          </select>
          <div className="text-xs text-foreground/70 mt-1">
            Select your preferred currency symbol
          </div>
        </div>
      </Card>
      
      <Card className="mb-6 p-4">
        <h2 className="text-lg font-semibold mb-3">Settlement Message</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showAppName"
              checked={showAppName}
              onChange={() => setShowAppName(!showAppName)}
              className="h-4 w-4"
            />
            <label htmlFor="showAppName" className="text-sm">Show "Sent by Udhari app" in messages</label>
          </div>
          
          <div>
            <label className="text-sm block mb-1">Custom message (optional):</label>
            <Input
              placeholder="Add your custom message here..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              fullWidth
            />
            <p className="text-xs text-foreground/70 mt-1">
              This message will appear at the end of settlement messages
            </p>
          </div>
          
          <div className="mt-2">
            <Button 
              variant="outline" 
              onClick={togglePreview}
              className="flex items-center gap-2 w-full justify-center"
            >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            
            {showPreview && (
              <div className="mt-3 p-3 bg-foreground/5 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Message Preview:</h3>
                <pre className="whitespace-pre-wrap text-xs p-2 bg-background rounded">
                  {getMessagePreview()}
                </pre>
              </div>
            )}
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
