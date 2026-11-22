import ServiceDetailsView from "@/components/services/ServiceDetailsView";

export default function AdminServiceDetailsPage() {
  return (
    <ServiceDetailsView
      backHref="/dashboard/admin/manage-services"
      backLabel="Manage Services"
    />
  );
}