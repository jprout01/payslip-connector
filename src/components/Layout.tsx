
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { auth, logout } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const user = auth.currentUser;

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Add Payslip", path: "/add-payslip" },
    { name: "Payslips", path: "/payslips" },
    { name: "Profile", path: "/profile" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar/Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white/90 backdrop-blur-md shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full lg:static lg:w-64"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-semibold">PH</span>
              </div>
              <span className="text-xl">PaySlip Harmony</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10 ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <Separator className="my-4" />
          </ScrollArea>
          <div className="p-4">
            {user ? (
              <Button
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold">PaySlip Harmony</h1>
          </div>
          <div className="w-10"></div> {/* Placeholder for balance */}
        </div>
      )}

      {/* Backdrop for mobile */}
      {isMenuOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${isMobile ? 'pt-16' : ''}`}>
        <div className="container mx-auto p-6 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
