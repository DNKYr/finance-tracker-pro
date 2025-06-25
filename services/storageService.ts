
import { Transaction } from '../types';

const TRANSACTIONS_KEY = 'financeTrackerTransactions';

export const loadTransactions = (): Transaction[] => {
  try {
    const serializedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    if (serializedTransactions === null) {
      return [];
    }
    return JSON.parse(serializedTransactions);
  } catch (error) {
    console.error("Error loading transactions from localStorage:", error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    const serializedTransactions = JSON.stringify(transactions);
    localStorage.setItem(TRANSACTIONS_KEY, serializedTransactions);
  } catch (error) {
    console.error("Error saving transactions to localStorage:", error);
  }
};
