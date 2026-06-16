import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NicheType, NicheConfig } from '../config/niches/types';
import { getNicheConfig } from '../config/niches';

interface Owner {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface Organization {
  id: string;
  businessName: string;
  nicheType: NicheType;
}

interface AuthState {
  token: string | null;
  owner: Owner | null;
  organization: Organization | null;
  config: NicheConfig | null;
  isLoading: boolean;
  setAuth: (token: string, owner: Owner, organization: Organization) => Promise<void>;
  logout: () => Promise<void>;
  restoreAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  owner: null,
  organization: null,
  config: null,
  isLoading: true,
  
  setAuth: async (token, owner, organization) => {
    const config = getNicheConfig(organization.nicheType);
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_owner', JSON.stringify(owner));
    await AsyncStorage.setItem('auth_organization', JSON.stringify(organization));
    set({ token, owner, organization, config });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_owner');
    await AsyncStorage.removeItem('auth_organization');
    set({ token: null, owner: null, organization: null, config: null });
  },

  restoreAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const ownerStr = await AsyncStorage.getItem('auth_owner');
      const orgStr = await AsyncStorage.getItem('auth_organization');

      if (token && ownerStr && orgStr) {
        const organization = JSON.parse(orgStr);
        const config = getNicheConfig(organization.nicheType);
        set({
          token,
          owner: JSON.parse(ownerStr),
          organization,
          config,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));
