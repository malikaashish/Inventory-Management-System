import React from 'react';
import { Card } from '../common/Card';

export const DashboardWidget = ({ title, children }) => {
  return (
    <Card title={title} className="h-full">
      <div className="mt-2">{children}</div>
    </Card>
  );
};