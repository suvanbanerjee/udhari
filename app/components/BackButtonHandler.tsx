"use client";

import { useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';

export default function BackButtonHandler() {
  useEffect(() => {
    let listener: any = null;
    
    // Set up the back button listener
    const setupListener = async () => {
      listener = await CapacitorApp.addListener('backButton', ({canGoBack}) => {
        if(!canGoBack){
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });
    };
    
    setupListener();

    // Clean up the listener when the component unmounts
    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}