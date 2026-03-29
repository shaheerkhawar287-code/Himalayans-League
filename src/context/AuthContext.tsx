import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'player';
  age?: number;
  skillLevel?: string;
  teamId?: string;
  stats?: {
    wins: number;
    losses: number;
    points: number;
  };
  badges?: string[];
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch profile
        const userDoc = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for profile changes
  useEffect(() => {
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDoc, (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });
    return () => unsubscribe();
  }, [user]);

  const isAdmin = profile?.role === 'admin' || user?.email === 'shaheerkhawar287@gmail.com';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
