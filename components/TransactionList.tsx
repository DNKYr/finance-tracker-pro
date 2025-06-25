
import React from 'react';
import { Transaction } from '../types';
import XMarkIcon from './icons/XMarkIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDeleteTransaction }) => {
  if (transactions.length === 0) {
    return <p className="text-secondary text-center py-10">No transactions yet. Add one to get started!</p>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-neutral">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Description</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Category</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-base divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-neutral/50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(transaction.date)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent/20 text-accent-800">
                  {transaction.category}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.type === 'income' ? 'text-success' : 'text-error'}`}>
                {transaction.type === 'expense' ? '-' : ''}{formatCurrency(transaction.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => onDeleteTransaction(transaction.id)} 
                  className="text-error hover:text-red-700"
                  aria-label="Delete transaction"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
