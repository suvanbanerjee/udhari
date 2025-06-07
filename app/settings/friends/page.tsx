"use client";

import React, { useState } from 'react';
import { useAppStore, Friend } from '../../store/useStore';
import { Button, Card, Input, ConfirmDialog } from '../../components/ui';
import { 
  IoPersonAdd, 
  IoTrashOutline, 
  IoSaveOutline,
  IoPerson, 
  IoArrowBack, 
  IoSearch,
  IoClose,
  IoPencil
} from 'react-icons/io5';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '../../components/Avatar';

export default function FriendsManagementPage() {
  const { 
    friends, 
    addFriend, 
    updateFriend, 
    removeFriend
  } = useAppStore();
  
  const router = useRouter();
  
  // State
  const [newFriendName, setNewFriendName] = useState('');
  const [editMode, setEditMode] = useState<{[key: string]: string}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    friendId: string;
    friendName: string;
  }>({ isOpen: false, friendId: '', friendName: '' });
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  // Handlers
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
  
  const handleDeleteConfirmation = (friend: Friend) => {
    setConfirmDialog({
      isOpen: true,
      friendId: friend.id,
      friendName: friend.name
    });
  };
  
  const handleDeleteFriend = () => {
    removeFriend(confirmDialog.friendId);
    setConfirmDialog({ isOpen: false, friendId: '', friendName: '' });
  };

  const toggleBulkDeleteMode = () => {
    setBulkDeleteMode(!bulkDeleteMode);
    setSelectedFriends([]);
  };

  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedFriends.length} friends?`)) {
      selectedFriends.forEach(id => removeFriend(id));
      setSelectedFriends([]);
      setBulkDeleteMode(false);
    }
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 pb-20 mx-auto">
      {/* Header with back button */}
      <header className="mb-6 flex items-center">
        <Link href="/settings" className="mr-3">
          <Button variant="ghost" className="p-2" aria-label="Back">
            <IoArrowBack size={22} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-foreground/70 text-sm">Manage your contacts</p>
        </div>
      </header>
      
      {/* Search and Actions Bar */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-grow">
          <Input
            placeholder="Search friends..."
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <IoSearch 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"
            size={18}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <IoClose size={18} />
            </button>
          )}
        </div>
        {friends.length > 1 && (
          <Button 
            variant={bulkDeleteMode ? "danger" : "secondary"} 
            onClick={toggleBulkDeleteMode}
            aria-label={bulkDeleteMode ? "Cancel" : "Bulk select"}
          >
            {bulkDeleteMode ? "Cancel" : "Select"}
          </Button>
        )}
      </div>
      
      {/* Add Friend Card */}
      <Card className="mb-6 p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <IoPerson />
          Add New Friend
        </h2>
        <div className="flex gap-2">
          <Input
            placeholder="Friend's name"
            fullWidth
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
          />
          <Button 
            onClick={handleAddFriend} 
            aria-label="Add friend"
            disabled={!newFriendName.trim()}
          >
            <IoPersonAdd />
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {bulkDeleteMode && selectedFriends.length > 0 && (
        <div className="sticky bottom-24 left-0 right-0 p-4 bg-background shadow-lg rounded-lg border border-foreground/10 mb-4 z-10">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedFriends.length} selected</span>
            <Button 
              variant="danger" 
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <IoTrashOutline />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      
      {/* Friends List */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <IoPerson />
          Friends List {friends.length > 0 && `(${friends.length})`}
        </h2>
        
        {filteredFriends.length > 0 ? (
          <div className="space-y-3">
            {filteredFriends.map(friend => (
              <div 
                key={friend.id} 
                className={`p-4 rounded-lg transition-all ${
                  selectedFriends.includes(friend.id) 
                    ? 'bg-accent/10 border border-accent' 
                    : 'bg-foreground/5 hover:bg-foreground/10'
                }`}
              >
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
                      disabled={!editMode[friend.id]?.trim()}
                    >
                      <IoSaveOutline />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => cancelEdit(friend.id)}
                      className="p-2"
                      aria-label="Cancel"
                    >
                      <IoClose />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {bulkDeleteMode && (
                        <input 
                          type="checkbox"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={() => toggleFriendSelection(friend.id)}
                          className="h-5 w-5 rounded"
                        />
                      )}
                    <Avatar seed={friend.name} size={36} className="rounded-full shadow-sm" />
                      <span className="font-medium">{friend.name}</span>
                    </div>
                    {!bulkDeleteMode && (
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary"
                          onClick={() => startEdit(friend.id, friend.name)}
                          className="p-2"
                          aria-label="Edit"
                        >
                          <IoPencil size={18} />
                        </Button>
                        <Button 
                          variant="danger"
                          onClick={() => handleDeleteConfirmation(friend)}
                          className="p-2"
                          aria-label="Delete"
                        >
                          <IoTrashOutline size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-foreground/20 rounded-lg">
            {searchQuery ? (
              <>
                <p className="text-foreground/70 mb-2">No friends found matching "{searchQuery}"</p>
                <Button variant="secondary" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </>
            ) : (
              <p className="text-foreground/70">No friends added yet. Add your first friend above!</p>
            )}
          </div>
        )}
      </Card>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleDeleteFriend}
        title="Delete Friend"
        message={`Are you sure you want to delete ${confirmDialog.friendName}? All related transactions will also be deleted.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
