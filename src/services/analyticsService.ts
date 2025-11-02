import { apiFetch } from './api';

interface AnalyticsSummary {
    projectStatusData: { name: string; value: number }[];
    revenueByCropData: { name: string; revenue: number }[];
    yieldByCropData: { name: string; yield: number }[];
}

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
    return await apiFetch('/analytics/summary/');
};
