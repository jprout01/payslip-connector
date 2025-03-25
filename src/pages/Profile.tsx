
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { auth, logout, PayslipFile, uploadPayslipFile, getPayslipFiles, deletePayslipFile } from "@/lib/firebase";
import { AlertTriangle, Upload, FileText, Trash2 } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [payslipFiles, setPayslipFiles] = useState<PayslipFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const user = auth.currentUser;
  
  useEffect(() => {
    fetchPayslipFiles();
  }, []);
  
  const fetchPayslipFiles = async () => {
    try {
      const files = await getPayslipFiles();
      setPayslipFiles(files);
    } catch (error) {
      console.error("Error fetching payslip files:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payslip files",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setUploadLoading(true);
    try {
      await uploadPayslipFile(selectedFile);
      
      toast({
        title: "Success",
        description: "Payslip file uploaded successfully",
      });
      
      // Clear selected file and refresh file list
      setSelectedFile(null);
      fetchPayslipFiles();
      
      // Reset file input
      const fileInput = document.getElementById("payslipFile") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload payslip file",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };
  
  const handleFileDelete = async (fileId: string, fileUrl: string) => {
    if (!fileId) return;
    
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await deletePayslipFile(fileId, fileUrl);
        
        // Update the file list
        setPayslipFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
        
        toast({
          title: "Success",
          description: "Payslip file deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting file:", error);
        toast({
          title: "Error",
          description: "Failed to delete payslip file",
          variant: "destructive",
        });
      }
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Not Authenticated</CardTitle>
              <CardDescription>
                You need to be logged in to view this page.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and documents.
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="payslips">My Payslips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card className="card-hover overflow-hidden">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your personal account details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div className="flex items-center p-3 text-sm border rounded-md bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p>Email verification and password reset are available in the full version.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleLogout} 
                  variant="destructive"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Logging out..." : "Logout"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="payslips" className="space-y-4">
            <Card className="card-hover overflow-hidden">
              <CardHeader>
                <CardTitle>Upload Payslips</CardTitle>
                <CardDescription>
                  Upload your payslip documents for safekeeping.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="payslipFile">Select File</Label>
                  <Input 
                    id="payslipFile" 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!selectedFile || uploadLoading}
                  className="w-full sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadLoading ? "Uploading..." : "Upload Payslip"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="card-hover overflow-hidden">
              <CardHeader>
                <CardTitle>My Payslip Documents</CardTitle>
                <CardDescription>
                  View and manage your uploaded payslip documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payslipFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
                    <p>No payslip documents uploaded yet.</p>
                    <p className="text-sm">Upload your first payslip document above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payslipFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={() => file.id && handleFileDelete(file.id, file.url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
