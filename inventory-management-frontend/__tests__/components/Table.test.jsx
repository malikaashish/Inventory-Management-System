// src/__tests__/components/Table.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '../../components/common/Table';

describe('Table Component', () => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  ];

  it('renders column headers', () => {
    render(<Table columns={columns} data={data} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const { container } = render(<Table columns={columns} data={[]} loading={true} />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<Table columns={columns} data={[]} emptyMessage="No records found" />);
    
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('calls onRowClick when row is clicked', () => {
    const handleRowClick = jest.fn();
    render(<Table columns={columns} data={data} onRowClick={handleRowClick} />);
    
    fireEvent.click(screen.getByText('John Doe'));
    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('renders custom cell content with render function', () => {
    const columnsWithRender = [
      ...columns,
      {
        title: 'Actions',
        key: 'actions',
        render: (_, row) => <button>Edit {row.name}</button>,
      },
    ];

    render(<Table columns={columnsWithRender} data={data} />);
    
    expect(screen.getByText('Edit John Doe')).toBeInTheDocument();
    expect(screen.getByText('Edit Jane Smith')).toBeInTheDocument();
  });
});