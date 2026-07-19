import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowRightIcon, MailIcon, PlaneMark, WhatsAppIcon } from "@/components/icons";

type FlightStatus = "on_time" | "delayed" | "cancelled";

type TrackedFlight = {
  id: string;
  flight_number: string;
  origin: string;
  destination: string;
  gate: string | null;
  last_status: FlightStatus;
  delay_minutes: number;
  customer_email: string | null;
  customer_whatsapp: string | null;
  active: boolean;
  last_updated: string;
};

type FeedEvent = {
  id: string;
  channel: "whatsapp" | "email";
  message: string;
  timestamp: string;
};

const AIRLINE_NAMES: Record<string, string> = {
  AA: "American Airlines",
  DL: "Delta Air Lines",
  UA: "United Airlines",
  WN: "Southwest Airlines",
  AS: "Alaska Airlines",
  B6: "JetBlue Airways",
  NK: "Spirit Airlines",
  F9: "Frontier Airlines",
  BA: "British Airways",
  AF: "Air France",
  LH: "Lufthansa",
  EK: "Emirates",
  QF: "Qantas",
  AC: "Air Canada",
  SQ: "Singapore Airlines",
  CX: "Cathay Pacific",
  QR: "Qatar Airways",
  TK: "Turkish Airlines",
  JL: "Japan Airlines",
  NH: "All Nippon Airways",
};

const STATUS_BADGES: Record<FlightStatus, { label: string; classes: string }> = {
  on_time: {
    label: "ON TIME",
    classes: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  },
  delayed: {
    label: "DELAYED",
    classes: "border-amber-400/30 bg-amber-400/10 text-amber-400",
  },
  cancelled: {
    label: "CANCELLED",
    classes: "border-red-400/30 bg-red-400/10 text-red-400",
  },
};

function airlineFromFlightNumber(flightNumber: string): string {
  const code = flightNumber.trim().slice(0, 2).toUpperCase();
  return AIRLINE_NAMES[code] ?? code;
}

function formatRelativeTime(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function buildFeedEvents(flights: TrackedFlight[]): FeedEvent[] {
  const events: FeedEvent[] = [];

  for (const flight of flights) {
    const badge = STATUS_BADGES[flight.last_status];
    const detail =
      flight.last_status === "delayed" && flight.delay_minutes > 0
        ? `${badge.label} ${flight.delay_minutes}M`
        : badge.label;

    if (flight.customer_whatsapp) {
      events.push({
        id: `${flight.id}-whatsapp`,
        channel: "whatsapp",
        message: `${flight.flight_number} ${detail} — notified via WhatsApp`,
        timestamp: flight.last_updated,
      });
    }

    if (flight.customer_email) {
      events.push({
        id: `${flight.id}-email`,
        channel: "email",
        message: `${flight.flight_number} ${detail} — notified via email`,
        timestamp: flight.last_updated,
      });
    }
  }

  return events.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

function StatCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="rounded-lg border border-deck-gold-dim/20 bg-deck-panel px-5 py-4">
      <p className="font-mono text-xs tracking-[0.2em] text-deck-gold-dim">
        {label}
      </p>
      <p className={`mt-2 font-mono text-3xl font-bold ${colorClass}`}>
        {value}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: flightsData } = await supabase
    .from("tracked_flights")
    .select("*")
    .eq("active", true)
    .order("last_updated", { ascending: false });

  const flights = (flightsData ?? []) as TrackedFlight[];

  const stats = {
    tracked: flights.length,
    onTime: flights.filter((f) => f.last_status === "on_time").length,
    delayed: flights.filter((f) => f.last_status === "delayed").length,
    cancelled: flights.filter((f) => f.last_status === "cancelled").length,
  };

  const feedEvents = buildFeedEvents(flights).slice(0, 6);

  return (
    <div className="min-h-screen bg-deck-navy text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between border-b border-deck-gold-dim/20 pb-6">
          <div className="flex items-center gap-4">
            <PlaneMark className="h-8 w-8 text-deck-gold" />
            <div>
              <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-deck-gold">
                FLIGHT DECK
              </h1>
              <p className="font-mono text-xs tracking-[0.3em] text-slate-400">
                DIPTYAI OPERATIONS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute h-full w-full animate-[pulse-glow_2s_ease-in-out_infinite] rounded-full bg-emerald-400" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-xs tracking-[0.2em] text-emerald-400">
              LIVE
            </span>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="TRACKED" value={stats.tracked} colorClass="text-slate-100" />
          <StatCard label="ON TIME" value={stats.onTime} colorClass="text-emerald-400" />
          <StatCard label="DELAYED" value={stats.delayed} colorClass="text-amber-400" />
          <StatCard label="CANCELLED" value={stats.cancelled} colorClass="text-red-400" />
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-sm tracking-[0.25em] text-deck-gold-dim">
              DEPARTURES
            </h2>
            <span className="font-mono text-xs text-slate-500">
              {flights.length} ACTIVE
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-deck-gold-dim/20 bg-deck-panel">
            {flights.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                No flights are being tracked yet.
              </p>
            ) : (
              <ul>
                {flights.map((flight, index) => {
                  const badge = STATUS_BADGES[flight.last_status];
                  return (
                    <li
                      key={flight.id}
                      style={{ animationDelay: `${index * 60}ms` }}
                      className="flex animate-[slide-up_0.4s_ease-out_backwards] items-center gap-4 border-b border-white/5 px-5 py-4 transition-colors last:border-b-0 hover:bg-deck-gold/[0.06]"
                    >
                      <span className="w-16 shrink-0 font-mono text-sm font-semibold text-deck-gold">
                        {flight.flight_number}
                      </span>
                      <span className="flex min-w-0 flex-1 items-center gap-4">
                        <span className="flex items-center gap-2 text-sm text-slate-200">
                          <span>{flight.origin}</span>
                          <ArrowRightIcon className="h-3.5 w-3.5 text-deck-gold-dim" />
                          <span>{flight.destination}</span>
                        </span>
                        <span
                          className="hidden truncate text-xs tracking-wide text-slate-400 sm:inline"
                          style={{ fontVariant: "small-caps" }}
                        >
                          {airlineFromFlightNumber(flight.flight_number)}
                        </span>
                      </span>
                      <span className="hidden shrink-0 font-mono text-xs text-slate-400 md:inline">
                        GATE {flight.gate ?? "—"}
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs tracking-wider ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-10 mb-10">
          <h2 className="mb-3 font-mono text-sm tracking-[0.25em] text-deck-gold-dim">
            LIVE FEED
          </h2>
          <div className="rounded-lg border border-deck-gold-dim/20 bg-deck-panel p-4">
            {feedEvents.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">
                No notifications sent yet.
              </p>
            ) : (
              <ul className="divide-y divide-white/5">
                {feedEvents.map((event) => (
                  <li key={event.id} className="flex items-center gap-3 py-3">
                    {event.channel === "whatsapp" ? (
                      <WhatsAppIcon className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <MailIcon className="h-4 w-4 shrink-0 text-sky-400" />
                    )}
                    <span className="flex-1 truncate text-sm text-slate-300">
                      {event.message}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-slate-500">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-dashed border-deck-gold-dim/50 px-4 py-3 font-mono text-xs tracking-[0.2em] text-deck-gold-dim transition-colors hover:border-deck-gold hover:text-deck-gold"
            >
              + TRACK FLIGHT
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
