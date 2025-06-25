
import React from 'react';
import { Transaction } from '../types';
import TransactionList from './TransactionList';

interface AllTransactionsViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const AllTransactionsView: React.FC<AllTransactionsViewProps> = ({ transactions, onDeleteTransaction }) => {
  return (
    <div className="space-y-6 bg-base p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">All Transactions</h1>
      {transactions.length > 0 ? (
        <TransactionList transactions={transactions} onDeleteTransaction={onDeleteTransaction} />
      ) : (
        <p className="text-secondary text-center py-10">
          No transactions recorded yet. Add some transactions to see them here!
        </p>
      )}
    </div>
  );
};

export default AllTransactionsView;
