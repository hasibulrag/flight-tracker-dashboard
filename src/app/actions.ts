"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TrackFlightState = {
  error: string | null;
  success: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function trackFlight(
  _prevState: TrackFlightState,
  formData: FormData,
): Promise<TrackFlightState> {
  const flightNumber = String(formData.get("flight_number") ?? "").trim();
  const origin = String(formData.get("origin") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "").trim();
  const customerWhatsapp =
    String(formData.get("customer_whatsapp") ?? "").trim() || null;

  if (!flightNumber || !origin || !destination || !customerEmail) {
    return {
      error: "Flight number, origin, destination, and email are required.",
      success: false,
    };
  }

  if (!EMAIL_PATTERN.test(customerEmail)) {
    return { error: "Enter a valid email address.", success: false };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to track a flight.", success: false };
  }

  const { error: insertError } = await supabase.from("tracked_flights").insert({
    flight_number: flightNumber.toUpperCase(),
    origin,
    destination,
    gate: null,
    last_status: "scheduled",
    delay_minutes: 0,
    customer_email: customerEmail,
    customer_whatsapp: customerWhatsapp,
    active: true,
    last_updated: new Date().toISOString(),
  });

  if (insertError) {
    return { error: insertError.message, success: false };
  }

  revalidatePath("/");
  return { error: null, success: true };
}
