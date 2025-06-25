
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, ChartDataPoint } from '../types';

interface CategoryChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82Ca9D', '#FF5733', '#C70039', '#900C3F', '#581845'
];

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const expenseData = useMemo<ChartDataPoint[]>(() => {
    const expensesByCategory: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });
    
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value); // Sort for consistent color assignment
  }, [transactions]);

  if (expenseData.length === 0) {
    return null; // Handled by parent
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {expenseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
