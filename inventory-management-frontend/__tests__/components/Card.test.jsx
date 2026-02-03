// src/__tests__/components/Card.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../../components/common/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<Card title="Title" subtitle="Subtitle">Content</Card>);
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <Card title="Title" actions={<button>Action</button>}>
        Content
      </Card>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies padding by default', () => {
    const { container } = render(<Card>Content</Card>);
    const contentDiv = container.querySelector('.p-6');
    expect(contentDiv).toBeInTheDocument();
  });

  it('removes padding when padding prop is false', () => {
    const { container } = render(<Card padding={false}>Content</Card>);
    const contentDiv = container.querySelector('.p-6');
    expect(contentDiv).not.toBeInTheDocument();
  });
});