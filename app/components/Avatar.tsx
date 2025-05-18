"use client";

import React, { useEffect, useState } from 'react';
import { createAvatar } from '@dicebear/core';
import { loreleiNeutral } from '@dicebear/collection';

interface AvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export default function Avatar({ seed, size = 40, className = '' }: AvatarProps) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    // Create avatar with the provided seed
    const avatar = createAvatar(loreleiNeutral, {
      seed,
      radius: 50
    });
    
    setSvg(avatar.toString());
  }, [seed]);

  return (
    <div 
      className={`overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
