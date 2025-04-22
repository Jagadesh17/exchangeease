import { supabase } from "@/integrations/supabase/client";

export async function checkDatabaseConnection() {
  try {
    console.log('Checking database connection...');
    
    // Try to connect and query a simple table
    const { data, error } = await supabase
      .from('books')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return {
        ok: false,
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      };
    }

    // Try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return {
        ok: false,
        error: sessionError.message,
        details: {
          code: 'SESSION_ERROR',
          message: sessionError.message
        }
      };
    }

    return {
      ok: true,
      authenticated: !!session,
      userId: session?.user?.id
    };
  } catch (err) {
    console.error('Health check error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      details: { error: err }
    };
  }
} 