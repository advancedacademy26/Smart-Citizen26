"use client";

import { STATIONS, type StationId } from "./stations";

export interface Visitor {
  name: string;
  className: string;
  section: string;
  registeredAt: number;
  passportNumber: string;
}

const VISITOR_KEY = "exhibition_visitor";
const STAMPS_KEY = "exhibition_stamps";
const CERTIFICATE_KEY = "exhibition_cert_issued";

export function generatePassportNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `CD-${timestamp}${random}`;
}

export function getVisitor(): Visitor | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VISITOR_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Visitor;
  } catch {
    return null;
  }
}

export function saveVisitor(v: Visitor): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VISITOR_KEY, JSON.stringify(v));
}

export function clearVisitor(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VISITOR_KEY);
  localStorage.removeItem(STAMPS_KEY);
  localStorage.removeItem(CERTIFICATE_KEY);
}

export function getCollectedStamps(): StationId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STAMPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StationId[];
  } catch {
    return [];
  }
}

export function addStamp(stationId: StationId): StationId[] {
  const existing = getCollectedStamps();
  if (!existing.includes(stationId)) {
    const updated = [...existing, stationId];
    localStorage.setItem(STAMPS_KEY, JSON.stringify(updated));
    if (updated.length === STATIONS.length) {
      localStorage.setItem(CERTIFICATE_KEY, new Date().toISOString());
    }
    return updated;
  }
  return existing;
}

export function hasCollectedAll(): boolean {
  return getCollectedStamps().length === STATIONS.length;
}

export function isStampCollected(id: StationId): boolean {
  return getCollectedStamps().includes(id);
}

export function getCertificateIssuedAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CERTIFICATE_KEY);
}
