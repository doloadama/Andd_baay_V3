import { Role } from './types';

export const MALI_REGIONS: string[] = [
    'Kayes',
    'Koulikoro',
    'Sikasso',
    'Ségou',
    'Mopti',
    'Tombouctou',
    'Gao',
    'Kidal',
    'Taoudénit',
    'Ménaka',
    'Bamako',
];

export const MALI_REGION_IMAGES: { [key: string]: string } = {
    'Kayes': 'https://source.unsplash.com/1600x900/?kayes,mali,river',
    'Koulikoro': 'https://source.unsplash.com/1600x900/?koulikoro,mali,escarpment',
    'Sikasso': 'https://source.unsplash.com/1600x900/?sikasso,mali,agriculture',
    'Ségou': 'https://source.unsplash.com/1600x900/?segou,mali,architecture',
    'Mopti': 'https://source.unsplash.com/1600x900/?mopti,mali,mosque',
    'Tombouctou': 'https://source.unsplash.com/1600x900/?timbuktu,mali,desert',
    'Gao': 'https://source.unsplash.com/1600x900/?gao,mali,dunes',
    'Kidal': 'https://source.unsplash.com/1600x900/?kidal,mali,mountains',
    'Taoudénit': 'https://source.unsplash.com/1600x900/?taoudenit,mali,salt',
    'Ménaka': 'https://source.unsplash.com/1600x900/?menaka,mali,sahel',
    'Bamako': 'https://source.unsplash.com/1600x900/?bamako,mali,cityscape',
};

// Mock data has been removed and will be fetched from the API.
export const USERS: any[] = [];
export const MOCK_SITES: any[] = [];
export const MOCK_PROJECTS: any[] = [];
export const MOCK_PRODUCTS: any[] = [];
export const MOCK_TRANSACTIONS: any[] = [];
