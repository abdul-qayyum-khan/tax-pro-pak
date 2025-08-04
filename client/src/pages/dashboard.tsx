import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { ClientModal } from "@/components/modals/client-modal";
import { TaskModal } from "@/components/modals/task-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Building,
  Truck,
  Copyright,
  TrendingUp
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Dashboard() {
  const [showClientModal, setShowClientModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Get recent activity from tasks
  const recentTasks = tasks
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // Get upcoming deadlines
  const upcomingDeadlines = tasks
    .filter((task: any) => task.deadline && task.status !== 'completed')
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'FBR': return <Building className="w-4 h-4" />;
      case 'SECP': return <Building className="w-4 h-4" />;
      case 'PSW': return <Truck className="w-4 h-4" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (daysRemaining <= 2) return { text: `${daysRemaining} days remaining`, color: 'text-orange-600' };
    return { text: `${daysRemaining} days remaining`, color: 'text-green-600' };
  };

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Overview of your tax consultancy operations"
        onAddClick={() => setShowClientModal(true)}
        addButtonText="Add Client"
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.totalClients || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">Growing</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasks Due This Week</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats?.tasksDueThisWeek || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-orange-600 font-medium">Attention needed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {stats?.overdueTasks || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-red-600 font-medium">
                  {stats?.overdueTasks ? 'Action needed' : 'All on track'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed This Month</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats?.completedThisMonth || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">Productive</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6 space-y-4">
                {recentTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  recentTasks.map((task: any) => {
                    const client = clients.find((c: any) => c.id === task.clientId);
                    return (
                      <div key={task.id} className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {getServiceTypeIcon(task.serviceType)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{client?.fullName || 'Unknown Client'}</span> - {task.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(task.updatedAt), 'PPp')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowClientModal(true)}
              >
                <Users className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Add New Client</p>
                  <p className="text-sm text-gray-500">Register a new client profile</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowTaskModal(true)}
              >
                <FileText className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Create Task</p>
                  <p className="text-sm text-gray-500">Assign new task to client</p>
                </div>
              </Button>
            </div>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <Card className="mt-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No upcoming deadlines
                    </td>
                  </tr>
                ) : (
                  upcomingDeadlines.map((task: any) => {
                    const client = clients.find((c: any) => c.id === task.clientId);
                    const deadlineStatus = getDeadlineStatus(task.deadline);
                    
                    return (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary text-sm font-medium">
                                {client?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'UN'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {client?.fullName || 'Unknown Client'}
                              </p>
                              {client?.ntn && (
                                <p className="text-xs text-gray-500">NTN: {client.ntn}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{task.title}</p>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={getServiceTypeColor(task.serviceType)}>
                            {task.serviceType}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">
                            {format(new Date(task.deadline), 'MMM dd, yyyy')}
                          </p>
                          <p className={`text-xs ${deadlineStatus.color}`}>
                            {deadlineStatus.text}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ClientModal
        open={showClientModal}
        onClose={() => setShowClientModal(false)}
      />

      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
      />
    </>
  );
}
