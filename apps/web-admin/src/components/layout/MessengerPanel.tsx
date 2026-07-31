import React from 'react';
import { MessengerContent } from '@encreasl/ui/messenger';

interface MessengerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessengerPanel({ isOpen, onClose }: MessengerPanelProps) {
  return <MessengerContent variant="modal" isOpen={isOpen} onClose={onClose} />;
}
