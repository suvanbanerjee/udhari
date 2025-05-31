"use client";

import React from 'react';
import NavBar from '../components/NavBar';
import { motion } from 'framer-motion';
import { Card } from '../components/ui';

export default function AboutPage() {
  return (
    <div className="p-6 pb-20">
      <motion.header 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-1">About <span className="gradient-text">Udhari</span></h1>
        <p className="text-foreground/70 font-mono">Track money with friends, the easy way!</p>
      </motion.header>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="relative overflow-hidden card-hover-effect">
            <div className="dot-pattern absolute inset-0 opacity-5"></div>
            <h2 className="text-xl font-bold mb-3">What is Udhari?</h2>
            <p className="text-foreground/80 mb-4">
              Udhari is a fun and friendly money tracking app that helps you keep tabs on 
              who paid what between friends. Say goodbye to those awkward "Hey, remember you owe me?" chats!
            </p>
            <div className="font-mono text-xs bg-subtle-bg p-3 rounded-lg">
              <span className="text-red-500">udhari</span> /'u·dha·ri/ - Hindi word meaning "credit" or "loan"
            </div>
          </Card>
        </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="relative overflow-hidden">
            <div className="dot-pattern absolute inset-0 opacity-5"></div>
            <h2 className="text-xl font-bold mb-3">Version</h2>
            <p className="text-foreground/80 mb-2">1.0.0</p>
            <p className="text-foreground/70 text-sm">Made with ❤️ by Suvan</p>
          </Card>
        </motion.div>
      </div>
      
      {/* <NavBar /> */}
    </div>
  );
}
