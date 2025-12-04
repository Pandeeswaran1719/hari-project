import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import MetricCard from "@/components/dashboard/metric-card";
import RecentActivities from "@/components/dashboard/recent-activities";
import UpcomingDeadlines from "@/components/dashboard/upcoming-deadlines";
import ClientTable from "@/components/clients/client-table";
import ClientForm from "@/components/clients/client-form";
import PaymentForm from "@/components/payments/payment-form";
import { Users, Calendar, AlertTriangle, DollarSign } from "lucide-react";
import type { Client } from "@shared/schema";

export default function Dashboard() {
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const recentClients = clients.slice(0, 3);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    // In a full implementation, this would open a client details view
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientForm(true);
  };

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your practice today."
        onAddClient={() => setShowClientForm(true)}
        onRecordPayment={() => setShowPaymentForm(true)}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Clients"
            value={metricsLoading ? "..." : metrics?.totalClients || 0}
            icon={Users}
            iconBgColor="bg-blue-100"
            iconColor="text-primary"
            trend={{
              value: "12% from last month",
              isPositive: true
            }}
          />
          
          <MetricCard
            title="Upcoming Due Dates"
            value={metricsLoading ? "..." : metrics?.upcomingDues || 0}
            subtitle="Next 7 days"
            icon={Calendar}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          
          <MetricCard
            title="Outstanding Payments"
            value={metricsLoading ? "..." : formatCurrency(metrics?.outstandingAmount || 0)}
            subtitle="From multiple clients"
            icon={AlertTriangle}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
          />
          
          <MetricCard
            title="Paid This Month"
            value={metricsLoading ? "..." : formatCurrency(metrics?.monthlyRevenue || 0)}
            icon={DollarSign}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            trend={{
              value: "18% vs last month",
              isPositive: true
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <RecentActivities />
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <UpcomingDeadlines />
          </div>
        </div>

        {/* Recent Clients Table */}
        <div className="mt-8 bg-white dark:bg-card rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Recent Clients</h3>
                <p className="text-sm text-muted-foreground mt-1">Latest additions to your client base</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {clientsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading clients...</p>
              </div>
            ) : recentClients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No clients found. Add your first client to get started!</p>
              </div>
            ) : (
              <ClientTable
                clients={recentClients}
                onEditClient={handleEditClient}
                onViewClient={handleViewClient}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ClientForm
        isOpen={showClientForm}
        onClose={() => {
          setShowClientForm(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        mode={selectedClient ? "edit" : "create"}
      />

      <PaymentForm
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
      />
    </>
  );
}
