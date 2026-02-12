import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Pagination } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { PaymentStatusBadge } from '../components/ui/Badge';
import { invoiceAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Invoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchInvoices();
    }, [currentPage, search, statusFilter]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await invoiceAPI.getAll({
                page: currentPage,
                limit: 10,
                search: search,
                status: statusFilter
            });

            if (response.data.success) {
                setInvoices(response.data.invoices);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            // toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const invoiceColumns = [
        {
            header: 'Invoice #',
            accessor: 'invoiceNumber',
        },
        {
            header: 'Member',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.member?.name || 'Unknown'}</div>
                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted">{row.member?.memberId || '-'}</div>
                </div>
            ),
        },
        {
            header: 'Amount',
            render: (row) => (
                <div>
                    <div className="font-medium">{formatCurrency(row.totalAmount)}</div>
                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted">Base: {formatCurrency(row.amount)}</div>
                </div>
            ),
        },
        {
            header: 'Due Date',
            render: (row) => formatDate(row.dueDate),
        },
        {
            header: 'Status',
            render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/${row.id}`);
                        }}
                        className="flex items-center gap-1 p-1.5 px-3 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all duration-300 font-medium text-xs border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/edit/${row.id}`);
                        }}
                        className="flex items-center gap-1 p-1.5 px-3 rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900/30 transition-all duration-300 font-medium text-xs border border-gray-100 dark:border-gray-900/50 hover:border-gray-200 dark:hover:border-gray-800 shadow-sm active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Billing & Invoices
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Manage invoices and payment processing
                    </p>
                </div>
                <Button onClick={() => navigate('/invoices/create')}>
                    Create Invoice
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <Input
                        placeholder="Search by invoice #, member name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                            { value: 'paid', label: 'Paid' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'overdue', label: 'Overdue' },
                        ]}
                        placeholder="All Status"
                        className="w-full md:w-48"
                    />
                </div>
            </div>

            {/* Invoices Table */}
            <div className="card">
                <Table
                    columns={invoiceColumns}
                    data={invoices}
                    loading={loading}
                    emptyMessage="No invoices found"
                />

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default Invoices;
