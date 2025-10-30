
// Fix: Removed self-import which was causing multiple declaration conflict errors.

// Fix: Defined and exported all necessary enums and interfaces to be used across the application.
// This resolves numerous "module has no exported member" errors.
export enum View {
  DASHBOARD = 'DASHBOARD',
  SITE_MANAGEMENT = 'SITE_MANAGEMENT',
  SITE_DETAILS = 'SITE_DETAILS',
  MARKETPLACE = 'MARKETPLACE',
  CART = 'CART',
  ANALYTICS = 'ANALYTICS',
  FINANCE = 'FINANCE',
  PROFILE = 'PROFILE',
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

// Fix: Add the missing 'Investment' interface to resolve an import error.
export interface Investment {
    id: number;
    farmerId: number;
    name: string;
    amount: number;
    date: string;
    description: string;
    relatedProjectId: number | null;
}
