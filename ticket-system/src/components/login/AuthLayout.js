// AuthLayout.js
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card";
  import { UserCog } from "lucide-react";
  
  export default function AuthLayout({ children }) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <UserCog className="h-6 w-6" />
              Worker Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the worker dashboard
            </CardDescription>
          </CardHeader>
          {children}
        </Card>
      </div>
    );
  }