import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let client: SMTPClient | null = null;
  
  try {
    const config = await req.json();
    console.log("Testing SMTP connection with config:", {
      ...config,
      password: '***' // Hide password in logs
    });
    
    // Create SMTP client with explicit connection options
    client = new SMTPClient({
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

    // Connect to verify credentials
    await client.connect();
    console.log("SMTP connection established successfully");

    // Send a simple test email with text content only
    await client.send({
      from: `${config.from_name} <${config.from_email}>`,
      to: [config.from_email],
      subject: "SMTP Test",
      content: "This is a test email to verify SMTP configuration.",
    });

    console.log("SMTP test email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "SMTP connection successful" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("SMTP connection error:", error);
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
  } finally {
    // Always try to close the client connection
    if (client) {
      try {
        await client.close();
        console.log("SMTP connection closed");
      } catch (closeError) {
        console.error("Error closing SMTP connection:", closeError);
      }
    }
  }
});