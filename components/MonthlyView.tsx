
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import TransactionList from './TransactionList';
import MonthlySummary from './MonthlySummary';

interface MonthlyViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

interface GroupedTransactions {
  [key: string]: Transaction[];
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ transactions, onDeleteTransaction }) => {
  const groupedTransactions = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const monthYear = transaction.date.substring(0, 7); // YYYY-MM
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(transaction);
      return acc;
    }, {} as GroupedTransactions);
  }, [transactions]);

  const sortedMonthKeys = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)); // Sorts YYYY-MM descending
  }, [groupedTransactions]);

  const formatMonthYear = (monthYearKey: string) => {
    const [year, month] = monthYearKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (transactions.length === 0) {
    return <p className="text-secondary text-center py-10 text-lg">No transactions yet. Add some to see them here!</p>;
  }
  
  if (sortedMonthKeys.length === 0) {
    return <p className="text-secondary text-center py-10 text-lg">No transactions found for any month.</p>;
  }

  return (
    <div className="space-y-8">
      {sortedMonthKeys.map(monthKey => (
        <section key={monthKey} className="bg-base p-6 rounded-xl shadow-lg" aria-labelledby={`month-header-${monthKey}`}>
          <h2 id={`month-header-${monthKey}`} className="text-2xl font-semibold text-gray-800 mb-4">
            {formatMonthYear(monthKey)}
          </h2>
          <MonthlySummary transactions={groupedTransactions[monthKey]} />
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Transactions for this month</h3>
            <TransactionList
              transactions={groupedTransactions[monthKey]}
              onDeleteTransaction={onDeleteTransaction}
            />
          </div>
        </section>
      ))}
    </div>
  );
};

export default MonthlyView;
