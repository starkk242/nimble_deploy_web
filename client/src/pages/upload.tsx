import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { CloudUpload, Check, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/ui/file-upload";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const serverConfigSchema = z.object({
  name: z.string().min(1, "Server name is required").max(50, "Server name too long"),
  environment: z.enum(["production", "staging", "development"]),
  authentication: z.enum(["api_key", "bearer_token", "basic_auth", "none"]),
  rateLimit: z.number().min(1).max(10000),
});

type ServerConfig = z.infer<typeof serverConfigSchema>;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  endpointCount: number;
  resourceTypes: string[];
  hasAuthentication: boolean;
  spec?: any;
}

export default function Upload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<ServerConfig>({
    resolver: zodResolver(serverConfigSchema),
    defaultValues: {
      name: "",
      environment: "production",
      authentication: "api_key",
      rateLimit: 100,
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest('POST', '/api/validate-openapi', formData);
      return response.json();
    },
    onSuccess: (result: ValidationResult) => {
      setValidationResult(result);
      if (result.isValid && !form.getValues('name')) {
        // Auto-suggest server name from OpenAPI title
        const title = result.spec?.info?.title;
        if (title) {
          form.setValue('name', title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to validate OpenAPI specification",
        variant: "destructive",
      });
    },
  });

  const createServerMutation = useMutation({
    mutationFn: async (data: ServerConfig & { openApiSpec: any }) => {
      const response = await apiRequest('POST', '/api/servers', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Server Created",
        description: "Your MCP server is being generated and deployed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setLocation('/servers');
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to create MCP server",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setValidationResult(null);
    setIsValidating(true);
    
    try {
      await validateMutation.mutateAsync(file);
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: ServerConfig) => {
    if (!validationResult?.isValid || !validationResult.spec) {
      toast({
        title: "Validation Required",
        description: "Please upload and validate an OpenAPI specification first",
        variant: "destructive",
      });
      return;
    }

    await createServerMutation.mutateAsync({
      ...data,
      openApiSpec: validationResult.spec,
    });
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Deploy Your API</h1>
        <p className="text-lg text-gray-600">Upload your OpenAPI specification to automatically generate and deploy your MCP server</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-8">
          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Upload OpenAPI Definition</h2>
            <FileUpload
              onFileSelect={handleFileUpload}
              accept=".json,.yaml,.yml"
              maxSize={10 * 1024 * 1024} // 10MB
              uploadedFile={uploadedFile}
              isProcessing={isValidating}
            />
            <p className="text-sm text-gray-500 mt-2">Supports JSON and YAML formats (OpenAPI 3.0+)</p>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Validation Results</h2>
              {validationResult.isValid ? (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="font-medium">OpenAPI specification is valid</div>
                    <div className="text-sm mt-1">
                      Found {validationResult.endpointCount} endpoints across {validationResult.resourceTypes.length} resource types
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="font-medium">Validation failed</div>
                    <ul className="text-sm mt-1 list-disc list-inside">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {validationResult.warnings.length > 0 && (
                <Alert className="border-amber-200 bg-amber-50 mt-4">
                  <AlertDescription className="text-amber-800">
                    <div className="font-medium">Warnings</div>
                    <ul className="text-sm mt-1 list-disc list-inside">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Configuration Section */}
          {validationResult?.isValid && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Server Configuration</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server Name</FormLabel>
                          <FormControl>
                            <Input placeholder="my-api-server" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="environment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Environment</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select environment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="production">Production</SelectItem>
                              <SelectItem value="staging">Staging</SelectItem>
                              <SelectItem value="development">Development</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authentication"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authentication</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select authentication method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="api_key">API Key</SelectItem>
                              <SelectItem value="bearer_token">Bearer Token</SelectItem>
                              <SelectItem value="basic_auth">Basic Auth</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rateLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate Limiting (requests/minute)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rate limit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="100">100 req/min</SelectItem>
                              <SelectItem value="500">500 req/min</SelectItem>
                              <SelectItem value="1000">1000 req/min</SelectItem>
                              <SelectItem value="10000">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Generation Button */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button type="button" variant="outline" onClick={() => setLocation('/')}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createServerMutation.isPending || !validationResult?.isValid}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createServerMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2" size={16} />
                          Generate & Deploy
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
