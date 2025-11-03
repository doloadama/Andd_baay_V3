import { Project } from '../types';
import { apiFetch } from './api';

export const getProjects = async (): Promise<Project[]> => {
    return await apiFetch('/projects/');
};

export const createProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    // The backend expects 'siteId' from the frontend, but the serializer works with the 'site' field.
    const payload = { ...projectData, site: projectData.siteId };
    return await apiFetch('/projects/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const updateProject = async (id: number, projectData: Partial<Omit<Project, 'id'>>): Promise<Project> => {
    const payload = projectData.siteId ? { ...projectData, site: projectData.siteId } : projectData;
    return await apiFetch(`/projects/${id}/`, {
        method: 'PATCH', // Use PATCH for partial updates
        body: JSON.stringify(payload),
    });
};

export const deleteProject = async (id: number): Promise<void> => {
    await apiFetch(`/projects/${id}/`, {
        method: 'DELETE',
    });
};
