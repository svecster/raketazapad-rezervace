import { createClient } from "@supabase/supabase-js";

// Using the existing Supabase configuration from the project
const SUPABASE_URL = "https://rdplnaulnxevymvwbzpu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGxuYXVsbnhldnltdndienB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTQ2MDIsImV4cCI6MjA3Mzg3MDYwMn0.sTOS0084LRzY2e_QsJRBQDwjy9DL-8mGOpMuRApK198";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { 
    persistSession: true, 
    autoRefreshToken: true, 
    detectSessionInUrl: true 
  }
});