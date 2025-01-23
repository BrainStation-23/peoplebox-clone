import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  use_ssl: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const config: SMTPConfig = await req.json();
    
    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "SMTP connection successful" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("SMTP test error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "SMTP connection failed", 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});