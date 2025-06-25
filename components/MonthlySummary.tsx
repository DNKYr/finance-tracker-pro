
import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface MonthlySummaryProps {
  transactions: Transaction[];
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ transactions }) => {
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    });
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-success/10 p-4 rounded-lg shadow-md text-center">
        <h3 className="text-xs font-medium text-success uppercase tracking-wider">Monthly Income</h3>
        <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totalIncome)}</p>
      </div>
      <div className="bg-error/10 p-4 rounded-lg shadow-md text-center">
        <h3 className="text-xs font-medium text-error uppercase tracking-wider">Monthly Expenses</h3>
        <p className="text-2xl font-bold text-error mt-1">{formatCurrency(totalExpenses)}</p>
      </div>
      <div className="bg-info/10 p-4 rounded-lg shadow-md text-center">
        <h3 className="text-xs font-medium text-info uppercase tracking-wider">Monthly Net</h3>
        <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-info' : 'text-error'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
};

export default MonthlySummary;
