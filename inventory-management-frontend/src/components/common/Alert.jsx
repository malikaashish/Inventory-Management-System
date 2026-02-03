// components/common/Alert.jsx
import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const variants = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: AlertCircle,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
  },
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const styles = variants[variant];
  const Icon = styles.icon;

  return (
    <div
      className={clsx(
        'flex p-4 rounded-lg border',
        styles.bg,
        styles.border,
        className
      )}
    >
      <Icon className={clsx('w-5 h-5 flex-shrink-0', styles.text)} />
      <div className="ml-3 flex-1">
        {title && (
          <h3 className={clsx('text-sm font-medium', styles.text)}>{title}</h3>
        )}
        {children && (
          <div className={clsx('text-sm', styles.text, title && 'mt-1')}>
            {children}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={clsx(
            'ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-white/50',
            styles.text
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};