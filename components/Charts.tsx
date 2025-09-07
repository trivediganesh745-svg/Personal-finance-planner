import React from 'react';
import type { ChartData } from '../types';

// This component relies on the Recharts library being loaded globally via CDN.
// We access it via the window object to ensure it has loaded before use.
declare const window: {
    Recharts?: any;
} & Window;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'];

const currencyFormatter = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const shortCurrencyFormatter = (value: number) => {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${Math.round(value)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    if (label === 'Cash Flow') { // Bar chart
        return (
            <div className="bg-white p-3 border rounded shadow-lg text-sm">
                <p className="font-bold text-green-600">{`Income: ${currencyFormatter(payload[0].value)}`}</p>
                <p className="font-bold text-red-500">{`Expenses: ${currencyFormatter(payload[1].value)}`}</p>
                <p className="font-bold text-blue-600">{`Surplus: ${currencyFormatter(payload[2].value)}`}</p>
            </div>
        );
    }
    if (payload[0].name === 'month') { // Line chart
        return (
            <div className="bg-white p-3 border rounded shadow-lg text-sm">
                <p className="label">{`Month ${payload[0].payload.month}`}</p>
                <p className="intro font-bold">{`Projected Value: ${currencyFormatter(payload[0].value)}`}</p>
            </div>
        );
    }
    // Pie chart
    return (
      <div className="bg-white p-3 border rounded shadow-lg text-sm">
        <p className="label">{`${payload[0].name} : ${currencyFormatter(payload[0].value)} (${(payload[0].percent * 100).toFixed(0)}%)`}</p>
      </div>
    );
  }
  return null;
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
        {children}
    </div>
);

export const Charts: React.FC<{ chartData: ChartData }> = ({ chartData }) => {
  // Access Recharts from window at render time to avoid race conditions.
  const Recharts = window.Recharts;

  if (!Recharts) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Monthly Expense Breakdown">
                <div className="flex items-center justify-center h-[300px] text-gray-500">Loading Chart...</div>
            </ChartCard>
            <ChartCard title="Monthly Cash Flow">
                <div className="flex items-center justify-center h-[300px] text-gray-500">Loading Chart...</div>
            </ChartCard>
            <div className="lg:col-span-2">
                <ChartCard title="Investment Growth Projection">
                    <div className="flex items-center justify-center h-[400px] text-gray-500">Loading Chart...</div>
                </ChartCard>
            </div>
        </div>
    );
  }

  const {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line,
  } = Recharts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Expense Breakdown">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={chartData.expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        return (percent > 0.05) ? <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">{`${(percent * 100).toFixed(0)}%`}</text> : null;
                    }}>
                        {chartData.expenseBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Cash Flow">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.cashFlow} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={shortCurrencyFormatter} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill="#4ade80" />
                    <Bar dataKey="expenses" fill="#f87171" />
                    <Bar dataKey="surplus" fill="#60a5fa" />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
        
        <div className="lg:col-span-2">
            <ChartCard title="Investment Growth Projection">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData.investmentProjection} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                        <YAxis tickFormatter={shortCurrencyFormatter} label={{ value: 'Corpus Value (₹)', angle: -90, position: 'insideLeft' }}/>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} name="Projected Investment Value" />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    </div>
  );
};