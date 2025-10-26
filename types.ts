export enum View {
  DASHBOARD = 'DASHBOARD',
  MARKETPLACE = 'MARKETPLACE',
  ANALYTICS = 'ANALYTICS',
  PROFILE = 'PROFILE',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  FINANCE = 'FINANCE',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
}

// Fix: Replaced incorrect component definition with actual type definitions.
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

export interface Investment {
  id: number;
  farmerId: number;
  name: string;
  amount: number;
  date: string;
  description: string;
  relatedProjectId: number | null;
}

export interface Transaction {
  id: number;
  userId: number;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  relatedInvestmentId?: number;
  relatedProductId?: number;
}