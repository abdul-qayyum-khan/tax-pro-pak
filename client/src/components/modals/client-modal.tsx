import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertClientSchema, type Client, type InsertClient } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield, Building, Landmark, Truck, University, Copyright } from "lucide-react";

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client;
}

export function ClientModal({ open, onClose, client }: ClientModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!client;

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      fullName: client?.fullName || "",
      email: client?.email || "",
      phone: client?.phone || "",
      cnic: client?.cnic || "",
      ntn: client?.ntn || "",
      portalCredentials: client?.portalCredentials || {},
      notes: client?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertClient) => apiRequest("POST", "/api/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client created successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to create client", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertClient) => 
      apiRequest("PUT", `/api/clients/${client!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client updated successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to update client", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertClient) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const portals = [
    { key: "fbr", label: "FBR Portal", icon: Building, color: "text-blue-600" },
    { key: "secp", label: "SECP Portal", icon: Landmark, color: "text-green-600" },
    { key: "psw", label: "PSW Portal", icon: Truck, color: "text-orange-600" },
    { key: "pra", label: "PRA Portal", icon: University, color: "text-purple-600" },
    { key: "ipo", label: "IPO Portal", icon: Copyright, color: "text-pink-600" },
  ];

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Muhammad Ahmad Khan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="client@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+92 300 1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNIC Number</FormLabel>
                      <FormControl>
                        <Input placeholder="42101-1234567-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ntn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NTN Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Portal Credentials */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Credentials</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <Shield className="text-yellow-600 mt-1 mr-3 w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      All portal credentials are encrypted and stored securely.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portals.map(({ key, label, icon: Icon, color }) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Icon className={`${color} mr-2 w-4 h-4`} />
                      {label}
                    </h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`portalCredentials.${key}.username` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder={`${key.toUpperCase()} Username`}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`portalCredentials.${key}.password` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={`${key.toUpperCase()} Password`}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this client..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? "Update Client" : "Save Client"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
