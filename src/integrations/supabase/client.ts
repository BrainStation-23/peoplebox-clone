import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = 'https://iqpgjxbqoeioqlfzosvu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcGdqeGJxb2Vpb3FsZnpvc3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU2NzI0ODAsImV4cCI6MjAyMTI0ODQ4MH0.0_KQby_0YVZqwuGz_hOpP3Nq5yGHZHVVBbM1aNqP0Oc'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)