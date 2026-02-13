import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const LineChart = ({ data, title, color = '#2563eb' }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !!title,
                text: title,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)',
                },
                ticks: {
                    color: '#9ca3af',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9ca3af',
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: title || 'Value',
                data: data.values,
                borderColor: color,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, `${color}40`);
                    gradient.addColorStop(1, `${color}00`);
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    return <Line options={options} data={chartData} />;
};

export const BarChart = ({ data, title, color = '#10b981' }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !!title,
                text: title,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)',
                },
                ticks: {
                    color: '#9ca3af',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9ca3af',
                },
            },
        },
    };

    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: title || 'Value',
                data: data.values,
                backgroundColor: color,
                borderRadius: 4,
            },
        ],
    };

    return <Bar options={options} data={chartData} />;
};
