"use client";

import { useActionState, useState } from "react";
import { trackFlight, type TrackFlightState } from "@/app/actions";

const initialState: TrackFlightState = { error: null, success: false };

function FormField({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-xs tracking-[0.2em] text-deck-gold-dim"
      >
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="rounded-lg border border-deck-gold-dim/20 bg-deck-navy px-3 py-2 text-sm text-slate-100 outline-none focus:border-deck-gold/50"
      />
    </div>
  );
}

export default function TrackFlightModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    trackFlight,
    initialState,
  );
  // Close the modal the moment a submission succeeds, without an Effect:
  // compare against the last state we've handled and adjust during render,
  // per https://react.dev/learn/you-might-not-need-an-effect. The form is
  // conditionally rendered below, so closing it also unmounts it, which
  // clears its (uncontrolled) fields for the next time it's opened.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full rounded-lg border border-dashed border-deck-gold-dim/50 px-4 py-3 font-mono text-xs tracking-[0.2em] text-deck-gold-dim transition-colors hover:border-deck-gold hover:text-deck-gold"
      >
        + TRACK FLIGHT
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-lg border border-deck-gold-dim/20 bg-deck-panel p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-sm tracking-[0.25em] text-deck-gold-dim">
                TRACK FLIGHT
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="text-slate-400 transition-colors hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <FormField id="flight_number" label="Flight Number" required />
              <FormField id="origin" label="Origin" required />
              <FormField id="destination" label="Destination" required />
              <FormField
                id="customer_email"
                label="Customer Email"
                type="email"
                required
              />
              <FormField
                id="customer_whatsapp"
                label="Customer WhatsApp"
                type="tel"
              />

              {state.error && (
                <p role="alert" className="text-sm text-red-400">
                  {state.error}
                </p>
              )}

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-deck-gold-dim/20 px-4 py-2 font-mono text-xs tracking-[0.2em] text-slate-400 transition-colors hover:text-slate-100"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg border border-deck-gold/50 bg-deck-gold/10 px-4 py-2 font-mono text-xs tracking-[0.2em] text-deck-gold transition-colors hover:bg-deck-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "TRACKING…" : "TRACK"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
