
import React from 'react';
import { Transaction } from '../types';
import Summary from './Summary';
import CategoryChart from './CategoryChart';
import TransactionList from './TransactionList';

interface DashboardProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onDeleteTransaction }) => {
  return (
    <div className="space-y-6">
      <Summary transactions={transactions} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-base p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Expenses by Category</h2>
          {transactions.filter(t => t.type === 'expense').length > 0 ? (
            <CategoryChart transactions={transactions} />
          ) : (
            <p className="text-secondary text-center py-10">No expense data available for chart.</p>
          )}
        </div>
        <div className="lg:col-span-2 bg-base p-6 rounded-xl shadow-lg">
           <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Transactions</h2>
          <TransactionList transactions={transactions} onDeleteTransaction={onDeleteTransaction} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
