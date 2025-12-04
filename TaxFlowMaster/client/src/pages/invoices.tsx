import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Eye, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF, downloadPDF, type InvoiceData } from "@/lib/pdf-generator";
import type { Payment, Client, FirmSettings } from "@shared/schema";

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: firmSettings } = useQuery<FirmSettings>({
    queryKey: ["/api/settings"],
  });

  const clientsMap = new Map(clients.map(client => [client.id, client]));

  const filteredPayments = payments.filter(payment => {
    const client = clientsMap.get(payment.clientId);
    const clientName = client?.name || "";
    
    const matchesSearch = (
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

    const matchesMonth = monthFilter === "all" || (() => {
      if (!payment.createdAt) return false;
      const paymentMonth = new Date(payment.createdAt).getMonth();
      const currentMonth = new Date().getMonth();
      
      switch (monthFilter) {
        case "current":
          return paymentMonth === currentMonth;
        case "last":
          return paymentMonth === (currentMonth - 1 + 12) % 12;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="status-active">Paid</Badge>;
      case "unpaid":
        return <Badge className="status-overdue">Unpaid</Badge>;
      case "partially_paid":
        return <Badge className="status-pending">Partially Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `₹${parseFloat(amount.toString()).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleGenerateInvoice = async (payment: Payment) => {
    try {
      const client = clientsMap.get(payment.clientId);
      if (!client || !firmSettings) {
        toast({
          title: "Error",
          description: "Missing client or firm information",
          variant: "destructive",
        });
        return;
      }

      const invoiceData: InvoiceData = {
        invoiceNumber: payment.invoiceNumber,
        clientName: client.name,
        clientAddress: client.address || undefined,
        serviceName: payment.serviceName,
        amount: parseFloat(payment.feeAmount.toString()),
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : undefined,
        firmName: firmSettings.firmName,
        firmAddress: firmSettings.address || undefined,
        firmGSTIN: firmSettings.gstin || undefined,
      };

      const pdfBlob = await generateInvoicePDF(invoiceData);
      downloadPDF(pdfBlob, `invoice-${payment.invoiceNumber}.pdf`);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      });
    }
  };

  const handlePreviewInvoice = (payment: Payment) => {
    toast({
      title: "Feature Coming Soon",
      description: "Invoice preview will be available soon",
    });
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => 
    sum + parseFloat(payment.feeAmount.toString()), 0
  );

  const paidAmount = filteredPayments
    .filter(payment => payment.status === "paid")
    .reduce((sum, payment) => sum + parseFloat(payment.feeAmount.toString()), 0);

  const unpaidAmount = filteredPayments
    .filter(payment => payment.status === "unpaid" || payment.status === "partially_paid")
    .reduce((sum, payment) => sum + parseFloat(payment.feeAmount.toString()), 0);

  return (
    <>
      <Header
        title="Receipts & Invoices"
        subtitle="Generate and manage invoices and receipts"
        showQuickActions={false}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold text-foreground">{filteredPayments.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount Collected</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(unpaidAmount)}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="current">This Month</SelectItem>
                    <SelectItem value="last">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setMonthFilter("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading invoices...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || monthFilter !== "all" 
                    ? "No invoices found matching your filters" 
                    : "No invoices found"}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => {
                      const client = clientsMap.get(payment.clientId);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-sm">
                            {payment.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {client?.name || "Unknown Client"}
                              </div>
                              {client?.contactNumber && (
                                <div className="text-sm text-muted-foreground">
                                  {client.contactNumber}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{payment.serviceName}</TableCell>
                          <TableCell className="font-mono">
                            {formatCurrency(payment.feeAmount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell>
                            {formatDate(payment.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePreviewInvoice(payment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleGenerateInvoice(payment)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
