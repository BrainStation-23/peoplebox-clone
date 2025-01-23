import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  assignmentId: string;
  surveyName: string;
  dueDate: string | null;
  recipientEmail: string;
  recipientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const reminderRequest: ReminderRequest = await req.json();
    const { assignmentId, surveyName, dueDate, recipientEmail, recipientName } = reminderRequest;

    // Check if a reminder was sent in the last 24 hours
    const { data: assignment } = await supabase
      .from('survey_assignments')
      .select('last_reminder_sent')
      .eq('id', assignmentId)
      .single();

    if (assignment?.last_reminder_sent) {
      const lastSent = new Date(assignment.last_reminder_sent);
      const hoursSinceLastReminder = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastReminder < 24) {
        return new Response(
          JSON.stringify({ 
            error: "A reminder was already sent in the last 24 hours" 
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }

    // Send email using Resend
    const dueDateText = dueDate 
      ? `This survey is due by ${new Date(dueDate).toLocaleDateString()}.` 
      : "Please complete this survey at your earliest convenience.";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Survey System <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Reminder: ${surveyName} Survey Pending`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${recipientName},</h2>
            <p>This is a friendly reminder that you have a pending survey to complete: <strong>${surveyName}</strong></p>
            <p>${dueDateText}</p>
            <p>Please log in to the survey system to complete your response.</p>
            <p>Thank you for your participation!</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending email:", error);
      throw new Error("Failed to send email reminder");
    }

    // Update last_reminder_sent timestamp
    const { error: updateError } = await supabase
      .from('survey_assignments')
      .update({ last_reminder_sent: new Date().toISOString() })
      .eq('id', assignmentId);

    if (updateError) {
      console.error("Error updating last_reminder_sent:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ message: "Reminder sent successfully" }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Error in send-survey-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);