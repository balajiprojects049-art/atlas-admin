import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/helpers';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeMembers: 0,
        renewalRate: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await analyticsAPI.getDashboard();
                if (response.data.success) {
                    setStats({
                        totalRevenue: response.data.stats.totalRevenue || 0,
                        activeMembers: response.data.stats.activeMembers || 0,
                        renewalRate: 0 // Backend doesn't provide this yet
                    });
                }
            } catch (error) {
                console.error('Error fetching report stats:', error);
            }
        };
        fetchStats();
    }, []);

    const handleExportCSV = async () => {
        try {
            const response = await analyticsAPI.exportCSV();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Revenue_Report.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success('CSV Report Exported!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export CSV');
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await analyticsAPI.exportPDF();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Revenue_Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success('PDF Report Exported!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export PDF');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Reports & Analytics
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        View detailed reports and analytics
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportCSV}>
                        Export CSV
                    </Button>
                    <Button variant="primary" onClick={handleExportPDF}>
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    color="success"
                />
                <StatCard
                    title="Active Members"
                    value={stats.activeMembers}
                    color="info"
                />
                <StatCard
                    title="Renewal Rate"
                    value={`${stats.renewalRate}%`}
                    color="accent"
                />
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card h-80">
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                        Revenue Trend
                    </h3>
                    <div className="flex items-center justify-center h-full text-light-text-muted dark:text-dark-text-muted">
                        Chart will be implemented with Chart.js
                    </div>
                </div>

                <div className="card h-80">
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                        Membership Growth
                    </h3>
                    <div className="flex items-center justify-center h-full text-light-text-muted dark:text-dark-text-muted">
                        Chart will be implemented with Chart.js
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
