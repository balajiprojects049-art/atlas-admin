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
                        className="flex items-center gap-1.5 p-1.5 px-3 rounded-lg text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 transition-all duration-300 font-semibold text-[11px] border border-indigo-200/50 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm active:scale-95 group"
                        title="View Details"
                    >
                        <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/edit/${row.id}`);
                        }}
                        className="flex items-center gap-1.5 p-1.5 px-3 rounded-lg text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 transition-all duration-300 font-semibold text-[11px] border border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm active:scale-95 group"
                        title="Edit Invoice"
                    >
                        <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
