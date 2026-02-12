import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Pagination } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MembershipStatusBadge } from '../components/ui/Badge';
import { memberAPI } from '../services/api';
import { formatDate, getMembershipStatus } from '../utils/helpers';
import toast from 'react-hot-toast';

const Members = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
                            navigate(`/members/edit/${row.id}`);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                    >
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
        </div>
    );
};

export default Members;
