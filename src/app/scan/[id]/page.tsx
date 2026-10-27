import { STATIONS } from "@/lib/stations";
import { ScanClient } from "./ScanClient";

// Pre-renders /scan/green, /scan/healthy, /scan/digital, /scan/sustainable,
// /scan/innovation, /scan/entrepreneur as real static HTML files at build
// time. This is required for GitHub Pages (and any static host) since there
// is no server available to render dynamic routes on demand.
export function generateStaticParams() {
  return STATIONS.map((station) => ({ id: station.id }));
}

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScanClient id={id} />;
}
