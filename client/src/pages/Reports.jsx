import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LineChart, BarChart } from '../components/ui/Charts';
import { formatCurrency } from '../utils/helpers';
import { analyticsAPI } from '../services/api';
import { getCafeteriaAnalytics, getAllOrders } from '../services/cafeteriaService';
import toast from 'react-hot-toast';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('gym');
    const [loading, setLoading] = useState(true);

    // Gym Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeMembers: 0,
        renewalRate: 0,
        revenueTrend: { labels: [], values: [] },
        memberGrowth: { labels: [], values: [] }
    });

    // Cafeteria Stats
    const [cafeteriaStats, setCafeteriaStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        paidOrders: 0,
        pendingOrders: 0,
        salesTrend: { labels: [], values: [] },
        topProductsChart: { labels: [], values: [] }
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Gym Data
            const response = await analyticsAPI.getDashboard();

            if (response.data.success) {
                setStats({
                    totalRevenue: response.data.stats.totalRevenue || 0,
                    activeMembers: response.data.stats.activeMembers || 0,
                    renewalRate: response.data.stats.renewalRate || 0,
                    revenueTrend: response.data.stats.revenueTrend || { labels: [], values: [] },
                    memberGrowth: response.data.stats.memberGrowth || { labels: [], values: [] }
                });
            }

            // Cafeteria Data
            const cafStatsData = await getCafeteriaAnalytics();
            const cafOrdersData = await getAllOrders();

            // Calculate Daily Sales Trend from orders
            const salesByDate = {};
            const sortedOrders = cafOrdersData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            sortedOrders.forEach(order => {
                const date = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
                salesByDate[date] = (salesByDate[date] || 0) + (order.paymentStatus === 'PAID' ? (order.subtotal || 0) : 0);
            });

            const salesTrend = {
                labels: Object.keys(salesByDate),
                values: Object.values(salesByDate)
            };

            // Top Products Data transformation for chart
            const topProductsChart = {
                labels: cafStatsData.topProducts?.map(p => p.productName) || [],
                values: cafStatsData.topProducts?.map(p => p.quantity) || []
            };

            setCafeteriaStats({
                ...cafStatsData,
                salesTrend: salesTrend.labels.length > 0 ? salesTrend : { labels: ['No Data'], values: [0] },
                topProductsChart: topProductsChart
            });

        } catch (error) {
            console.error('Error fetching report stats:', error);
            toast.error('Failed to update reports');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await analyticsAPI.exportCSV();
            downloadFile(response.data, 'Gym_Revenue_Report.csv');
            toast.success('Gym Report Exported!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export CSV');
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await analyticsAPI.exportPDF();
            downloadFile(response.data, 'Gym_Revenue_Report.pdf');
            toast.success('Gym PDF Report Exported!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export PDF');
        }
    };

    const handleCafeteriaExportCSV = () => {
        try {
            // Manual CSV generation from current stats
            const headers = ['Metric,Value'];
            const rows = [
                `Total Revenue,${cafeteriaStats.totalRevenue}`,
                `Total Orders,${cafeteriaStats.totalOrders}`,
                `Paid Orders,${cafeteriaStats.paidOrders}`,
                `Pending Orders,${cafeteriaStats.pendingOrders}`
            ];

            const csvContent = headers.concat(rows).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            downloadFile(blob, 'Cafeteria_Report.csv');
            toast.success('Cafeteria Report Exported!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export CSV');
        }
    };

    const downloadFile = (data, filename) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
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

                {/* Tabs & Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex p-1 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-bg-accent dark:border-dark-bg-accent">
                        <button
                            onClick={() => setActiveTab('gym')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'gym'
                                ? 'bg-accent text-white shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                                }`}
                        >
                            Gym Reports
                        </button>
                        <button
                            onClick={() => setActiveTab('cafeteria')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'cafeteria'
                                ? 'bg-accent text-white shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                                }`}
                        >
                            Cafeteria Reports
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {activeTab === 'gym' ? (
                            <>
                                <Button variant="outline" onClick={handleExportCSV}>
                                    Export CSV
                                </Button>
                                <Button variant="primary" onClick={handleExportPDF}>
                                    Export PDF
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={handleCafeteriaExportCSV}>
                                Export CSV
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'gym' ? (
                <>
                    {/* Gym Stats Overview */}
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

                    {/* Gym Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card h-80 flex flex-col">
                            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                                Revenue Trend (Weekly)
                            </h3>
                            <div className="flex-1 min-h-0">
                                <LineChart data={stats.revenueTrend} color="#10b981" />
                            </div>
                        </div>

                        <div className="card h-80 flex flex-col">
                            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                                Membership Growth (Monthly)
                            </h3>
                            <div className="flex-1 min-h-0">
                                <BarChart data={stats.memberGrowth} color="#3b82f6" />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Cafeteria Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Cafeteria Revenue"
                            value={formatCurrency(cafeteriaStats.totalRevenue || 0)}
                            color="success"
                        />
                        <StatCard
                            title="Total Orders"
                            value={cafeteriaStats.totalOrders || 0}
                            color="info"
                        />
                        <StatCard
                            title="Paid Orders"
                            value={cafeteriaStats.paidOrders || 0}
                            color="accent"
                        />
                        <StatCard
                            title="Pending Orders"
                            value={cafeteriaStats.pendingOrders || 0}
                            color="warning"
                        />
                    </div>

                    {/* Cafeteria Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card h-80 flex flex-col">
                            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                                Daily Sales Trend
                            </h3>
                            <div className="flex-1 min-h-0">
                                {cafeteriaStats.salesTrend && cafeteriaStats.salesTrend.values.length > 0 ? (
                                    <LineChart data={cafeteriaStats.salesTrend} color="#f59e0b" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No sales data</div>
                                )}
                            </div>
                        </div>

                        <div className="card h-80 flex flex-col">
                            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                                Top Products (By Quantity)
                            </h3>
                            <div className="flex-1 min-h-0">
                                {cafeteriaStats.topProductsChart && cafeteriaStats.topProductsChart.values.length > 0 ? (
                                    <BarChart data={cafeteriaStats.topProductsChart} color="#ef4444" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No product data</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
