import React from "react";
import { CreateServiceForm } from "@/components/dashboard/CreateServiceForm";

export default function ManageServicesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
          Manage Services
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Add new salon services and manage existing offerings
        </p>
      </div>

      {/* Service creation form section */}
      <CreateServiceForm />
    </div>
  );
}