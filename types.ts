
export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number; // Always positive
  type: 'income' | 'expense';
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
