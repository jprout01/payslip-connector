
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Payslip, getPayslips, deletePayslip } from "@/lib/firebase";

const Payslips = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    if (window.confirm("Are you sure you want to delete this payslip?")) {
      try {
        await deletePayslip(id);
        setPayslips((prevPayslips) => prevPayslips.filter((payslip) => payslip.id !== id));
        toast({
          title: "Success",
          description: "Payslip deleted successfully!",
        });
      } catch (error) {
        console.error("Error deleting payslip:", error);
        toast({
          title: "Error",
          description: "Failed to delete payslip. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const filteredPayslips = payslips.filter((payslip) =>
    payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payslip.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payslip.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payslip.year.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Payslips</h2>
            <p className="text-muted-foreground">
              View and manage all your payslips.
            </p>
          </div>
          <Link to="/add-payslip">
            <Button className="w-full sm:w-auto">Add New Payslip</Button>
          </Link>
        </div>

        <Card className="card-hover overflow-hidden">
          <CardHeader>
            <CardTitle>All Payslips</CardTitle>
            <CardDescription>
              A list of all payslips in your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search payslips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : filteredPayslips.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Month/Year</TableHead>
                      <TableHead className="hidden md:table-cell">Payment Date</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayslips.map((payslip) => (
                      <TableRow key={payslip.id}>
                        <TableCell>
                          <div className="font-medium">{payslip.employeeName}</div>
                          <div className="text-sm text-muted-foreground">ID: {payslip.employeeId}</div>
                        </TableCell>
                        <TableCell>
                          {payslip.month} {payslip.year}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(payslip.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${payslip.netPay.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => payslip.id && handleDelete(payslip.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? "No payslips match your search" : "No payslips found. Add your first payslip!"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Payslips;
