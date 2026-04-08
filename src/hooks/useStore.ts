import { useState, useCallback } from 'react';
import farmersData from '../data/farmers.json';
import collectionsData from '../data/collections.json';
import paymentsData from '../data/payments.json';
import cyclesData from '../data/cycles.json';
import { Farmer, Collection, Payment, Cycle } from '../types';

let _farmers: Farmer[] = farmersData as Farmer[];
let _collections: Collection[] = collectionsData as Collection[];
let _payments: Payment[] = paymentsData as Payment[];
let _cycles: Cycle[] = cyclesData as Cycle[];

export const useStore = () => {
  const [farmers, setFarmers] = useState<Farmer[]>(_farmers);
  const [collections, setCollections] = useState<Collection[]>(_collections);
  const [payments, setPayments] = useState<Payment[]>(_payments);
  const [cycles, setCycles] = useState<Cycle[]>(_cycles);

  const activeCycle = cycles.find(c => c.status === 'active') || cycles[cycles.length - 1];

  const addFarmer = useCallback((farmer: Omit<Farmer, 'id'>) => {
    const newF: Farmer = { ...farmer, id: `f${Date.now()}` };
    _farmers = [..._farmers, newF];
    setFarmers([..._farmers]);
    return newF;
  }, []);

  const updateFarmer = useCallback((id: string, data: Partial<Farmer>) => {
    _farmers = _farmers.map(f => f.id === id ? { ...f, ...data } : f);
    setFarmers([..._farmers]);
  }, []);

  const deleteFarmer = useCallback((id: string) => {
    _farmers = _farmers.filter(f => f.id !== id);
    setFarmers([..._farmers]);
  }, []);

  const addCollection = useCallback((col: Omit<Collection, 'id'>) => {
    const newC: Collection = { ...col, id: `c${Date.now()}` };
    _collections = [..._collections, newC];
    setCollections([..._collections]);
    const existing = _payments.find(p => p.farmerId === col.farmerId && p.cycleId === col.cycleId);
    if (existing) {
      _payments = _payments.map(p =>
        p.id === existing.id
          ? { ...p, totalMilk: p.totalMilk + col.quantity, totalAmount: parseFloat((p.totalAmount + col.amount).toFixed(2)) }
          : p
      );
    } else {
      _payments = [..._payments, {
        id: `pay${Date.now()}`, farmerId: col.farmerId, cycleId: col.cycleId,
        totalMilk: col.quantity, totalAmount: col.amount,
        status: 'unpaid', paymentMode: null, paymentDate: null
      }];
    }
    setPayments([..._payments]);
    return newC;
  }, []);

  const updateCollection = useCallback((id: string, data: Partial<Collection>) => {
    _collections = _collections.map(c => c.id === id ? { ...c, ...data } : c);
    setCollections([..._collections]);
  }, []);

  const deleteCollection = useCallback((id: string) => {
    _collections = _collections.filter(c => c.id !== id);
    setCollections([..._collections]);
  }, []);

  const markAsPaid = useCallback((paymentId: string, mode: 'UPI' | 'Cash') => {
    _payments = _payments.map(p =>
      p.id === paymentId
        ? { ...p, status: 'paid', paymentMode: mode, paymentDate: new Date().toISOString().split('T')[0] }
        : p
    );
    setPayments([..._payments]);
  }, []);

  return {
    farmers, collections, payments, cycles, activeCycle,
    addFarmer, updateFarmer, deleteFarmer,
    addCollection, updateCollection, deleteCollection,
    markAsPaid,
  };
};
