import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      await login(data.username, data.password);
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="text-primary-foreground text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">TaxConsult Pro</h2>
            <p className="text-gray-600 mt-2">Admin Access Required</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
