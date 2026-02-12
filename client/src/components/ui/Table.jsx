import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Table = ({
    columns,
    data,
    onRowClick,
    loading = false,
    emptyMessage = 'No data available'
}) => {
    if (loading) {
        return (
            <div className="w-full space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-light-bg-accent dark:bg-dark-bg-accent rounded w-3/4"></div>
                            <div className="h-3 bg-light-bg-accent dark:bg-dark-bg-accent rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
                <p className="text-light-text-muted dark:text-dark-text-muted">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-light-bg-accent dark:border-dark-bg-accent">
            <table className="w-full">
                <thead className="bg-light-bg-accent dark:bg-dark-bg-accent">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`
                  px-6 py-4 text-left text-xs font-semibold 
                  text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider
                  ${column.className || ''}
                `}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-light-bg-secondary dark:bg-dark-bg-secondary divide-y divide-light-bg-accent dark:divide-dark-bg-accent">
                    {data.map((row, rowIndex) => (
                        <motion.tr
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`
                transition-colors duration-150
                hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: rowIndex * 0.03 }}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`
                    px-6 py-4 text-sm text-light-text-primary dark:text-dark-text-primary
                    ${column.cellClassName || ''}
                  `}
                                >
                                    {column.render ? column.render(row) : row[column.accessor]}
                                </td>
                            ))}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-bg-accent dark:border-dark-bg-accent text-light-text-primary dark:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
            >
                Previous
            </button>

            {startPage > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-bg-accent dark:border-dark-bg-accent text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
                    >
                        1
                    </button>
                    {startPage > 2 && <span className="px-2 text-light-text-muted dark:text-dark-text-muted">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`
            px-3 py-2 rounded-lg transition-colors
            ${page === currentPage
                            ? 'bg-accent text-white'
                            : 'bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-bg-accent dark:border-dark-bg-accent text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent'
                        }
          `}
                >
                    {page}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="px-2 text-light-text-muted dark:text-dark-text-muted">...</span>}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-bg-accent dark:border-dark-bg-accent text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-bg-accent dark:border-dark-bg-accent text-light-text-primary dark:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
            >
                Next
            </button>
        </div>
    );
};

export default Table;
