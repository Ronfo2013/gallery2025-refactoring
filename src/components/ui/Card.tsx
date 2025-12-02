import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

/**
 * Card component - professional container with shadow
 */
export const Card: React.FC<CardProps> = ({ children, className, hover = false, onClick }) => {
  return (
    <div
      className={clsx('card', hover && 'card-hover cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={clsx('p-6 border-b border-gray-200', className)}>{children}</div>;
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return <div className={clsx('p-6', className)}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={clsx('p-6 border-t border-gray-200 bg-gray-50', className)}>{children}</div>
  );
};
