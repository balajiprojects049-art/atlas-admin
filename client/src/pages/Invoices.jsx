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

            // Mock data
            const mockInvoices = [
                { id: '1', invoiceNumber: 'INV-2026-0001', memberName: 'John Doe', memberId: 'MEM-0001', amount: 1000, gstAmount: 180, totalAmount: 1180, dueDate: '2026-02-15', status: 'pending' },
                { id: '2', invoiceNumber: 'INV-2026-0002', memberName: 'Sarah Smith', memberId: 'MEM-0002', amount: 2700, gstAmount: 486, totalAmount: 3186, dueDate: '2026-02-10', status: 'paid', paidDate: '2026-02-09' },
                { id: '3', invoiceNumber: 'INV-2026-0003', memberName: 'Mike Johnson', memberId: 'MEM-0003', amount: 10000, gstAmount: 1800, totalAmount: 11800, dueDate: '2026-02-05', status: 'overdue' },
                { id: '4', invoiceNumber: 'INV-2026-0004', memberName: 'Emma Wilson', memberId: 'MEM-0004', amount: 1000, gstAmount: 180, totalAmount: 1180, dueDate: '2026-02-20', status: 'pending' },
                { id: '5', invoiceNumber: 'INV-2026-0005', memberName: 'David Brown', memberId: 'MEM-0005', amount: 2700, gstAmount: 486, totalAmount: 3186, dueDate: '2026-02-12', status: 'paid', paidDate: '2026-02-11' },
            ];

            setInvoices(mockInvoices);
            setTotalPages(1);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Failed to load invoices');
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
                    <div className="font-medium">{row.memberName}</div>
                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted">{row.memberId}</div>
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
            render: (row) => <PaymentStatusBadge status={row.status} />,
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/${row.id}`);
                        }}
                    >
                        View
                    </Button>
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
