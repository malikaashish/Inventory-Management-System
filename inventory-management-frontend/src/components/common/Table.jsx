import React from 'react';

export const Table = ({ columns, data, loading, emptyMessage = 'No data' }) => {
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!data?.length) return <div className="p-8 text-center text-gray-500">{emptyMessage}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3">{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4">
                  {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};