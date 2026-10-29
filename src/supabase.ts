import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// The URL and the publishable key are public by design. Row-level security in the database protects the data.
const URL = 'https://ufhruncvloupmmktvjsm.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_l6pUhksklVabu5iVNO-z1A_vk3dt31w';

export const supabase = createClient(URL, PUBLISHABLE_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});
