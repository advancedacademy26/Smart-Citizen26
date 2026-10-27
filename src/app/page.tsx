"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generatePassportNumber, getVisitor, saveVisitor, type Visitor } from "@/lib/storage";
import { SCHOOL_NAME, EVENT_NAME, EVENT_SUBTITLE, EVENT_THEME } from "@/lib/branding";

const AUTO_REDIRECT_SECONDS = 3;

export default function HomePage() {
  const router = useRouter();
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [registeredVisitor, setRegisteredVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If this visitor already registered on this device, skip straight to the dashboard.
  useEffect(() => {
    const v = getVisitor();
    if (v) {
      router.replace("/dashboard");
      return;
    }
    setCheckingExisting(false);
  }, [router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !className.trim() || !section.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    const newVisitor: Visitor = {
      name: name.trim(),
      className: className.trim(),
      section: section.trim().toUpperCase(),
      registeredAt: Date.now(),
      passportNumber: generatePassportNumber(),
    };
    saveVisitor(newVisitor);
    setTimeout(() => {
      setRegisteredVisitor(newVisitor);
      setLoading(false);
    }, 500);
  };

  if (checkingExisting) {
    return (
      <main className="min-h-screen grid place-items-center confetti-bg">
        <div className="text-slate-400 text-sm">Loading...</div>
      </main>
    );
  }

  if (registeredVisitor) {
    return <RegisteredRedirect visitor={registeredVisitor} />;
  }

  return (
    <main className="min-h-screen confetti-bg flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block text-5xl mb-3">🇮🇳</div>
          <p className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">{SCHOOL_NAME}</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 via-rose-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            {EVENT_NAME}
          </h1>
          <p className="mt-1 text-slate-700 font-semibold text-sm">{EVENT_SUBTITLE}</p>
          <p className="text-slate-500 text-xs uppercase tracking-wide">{EVENT_THEME}</p>
        </div>

        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-4">
            🎟️ Visitor Registration
          </h2>

          {error && (
            <div className="mb-3 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Class
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                >
                  <option value="">Select</option>
                  {["6", "7", "8", "9", "10", "11", "12", "Parent", "Guest"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Section
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="A, B, C..."
                  maxLength={3}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base uppercase focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering...
                </>
              ) : (
                <>✨ Register & Get Passport</>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            By registering, you'll be taken straight to your Dashboard with your digital passport,
            welcome message, exhibition route & stamp collection!
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/admin" className="text-xs text-slate-400 hover:text-slate-600 underline">
            Admin: Print QR Codes
          </Link>
        </div>
      </div>
    </main>
  );
}

/**
 * Shown for a couple of seconds right after a successful registration,
 * then automatically redirects to /dashboard. This is what makes
 * "scan QR -> fill details -> dashboard" feel instant and automatic.
 */
function RegisteredRedirect({ visitor }: { visitor: Visitor }) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/dashboard");
      }
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, router]);

  const progress = ((AUTO_REDIRECT_SECONDS - secondsLeft) / AUTO_REDIRECT_SECONDS) * 100;

  return (
    <main className="min-h-screen confetti-bg flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="bounce-in">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl shadow-emerald-300 mb-5">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
          Welcome, {visitor.name}! 🎉
        </h1>
        <p className="text-slate-600 mb-1 text-sm">
          Class {visitor.className} - Section {visitor.section}
        </p>
        <p className="text-slate-500 text-xs mb-6 font-mono">
          Passport No: {visitor.passportNumber}
        </p>

        <div className="card p-5 mb-5">
          <p className="text-sm text-slate-700 font-semibold mb-3">
            Taking you to your Dashboard...
          </p>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 via-rose-500 to-purple-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => router.replace("/dashboard")}
          className="btn-primary w-full text-lg py-4"
        >
          🚀 Go Now
        </button>

        <p className="mt-4 text-xs text-slate-400">
          Your data is saved locally on this device for the exhibition.
        </p>
      </div>
    </main>
  );
}
