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

            // Mock data for now
            const mockMembers = [
                { id: '1', memberId: 'MEM-0001', name: 'John Doe', email: 'john@example.com', phone: '9876543210', planName: 'Monthly', planEndDate: '2026-03-15' },
                { id: '2', memberId: 'MEM-0002', name: 'Sarah Smith', email: 'sarah@example.com', phone: '9876543211', planName: 'Quarterly', planEndDate: '2026-04-20' },
                { id: '3', memberId: 'MEM-0003', name: 'Mike Johnson', email: 'mike@example.com', phone: '9876543212', planName: 'Yearly', planEndDate: '2027-02-10' },
                { id: '4', memberId: 'MEM-0004', name: 'Emma Wilson', email: 'emma@example.com', phone: '9876543213', planName: 'Monthly', planEndDate: '2026-02-28' },
                { id: '5', memberId: 'MEM-0005', name: 'David Brown', email: 'david@example.com', phone: '9876543214', planName: 'Quarterly', planEndDate: '2026-05-15' },
            ];

            setMembers(mockMembers);
            setTotalPages(1);
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
            accessor: 'planName',
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
