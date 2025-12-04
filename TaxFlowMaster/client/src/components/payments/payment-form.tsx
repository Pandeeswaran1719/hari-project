import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPaymentSchema, type InsertPayment, type Client } from "@shared/schema";
import { X } from "lucide-react";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: InsertPayment & { id?: number };
  mode?: "create" | "edit";
}

const serviceOptions = [
  "IT Filing",
  "GST Filing",
  "GSTR-1",
  "GSTR-3B",
  "TDS Return",
  "Audit",
  "ROC Filing",
  "Other Services"
];

const paymentModes = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
];

const paymentStatuses = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partially_paid", label: "Partially Paid" },
];

export default function PaymentForm({ isOpen, onClose, payment, mode = "create" }: PaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      clientId: payment?.clientId || 0,
      serviceName: payment?.serviceName || "",
      feeAmount: payment?.feeAmount || "0",
      invoiceNumber: payment?.invoiceNumber || "",
      status: payment?.status || "unpaid",
      paymentMode: payment?.paymentMode || "",
      paymentDate: payment?.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : "",
      notes: payment?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPayment) => apiRequest("post", "/api/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Payment record created successfully",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payment record",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertPayment) => 
      apiRequest("put", `/api/payments/${payment?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Payment record updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment record",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPayment) => {
    const submitData = {
      ...data,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
    };
    
    if (mode === "edit") {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === "edit" ? "Edit Payment" : "Record Payment"}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="clientId">Client *</Label>
              <Select onValueChange={(value) => form.setValue("clientId", parseInt(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clientId && (
                <p className="text-sm text-destructive mt-1">
                  Please select a client
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="serviceName">Service Name *</Label>
              <Select onValueChange={(value) => form.setValue("serviceName", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.serviceName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.serviceName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="feeAmount">Fee Amount *</Label>
              <Input
                id="feeAmount"
                type="number"
                step="0.01"
                {...form.register("feeAmount")}
                placeholder="0.00"
                className="mt-1"
              />
              {form.formState.errors.feeAmount && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.feeAmount.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                {...form.register("invoiceNumber")}
                placeholder="Auto-generated if empty"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Payment Status *</Label>
              <Select onValueChange={(value) => form.setValue("status", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select onValueChange={(value) => form.setValue("paymentMode", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                {...form.register("paymentDate")}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes about the payment"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "edit" ? "Update Payment" : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
