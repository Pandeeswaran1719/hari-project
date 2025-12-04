import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Bell, Calendar, Edit, Trash2, Plus, X, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertReminderSchema, type InsertReminder, type Reminder, type Client } from "@shared/schema";

const serviceOptions = [
  "IT Return Filing",
  "GST Filing",
  "GSTR-1",
  "GSTR-3B",
  "TDS Return",
  "Audit Submission",
  "ROC Filing",
  "Annual Return",
  "Other"
];

export default function Reminders() {
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading: remindersLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const clientsMap = new Map(clients.map(client => [client.id, client]));

  const form = useForm<InsertReminder>({
    resolver: zodResolver(insertReminderSchema),
    defaultValues: {
      clientId: 0,
      serviceName: "",
      dueDate: "",
      reminderDate: "",
      status: "pending",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertReminder) => apiRequest("post", "/api/reminders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Reminder created successfully",
      });
      handleCloseForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertReminder) => 
      apiRequest("put", `/api/reminders/${selectedReminder?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Success",
        description: "Reminder updated successfully",
      });
      handleCloseForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("delete", `/api/reminders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Reminder deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("put", `/api/reminders/${id}`, { status: "completed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Success",
        description: "Reminder marked as completed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reminder status",
        variant: "destructive",
      });
    },
  });

  const filteredReminders = reminders.filter(reminder => {
    const client = clientsMap.get(reminder.clientId);
    const clientName = client?.name || "";
    
    const matchesSearch = (
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesStatus = statusFilter === "all" || reminder.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenForm = (reminder?: Reminder) => {
    if (reminder) {
      setSelectedReminder(reminder);
      form.reset({
        clientId: reminder.clientId,
        serviceName: reminder.serviceName,
        dueDate: new Date(reminder.dueDate).toISOString().split('T')[0],
        reminderDate: reminder.reminderDate ? new Date(reminder.reminderDate).toISOString().split('T')[0] : "",
        status: reminder.status,
        notes: reminder.notes || "",
      });
    } else {
      setSelectedReminder(null);
      form.reset({
        clientId: 0,
        serviceName: "",
        dueDate: "",
        reminderDate: "",
        status: "pending",
        notes: "",
      });
    }
    setShowReminderForm(true);
  };

  const handleCloseForm = () => {
    setShowReminderForm(false);
    setSelectedReminder(null);
    form.reset();
  };

  const onSubmit = (data: InsertReminder) => {
    const submitData = {
      ...data,
      dueDate: new Date(data.dueDate),
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
    };
    
    if (selectedReminder) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const isOverdue = due < today && status === "pending";

    if (status === "completed") {
      return <Badge className="status-active">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge className="status-overdue">Overdue</Badge>;
    }
    return <Badge className="status-pending">Pending</Badge>;
  };

  const getUrgencyLevel = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Overdue", class: "bg-red-100 text-red-800 border-red-200" };
    if (diffDays === 0) return { label: "Today", class: "bg-red-100 text-red-800 border-red-200" };
    if (diffDays === 1) return { label: "Tomorrow", class: "bg-orange-100 text-orange-800 border-orange-200" };
    if (diffDays <= 3) return { label: `${diffDays} days`, class: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    if (diffDays <= 7) return { label: `${diffDays} days`, class: "bg-blue-100 text-blue-800 border-blue-200" };
    return { label: `${diffDays} days`, class: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const upcomingCount = reminders.filter(reminder => {
    const dueDate = new Date(reminder.dueDate);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= nextWeek && reminder.status === 'pending';
  }).length;

  const overdueCount = reminders.filter(reminder => {
    const dueDate = new Date(reminder.dueDate);
    const today = new Date();
    return dueDate < today && reminder.status === 'pending';
  }).length;

  const completedCount = reminders.filter(reminder => reminder.status === 'completed').length;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Header
        title="Due Dates & Reminders"
        subtitle="Track important deadlines and compliance dates"
        showQuickActions={false}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming (7 days)</p>
                  <p className="text-2xl font-bold text-orange-600">{upcomingCount}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bell className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Bell className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reminders</p>
                  <p className="text-2xl font-bold text-primary">{reminders.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Add Button */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search reminders..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reminder List</CardTitle>
          </CardHeader>
          <CardContent>
            {remindersLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading reminders...</p>
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" 
                    ? "No reminders found matching your filters" 
                    : "No reminders found. Add your first reminder to get started!"}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReminders.map((reminder) => {
                      const client = clientsMap.get(reminder.clientId);
                      const urgency = getUrgencyLevel(reminder.dueDate);
                      
                      return (
                        <TableRow key={reminder.id}>
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
                          <TableCell>{reminder.serviceName}</TableCell>
                          <TableCell>{formatDate(reminder.dueDate)}</TableCell>
                          <TableCell>
                            <Badge className={urgency.class}>
                              {urgency.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(reminder.status, reminder.dueDate)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {reminder.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markCompleteMutation.mutate(reminder.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Mark Complete
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenForm(reminder)}
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
                                    <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this reminder? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(reminder.id)}
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
          </CardContent>
        </Card>
      </main>

      {/* Reminder Form Dialog */}
      <Dialog open={showReminderForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {selectedReminder ? "Edit Reminder" : "Add New Reminder"}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleCloseForm}>
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
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...form.register("dueDate")}
                  className="mt-1"
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.dueDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="reminderDate">Reminder Date</Label>
                <Input
                  id="reminderDate"
                  type="date"
                  {...form.register("reminderDate")}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Additional notes about this reminder"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : selectedReminder ? "Update Reminder" : "Add Reminder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
