import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Pagination } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MembershipStatusBadge } from '../components/ui/Badge';
import { memberAPI } from '../services/api';
import { formatDate, getMembershipStatus } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Modal } from '../components/ui/Modal';

const Members = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        memberId: null,
        memberName: ''
    });

    useEffect(() => {
        fetchMembers();
    }, [currentPage, search]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await memberAPI.getAll({
                page: currentPage,
                limit: 10,
                search: search
            });

            if (response.data.success) {
                setMembers(response.data.members);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id, name) => {
        setDeleteModal({
            isOpen: true,
            memberId: id,
            memberName: name
        });
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await memberAPI.delete(deleteModal.memberId);
            if (response.data.success) {
                toast.success('Member deleted successfully');
                setDeleteModal({ isOpen: false, memberId: null, memberName: '' });
                fetchMembers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            toast.error(error.response?.data?.message || 'Failed to delete member');
        } finally {
            setLoading(false);
        }
    };

    const memberColumns = [
        {
            header: 'Member ID',
            accessor: 'memberId',
        },
        {
            header: 'Name',
            accessor: 'name',
        },
        {
            header: 'Email',
            accessor: 'email',
        },
        {
            header: 'Phone',
            accessor: 'phone',
        },
        {
            header: 'Plan',
            render: (row) => row.plan?.name || '-',
        },
        {
            header: 'Expires On',
            render: (row) => formatDate(row.planEndDate),
        },
        {
            header: 'Status',
            render: (row) => {
                const status = getMembershipStatus(row.planEndDate);
                return <MembershipStatusBadge status={status} />;
            },
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/members/${row.id}`);
                        }}
                        className="flex items-center gap-1 p-1.5 px-3 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all duration-300 font-medium text-xs border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm active:scale-95"
                        title="View Details"
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
                            navigate(`/members/edit/${row.id}`);
                        }}
                        className="flex items-center gap-1 p-1.5 px-3 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-all duration-300 font-medium text-xs border border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm active:scale-95"
                        title="Edit Member"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(row.id, row.name);
                        }}
                        className="flex items-center gap-1 p-1.5 px-3 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all duration-300 font-medium text-xs border border-red-100 dark:border-red-900/50 hover:border-red-200 dark:hover:border-red-800 shadow-sm active:scale-95"
                        title="Delete Member"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
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
                        Members
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Manage gym members and their memberships
                    </p>
                </div>
                <Button onClick={() => navigate('/members/add')}>
                    Add Member
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Members Table */}
            <div className="card">
                <Table
                    columns={memberColumns}
                    data={members}
                    loading={loading}
                    onRowClick={(member) => navigate(`/members/${member.id}`)}
                    emptyMessage="No members found"
                />

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                title="Confirm Deletion"
                size="sm"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Warning!</h3>
                            <p className="text-sm text-red-700 dark:text-red-400 opacity-90">
                                This action is permanent and cannot be reversed.
                            </p>
                        </div>
                    </div>

                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Are you sure you want to delete <span className="font-bold text-light-text-primary dark:text-dark-text-primary">{deleteModal.memberName}</span>?
                        All their membership records and invoices will be permanently removed.
                    </p>

                    <div className="flex gap-3 justify-end pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-200 dark:shadow-red-900/20"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete Member'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Members;
