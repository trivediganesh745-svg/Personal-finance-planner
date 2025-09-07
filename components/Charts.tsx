import React, { useState, useCallback, useEffect } from 'react';
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
    if (!active || !payload || !payload.length) return null;

    // Bar Chart Tooltip
    if (label === 'Cash Flow') {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg text-sm transition-all">
                <p className="font-bold text-green-600">{`Income: ${currencyFormatter(payload.find(p => p.dataKey === 'income')?.value ?? 0)}`}</p>
                <p className="font-bold text-red-500">{`Expenses: ${currencyFormatter(payload.find(p => p.dataKey === 'expenses')?.value ?? 0)}`}</p>
                <p className="font-bold text-blue-600">{`Surplus: ${currencyFormatter(payload.find(p => p.dataKey === 'surplus')?.value ?? 0)}`}</p>
            </div>
        );
    }

    // Line Chart Tooltip (label is the month number)
    if (typeof label === 'number') {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg text-sm transition-all">
                <p className="font-semibold text-gray-600">{`Month ${label}`}</p>
                <p className="font-bold text-indigo-600">{`${payload[0].name}: ${currencyFormatter(payload[0].value)}`}</p>
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

const LoadingPlaceholder: React.FC<{ height: string; message?: string }> = ({ height, message }) => (
    <div className={`flex items-center justify-center ${height} text-gray-500`}>
        {message ? <span>{message}</span> : <div className="spinner"></div>}
    </div>
);


export const Charts: React.FC<{ chartData: ChartData }> = ({ chartData }) => {
  const [recharts, setRecharts] = useState<any | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let intervalId: number;
    const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (!window.Recharts) {
            setLoadingStatus('error');
        }
    }, 8000); // 8-second timeout

    intervalId = window.setInterval(() => {
      // Check for a specific component to be more robust
      if (window.Recharts && window.Recharts.ResponsiveContainer) {
        setRecharts(window.Recharts);
        setLoadingStatus('loaded');
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      }
    }, 100);

    return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
    };
  }, []);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  if (loadingStatus !== 'loaded') {
    const message = loadingStatus === 'error' ? 'Could not load chart library.' : undefined;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Monthly Expense Breakdown">
                <LoadingPlaceholder height="h-[300px]" message={message} />
            </ChartCard>
            <ChartCard title="Monthly Cash Flow">
                <LoadingPlaceholder height="h-[300px]" message={message} />
            </ChartCard>
            <div className="lg:col-span-2">
                <ChartCard title="Investment Growth Projection">
                    <LoadingPlaceholder height="h-[400px]" message={message} />
                </ChartCard>
            </div>
        </div>
    );
  }

  const {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line, Brush, Sector,
  } = recharts;

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
        return (
          <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-base font-bold">
              {payload.name}
            </text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#333" className="text-sm">
              {currencyFormatter(payload.value)}
            </text>
             <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="#999" className="text-xs">
              {`(${(percent * 100).toFixed(1)}%)`}
            </text>
            <g style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }}>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 4}
                    outerRadius={outerRadius + 8}
                    fill={fill}
                />
            </g>
          </g>
        );
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Expense Breakdown">
            <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={chartData.expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        nameKey="name"
                    >
                        {chartData.expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none transition-opacity" style={{ outline: 'none' }} />
                        ))}
                    </Pie>
                    <Legend iconType="circle" onMouseEnter={onPieEnter} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Cash Flow">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.cashFlow} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={shortCurrencyFormatter} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(230, 230, 230, 0.4)'}} />
                    <Legend />
                    <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="surplus" fill="#60a5fa" radius={[4, 4, 0, 0]} />
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
                        <Legend verticalAlign="top" />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} name="Projected Investment Value" activeDot={{ r: 6 }} />
                         <Brush dataKey="month" height={30} stroke="#8884d8" y={350} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    </div>
  );
};