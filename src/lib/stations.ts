export type StationId =
  | "green"
  | "healthy"
  | "digital"
  | "sustainable"
  | "innovation"
  | "entrepreneur";

export type StationIcon =
  | "leaf"
  | "heart"
  | "wifi"
  | "globe"
  | "city"
  | "star-person";

export interface Station {
  id: StationId;
  name: string;
  label: string;
  description: string;
  /** tailwind gradient classes */
  color: string;
  /** hex colors used for canvas / svg rendering */
  hex: string;
  hexDark: string;
  icon: StationIcon;
}

export const STATIONS: Station[] = [
  {
    id: "green",
    name: "Green Citizen",
    label: "Green Citizen",
    description: "Eco & Environment — trees, recycling & a greener tomorrow",
    color: "from-green-500 to-emerald-600",
    hex: "#16a34a",
    hexDark: "#15803d",
    icon: "leaf",
  },
  {
    id: "healthy",
    name: "Healthy Citizen",
    label: "Healthy Citizen",
    description: "Health & Well-being — fitness, nutrition & a healthy mind",
    color: "from-rose-500 to-red-600",
    hex: "#e11d48",
    hexDark: "#be123c",
    icon: "heart",
  },
  {
    id: "digital",
    name: "Digital Citizen",
    label: "Digital Citizen",
    description: "Technology & Innovation — coding, AI & the digital world",
    color: "from-blue-500 to-sky-600",
    hex: "#2563eb",
    hexDark: "#1d4ed8",
    icon: "wifi",
  },
  {
    id: "sustainable",
    name: "Sustainable Citizen",
    label: "Sustainable Citizen",
    description: "Sustainability & Choices — clean energy & responsible living",
    color: "from-purple-500 to-fuchsia-600",
    hex: "#9333ea",
    hexDark: "#7e22ce",
    icon: "globe",
  },
  {
    id: "innovation",
    name: "Innovation Citizen",
    label: "Innovation Citizen",
    description: "Smart Cities & Innovation — future urban living",
    color: "from-indigo-600 to-blue-800",
    hex: "#4338ca",
    hexDark: "#3730a3",
    icon: "city",
  },
  {
    id: "entrepreneur",
    name: "Young Entrepreneur",
    label: "Young Entrepreneur",
    description: "Nation Builders — ideas, startups & the leaders of tomorrow",
    color: "from-amber-500 to-orange-600",
    hex: "#d97706",
    hexDark: "#b45309",
    icon: "star-person",
  },
];

export const STATION_MAP: Record<StationId, Station> = STATIONS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<StationId, Station>,
);
