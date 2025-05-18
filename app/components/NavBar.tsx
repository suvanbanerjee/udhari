"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoEllipseOutline, IoReceiptOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoInformation } from 'react-icons/io5';

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    {
      icon: <IoEllipseOutline size={24} />,
      label: 'Friends',
      path: '/',
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

  return (
    <>      
      {/* Navigation Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-10 px-4">
        <div className="mx-auto max-w-xs bg-background/80 backdrop-blur-lg rounded-full">
          <div className="flex justify-around items-center py-2.5 px-3">
        {navItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                >
                  <div
                    className={`flex flex-col items-center px-3 py-1.5 rounded-full ${
                      isActive ? 'text-red-500' : 'text-foreground/60 hover:bg-subtle-bg'
                    }`}
                  >
                    {item.icon}
                    {/* <span className="text-xs mt-0.5 font-medium">{item.label}</span> */}
                    {isActive && (
                      <div 
                        className="h-1 w-1 rounded-full bg-accent absolute -bottom-1"
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
