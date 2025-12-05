"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TabsExample() {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Tabs Example</CardTitle>
        <CardDescription>
          Example of tabs with green active button styling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="text-foreground font-medium">Products Content</div>
            <p className="text-muted text-sm">
              This is the products tab content. When active, the Products tab button has a green background.
            </p>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="text-foreground font-medium">Analytics Content</div>
            <p className="text-muted text-sm">
              This is the analytics tab content. When active, the Analytics tab button has a green background.
            </p>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="text-foreground font-medium">Reports Content</div>
            <p className="text-muted text-sm">
              This is the reports tab content. When active, the Reports tab button has a green background.
            </p>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="text-foreground font-medium">Customers Content</div>
            <p className="text-muted text-sm">
              This is the customers tab content. When active, the Customers tab button has a green background.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}