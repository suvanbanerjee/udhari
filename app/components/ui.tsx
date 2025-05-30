"use client";

import { getHash } from 'next/dist/server/image-optimizer';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  children, 
  ...props 
}: ButtonProps) => {
  const baseClasses = "relative py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium text-sm overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30";
  
  const variantClasses = {
    primary: "bg-stone-800 text-white",
    secondary: "bg-element-bg text-foreground hover:bg-element-hover border border-foreground/10",
    outline: "bg-background text-foreground border border-foreground/20 hover:border-foreground/40",
    danger: "bg-red-500 text-white hover:bg-red-600 ring-1 ring-red-500/50",
    ghost: "bg-element-bg text-foreground/80 hover:bg-element-hover",
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 dot-pattern opacity-5" />
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  fullWidth?: boolean;
  error?: string;
}

export const Input = ({ 
  label, 
  fullWidth = false, 
  className = '', 
  error, 
  id,
  ...props 
}: InputProps) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} group`}>
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-sm font-medium text-foreground/80 font-mono">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`py-2.5 px-3 block rounded-lg bg-element-bg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-300 ${error ? 'shadow-error/20 focus:ring-error/30' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
          {...props}
        />
        <div className="absolute inset-0 dot-pattern opacity-0 group-hover:opacity-5 pointer-events-none rounded-lg"></div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-error flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-error rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div 
      className={`rounded-xl backdrop-blur-sm p-4 transition-all shadow-sm ${className}`}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-shadow)'
      }}
    >
      {children}
    </div>
  );
};

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  preventDefault?: boolean;
}

export const Tabs = ({ tabs, activeTab, onChange, preventDefault = false }: TabsProps) => {
  return (
    <div 
      className="flex w-full p-1 rounded-lg bg-element-bg"
    >
      {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md flex-1 text-sm font-medium transition-all duration-200 ${
        activeTab === tab.id
          ? 'bg-stone-800 text-white rounded-md shadow-sm'
          : 'text-foreground/70 hover:text-foreground/90 hover:bg-element-hover'
        }`}
        onClick={(e) => {
          if (preventDefault) e.preventDefault();
          onChange(tab.id);
        }}
      >
        {tab.icon}
        {tab.label}
      </button>
      ))}
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel'
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-background rounded-xl shadow-xl max-w-sm w-full p-5 border border-foreground/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-foreground/70 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={() => {
            onConfirm();
            onClose();
          }}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
