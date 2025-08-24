import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={cn(
      'p-4 bg-white dark:bg-gray-800 rounded-lg shadow',
      className
    )}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
};

export { Card };