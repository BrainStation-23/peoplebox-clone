import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const config = await req.json();
    console.log("Testing SMTP connection with config:", {
      ...config,
      password: '***' // Hide password in logs
    });
    
    const client = new SmtpClient();

    const connectConfig = {
      hostname: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      tls: config.use_ssl,
    };

    console.log("Attempting to connect to SMTP server...");
    await client.connectTLS(connectConfig);
    console.log("SMTP connection established successfully");

    const testEmail = {
      from: `${config.from_name} <${config.from_email}>`,
      to: config.from_email,
      subject: "SMTP Test",
      content: "This is a test email to verify SMTP configuration.",
    };

    console.log("Sending test email...");
    await client.send(testEmail);
    console.log("Test email sent successfully");

    await client.close();
    console.log("SMTP connection closed");

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
  }
});