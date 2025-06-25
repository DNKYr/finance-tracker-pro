import React, { useMemo, useCallback } from 'react';
import { Transaction } from '../types';
import TransactionList from './TransactionList';
import MonthlySummary from './MonthlySummary';
import DownloadIcon from './icons/DownloadIcon'; // Import DownloadIcon
import * as XLSX from 'xlsx'; // Import xlsx library

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

  const formatMonthYear = useCallback((monthYearKey: string) => {
    const [year, month] = monthYearKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const handleExportMonthToExcel = useCallback((monthTransactions: Transaction[], monthYearKey: string) => {
    if (monthTransactions.length === 0) {
      alert(`No transactions to export for ${formatMonthYear(monthYearKey)}.`);
      return;
    }

    const worksheetData = monthTransactions.map(tx => ({
      Date: tx.date,
      Description: tx.description,
      Category: tx.category,
      Amount: tx.amount,
      Type: tx.type,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const [year, monthNum] = monthYearKey.split('-');
    const monthNameForFile = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'long' });
    const filename = `FinanceTracker_Transactions_${monthNameForFile}_${year}.xlsx`;

    XLSX.writeFile(workbook, filename);
  }, [formatMonthYear]);

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
          <div className="flex justify-between items-center mb-4">
            <h2 id={`month-header-${monthKey}`} className="text-2xl font-semibold text-gray-800">
              {formatMonthYear(monthKey)}
            </h2>
            <button
              onClick={() => handleExportMonthToExcel(groupedTransactions[monthKey], monthKey)}
              className="flex items-center text-sm bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm transition duration-150 ease-in-out"
              aria-label={`Export transactions for ${formatMonthYear(monthKey)} to Excel`}
            >
              <DownloadIcon className="h-4 w-4 mr-1.5" />
              Export Month
            </button>
          </div>
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