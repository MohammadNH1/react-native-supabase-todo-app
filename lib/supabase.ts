import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ubczcosezoepmrkfudok.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViY3pjb3Nlem9lcG1ya2Z1ZG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTg2NjMsImV4cCI6MjA2NTU3NDY2M30._aek8peSnUZQo_knz1nZ6Z3XrguRgKDAID4C29g53Fc"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})