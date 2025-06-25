
import React, { useState, useCallback, useEffect } from 'react';
import { Transaction } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import XMarkIcon from './icons/XMarkIcon';
import * as pdfjsLib from 'pdfjs-dist';
import { extractTransactionsFromPdfText } from '../services/geminiService';

// Configure the workerSrc for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onAddMultipleTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  mode: 'add' | 'import';
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  onAddMultipleTransactions,
  mode
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0] || '');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [customCategory, setCustomCategory] = useState('');
  const [statementData, setStatementData] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessingPdfText, setIsProcessingPdfText] = useState(false); // For pdf.js text extraction
  const [isProcessingWithAI, setIsProcessingWithAI] = useState(false); // For Gemini processing
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm(); // Reset form when modal is closed
    }
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setCategory(DEFAULT_CATEGORIES[0] || '');
    setAmount('');
    setType('expense');
    setCustomCategory('');
    setStatementData('');
    setPdfFile(null);
    const fileInput = document.getElementById('pdfFileImport') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    setError(null);
    setIsProcessingPdfText(false);
    setIsProcessingWithAI(false);
  }, []);
  
  const handleClose = () => {
    resetForm(); // Ensure form is reset before calling onClose
    onClose();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError(null); 
    } else {
      setPdfFile(null);
      if (file) { 
        setError("Invalid file type. Please upload a PDF.");
      }
    }
  };

  const parseTransactionsFromCsvString = (text: string): { transactions: Omit<Transaction, 'id'>[], errors: string[] } => {
    const lines = text.trim().split('\n');
    const transactions: Omit<Transaction, 'id'>[] = [];
    let lineErrors: string[] = [];

    lines.forEach((line, index) => {
      if (line.trim() === "") return; 
      const parts = line.split(',').map(p => p.trim());
      if (parts.length !== 5) {
        lineErrors.push(`Line ${index + 1}: Incorrect CSV format. Expected 5 comma-separated values (Date,Description,Category,Amount,Type).`);
        return;
      }
      const [stmtDate, stmtDesc, stmtCat, stmtAmtStr, stmtType] = parts;
      
      if (!stmtDate || !/^\d{4}-\d{2}-\d{2}$/.test(stmtDate)) {
        lineErrors.push(`Line ${index + 1}: Invalid date format (YYYY-MM-DD). Got: "${stmtDate}"`);
        return;
      }
      if (!stmtDesc) {
        lineErrors.push(`Line ${index + 1}: Description is missing.`);
        return;
      }
      if (!stmtCat) {
        lineErrors.push(`Line ${index + 1}: Category is missing.`);
        return;
      }
      const numericAmount = parseFloat(stmtAmtStr);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        lineErrors.push(`Line ${index + 1}: Amount must be a positive number. Got: "${stmtAmtStr}"`);
        return;
      }
      if (stmtType !== 'income' && stmtType !== 'expense') {
        lineErrors.push(`Line ${index + 1}: Type must be 'income' or 'expense'. Got: "${stmtType}"`);
        return;
      }
      transactions.push({ date: stmtDate, description: stmtDesc, category: stmtCat, amount: numericAmount, type: stmtType as 'income' | 'expense' });
    });
    return { transactions, errors: lineErrors };
  };

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!date || !description || (!category && !customCategory) || !amount || !type) {
      setError("All fields are required.");
      return;
    }
    const finalCategory = customCategory || category;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }
    
    onAddTransaction({ date, description, category: finalCategory, amount: numericAmount, type });
    resetForm();
  };

  const handleSubmitMultiple = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let transactionsToSubmit: Omit<Transaction, 'id'>[] = [];

    if (pdfFile) {
      setIsProcessingPdfText(true);
      let pdfTextContent = "";
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          pdfTextContent += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } catch (pdfError) {
        console.error("Error processing PDF with pdf.js:", pdfError);
        setError(`Failed to read PDF content: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}.`);
        setIsProcessingPdfText(false);
        return;
      }
      setIsProcessingPdfText(false);

      if (pdfTextContent.trim() === "") {
        setError("PDF text extraction resulted in empty content. Cannot process with AI.");
        return;
      }

      setIsProcessingWithAI(true);
      try {
        transactionsToSubmit = await extractTransactionsFromPdfText(pdfTextContent);
        if (transactionsToSubmit.length === 0) {
          setError("AI could not find any valid transactions in the PDF. Try manual input or check PDF content.");
        }
      } catch (aiError) {
        console.error("Error processing with AI:", aiError);
        setError(aiError instanceof Error ? aiError.message : "An unknown AI processing error occurred.");
        setIsProcessingWithAI(false);
        return;
      }
      setIsProcessingWithAI(false);

    } else if (statementData.trim() !== "") {
      const { transactions, errors: parsingErrors } = parseTransactionsFromCsvString(statementData);
      if (parsingErrors.length > 0) {
        setError("Error parsing manually entered data:\n" + parsingErrors.join('\n'));
        return;
      }
      transactionsToSubmit = transactions;
      if (transactionsToSubmit.length === 0) {
          setError("No valid transactions found in the pasted data.");
      }
    } else {
      setError("No data to import. Please upload a PDF or paste transaction data.");
      return;
    }
    
    if (transactionsToSubmit.length > 0) {
      onAddMultipleTransactions(transactionsToSubmit);
      resetForm();
    } else if (!error) { // If no transactions but no specific error was set yet
        setError("No transactions were imported.");
    }
  };

  const isProcessing = isProcessingPdfText || isProcessingWithAI;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-base rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {mode === 'add' ? 'Add New Transaction' : 'Import Transactions'}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line" role="alert">{error}</div>}

        {mode === 'add' ? (
          <form onSubmit={handleSubmitSingle} className="space-y-4">
            {/* Single transaction form fields remain unchanged */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g., Coffee, Salary" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" value={category} onChange={e => {setCategory(e.target.value); if(e.target.value !== 'Other (Custom)') setCustomCategory('');}} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="Other (Custom)">Other (Specify Below)</option>
              </select>
            </div>
            {category === 'Other (Custom)' && (
               <div>
                 <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700">Custom Category Name</label>
                 <input type="text" id="customCategory" value={customCategory} onChange={e => setCustomCategory(e.target.value)} required placeholder="e.g., Birthday Gift" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
               </div>
            )}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" step="0.01" min="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="mt-1 flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300"/>
                  <span className="ml-2 text-sm text-gray-700">Expense</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300"/>
                  <span className="ml-2 text-sm text-gray-700">Income</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={handleClose} className="mr-2 bg-secondary/80 hover:bg-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out">Cancel</button>
              <button type="submit" className="bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out">Add Transaction</button>
            </div>
          </form>
        ) : ( // Import mode
          <form onSubmit={handleSubmitMultiple} className="space-y-4">
            <div>
              <label htmlFor="pdfFileImport" className="block text-sm font-medium text-gray-700">Upload PDF Statement (Processed by AI)</label>
               <input 
                type="file" 
                id="pdfFileImport" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isProcessing}
              />
              {pdfFile && <p className="text-xs text-gray-600 mt-1">Selected: {pdfFile.name}</p>}
              <p className="text-xs text-gray-500 mt-1">
                AI will attempt to parse transactions from your PDF bank/credit card statement.
              </p>
            </div>
            <div className="text-center my-2 text-sm text-gray-500">OR</div>
            <div>
              <label htmlFor="statementData" className="block text-sm font-medium text-gray-700">Paste Transaction Data (CSV Format)</label>
              <p className="text-xs text-gray-500 mb-1">
                Enter one transaction per line in the format: <code className="bg-gray-200 p-0.5 rounded text-xs">YYYY-MM-DD,Description,Category,Amount,Type</code>
                <br/>
                (Type can be 'income' or 'expense'. Amount should always be positive.)
                <br/>
                Example: <code className="bg-gray-200 p-0.5 rounded text-xs">2023-10-26,Groceries,Food,55.25,expense</code>
              </p>
              <textarea
                id="statementData"
                rows={pdfFile ? 3 : 8}
                value={statementData}
                onChange={e => setStatementData(e.target.value)}
                placeholder="2023-10-26,Lunch with Client,Business,45.50,expense&#10;2023-10-25,Project Payment,Salary,1200.00,income"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-mono text-xs"
                disabled={isProcessing || !!pdfFile} // Disable if PDF is selected or processing
              />
            </div>
             <div className="flex justify-end pt-2">
              <button type="button" onClick={handleClose} className="mr-2 bg-secondary/80 hover:bg-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out" disabled={isProcessing}>Cancel</button>
              <button type="submit" className="bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out" disabled={isProcessing}>
                {isProcessingPdfText ? 'Extracting PDF Text...' : isProcessingWithAI ? 'AI Processing...' : 'Import Transactions'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;
