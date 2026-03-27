import React from 'react';
import { useSocket } from '@/shared/hooks/useSocket';
import { useUserSocket } from '@/shared/hooks/useUserSocket';

interface SocketProviderProps {
  children: React.ReactNode;
}

function SocketListeners() {
  useSocket();
  useUserSocket();
  return null;
}

export function SocketProvider({ children }: SocketProviderProps) {
  return (
    <>
      <SocketListeners />
      {children}
    </>
  );
}
