// components/Table.jsx (or .tsx for TypeScript)
"use client"; // إضافة "use client" إذا لم تكن موجودة بسبب الأزرار التفاعلية

import React from 'react';

const Table = ({ data, columns, title = "Data Table" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-theme-card-bg p-6 rounded-lg shadow-lg text-theme-secondary-text text-center border border-theme-border">
        لا توجد بيانات متاحة لعرضها.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-theme-text mb-8 text-center drop-shadow-lg">
        {title}
      </h2>
      <div className="overflow-x-auto bg-theme-card-bg rounded-2xl shadow-xl border border-theme-border">
        <table className="min-w-full divide-y divide-theme-border">
          <thead className="bg-theme-background-header"> {/* لون رأس الجدول مختلف قليلاً */}
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  ${rowIndex % 2 === 0 ? 'bg-theme-row-odd' : 'bg-theme-row-even'}
                  hover:bg-theme-row-hover transition-colors duration-300 ease-in-out
                `}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-theme-text" /* نص الصفوف عادي */
                  >
                    {column.renderCell ? column.renderCell(row) : row[column.accessor]}
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

export default Table;