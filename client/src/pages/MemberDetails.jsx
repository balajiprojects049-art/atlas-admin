import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { MembershipStatusBadge, PaymentStatusBadge } from '../components/ui/Badge';
import { memberAPI } from '../services/api';
import { formatDate, formatCurrency, getMembershipStatus } from '../utils/helpers';
import toast from 'react-hot-toast';

const MemberDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemberDetails();
    }, [id]);

    const fetchMemberDetails = async () => {
        try {
            setLoading(true);
            const response = await memberAPI.getById(id);
            if (response.data.success) {
                setMember(response.data.member);
            } else {
                toast.error('Member not found');
                navigate('/members');
            }
        } catch (error) {
            console.error('Error fetching member details:', error);
            toast.error('Failed to load member details');
            navigate('/members');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!member) return null;

    const status = getMembershipStatus(member.planEndDate);

    const invoiceColumns = [
        {
            header: 'Invoice #',
            accessor: 'invoiceNumber',
        },
        {
            header: 'Amount',
            render: (row) => formatCurrency(row.totalAmount),
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
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/invoices/${row.id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg">
                        {member.photo ? (
                            <img
                                src={member.photo}
                                alt={member.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-indigo-600 dark:text-indigo-400 text-3xl font-bold">
                                {member.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                            {member.name}
                        </h1>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            Member ID: {member.memberId}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/members/edit/${member.id}`)}>
                        Edit Profile
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                        onClick={() => navigate('/invoices/create', { state: { memberId: member.id, isRenewal: true } })}
                    >
                        Renew Plan
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/invoices/create', { state: { memberId: member.id } })}>
                        Create Invoice
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal Info */}
                <div className="space-y-6">
                    <Card title="Personal Information">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                    Email Address
                                </label>
                                <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {member.email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                    Phone Number
                                </label>
                                <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {member.phone}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                    Gender
                                </label>
                                <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {member.gender || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                    Date of Birth
                                </label>
                                <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {formatDate(member.dob) || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                    Address
                                </label>
                                <p className="text-light-text-primary dark:text-dark-text-primary mt-1 leading-relaxed">
                                    {member.address || 'No address provided'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Fitness Stats">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase">
                                    Height
                                </label>
                                <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {member.height || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase">
                                    Weight
                                </label>
                                <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {member.weight || 'N/A'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase">
                                    Workout Preference
                                </label>
                                <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {member.workoutType || 'General Training'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Membership & Invoices */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Current Membership">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                    Plan Name
                                </label>
                                <p className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {member.plan?.name || 'No Active Plan'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                    Status
                                </label>
                                <div className="mt-1">
                                    <MembershipStatusBadge status={status} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                                    Expiry Date
                                </label>
                                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                                    {formatDate(member.planEndDate)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Payment History">
                        <Table
                            columns={invoiceColumns}
                            data={member.invoices || []}
                            emptyMessage="No invoices found for this member"
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MemberDetails;
