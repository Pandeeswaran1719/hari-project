import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, BarChart3, TrendingUp, DollarSign, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Payment, Client, Reminder } from "@shared/schema";

export default function Reports() {
  const [reportType, setReportType] = useState<string>("revenue");
  const [dateRange, setDateRange] = useState<string>("current_month");
  const { toast } = useToast();

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const clientsMap = new Map(clients.map(client => [client.id, client]));

  const getDateRangeFilter = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (dateRange) {
      case "current_month":
        return (date: Date) => date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      case "last_month":
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return (date: Date) => date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      case "current_year":
        return (date: Date) => date.getFullYear() === currentYear;
      case "last_year":
        return (date: Date) => date.getFullYear() === currentYear - 1;
      default:
        return () => true;
    }
  };

  const dateFilter = getDateRangeFilter();

  // Revenue Report Data
  const revenueData = payments
    .filter(payment => {
      const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.createdAt || "");
      return payment.status === "paid" && dateFilter(paymentDate);
    })
    .map(payment => ({
      ...payment,
      client: clientsMap.get(payment.clientId),
      amount: parseFloat(payment.feeAmount.toString())
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalRevenue = revenueData.reduce((sum, payment) => sum + payment.amount, 0);
  const averageTransaction = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  // Outstanding Payments Report
  const outstandingData = payments
    .filter(payment => payment.status === "unpaid" || payment.status === "partially_paid")
    .map(payment => ({
      ...payment,
      client: clientsMap.get(payment.clientId),
      amount: parseFloat(payment.feeAmount.toString())
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalOutstanding = outstandingData.reduce((sum, payment) => sum + payment.amount, 0);

  // Client Report Data
  const clientData = clients.map(client => {
    const clientPayments = payments.filter(p => p.clientId === client.id);
    const paidPayments = clientPayments.filter(p => p.status === "paid");
    const unpaidPayments = clientPayments.filter(p => p.status === "unpaid" || p.status === "partially_paid");
    
    return {
      ...client,
      totalPayments: clientPayments.length,
      paidAmount: paidPayments.reduce((sum, p) => sum + parseFloat(p.feeAmount.toString()), 0),
      unpaidAmount: unpaidPayments.reduce((sum, p) => sum + parseFloat(p.feeAmount.toString()), 0),
      services: client.services?.length || 0
    };
  }).sort((a, b) => b.paidAmount - a.paidAmount);

  // Service Performance Data
  const serviceData = payments.reduce((acc, payment) => {
    const service = payment.serviceName;
    if (!acc[service]) {
      acc[service] = {
        name: service,
        count: 0,
        revenue: 0,
        paid: 0,
        unpaid: 0
      };
    }
    
    acc[service].count++;
    const amount = parseFloat(payment.feeAmount.toString());
    acc[service].revenue += amount;
    
    if (payment.status === "paid") {
      acc[service].paid += amount;
    } else {
      acc[service].unpaid += amount;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const serviceArray = Object.values(serviceData).sort((a: any, b: any) => b.revenue - a.revenue);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "current_month": return "This Month";
      case "last_month": return "Last Month";
      case "current_year": return "This Year";
      case "last_year": return "Last Year";
      default: return "All Time";
    }
  };

  const handleExportData = () => {
    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case "revenue":
        csvContent = "Client,Service,Amount,Payment Date,Invoice Number\n";
        revenueData.forEach(payment => {
          csvContent += `"${payment.client?.name || 'Unknown'}","${payment.serviceName}","${payment.amount}","${formatDate(payment.paymentDate)}","${payment.invoiceNumber}"\n`;
        });
        filename = `revenue-report-${dateRange}.csv`;
        break;
      case "outstanding":
        csvContent = "Client,Service,Amount,Due Date,Invoice Number\n";
        outstandingData.forEach(payment => {
          csvContent += `"${payment.client?.name || 'Unknown'}","${payment.serviceName}","${payment.amount}","${formatDate(payment.createdAt)}","${payment.invoiceNumber}"\n`;
        });
        filename = `outstanding-report-${dateRange}.csv`;
        break;
      case "clients":
        csvContent = "Client Name,Services Count,Paid Amount,Unpaid Amount,Total Payments\n";
        clientData.forEach(client => {
          csvContent += `"${client.name}","${client.services}","${client.paidAmount}","${client.unpaidAmount}","${client.totalPayments}"\n`;
        });
        filename = `clients-report-${dateRange}.csv`;
        break;
      case "services":
        csvContent = "Service,Total Count,Total Revenue,Paid Amount,Unpaid Amount\n";
        serviceArray.forEach((service: any) => {
          csvContent += `"${service.name}","${service.count}","${service.revenue}","${service.paid}","${service.unpaid}"\n`;
        });
        filename = `services-report-${dateRange}.csv`;
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded`,
    });
  };

  const renderReportContent = () => {
    switch (reportType) {
      case "revenue":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold text-primary">{revenueData.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Average Transaction</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(averageTransaction)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Invoice #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.client?.name || "Unknown"}</TableCell>
                      <TableCell>{payment.serviceName}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.invoiceNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "outstanding":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
                    <p className="text-2xl font-bold text-orange-600">{outstandingData.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Average Outstanding</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {outstandingData.length > 0 ? formatCurrency(totalOutstanding / outstandingData.length) : formatCurrency(0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingData.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.client?.name || "Unknown"}</TableCell>
                      <TableCell>{payment.serviceName}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge className={payment.status === "unpaid" ? "status-overdue" : "status-pending"}>
                          {payment.status === "unpaid" ? "Unpaid" : "Partially Paid"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.invoiceNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "clients":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-bold text-primary">{clientData.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold text-green-600">
                      {clientData.filter(client => client.status === "active").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Average Revenue/Client</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {clientData.length > 0 ? formatCurrency(totalRevenue / clientData.length) : formatCurrency(0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Services Count</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Unpaid Amount</TableHead>
                    <TableHead>Total Payments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientData.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.services}</TableCell>
                      <TableCell className="font-mono text-green-600">{formatCurrency(client.paidAmount)}</TableCell>
                      <TableCell className="font-mono text-red-600">{formatCurrency(client.unpaidAmount)}</TableCell>
                      <TableCell>{client.totalPayments}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "services":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Services</p>
                    <p className="text-2xl font-bold text-primary">{serviceArray.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Top Service</p>
                    <p className="text-lg font-bold text-green-600">
                      {serviceArray[0]?.name || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Service Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(serviceArray.reduce((sum: number, service: any) => sum + service.revenue, 0))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Total Count</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Unpaid Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceArray.map((service: any) => (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.count}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(service.revenue)}</TableCell>
                      <TableCell className="font-mono text-green-600">{formatCurrency(service.paid)}</TableCell>
                      <TableCell className="font-mono text-red-600">{formatCurrency(service.unpaid)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      default:
        return <div>Select a report type to view data</div>;
    }
  };

  return (
    <>
      <Header
        title="Reports"
        subtitle="Analyze your practice performance and generate insights"
        showQuickActions={false}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Report Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Report Type
                </label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue Report</SelectItem>
                    <SelectItem value="outstanding">Outstanding Payments</SelectItem>
                    <SelectItem value="clients">Client Performance</SelectItem>
                    <SelectItem value="services">Service Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="current_year">This Year</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleExportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {reportType === "revenue" && "Revenue Report"}
                {reportType === "outstanding" && "Outstanding Payments Report"}
                {reportType === "clients" && "Client Performance Report"}
                {reportType === "services" && "Service Analysis Report"}
              </span>
              <Badge variant="outline">{getDateRangeLabel()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderReportContent()}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
