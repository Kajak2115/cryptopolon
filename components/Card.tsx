import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default Card;