import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Reminder, Client } from "@shared/schema";

export default function UpcomingDeadlines() {
  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const clientsMap = new Map(clients.map(client => [client.id, client]));

  const upcomingReminders = reminders
    .filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= today && dueDate <= nextWeek && reminder.status === 'pending';
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const getUrgencyLevel = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: "Urgent", class: "bg-red-100 text-red-800" };
    if (diffDays <= 1) return { label: "Soon", class: "bg-orange-100 text-orange-800" };
    if (diffDays <= 3) return { label: `${diffDays} days`, class: "bg-yellow-100 text-yellow-800" };
    return { label: `${diffDays} days`, class: "bg-blue-100 text-blue-800" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <p className="text-sm text-muted-foreground">Next 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming deadlines in the next 7 days
            </p>
          ) : (
            upcomingReminders.map((reminder) => {
              const client = clientsMap.get(reminder.clientId);
              const urgency = getUrgencyLevel(reminder.dueDate);
              const bgClass = urgency.label === "Urgent" ? "bg-red-50 border-red-100" :
                             urgency.label === "Soon" ? "bg-orange-50 border-orange-100" :
                             urgency.label.includes("3") ? "bg-yellow-50 border-yellow-100" :
                             "bg-blue-50 border-blue-100";

              return (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-3 ${bgClass} rounded-lg border`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {client?.name || "Unknown Client"}
                    </p>
                    <p className="text-xs text-muted-foreground">{reminder.serviceName}</p>
                    <p className="text-xs font-medium mt-1">
                      Due: {formatDate(reminder.dueDate)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge className={urgency.class}>
                      {urgency.label}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" className="w-full text-primary hover:text-primary/80">
            View All Deadlines <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
