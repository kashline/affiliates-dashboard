import { notFound } from "next/navigation";

// The root has no landing page — it must not reveal the platform or list tenants.
// Visitors reach a storefront only via its opaque slug.
export default function RootPage() {
  notFound();
}
