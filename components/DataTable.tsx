
import React from 'react';

interface DataTableProps {
  title: string;
  data: (string | number)[][];
}

export const DataTable: React.FC<DataTableProps> = ({ title, data }) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  const headers = data[0];
  const rows = data.slice(1);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100 transition-colors duration-200">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
