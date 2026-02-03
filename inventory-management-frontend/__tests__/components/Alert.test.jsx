// src/__tests__/components/Alert.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../../components/common/Alert';

describe('Alert Component', () => {
  it('renders with default info variant', () => {
    const { container } = render(<Alert>Info message</Alert>);
    expect(container.firstChild).toHaveClass('bg-blue-50');
  });

  it('renders success variant correctly', () => {
    const { container } = render(<Alert variant="success">Success</Alert>);
    expect(container.firstChild).toHaveClass('bg-green-50');
  });

  it('renders warning variant correctly', () => {
    const { container } = render(<Alert variant="warning">Warning</Alert>);
    expect(container.firstChild).toHaveClass('bg-yellow-50');
  });

  it('renders error variant correctly', () => {
    const { container } = render(<Alert variant="error">Error</Alert>);
    expect(container.firstChild).toHaveClass('bg-red-50');
  });

  it('renders title when provided', () => {
    render(<Alert title="Alert Title">Message</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('renders children as message', () => {
    render(<Alert>Alert message content</Alert>);
    expect(screen.getByText('Alert message content')).toBeInTheDocument();
  });

  it('shows close button when onClose is provided', () => {
    const handleClose = jest.fn();
    render(<Alert onClose={handleClose}>Message</Alert>);
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<Alert onClose={handleClose}>Message</Alert>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when onClose is not provided', () => {
    render(<Alert>Message</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});