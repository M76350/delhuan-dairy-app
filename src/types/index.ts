export interface Farmer {
  id: string;
  name: string;
  mobile: string;
  village: string;
  active: boolean;
}

export interface Collection {
  id: string;
  farmerId: string;
  date: string;
  shift: 'morning' | 'evening';
  quantity: number;
  fat: number;
  snf: number;
  rate: number;
  amount: number;
  cycleId: string;
}

export interface Payment {
  id: string;
  farmerId: string;
  cycleId: string;
  totalMilk: number;
  totalAmount: number;
  status: 'paid' | 'unpaid';
  paymentMode: 'UPI' | 'Cash' | null;
  paymentDate: string | null;
}

export interface Cycle {
  id: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
}
