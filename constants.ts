import { User, Role, Site, Project, ProjectStatus, Product, AvailabilityStatus, Investment, Transaction } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Adama Traoré', email: 'adama@farm.com', phone: '555-0101', location: 'Kayes, Mali', role: Role.FARMER },
  { id: 2, name: 'Binta Diallo', email: 'binta@market.com', phone: '555-0102', location: 'Sikasso, Mali', role: Role.SELLER },
  { id: 3, name: 'Moussa Coulibaly', email: 'moussa@agri.com', phone: '555-0103', location: 'Koulikoro, Mali', role: Role.BOTH },
  { id: 4, name: 'Fatoumata Keita', email: 'fatou@farm.com', phone: '555-0104', location: 'Ségou, Mali', role: Role.FARMER },
  { id: 5, name: 'Awa Cissoko', email: 'awa@agribusiness.com', phone: '555-0105', location: 'Bamako, Mali', role: Role.BOTH },
  { id: 6, name: 'Issa Sanogo', email: 'issa@seller.com', phone: '555-0106', location: 'Mopti, Mali', role: Role.SELLER },
];

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

export const MOCK_SITES: Site[] = [
  { id: 1, farmerId: 1, name: 'Kayes Sun Farm', location: 'Kayes' },
  { id: 2, farmerId: 1, name: 'River Field', location: 'Kayes' },
  { id: 3, farmerId: 3, name: 'Koulikoro Oasis', location: 'Koulikoro' },
  { id: 4, farmerId: 4, name: 'Ségou Fertile Lands', location: 'Ségou' },
  { id: 5, farmerId: 4, name: 'Bani River Plots', location: 'Ségou' },
  { id: 6, farmerId: 5, name: 'Bamako Urban Farm', location: 'Bamako' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 1, siteId: 1, name: 'Mango Season 2024', description: 'Organic Kent mango cultivation.', cropType: 'Mango', startDate: '2024-03-01', endDate: '2024-08-15', expectedYield: 5000, status: ProjectStatus.HARVESTING },
  { id: 2, siteId: 2, name: 'Millet Harvest', description: 'High-yield pearl millet for local markets.', cropType: 'Millet', startDate: '2024-06-01', endDate: '2024-10-30', expectedYield: 10000, status: ProjectStatus.IN_PROGRESS },
  { id: 3, siteId: 3, name: 'Tomato Greenhouse', description: 'Year-round tomato production.', cropType: 'Tomato', startDate: '2024-01-01', endDate: '2024-12-31', expectedYield: 2000, status: ProjectStatus.COMPLETED },
  { id: 4, siteId: 3, name: 'Okra Planting', description: 'Early-season okra for premium price.', cropType: 'Okra', startDate: '2024-04-15', endDate: '2024-07-20', expectedYield: 1500, status: ProjectStatus.HARVESTING },
  { id: 5, siteId: 4, name: 'Rice Paddy Cultivation', description: 'High-quality rice for export.', cropType: 'Rice', startDate: '2024-05-20', endDate: '2024-11-10', expectedYield: 25000, status: ProjectStatus.IN_PROGRESS },
  { id: 6, siteId: 5, name: 'Cotton Fields Expansion', description: 'Expanding cotton production capacity.', cropType: 'Cotton', startDate: '2025-02-01', endDate: '2025-09-01', expectedYield: 8000, status: ProjectStatus.PLANNING },
  { id: 7, siteId: 6, name: 'Herb Garden 2024', description: 'Cultivating basil and mint for local restaurants.', cropType: 'Herbs', startDate: '2024-04-01', endDate: '2024-11-01', expectedYield: 500, status: ProjectStatus.IN_PROGRESS },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, projectId: 1, farmerId: 1, productName: 'Organic Kent Mangoes', quantity: 2000, price: 1.5, unit: 'kg', availabilityStatus: AvailabilityStatus.AVAILABLE, imageUrl: 'https://source.unsplash.com/400x300/?mango', location: 'Kayes', cropType: 'Mango', projectStatus: ProjectStatus.HARVESTING },
  { id: 2, projectId: 3, farmerId: 3, productName: 'Greenhouse Tomatoes', quantity: 500, price: 2.0, unit: 'kg', availabilityStatus: AvailabilityStatus.AVAILABLE, imageUrl: 'https://source.unsplash.com/400x300/?tomatoes', location: 'Koulikoro', cropType: 'Tomato', projectStatus: ProjectStatus.COMPLETED },
  { id: 3, projectId: 4, farmerId: 3, productName: 'Fresh Okra', quantity: 0, price: 3.0, unit: 'kg', availabilityStatus: AvailabilityStatus.OUT_OF_STOCK, imageUrl: 'https://source.unsplash.com/400x300/?okra', location: 'Koulikoro', cropType: 'Okra', projectStatus: ProjectStatus.HARVESTING },
  { id: 4, projectId: 5, farmerId: 4, productName: 'Premium Ségou Rice', quantity: 10000, price: 0.8, unit: 'kg', availabilityStatus: AvailabilityStatus.PRE_ORDER, imageUrl: 'https://source.unsplash.com/400x300/?rice', location: 'Ségou', cropType: 'Rice', projectStatus: ProjectStatus.IN_PROGRESS },
  { id: 5, projectId: 2, farmerId: 1, productName: 'Pearl Millet Grain', quantity: 5000, price: 0.5, unit: 'kg', availabilityStatus: AvailabilityStatus.PRE_ORDER, imageUrl: 'https://source.unsplash.com/400x300/?millet', location: 'Kayes', cropType: 'Millet', projectStatus: ProjectStatus.IN_PROGRESS },
];

export const MOCK_INVESTMENTS: Investment[] = [
    { id: 1, farmerId: 1, name: 'Tractor Purchase', amount: 15000, date: '2024-01-20', description: 'New John Deere 5050D for mango and millet fields.', relatedProjectId: null },
    { id: 2, farmerId: 3, name: 'Greenhouse Setup', amount: 8000, date: '2023-12-05', description: 'Materials and labor for the new tomato greenhouse.', relatedProjectId: 3 },
    { id: 3, farmerId: 4, name: 'Irrigation System Upgrade', amount: 12000, date: '2024-03-10', description: 'Drip irrigation for Ségou rice paddies.', relatedProjectId: 5 },
    { id: 4, farmerId: 1, name: 'Seed Funding (Millet)', amount: 1500, date: '2024-05-15', description: 'High-yield pearl millet seeds.', relatedProjectId: 2 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    // Farmer 1 (Adama)
    { id: 1, userId: 1, type: 'expense', amount: 15000, date: '2024-01-20', description: 'Expense for Tractor Purchase', relatedInvestmentId: 1 },
    { id: 2, userId: 1, type: 'expense', amount: 1500, date: '2024-05-15', description: 'Expense for Seed Funding (Millet)', relatedInvestmentId: 4 },
    { id: 3, userId: 1, type: 'income', amount: 1500, date: '2024-07-10', description: 'Sale of 1000kg Organic Kent Mangoes', relatedProductId: 1 },
    
    // Farmer 3 (Moussa)
    { id: 4, userId: 3, type: 'expense', amount: 8000, date: '2023-12-05', description: 'Expense for Greenhouse Setup', relatedInvestmentId: 2 },
    { id: 5, userId: 3, type: 'income', amount: 800, date: '2024-06-25', description: 'Sale of 400kg Greenhouse Tomatoes', relatedProductId: 2 },

    // Farmer 4 (Fatoumata)
    { id: 6, userId: 4, type: 'expense', amount: 12000, date: '2024-03-10', description: 'Expense for Irrigation System Upgrade', relatedInvestmentId: 3 },
    
    // Seller 2 (Binta)
    { id: 7, userId: 2, type: 'expense', amount: 750, date: '2024-07-11', description: 'Purchase of 500kg Organic Kent Mangoes', relatedProductId: 1 },
    { id: 8, userId: 2, type: 'expense', amount: 400, date: '2024-06-26', description: 'Purchase of 200kg Greenhouse Tomatoes', relatedProductId: 2 },
];