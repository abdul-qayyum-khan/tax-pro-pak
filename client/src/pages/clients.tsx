import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { ClientModal } from "@/components/modals/client-modal";
import { TaskModal } from "@/components/modals/task-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { type Client } from "@shared/schema";
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus,
  Phone,
  Mail,
  FileText,
  Building
} from "lucide-react";

export default function Clients() {
  const [showClientModal, setShowClientModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [selectedClientForTask, setSelectedClientForTask] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete client", variant: "destructive" });
    },
  });

  const filteredClients = clients.filter((client: Client) =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.ntn?.includes(searchTerm)
  );

  const getClientTaskCount = (clientId: string) => {
    return tasks.filter((task: any) => task.clientId === clientId).length;
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleCreateTask = (clientId: string) => {
    setSelectedClientForTask(clientId);
    setShowTaskModal(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("Are you sure you want to delete this client? This will also delete all associated tasks.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setShowClientModal(false);
    setShowTaskModal(false);
    setSelectedClient(undefined);
    setSelectedClientForTask(undefined);
  };

  if (isLoading) {
    return (
      <>
        <Header
          title="Clients"
          subtitle="Manage your client database"
        />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
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
        title="Clients"
        subtitle="Manage your client database"
        onAddClick={() => setShowClientModal(true)}
        addButtonText="Add Client"
      />

      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search clients by name, email, phone, or NTN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No clients found" : "No clients yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Start by adding your first client to the system"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowClientModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client: Client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {client.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.fullName}</h3>
                        {client.ntn && (
                          <Badge variant="secondary" className="text-xs">
                            NTN: {client.ntn}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateTask(client.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Task
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {client.email}
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      {getClientTaskCount(client.id)} tasks
                    </div>
                  </div>

                  {client.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      {client.notes.length > 100 
                        ? `${client.notes.slice(0, 100)}...` 
                        : client.notes
                      }
                    </div>
                  )}

                  {/* Portal Credentials Summary */}
                  {client.portalCredentials && Object.keys(client.portalCredentials).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Object.keys(client.portalCredentials).map((portal) => (
                        <Badge key={portal} variant="outline" className="text-xs">
                          {portal.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ClientModal
        open={showClientModal}
        onClose={handleModalClose}
        client={selectedClient}
      />

      <TaskModal
        open={showTaskModal}
        onClose={handleModalClose}
        preselectedClientId={selectedClientForTask}
      />
    </>
  );
}
