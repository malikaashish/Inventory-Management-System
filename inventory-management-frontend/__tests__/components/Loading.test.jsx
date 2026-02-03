import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loading } from '../../src/components/common/Loading';

test('renders loading label', () => {
  render(<Loading label="Please wait" />);
  expect(screen.getByText('Please wait')).toBeInTheDocument();
});