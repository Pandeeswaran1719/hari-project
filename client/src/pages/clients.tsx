import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ClientTable from "@/components/clients/client-table";
import ClientForm from "@/components/clients/client-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Client } from "@shared/schema";

export default function Clients() {
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const handleViewClient = (client: Client) => {
    // In a full implementation, this would open a detailed client view
    console.log("View client:", client);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientForm(true);
  };

  return (
    <>
      <Header
        title="Clients"
        subtitle="Manage your client database and information"
        onAddClient={() => setShowClientForm(true)}
        showQuickActions={false}
      />

      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading clients...</p>
              </div>
            ) : (
              <ClientTable
                clients={clients}
                onEditClient={handleEditClient}
                onViewClient={handleViewClient}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <ClientForm
        isOpen={showClientForm}
        onClose={() => {
          setShowClientForm(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        mode={selectedClient ? "edit" : "create"}
      />
    </>
  );
}
