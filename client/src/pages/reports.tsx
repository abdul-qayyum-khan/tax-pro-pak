import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  Download, 
  TrendingUp,
  Calendar,
  Users,
  Building,
  Landmark,
  Truck,
  University,
  Copyright,
  FileText,
  Clock,
  CheckCircle
} from "lucide-react";
import { format, subMonths, differenceInDays } from "date-fns";

export default function Reports() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Generate reports data
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 6);

  // Service type distribution
  const serviceStats = tasks.reduce((acc: any, task: any) => {
    acc[task.serviceType] = (acc[task.serviceType] || 0) + 1;
    return acc;
  }, {});

  // Monthly completion stats
  const monthlyStats = Array.from({length: 6}, (_, i) => {
    const month = subMonths(now, i);
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const completed = tasks.filter((task: any) => 
      task.status === 'completed' && 
      task.updatedAt &&
      new Date(task.updatedAt) >= monthStart && 
      new Date(task.updatedAt) <= monthEnd
    ).length;

    return {
      month: format(month, 'MMM yyyy'),
      completed
    };
  }).reverse();

  // Client activity report
  const clientActivity = clients.map((client: any) => {
    const clientTasks = tasks.filter((task: any) => task.clientId === client.id);
    const completedTasks = clientTasks.filter((task: any) => task.status === 'completed').length;
    const pendingTasks = clientTasks.filter((task: any) => task.status === 'pending').length;
    const overdueTasks = clientTasks.filter((task: any) => 
      task.deadline && 
      new Date(task.deadline) < now && 
      task.status !== 'completed'
    ).length;

    return {
      client,
      totalTasks: clientTasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: clientTasks.length > 0 ? Math.round((completedTasks / clientTasks.length) * 100) : 0
    };
  }).sort((a, b) => b.totalTasks - a.totalTasks);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'FBR': return <Building className="w-4 h-4" />;
      case 'SECP': return <Landmark className="w-4 h-4" />;
      case 'PSW': return <Truck className="w-4 h-4" />;
      case 'PRA': return <University className="w-4 h-4" />;
      case 'IPO': return <Copyright className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'FBR': return 'bg-blue-100 text-blue-800';
      case 'SECP': return 'bg-green-100 text-green-800';
      case 'PSW': return 'bg-orange-100 text-orange-800';
      case 'PRA': return 'bg-purple-100 text-purple-800';
      case 'IPO': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Header
        title="Reports & Analytics"
        subtitle="Insights and performance metrics for your tax consultancy"
        onAddClick={() => {/* TODO: Export functionality */}}
        addButtonText="Export Report"
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">PKR 0</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Feature coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">Total registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter((t: any) => t.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.length > 0 ? Math.round((tasks.filter((t: any) => t.status === 'completed').length / tasks.length) * 100) : 0}%
                  </p>
                </div>
                <BarChart className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2">Success rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="w-5 h-5" />
                <span>Service Type Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(serviceStats).map(([service, count]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getServiceIcon(service)}
                      <span className="font-medium">{service}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getServiceTypeColor(service)}>
                        {count} tasks
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round((Number(count) / tasks.length) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
                {Object.keys(serviceStats).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No tasks yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Completion Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Monthly Completion Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.map((month) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="font-medium">{month.month}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((month.completed / Math.max(...monthlyStats.map(m => m.completed))) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{month.completed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Activity Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Client Activity Report</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Tasks</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Overdue</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clientActivity.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No client data available
                      </td>
                    </tr>
                  ) : (
                    clientActivity.slice(0, 10).map((item) => (
                      <tr key={item.client.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary text-xs font-medium">
                                {item.client.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.client.fullName}</p>
                              {item.client.ntn && (
                                <p className="text-xs text-gray-500">NTN: {item.client.ntn}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{item.totalTasks}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {item.completedTasks}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {item.pendingTasks}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {item.overdueTasks > 0 ? (
                            <Badge variant="destructive">{item.overdueTasks}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${item.completionRate >= 80 ? 'bg-green-600' : item.completionRate >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                style={{ width: `${item.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{item.completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}