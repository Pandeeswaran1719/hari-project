import { useState } from "react";
import { Edit, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Payment, Client } from "@shared/schema";

interface PaymentTableProps {
  payments: Payment[];
  clients: Client[];
  onEditPayment: (payment: Payment) => void;
}

export default function PaymentTable({ payments, clients, onEditPayment }: PaymentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clientsMap = new Map(clients.map(client => [client.id, client]));

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("delete", `/api/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    },
  });

  const filteredPayments = payments.filter(payment => {
    const client = clientsMap.get(payment.clientId);
    const clientName = client?.name || "";
    
    return (
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  const handleDownloadInvoice = (payment: Payment) => {
    // This would generate and download a PDF invoice
    toast({
      title: "Feature Coming Soon",
      description: "PDF invoice generation will be available soon",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search payments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchQuery ? "No payments found matching your search" : "No payments found"}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => {
                const client = clientsMap.get(payment.clientId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">
                        {client?.name || "Unknown Client"}
                      </div>
                      {payment.paymentMode && (
                        <div className="text-sm text-muted-foreground">
                          via {payment.paymentMode.charAt(0).toUpperCase() + payment.paymentMode.slice(1)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{payment.serviceName}</TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(payment.feeAmount)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      {formatDate(payment.paymentDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadInvoice(payment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditPayment(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this payment record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(payment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
