import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../../src/components/common/Pagination';

test('does not render if totalPages <= 1', () => {
  const { container } = render(<Pagination page={0} totalPages={1} />);
  expect(container.firstChild).toBeNull();
});

test('renders and calls handlers', () => {
  const onPrev = jest.fn();
  const onNext = jest.fn();
  render(<Pagination page={1} totalPages={5} onPrev={onPrev} onNext={onNext} />);

  expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Previous'));
  fireEvent.click(screen.getByText('Next'));

  expect(onPrev).toHaveBeenCalledTimes(1);
  expect(onNext).toHaveBeenCalledTimes(1);
});