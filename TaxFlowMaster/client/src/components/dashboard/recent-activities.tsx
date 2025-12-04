import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UserPlus, FileText, AlertTriangle, FileCheck } from "lucide-react";

// This would come from an API in a real application
const mockActivities = [
  {
    id: 1,
    type: "payment",
    icon: CheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Payment received from Raj Enterprises",
    subtitle: "GST Filing fee - ₹5,000",
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    type: "client",
    icon: UserPlus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "New client added: Priya Textiles",
    subtitle: "Services: IT Filing, GST",
    timestamp: "4 hours ago"
  },
  {
    id: 3,
    type: "invoice",
    icon: FileText,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    title: "Invoice generated for Mumbai Motors",
    subtitle: "TDS Return - ₹3,500",
    timestamp: "6 hours ago"
  },
  {
    id: 4,
    type: "overdue",
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Payment overdue: Global Tech Solutions",
    subtitle: "Audit fee - ₹15,000",
    timestamp: "1 day ago"
  },
  {
    id: 5,
    type: "kyc",
    icon: FileCheck,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "KYC documents updated for Sharma Industries",
    subtitle: "PAN and Aadhaar verified",
    timestamp: "2 days ago"
  }
];

export default function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <p className="text-sm text-muted-foreground">Latest updates from your practice</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`${activity.iconColor} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
