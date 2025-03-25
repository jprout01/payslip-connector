
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      navigate(user ? "/" : "/login");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30">
      <div className="animate-pulse space-y-2 flex flex-col items-center">
        <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
        <div className="h-4 w-32 bg-primary/20 rounded"></div>
      </div>
    </div>
  );
};

export default Index;
