import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzrzwliyfsgzkvqwfgvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cnp3bGl5ZnNnemt2cXdmZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODg4NzIsImV4cCI6MjA3MjM2NDg3Mn0.wmEKnzZEPVNps288veaGeHTNAq6iVV9Zm-qUaJQBeYM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);