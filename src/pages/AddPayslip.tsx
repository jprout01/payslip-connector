
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { addPayslip } from "@/lib/firebase";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString());

const AddPayslip = () => {
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    salary: "",
    deductions: "",
    taxAmount: "",
    month: "",
    year: currentYear.toString(),
    paymentDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate net pay
      const salary = parseFloat(formData.salary);
      const deductions = parseFloat(formData.deductions);
      const taxAmount = parseFloat(formData.taxAmount);
      const netPay = salary - deductions - taxAmount;

      // Create payslip object
      const payslipData = {
        employeeName: formData.employeeName,
        employeeId: formData.employeeId,
        salary,
        deductions,
        taxAmount,
        netPay,
        month: formData.month,
        year: formData.year,
        paymentDate: new Date(formData.paymentDate),
      };

      await addPayslip(payslipData);
      
      toast({
        title: "Success",
        description: "Payslip added successfully!",
      });
      
      navigate("/payslips");
    } catch (error) {
      console.error("Error adding payslip:", error);
      toast({
        title: "Error",
        description: "Failed to add payslip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Payslip</h2>
          <p className="text-muted-foreground">
            Create a new payslip by filling in the details below.
          </p>
        </div>

        <Card className="card-hover overflow-hidden">
          <CardHeader>
            <CardTitle>Payslip Information</CardTitle>
            <CardDescription>Enter the payslip details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} id="payslip-form">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    name="employeeName"
                    placeholder="John Doe"
                    value={formData.employeeName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    placeholder="EMP001"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    placeholder="5000.00"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    id="deductions"
                    name="deductions"
                    type="number"
                    placeholder="500.00"
                    value={formData.deductions}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">Tax Amount</Label>
                  <Input
                    id="taxAmount"
                    name="taxAmount"
                    type="number"
                    placeholder="1000.00"
                    value={formData.taxAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select 
                    value={formData.month} 
                    onValueChange={(value) => handleSelectChange("month", value)}
                    required
                  >
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select 
                    value={formData.year} 
                    onValueChange={(value) => handleSelectChange("year", value)}
                    required
                  >
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="payslip-form"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Payslip"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AddPayslip;
