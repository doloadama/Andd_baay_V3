export enum View {
  DASHBOARD = 'DASHBOARD',
  SITE_MANAGEMENT = 'SITE_MANAGEMENT',
  SITE_DETAILS = 'SITE_DETAILS',
  MARKETPLACE = 'MARKETPLACE',
  CART = 'CART',
  ANALYTICS = 'ANALYTICS',
  FINANCE = 'FINANCE',
  PROFILE = 'PROFILE',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
}

export enum Role {
    FARMER = 'FARMER',
    SELLER = 'SELLER',
    BOTH = 'BOTH',
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    role: Role;
}

export interface CartItem {
    productId: number;
    quantity: number;
}

export interface Site {
    id: number;
    farmerId: number;
    name: string;
    location: string;
}

export enum ProjectStatus {
    PLANNING = 'Planning',
    IN_PROGRESS = 'In Progress',
    HARVESTING = 'Harvesting',
    COMPLETED = 'Completed',
}

export interface Project {
    id: number;
    siteId: number;
    name: string;
    description: string;
    cropType: string;
    startDate: string;
    endDate: string;
    expectedYield: number;
    status: ProjectStatus;
}

export enum AvailabilityStatus {
    AVAILABLE = 'Available',
    OUT_OF_STOCK = 'Out of Stock',
    PRE_ORDER = 'Pre-order',
}

export interface Product {
    id: number;
    projectId: number;
    farmerId: number;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
    availabilityStatus: AvailabilityStatus;
    imageUrl: string;
    location: string;
    cropType: string;
    projectStatus: ProjectStatus;
}

export enum ExpenseCategory {
    EQUIPMENT = 'Equipment',
    SUPPLIES = 'Supplies',
    INFRASTRUCTURE = 'Infrastructure',
    LABOR = 'Labor',
    UTILITIES = 'Utilities',
    OTHER = 'Other',
}

export interface Transaction {
    id: number;
    userId: number;
    type: 'income' | 'expense';
    amount: number;
    date: string;
    description: string;
    siteId?: number | null;
    projectId?: number | null;
    category?: ExpenseCategory;
}

export interface Investment {
    id: number;
    farmerId: number;
    name: string;
    amount: number;
    date: string;
    description: string;
    relatedProjectId: number | null;
}