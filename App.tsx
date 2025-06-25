
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction } from './types';
import { loadTransactions, saveTransactions } from './services/storageService';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MonthlyView from './components/MonthlyView';
import TransactionModal from './components/TransactionModal';
import { APP_TITLE } from './constants';

export type ViewMode = 'dashboard' | 'monthly';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'import'>('add');
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  useEffect(() => {
    document.title = APP_TITLE;
    setTransactions(loadTransactions());
  }, []);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const handleAddTransaction = useCallback((newTransactionData: Omit<Transaction, 'id'>) => {
    setTransactions(prevTransactions => [
      ...prevTransactions,
      { ...newTransactionData, id: Date.now().toString() }
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsModalOpen(false);
  }, []);

  const handleAddMultipleTransactions = useCallback((newTransactionsData: Omit<Transaction, 'id'>[]) => {
    const newTxWithIds = newTransactionsData.map(tx => ({ ...tx, id: Date.now().toString() + Math.random().toString(36).substring(2,7) }));
    setTransactions(prevTransactions => 
      [...prevTransactions, ...newTxWithIds]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setIsModalOpen(false);
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions(prevTransactions => prevTransactions.filter(tx => tx.id !== id));
  }, []);

  const openModal = (mode: 'add' | 'import') => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <Navbar 
        openModal={openModal} 
        currentView={currentView} 
        setCurrentView={setCurrentView}
      />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' ? (
          <Dashboard transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
        ) : (
          <MonthlyView transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
        )}
      </main>
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={handleAddTransaction}
          onAddMultipleTransactions={handleAddMultipleTransactions}
          mode={modalMode}
        />
      )}
      <footer className="text-center p-4 text-secondary text-sm">
        © {new Date().getFullYear()} {APP_TITLE}. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
