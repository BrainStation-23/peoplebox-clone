import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = 'https://iqpgjxbqoeioqlfzosvu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcGdqeGJxb2Vpb3FsZnpvc3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU2NzI0NzAsImV4cCI6MjAyMTI0ODQ3MH0.0e46DXmzAz0h1VjB0RNTMVyMoN1yamhz4MaI-lZQQVk'

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)