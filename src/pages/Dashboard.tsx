
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Payslip, getPayslips } from "@/lib/firebase";

const Dashboard = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const data = await getPayslips();
        setPayslips(data);
      } catch (error) {
        console.error("Error fetching payslips:", error);
        toast({
          title: "Error",
          description: "Failed to fetch payslips. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [toast]);

  // Calculate total and average net pay
  const totalNetPay = payslips.reduce((sum, payslip) => sum + payslip.netPay, 0);
  const averageNetPay = payslips.length > 0 ? totalNetPay / payslips.length : 0;
  
  // Get recent payslips
  const recentPayslips = [...payslips].sort((a, b) => {
    return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
  }).slice(0, 3);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your PaySlip Harmony dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <div className="h-8 w-16 bg-muted animate-pulse rounded" /> : payslips.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {payslips.length === 1 ? "1 payslip" : `${payslips.length} payslips`} in your account
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Net Pay</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  `$${averageNetPay.toFixed(2)}`
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Average from {payslips.length} payslips
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-28 bg-muted animate-pulse rounded" />
                ) : (
                  `$${totalNetPay.toFixed(2)}`
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Total from all payslips
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 card-hover">
            <CardHeader>
              <CardTitle>Recent Payslips</CardTitle>
              <CardDescription>Your most recent payslips</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : recentPayslips.length > 0 ? (
                <div className="space-y-2">
                  {recentPayslips.map((payslip) => (
                    <div
                      key={payslip.id}
                      className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{payslip.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {payslip.month} {payslip.year}
                        </div>
                      </div>
                      <div className="font-semibold">${payslip.netPay.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No payslips found. Add your first payslip!
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link to="/payslips" className="w-full">
                <Button variant="outline" className="w-full">View all payslips</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="col-span-1 card-hover">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common actions you can take</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/add-payslip" className="w-full">
                <Button className="w-full mb-2">Add New Payslip</Button>
              </Link>
              <Link to="/payslips" className="w-full">
                <Button variant="outline" className="w-full mb-2">View All Payslips</Button>
              </Link>
              <Link to="/profile" className="w-full">
                <Button variant="outline" className="w-full">Manage Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
