import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddClient?: () => void;
  onRecordPayment?: () => void;
  showQuickActions?: boolean;
}

export default function Header({ 
  title, 
  subtitle, 
  onAddClient, 
  onRecordPayment,
  showQuickActions = true 
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        {showQuickActions && (
          <div className="flex items-center space-x-4">
            {onAddClient && (
              <Button onClick={onAddClient} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            )}
            
            {onRecordPayment && (
              <Button 
                onClick={onRecordPayment} 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            )}
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
