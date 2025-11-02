import { Site } from '../types';
import { apiFetch } from './api';

export const getSites = async (): Promise<Site[]> => {
    return await apiFetch('/sites/');
};

export const createSite = async (siteData: Omit<Site, 'id' | 'farmerId'>): Promise<Site> => {
    return await apiFetch('/sites/', {
        method: 'POST',
        body: JSON.stringify(siteData),
    });
};

export const updateSite = async (id: number, siteData: Partial<Omit<Site, 'id' | 'farmerId'>>): Promise<Site> => {
    return await apiFetch(`/sites/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(siteData),
    });
};

export const deleteSite = async (id: number): Promise<void> => {
    await apiFetch(`/sites/${id}/`, {
        method: 'DELETE',
    });
};
