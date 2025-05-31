"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { IoReceiptOutline, IoSettingsOutline, IoAdd, IoClose, IoInformation } from 'react-icons/io5';
import { GoHome } from "react-icons/go";
import Link from 'next/link';

export default function FloatingBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const pathname = usePathname();
  
  const menuItems = [
    {
      icon: <GoHome size={24} />,
      label: 'Friends',
      path: '/',
    },
    {
      icon: <IoAdd size={24} />,
      label: 'Add',
      path: '/transactions/add',
    },
    {
      icon: <IoReceiptOutline size={24} />,
      label: 'Transactions',
      path: '/transactions',
    },
    {
      icon: <IoSettingsOutline size={24} />,
      label: 'Settings',
      path: '/settings',
    },
    {
      icon: <IoInformation size={24} />,
      label: 'About',
      path: '/about',
    },
  ];

  // Close the bubble menu when navigating to a different page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  // Handle click outside to close menu
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.floating-bubble-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);
  
  // Check if the regular navbar exists
  useEffect(() => {
    const navbar = document.querySelector('.fixed.bottom-4.left-0.right-0') as HTMLElement;
    if (navbar) {
      // Make the navbar transparent when bubble is open to prevent overlap issues
      if (isOpen) {
        navbar.style.opacity = '0';
        navbar.style.pointerEvents = 'none';
      } else {
        navbar.style.opacity = '1';
        navbar.style.pointerEvents = 'auto';
      }
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 floating-bubble-container">
      {/* Backdrop for closing menu when clicking outside */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Menu items that appear when bubble is clicked */}
      <div 
        className={`absolute bottom-16 right-2 flex flex-col-reverse gap-3 items-center transition-all duration-300 origin-bottom ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          
          return (
            <div className="relative" key={item.path}>
              {/* Tooltip */}
              {showTooltip === index && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg shadow-lg text-sm whitespace-nowrap border border-foreground/10 animate-[pop-in_0.2s_ease-out]">
                  {item.label}
                </div>
              )}
              
              <Link
                href={item.path}
                className="block transform transition-all duration-300"
                style={{
                  transform: `translateY(${isOpen ? '0' : '20px'})`,
                  opacity: isOpen ? 1 : 0,
                  transitionDelay: `${(menuItems.length - index) * 50}ms`
                }}
                onMouseEnter={() => setShowTooltip(index)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <div
                  className={`flex items-center justify-center rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 ${
                    isActive 
                      ? 'bg-white text-red-500' 
                      : 'bg-white text-black'
                  }`}
                >
                  {item.icon}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Main floating bubble button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 ${
          isOpen ? 'bg-red-500 rotate-45' : 'bg-white text-black'
        } animate-[bubble-pop_0.5s_ease-out]`}
        style={{ 
          boxShadow: isOpen ? '0 10px 25px -5px rgba(255, 82, 82, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
        }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div className={`transition-all duration-300 ${isOpen ? 'rotate-0' : 'rotate-0'}`}>
          {isOpen ? (
            <IoClose size={28} className="text-white animate-[spin-in_0.3s_ease-out]" />
          ) : (
            <IoAdd size={28} className="text-foreground" />
          )}
        </div>
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping"></span>
        )}
      </button>
    </div>
  );
}
