import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertClientSchema, type InsertClient } from "@shared/schema";
import { X } from "lucide-react";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  client?: InsertClient & { id?: number };
  mode?: "create" | "edit";
}

const serviceOptions = [
  { id: "it_filing", label: "IT Filing" },
  { id: "gst", label: "GST" },
  { id: "tds", label: "TDS" },
  { id: "audit", label: "Audit" },
  { id: "roc", label: "ROC Filing" },
  { id: "others", label: "Others" },
];

const stateOptions = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function ClientForm({ isOpen, onClose, client, mode = "create" }: ClientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedServices, setSelectedServices] = useState<string[]>(client?.services || []);

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: client?.name || "",
      clientType: client?.clientType || "",
      contactNumber: client?.contactNumber || "",
      email: client?.email || "",
      whatsapp: client?.whatsapp || "",
      address: client?.address || "",
      state: client?.state || "",
      services: client?.services || [],
      notes: client?.notes || "",
      status: client?.status || "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertClient) => apiRequest("post", "/api/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      onClose();
      form.reset();
      setSelectedServices([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertClient) => 
      apiRequest("put", `/api/clients/${client?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertClient) => {
    const submitData = { ...data, services: selectedServices };
    if (mode === "edit") {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === "edit" ? "Edit Client" : "Add New Client"}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter client name"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="clientType">Client Type *</Label>
              <Select onValueChange={(value) => form.setValue("clientType", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="pvtltd">Pvt Ltd</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.clientType && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.clientType.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                {...form.register("contactNumber")}
                placeholder="+91 98765 43210"
                className="mt-1"
              />
              {form.formState.errors.contactNumber && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.contactNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="client@example.com"
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                {...form.register("whatsapp")}
                placeholder="+91 98765 43210"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Select onValueChange={(value) => form.setValue("state", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((state) => (
                    <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, '_')}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...form.register("address")}
              placeholder="Enter complete address"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>Services Availed</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {serviceOptions.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={(checked) => 
                      handleServiceChange(service.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={service.id} className="text-sm">
                    {service.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes or special instructions"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "edit" ? "Update Client" : "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
