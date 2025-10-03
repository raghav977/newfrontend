import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Users, CheckCircle, AlertCircle } from "lucide-react";

export default function DashboardStats({ total, title = "Total Pending Rooms", variant = "pending" }) {
  // Config for different variants
  const config = {
    pending: {
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },
    total: {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    approved: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bg: "bg-green-100",
      text: "text-green-600",
    },
    rejected: {
      icon: <AlertCircle className="w-6 h-6 text-red-600" />,
      bg: "bg-red-100",
      text: "text-red-600",
    },
  };

  const { icon, bg, text } = config[variant] || config.total;

  return (
    <Card className="shadow-md hover:shadow-lg grid grid-cols-3 transition-shadow rounded-xl">
      <CardHeader className="flex flex-col items-center justify-center space-y-2 py-6">
        <div className={`w-12 h-12 flex items-center justify-center rounded-full ${bg}`}>
          {icon}
        </div>
        <CardTitle className={`text-lg font-semibold ${text}`}>{title}</CardTitle>
        <CardContent className={`text-3xl font-bold ${text}`}>{total}</CardContent>
      </CardHeader>
    </Card>
  );
}
