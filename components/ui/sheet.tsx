import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface SheetProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

const Sheet: React.FC<SheetProps> = ({ children, trigger, side = 'right', className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <SheetTrigger onClick={handleOpen}>{trigger}</SheetTrigger>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleClose}
            role="presentation"
          />
          {/* Sheet Content */}
          <SheetContent side={side} className={className}>
            {children}
          </SheetContent>
        </div>
      )}
    </>
  );
};

interface SheetTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const SheetTrigger: React.FC<SheetTriggerProps> = ({ children, onClick }) => {
  return (
    <button
      className="inline-flex items-center justify-center"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface SheetContentProps {
  children: React.ReactNode;
  side: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

const SheetContent: React.FC<SheetContentProps> = ({ children, side, className }) => {
  const sideStyles = {
    left: 'left-0 top-0 bottom-0',
    right: 'right-0 top-0 bottom-0',
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0'
  };

  return (
    <div
      className={cn(
        'fixed bg-white dark:bg-gray-800 shadow-lg',
        sideStyles[side],
        'w-[90vw] max-w-md p-6',
        className
      )}
    >
      {children}
    </div>
  );
};

export { Sheet, SheetTrigger, SheetContent };