import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: error.message,
          duration: 5000
        });
        navigate("/login");
        return;
      }

      if (session) {
        try {
          // Check user role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (roleError) {
            throw roleError;
          }

          // Redirect based on role
          if (roleData?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }

          toast({
            title: "Success",
            description: "You have been successfully authenticated",
            duration: 5000
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not verify user role",
            duration: 5000
          });
          navigate("/login");
        }
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size={32} />
    </div>
  );
}