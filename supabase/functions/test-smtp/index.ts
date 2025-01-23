import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    console.log("Testing SMTP connection with config:", {
      ...config,
      password: '***' // Hide password in logs
    });
    
    const client = new SMTPClient({
      connection: {
        hostname: config.host,
        port: config.port,
        tls: config.use_ssl,
        auth: {
          username: config.username,
          password: config.password,
        },
      },
    });

    try {
      // Try to send a test email
      await client.send({
        from: `${config.from_name} <${config.from_email}>`,
        to: config.from_email,
        subject: "SMTP Test",
        content: "This is a test email to verify SMTP configuration.",
      });

      await client.close();

      return new Response(
        JSON.stringify({ success: true, message: "SMTP connection successful" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } catch (smtpError) {
      console.error("SMTP connection error:", smtpError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "SMTP connection failed", 
          error: smtpError.message 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    } finally {
      // Ensure client is closed even if there's an error
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing SMTP connection:", closeError);
      }
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Failed to process request", 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});