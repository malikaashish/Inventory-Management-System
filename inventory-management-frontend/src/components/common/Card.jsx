import React from 'react';

export const Card = ({ title, actions, children, padding = true }) => (
  <div className="card">
    {(title || actions) && (
      <div className="flex justify-between items-center px-6 py-4 border-b">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="flex gap-2">{actions}</div>
      </div>
    )}
    <div className={padding ? 'p-6' : ''}>{children}</div>
  </div>
);