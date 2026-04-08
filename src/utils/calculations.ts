// Rate calculation: (fat * 3.5) + (snf * 2.0) = rate per liter
export const calculateRate = (fat: number, snf: number): number => {
  return parseFloat((fat * 3.5 + snf * 2.0).toFixed(2));
};

export const calculateAmount = (quantity: number, rate: number): number => {
  return parseFloat((quantity * rate).toFixed(2));
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const getCurrentCycleId = (): string => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const cycleNum = Math.ceil(day / 10);
  return `${year}-${String(month).padStart(2, '0')}-C${cycleNum}`;
};

export const getCycleDates = (cycleId: string): { start: string; end: string } => {
  // For static data, return cyc2 dates
  return { start: '2024-01-11', end: '2024-01-20' };
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};
