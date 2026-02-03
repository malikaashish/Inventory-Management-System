// src/__tests__/components/MetricsCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricsCard } from '../../components/dashboard/MetricsCard';
import { Package } from 'lucide-react';

describe('MetricsCard Component', () => {
  it('renders title and value', () => {
    render(<MetricsCard title="Total Products" value="150" />);
    
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <MetricsCard title="Products" value="100" icon={Package} />
    );
    
    const iconContainer = container.querySelector('svg');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders trend indicator when trend is up', () => {
    render(
      <MetricsCard 
        title="Sales" 
        value="$10,000" 
        trend="up" 
        trendValue="+15%" 
      />
    );
    
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });

  it('renders trend indicator when trend is down', () => {
    render(
      <MetricsCard 
        title="Sales" 
        value="$8,000" 
        trend="down" 
        trendValue="-5%" 
      />
    );
    
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('applies correct color class', () => {
    const { container } = render(
      <MetricsCard title="Alerts" value="5" icon={Package} color="red" />
    );
    
    const iconBg = container.querySelector('.bg-red-50');
    expect(iconBg).toBeInTheDocument();
  });
});