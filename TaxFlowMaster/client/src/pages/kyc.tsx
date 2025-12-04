import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Eye, EyeOff } from "lucide-react";
import type { Client, KycDocument } from "@shared/schema";

export default function KYC() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: kycData } = useQuery<KycDocument>({
    queryKey: [`/api/clients/${selectedClientId}/kyc`],
    enabled: !!selectedClientId,
  });

  const getCompletionStatus = (kyc: KycDocument | undefined) => {
    if (!kyc) return { count: 0, total: 8, percentage: 0 };
    
    const fields = [
      kyc.pan,
      kyc.aadhaar,
      kyc.gstin,
      kyc.gstPortalUsername,
      kyc.gstPortalPassword,
      kyc.itPortalUsername,
      kyc.itPortalPassword,
      kyc.bankDetails
    ];
    
    const completed = fields.filter(field => field && field !== "").length;
    return { count: completed, total: 8, percentage: Math.round((completed / 8) * 100) };
  };

  const status = getCompletionStatus(kycData);

  return (
    <>
      <Header
        title="KYC & Credentials"
        subtitle="Manage client documents and portal credentials"
        showQuickActions={false}
      />

      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Select Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => setSelectedClientId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClientId && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Status</span>
                    <Badge variant={status.percentage === 100 ? "default" : "secondary"}>
                      {status.percentage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {status.count} of {status.total} fields completed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* KYC Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                KYC Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedClientId ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a client to view KYC documents
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pan">PAN Number</Label>
                    <Input
                      id="pan"
                      value={kycData?.pan || ""}
                      placeholder="ABCDE1234F"
                      className="mt-1"
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="aadhaar">Aadhaar Number</Label>
                    <Input
                      id="aadhaar"
                      value={kycData?.aadhaar || ""}
                      placeholder="1234 5678 9012"
                      className="mt-1"
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      value={kycData?.gstin || ""}
                      placeholder="22AAAAA0000A1Z5"
                      className="mt-1"
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfRegistration">Date of Registration</Label>
                    <Input
                      id="dateOfRegistration"
                      type="date"
                      value={kycData?.dateOfRegistration ? 
                        new Date(kycData.dateOfRegistration).toISOString().split('T')[0] : ""
                      }
                      className="mt-1"
                      readOnly
                    />
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">
                      Update KYC Documents
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portal Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Portal Credentials
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedClientId ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a client to view portal credentials
                </p>
              ) : (
                <div className="space-y-6">
                  {/* GST Portal */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">GST Portal</h4>
                    <div>
                      <Label htmlFor="gstUsername">Username</Label>
                      <Input
                        id="gstUsername"
                        value={kycData?.gstPortalUsername || ""}
                        placeholder="GST Username"
                        className="mt-1"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="gstPassword">Password</Label>
                      <Input
                        id="gstPassword"
                        type={showPasswords ? "text" : "password"}
                        value={kycData?.gstPortalPassword || ""}
                        placeholder="••••••••"
                        className="mt-1"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* IT Portal */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">IT Portal</h4>
                    <div>
                      <Label htmlFor="itUsername">Username</Label>
                      <Input
                        id="itUsername"
                        value={kycData?.itPortalUsername || ""}
                        placeholder="IT Username"
                        className="mt-1"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="itPassword">Password</Label>
                      <Input
                        id="itPassword"
                        type={showPasswords ? "text" : "password"}
                        value={kycData?.itPortalPassword || ""}
                        placeholder="••••••••"
                        className="mt-1"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* TDS Login */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">TDS Portal</h4>
                    <div>
                      <Label htmlFor="tdsLogin">Login Details</Label>
                      <Input
                        id="tdsLogin"
                        value={kycData?.tdsLogin || ""}
                        placeholder="TDS Login Details"
                        className="mt-1"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full">
                      Update Credentials
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document Upload Section */}
        {selectedClientId && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload KYC Documents</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <Button>
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: PDF, JPG, PNG (Max 10MB each)
                </p>
              </div>

              {kycData?.documents && kycData.documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {kycData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
