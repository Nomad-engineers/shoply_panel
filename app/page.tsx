"use client";

import { Plus, Search, Filter, Download } from "lucide-react";

import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Status } from "@/components/ui/status";
import { Search as SearchComponent } from "@/components/ui/search";
import { FilterButton } from "@/components/ui/filter-button";

export default function Home() {
  return (
    <DashboardLayout
      header={
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              Отчеты
            </h1>
          </div>
        </div>
      }
    >
      <PageHeader
        title="Overview"
        subtitle="Manage your deliveries and track orders"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Orders</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">1,234</p>
            </div>
            <Badge variant="success">+12%</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Couriers</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">45</p>
            </div>
            <Status status="active" label="Online" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Pending Orders</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">23</p>
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Completed Today</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">89</p>
            </div>
            <Status status="success" label="Completed" />
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Recent Orders</h2>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((order) => (
            <div key={order} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-text-primary">Order #{1000 + order}</p>
                  <p className="text-sm text-text-secondary">Customer: John Doe</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={order % 2 === 0 ? "success" : "warning"}>
                  {order % 2 === 0 ? "Delivered" : "In Transit"}
                </Badge>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="clickable">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#5AC800]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-[#5AC800]" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1">Create New Order</h3>
            <p className="text-sm text-text-secondary">Add a new delivery order to the system</p>
          </div>
        </Card>

        <Card variant="clickable">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#04DCB4]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-[#04DCB4]" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1">Track Order</h3>
            <p className="text-sm text-text-secondary">Search and track existing orders</p>
          </div>
        </Card>

        <Card variant="clickable">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#0A1428]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Filter className="h-6 w-6 text-[#0A1428]" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1">Manage Couriers</h3>
            <p className="text-sm text-text-secondary">View and manage delivery couriers</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
