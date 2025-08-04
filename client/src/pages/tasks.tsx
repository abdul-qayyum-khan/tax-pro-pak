import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { TaskModal } from "@/components/modals/task-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { type Task } from "@shared/schema";
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus,
  Calendar,
  Clock,
  FileText,
  Building,
  Landmark,
  Truck,
  University,
  Copyright
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Tasks() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest("PUT", `/api/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update task status", variant: "destructive" });
    },
  });

  const filteredTasks = tasks.filter((task: Task) => {
    const client = clients.find((c: any) => c.id === task.clientId);
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesService = serviceFilter === "all" || task.serviceType === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  const getServiceTypeIcon = (type: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null;
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining < 0) return { text: 'Overdue', color: 'text-red-600', urgent: true };
    if (daysRemaining <= 2) return { text: `${daysRemaining}d left`, color: 'text-orange-600', urgent: true };
    return { text: `${daysRemaining}d left`, color: 'text-green-600', urgent: false };
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const handleModalClose = () => {
    setShowTaskModal(false);
    setSelectedTask(undefined);
  };

  // Sort tasks by deadline and status
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Overdue tasks first
    if (a.deadline && b.deadline) {
      const aOverdue = new Date(a.deadline) < new Date();
      const bOverdue = new Date(b.deadline) < new Date();
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <>
        <Header title="Tasks & Processes" subtitle="Track and manage client tasks" />
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Tasks & Processes"
        subtitle="Track and manage client tasks"
        onAddClick={() => setShowTaskModal(true)}
        addButtonText="Create Task"
      />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks by title, description, or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="FBR">FBR</SelectItem>
                <SelectItem value="SECP">SECP</SelectItem>
                <SelectItem value="PSW">PSW</SelectItem>
                <SelectItem value="PRA">PRA</SelectItem>
                <SelectItem value="IPO">IPO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks List */}
        {sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" || serviceFilter !== "all" 
                  ? "No tasks found" 
                  : "No tasks yet"
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all" || serviceFilter !== "all"
                  ? "Try adjusting your search terms or filters" 
                  : "Start by creating your first task"
                }
              </p>
              {!searchTerm && statusFilter === "all" && serviceFilter === "all" && (
                <Button onClick={() => setShowTaskModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task: Task) => {
              const client = clients.find((c: any) => c.id === task.clientId);
              const deadlineStatus = task.deadline ? getDeadlineStatus(task.deadline) : null;
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <Badge className={getServiceTypeColor(task.serviceType)}>
                            <span className="flex items-center space-x-1">
                              {getServiceTypeIcon(task.serviceType)}
                              <span>{task.serviceType}</span>
                            </span>
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="font-medium">{client?.fullName || 'Unknown Client'}</span>
                          {task.deadline && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                              {deadlineStatus && (
                                <span className={`font-medium ${deadlineStatus.color}`}>
                                  ({deadlineStatus.text})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {deadlineStatus?.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            {task.status !== 'completed' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(task.id, 'completed')}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <TaskModal
        open={showTaskModal}
        onClose={handleModalClose}
        task={selectedTask}
      />
    </>
  );
}
