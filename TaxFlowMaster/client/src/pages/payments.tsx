import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import PaymentTable from "@/components/payments/payment-table";
import PaymentForm from "@/components/payments/payment-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Payment, Client } from "@shared/schema";

export default function Payments() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  return (
    <>
      <Header
        title="Fees & Payments"
        subtitle="Track payment status and manage invoices"
        onRecordPayment={() => setShowPaymentForm(true)}
        showQuickActions={false}
      />

      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="p-6">
            {paymentsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            ) : (
              <PaymentTable
                payments={payments}
                clients={clients}
                onEditPayment={handleEditPayment}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <PaymentForm
        isOpen={showPaymentForm}
        onClose={() => {
          setShowPaymentForm(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        mode={selectedPayment ? "edit" : "create"}
      />
    </>
  );
}
