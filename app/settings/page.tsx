"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore, ThemeType } from '../store/useStore';
import { Button, Card, Input } from '../components/ui';
import { IoPersonAdd, IoCashOutline, IoCheckmarkCircleOutline, IoEyeOutline } from 'react-icons/io5';
import Avatar from '../components/Avatar';

export default function SettingsPage() {
  const { 
    friends, 
    theme, 
    setTheme, 
    currency, 
    setCurrency, 
    showAppName, 
    setShowAppName, 
    customMessage, 
    setCustomMessage,
    upiVpa,
    setUpiVpa,
    enableUpiPayment,
    setEnableUpiPayment
  } = useAppStore();
  
  const [showPreview, setShowPreview] = useState(false);
  const [previewFriendName, setPreviewFriendName] = useState('Friend');
  const [previewAmount, setPreviewAmount] = useState('500');

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
    let message = `Hey ${previewFriendName}! 

Here's our money status:

You owe me: ${currency}${previewAmount}

Transaction history:
• ${new Date().toLocaleDateString()}: Dinner - ${currency}${previewAmount} (I paid)

`;

    if (enableUpiPayment && upiVpa) {
      // Create a mobile-friendly UPI link that works in messaging apps
      const upiLink = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent('Payment via Udhari')}&am=${previewAmount}&cu=INR&tn=${encodeURIComponent('Sent through Udhari app')}`;
      message += `Pay directly: ${upiLink}\n\n`;
    }

    message += `${customMessage ? customMessage + '\n' : ''}${showAppName ? 'Sent from Udhari app' : ''}`;

    return message;
  };

  return (
    <div className="p-4 pb-20 mx-auto">
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
        <h2 className="text-lg font-semibold mb-3">UPI Payment Settings</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableUpiPayment"
              checked={enableUpiPayment}
              onChange={() => setEnableUpiPayment(!enableUpiPayment)}
              className="h-4 w-4"
            />
            <label htmlFor="enableUpiPayment" className="text-sm">Include UPI payment link in messages</label>
          </div>
          
          {enableUpiPayment && (
            <div>
              <label className="text-sm block mb-1">Your UPI VPA (Virtual Payment Address):</label>
              <Input
                placeholder="example@upi"
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                fullWidth
              />
              <p className="text-xs text-foreground/70 mt-1">
                Enter your UPI ID (e.g. 1234567890@upi, yourname@bank)
              </p>
            </div>
          )}
        </div>
      </Card>
      
      <Card className="mb-6 p-4">
        <h2 className="text-lg font-semibold mb-3">Friends</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{friends.length} friends</p>
              <p className="text-foreground/70 text-sm">Manage your contacts</p>
            </div>
            <Link href="/settings/friends">
              <Button variant="primary" className="items-center gap-2">
                Modify
              </Button>
            </Link>
          </div>
          
          {friends.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {friends.slice(0, 4).map(friend => (
                <div key={friend.id} className="p-3 bg-foreground/5 rounded-lg flex items-center gap-2">
                  <Avatar seed={friend.name} size={36} className="rounded-full shadow-sm" />
                  <span className="font-medium truncate">{friend.name}</span>
                </div>
              ))}
              {friends.length > 4 && (
                <div className="p-3 bg-foreground/5 rounded-lg flex items-center justify-center">
                  <Link href="/settings/friends" className="text-accent font-medium">
                    +{friends.length - 4} more
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-3 border border-dashed border-foreground/20 rounded-lg">
              <p className="text-foreground/70 mb-2">No friends added yet</p>
              <Link href="/settings/friends">
                <Button variant="secondary" className="inline-flex items-center gap-2">
                  <IoPersonAdd />
                  Add Friends
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* <NavBar /> */}
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
