import { Transaction, Investment } from '../types';
import { apiFetch } from './api';

// --- Transactions ---

export const getTransactions = async (): Promise<Transaction[]> => {
    return await apiFetch('/finance/transactions/');
};

export const createTransaction = async (data: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> => {
    return await apiFetch('/finance/transactions/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateTransaction = async (id: number, data: Partial<Omit<Transaction, 'id' | 'userId'>>): Promise<Transaction> => {
    return await apiFetch(`/finance/transactions/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteTransaction = async (id: number): Promise<void> => {
    await apiFetch(`/finance/transactions/${id}/`, {
        method: 'DELETE',
    });
};

// --- Investments ---

export const getInvestments = async (): Promise<Investment[]> => {
    return await apiFetch('/finance/investments/');
};

export const createInvestment = async (data: Omit<Investment, 'id' | 'farmerId'>): Promise<Investment> => {
    return await apiFetch('/finance/investments/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateInvestment = async (id: number, data: Partial<Omit<Investment, 'id' | 'farmerId'>>): Promise<Investment> => {
    return await apiFetch(`/finance/investments/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteInvestment = async (id: number): Promise<void> => {
    await apiFetch(`/finance/investments/${id}/`, {
        method: 'DELETE',
    });
};
