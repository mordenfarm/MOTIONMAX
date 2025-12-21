
import { create } from 'zustand';
import { User, Role, Student, Staff, Parent, SystemSettings, SystemLog, SessionLog, Application, ShopItem, Order, MilestoneRecord } from '../types';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot,
  query,
  orderBy,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  limit
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQZSWdzzx1IJWGGbxPZH7GxudX5zNYHbw",
  authDomain: "nhaurwa-70692.firebaseapp.com",
  projectId: "nhaurwa-70692",
  storageBucket: "nhaurwa-70692.firebasestorage.app",
  messagingSenderId: "448641589213",
  appId: "1:448641589213:web:bd18d8220f571f8fe7a034"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const secondaryApp = getApps().length > 1 ? getApp("Secondary") : initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

type View = 'landing' | 'login' | 'app' | 'careers' | 'shop';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CartItem extends ShopItem {
  cartId: string;
  quantity: number;
}

export interface MilestoneTemplate {
  id: string;
  label: string;
  sections: {
    title: string;
    items: string[];
  }[];
  redFlags: string[];
}

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  isLoggedIn: boolean;
  view: View;
  setView: (view: View) => void;
  login: (role: Role, credentials: { email: string; pass: string }) => Promise<void>;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: (open?: boolean) => void;
  notifications: Notification[];
  notify: (type: 'success' | 'error' | 'info', message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  students: Student[];
  staff: Staff[];
  parents: Parent[];
  clinicalLogs: SessionLog[];
  systemLogs: SystemLog[];
  applications: Application[];
  shopItems: ShopItem[];
  cart: CartItem[];
  orders: Order[];
  milestoneRecords: MilestoneRecord[];
  milestoneTemplates: MilestoneTemplate[];
  settings: SystemSettings;
  selectedStudentIdForLog: string | null;
  setSelectedStudentIdForLog: (id: string | null) => void;
  initializeData: () => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (uid: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (uid: string) => Promise<void>;
  addStaff: (staff: Staff) => Promise<void>;
  updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
  updateUserProfile: (data: { name?: string; password?: string }) => Promise<void>;
  addSystemLog: (action: string, details: string) => Promise<void>;
  addClinicalLog: (log: Omit<SessionLog, 'id'>) => Promise<void>;
  submitApplication: (app: Omit<Application, 'id' | 'status' | 'timestamp'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status']) => Promise<void>;
  addShopItem: (item: Omit<ShopItem, 'id'>) => Promise<void>;
  deleteShopItem: (id: string) => Promise<void>;
  addToCart: (item: ShopItem) => void;
  updateCartQuantity: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  saveMilestoneRecord: (record: Omit<MilestoneRecord, 'id' | 'timestamp' | 'staffId'>) => Promise<void>;
  saveMilestoneTemplate: (template: MilestoneTemplate) => Promise<void>;
  deleteMilestoneTemplate: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => {
  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          set({ user: userData, isLoggedIn: true, view: 'app', activeTab: 'dashboard' });
          get().addSystemLog('Login', `User ${userData.name} logged in.`);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
      }
    } else {
      set({ user: null, isLoggedIn: false });
    }
  });

  return {
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    }),
    user: null,
    isLoggedIn: false,
    view: 'landing',
    setView: (view) => set({ view }),
    isMobileMenuOpen: false,
    toggleMobileMenu: (open) => set((state) => ({ isMobileMenuOpen: open !== undefined ? open : !state.isMobileMenuOpen })),
    notifications: [],
    notify: (type, message, duration = 5000) => {
      const id = Math.random().toString(36).substring(7);
      set(state => ({ notifications: [...state.notifications, { id, type, message }] }));
      setTimeout(() => get().removeNotification(id), duration);
    },
    removeNotification: (id) => set(state => ({ notifications: state.notifications.filter(n => n.id !== id) })),
    settings: { positions: ['Lead Therapist', 'Junior Therapist'], classes: [], feesAmount: 500, currentTerm: 'Term 1' },
    selectedStudentIdForLog: null,
    setSelectedStudentIdForLog: (id) => set({ selectedStudentIdForLog: id }),
    students: [],
    staff: [],
    parents: [],
    clinicalLogs: [],
    systemLogs: [],
    applications: [],
    shopItems: [],
    cart: [],
    orders: [],
    milestoneRecords: [],
    milestoneTemplates: [],
    login: async (role, credentials) => {
      const { email, pass } = credentials;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;
        const userDocRef = doc(db, 'users', fbUser.uid);
        let userDoc = await getDoc(userDocRef);
        if (!userDoc.exists() && email === 'admin@gmail.com') {
          const profile: User = { id: fbUser.uid, name: 'System Admin', email: email, role: 'SUPER_ADMIN', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin` };
          await setDoc(userDocRef, profile);
          userDoc = await getDoc(userDocRef);
        }
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.role !== role) { await signOut(auth); throw new Error('ROLE_MISMATCH'); }
          set({ user: userData, isLoggedIn: true, view: 'app', activeTab: 'dashboard' });
          get().notify('success', 'Logged in successfully.');
        } else { await signOut(auth); throw new Error('PROFILE_NOT_FOUND'); }
      } catch (error: any) { throw error; }
    },
    logout: async () => {
      const u = get().user;
      if (u) await get().addSystemLog('Logout', `User ${u.name} logged out.`);
      await signOut(auth);
      set({ isLoggedIn: false, view: 'landing', user: null, isMobileMenuOpen: false, cart: [] });
      get().notify('info', 'Logged out successfully.');
    },
    activeTab: 'dashboard',
    setActiveTab: (activeTab) => set({ activeTab, isMobileMenuOpen: false }),
    initializeData: () => {
      const studentsQuery = query(collection(db, 'students'), orderBy('fullName'));
      onSnapshot(studentsQuery, (snapshot) => {
        const students = snapshot.docs.map(doc => ({ ...doc.data() } as Student));
        set({ students });
      });
      const staffQuery = query(collection(db, 'staff'), orderBy('fullName'));
      onSnapshot(staffQuery, (snapshot) => {
        const staff = snapshot.docs.map(doc => ({ ...doc.data() } as Staff));
        set({ staff });
      });
      const parentsQuery = query(collection(db, 'parents'), orderBy('name'));
      onSnapshot(parentsQuery, (snapshot) => {
        const parents = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Parent));
        set({ parents });
      });
      const clinicalQuery = query(collection(db, 'clinical_logs'), orderBy('date', 'desc'), limit(100));
      onSnapshot(clinicalQuery, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SessionLog));
        set({ clinicalLogs: logs });
      });
      const shopQuery = query(collection(db, 'shop_items'), orderBy('name'));
      onSnapshot(shopQuery, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ShopItem));
        set({ shopItems: items });
      });
      const milestoneQuery = query(collection(db, 'milestone_records'), orderBy('timestamp', 'desc'));
      onSnapshot(milestoneQuery, (snapshot) => {
        const records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MilestoneRecord));
        set({ milestoneRecords: records });
      });
      const templateQuery = query(collection(db, 'milestone_templates'), orderBy('label'));
      onSnapshot(templateQuery, (snapshot) => {
        const templates = snapshot.docs.map(doc => ({ ...doc.data() } as MilestoneTemplate));
        set({ milestoneTemplates: templates });
      });
      onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
        if (snapshot.exists()) {
          set({ settings: snapshot.data() as SystemSettings });
        }
      });
    },
    updateSettings: async (newSettings) => {
      try {
        const settingsRef = doc(db, 'settings', 'global');
        await setDoc(settingsRef, { ...get().settings, ...newSettings }, { merge: true });
        get().notify('success', 'Changes saved');
      } catch (err) {
        get().notify('error', 'Could not save changes');
      }
    },
    addStudent: async (studentData) => {
      try {
        const fullName = `${studentData.firstName} ${studentData.lastName}`;
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef);
        const snapshot = await getDocs(q);
        const count = snapshot.size + 1;
        const formattedId = `MAX${count.toString().padStart(3, '0')}`;
        const email = `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}@motionmax.com`;
        const defaultPass = "000000";
        const studentUserCredential = await createUserWithEmailAndPassword(secondaryAuth, email, defaultPass);
        const studentUid = studentUserCredential.user.uid;
        const finalStudent = { ...studentData, fullName, id: formattedId, firebaseUid: studentUid, totalPaid: 0 };
        await setDoc(doc(db, 'students', studentUid), finalStudent);
        await setDoc(doc(db, 'users', studentUid), { id: studentUid, name: fullName, email: email, role: 'STUDENT', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}` });
        const parentEmail = studentData.parentEmail;
        const parentName = `Parent of ${fullName}`;
        const parentUserCredential = await createUserWithEmailAndPassword(secondaryAuth, parentEmail, defaultPass);
        const parentUid = parentUserCredential.user.uid;
        const parentRecord: Parent = { id: parentUid, name: parentName, email: parentEmail, phone: studentData.parentPhone, address: studentData.homeAddress, studentId: formattedId, studentFullName: fullName, firebaseUid: parentUid };
        await setDoc(doc(db, 'parents', parentUid), parentRecord);
        await setDoc(doc(db, 'users', parentUid), { id: parentUid, name: parentName, email: parentEmail, role: 'PARENT', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${parentName}` });
        await signOut(secondaryAuth);
        get().notify('success', `Added to list.`);
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    updateStudent: async (uid, data) => {
      try {
        await updateDoc(doc(db, 'students', uid), data);
        get().notify('success', 'Details saved.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    deleteStudent: async (uid) => {
      try {
        const studentDoc = await getDoc(doc(db, 'students', uid));
        if (studentDoc.exists()) {
          const sData = studentDoc.data() as Student;
          const parentsRef = collection(db, 'parents');
          const pSnap = await getDocs(query(parentsRef));
          const parentToClean = pSnap.docs.find(d => d.data().studentId === sData.id);
          await deleteDoc(doc(db, 'students', uid));
          await deleteDoc(doc(db, 'users', uid));
          if (parentToClean) {
            await deleteDoc(doc(db, 'parents', parentToClean.id));
            await deleteDoc(doc(db, 'users', parentToClean.id));
          }
          get().notify('success', 'Removed.');
        }
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    addStaff: async (staffData) => {
      try {
        const fullName = `${staffData.firstName} ${staffData.lastName}`;
        const email = staffData.email || `${staffData.firstName.toLowerCase()}.${staffData.lastName.toLowerCase()}@motionmax.com`;
        const staffCredential = await createUserWithEmailAndPassword(secondaryAuth, email, "000000");
        const staffUid = staffCredential.user.uid;
        const finalStaff = { ...staffData, fullName, id: staffUid, firebaseUid: staffUid };
        await setDoc(doc(db, 'staff', staffUid), finalStaff);
        await setDoc(doc(db, 'users', staffUid), { id: staffUid, name: fullName, email: email, role: staffData.role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}` });
        await signOut(secondaryAuth);
        get().notify('success', `Added staff.`);
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    updateStaff: async (id, data) => {
      try {
        await updateDoc(doc(db, 'staff', id), data);
        get().notify('success', 'Saved');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    updateUserProfile: async ({ name, password }) => {
      const fbUser = auth.currentUser;
      if (!fbUser) return;
      try {
        if (name) {
          await updateProfile(fbUser, { displayName: name });
          await updateDoc(doc(db, 'users', fbUser.uid), { name });
          set(state => ({ user: state.user ? { ...state.user, name } : null }));
        }
        if (password) await updatePassword(fbUser, password);
        get().notify('success', 'Profile saved.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    addSystemLog: async (action, details) => {
      const u = get().user;
      try {
        await addDoc(collection(db, 'logs'), { userId: u?.id || 'system', userName: u?.name || 'System', action, details, timestamp: new Date().toISOString() });
      } catch (err) { console.error(err); }
    },
    addClinicalLog: async (logData) => {
      const u = get().user;
      try {
        await addDoc(collection(db, 'clinical_logs'), { ...logData, staffId: u?.id || 'unknown' });
        get().notify('success', 'Log saved.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    submitApplication: async (appData) => {
      try {
        await addDoc(collection(db, 'applications'), { ...appData, status: 'Pending', timestamp: new Date().toISOString() });
        get().notify('success', 'Sent.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    updateApplicationStatus: async (id, status) => {
      try {
        await updateDoc(doc(db, 'applications', id), { status });
        get().notify('success', `Status: ${status}`);
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    addShopItem: async (item) => {
      try {
        await addDoc(collection(db, 'shop_items'), item);
        get().notify('success', 'Added to shop.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    deleteShopItem: async (id) => {
      try {
        await deleteDoc(doc(db, 'shop_items', id));
        get().notify('success', 'Removed.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    addToCart: (item) => {
      const existing = get().cart.find(i => i.id === item.id);
      if (existing) {
        get().updateCartQuantity(existing.cartId, 1);
        return;
      }
      const cartId = Math.random().toString(36).substring(7);
      set(state => ({ cart: [...state.cart, { ...item, cartId, quantity: 1 }] }));
    },
    updateCartQuantity: (cartId, delta) => {
      set(state => ({ cart: state.cart.map(i => i.cartId === cartId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i) }));
    },
    removeFromCart: (cartId) => {
      set(state => ({ cart: state.cart.filter(i => i.cartId !== cartId) }));
    },
    clearCart: () => set({ cart: [] }),
    placeOrder: async (orderData) => {
      try {
        await addDoc(collection(db, 'orders'), { ...orderData, status: 'Uncollected', timestamp: new Date().toISOString() });
        get().clearCart();
        get().notify('success', 'Order saved.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    updateOrderStatus: async (orderId, status) => {
      try {
        await updateDoc(doc(db, 'orders', orderId), { status });
        get().notify('success', `Order: ${status}`);
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    saveMilestoneRecord: async (record) => {
      try {
        await addDoc(collection(db, 'milestone_records'), {
          ...record,
          staffId: get().user?.id || 'system',
          timestamp: new Date().toISOString()
        });
        get().notify('success', 'Progress saved.');
      } catch (err: any) {
        get().notify('error', `Error: ${err.message}`);
      }
    },
    saveMilestoneTemplate: async (template) => {
      try {
        await setDoc(doc(db, 'milestone_templates', template.id), template);
        get().notify('success', 'Checklist updated.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    },
    deleteMilestoneTemplate: async (id) => {
      try {
        await deleteDoc(doc(db, 'milestone_templates', id));
        get().notify('success', 'Checklist removed.');
      } catch (err: any) { get().notify('error', `Error: ${err.message}`); }
    }
  };
});
