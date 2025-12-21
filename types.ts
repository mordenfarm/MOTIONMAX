
export type Role = 'SUPER_ADMIN' | 'SPECIALIST' | 'PARENT' | 'ADMIN_SUPPORT' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female';
  enrollmentDate: string;
  termEntry?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  homeAddress: string;
  diagnosis: string;
  medicalRecords: string;
  socialHistory: string;
  targetBehaviors: string;
  uniformSizes: string;
  assignedStaffId: string;
  imageUrl?: string;
  firebaseUid?: string;
  totalPaid?: number;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  studentId: string;
  studentFullName: string;
  firebaseUid: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  nationalId?: string;
  passportNumber?: string;
  nationality: string;
  gender: 'Male' | 'Female';
  address: string;
  position: string; 
  email: string;
  phone: string;
  role: Role;
}

export interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  coverLetter: string;
  cvBase64?: string;
  cvName?: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected';
  timestamp: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'Visa/Mastercard' | 'Ecocash' | 'O\'mari';
  status: 'Uncollected' | 'Collected';
  timestamp: string;
}

export interface SystemSettings {
  positions: string[];
  feesAmount: number;
  currentTerm: string;
}

export type PromptLevel = '+' | 'FP' | 'PP' | 'DV' | 'IDV' | 'GP' | 'VP' | '-';

export interface TaskStep {
  id: string;
  description: string;
  promptLevel: PromptLevel;
}

export interface SessionLog {
  id: string;
  studentId: string;
  staffId: string;
  date: string;
  targetBehavior: string;
  method: 'Forward Chaining' | 'Backward Chaining' | 'Total Task';
  steps: TaskStep[];
  independenceScore: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'Required' | 'Optional';
  imageUrl: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
