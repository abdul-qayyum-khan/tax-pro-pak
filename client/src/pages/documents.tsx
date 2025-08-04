import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Upload, 
  Search,
  Filter,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Get documents from tasks that have file attachments
  const documents = tasks
    .filter((task: any) => task.fileUrls && task.fileUrls.length > 0)
    .flatMap((task: any) => {
      const client = clients.find((c: any) => c.id === task.clientId);
      return task.fileUrls.map((fileUrl: string, index: number) => ({
        id: `${task.id}-${index}`,
        name: `${task.title} - Document ${index + 1}`,
        url: fileUrl,
        taskTitle: task.title,
        clientName: client?.fullName || 'Unknown Client',
        serviceType: task.serviceType,
        uploadedAt: task.createdAt,
        size: '-- KB' // Would need actual file size from backend
      }));
    });

  const filteredDocuments = documents.filter((doc: any) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        title="Documents"
        subtitle="Manage client documents and file attachments"
        onAddClick={() => {/* TODO: Implement file upload */}}
        addButtonText="Upload Document"
      />

      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents by name, client, or task..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Type
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by Date
            </Button>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No documents found" : "No documents yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Documents will appear here when you upload files to tasks"
                }
              </p>
              {!searchTerm && (
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc: any) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {doc.clientName}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      {doc.taskTitle}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={getServiceTypeColor(doc.serviceType)}>
                        {doc.serviceType}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}