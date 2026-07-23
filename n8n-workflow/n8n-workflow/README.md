Flight Status Notification — n8n Workflow

Automatically checks tracked flights every 30 minutes via the Aviationstack API and, when a flight's status changes, emails the customer, logs the event, and updates the record — while safely stopping itself from checking flights that have already landed or been cancelled.

This is the automation backend for the Flight Deck dashboard.

What you need before importing
A Supabase project with two tables:
tracked_flights — columns: id (uuid), flight_number (text), origin (text), destination (text), gate (text, nullable), last_status (text), delay_minutes (int), customer_email (text), customer_whatsapp (text, nullable), active (boolean), last_updated (timestamptz)
activity_log — columns: id (uuid), event_type (text), source (text), flight_number (text), details (jsonb), created_at (timestamptz)
Your Supabase service role key (Project Settings → API)
A free Aviationstack account for its API key (free tier is ~100 requests/month — fine for light/demo use, not for running many flights continuously; see note below)
A Gmail account connected via n8n's Gmail OAuth2 credential, to send the status-update emails
Setup
Import flight-status-notification-workflow.json into n8n (☰ menu → Import from File)
In "Get Tracked Flights (Supabase)": replace YOUR_SUPABASE_PROJECT_REF in the URL and both YOUR_SUPABASE_SERVICE_ROLE_KEY placeholders with your own values
In "Check Flight Status (Aviationstack)": replace YOUR_AVIATIONSTACK_API_KEY with your own key
In "Create a row" and "Update a row": click the Credential dropdown and connect/select your own Supabase credential
In "Send a message": click the Credential dropdown and connect your own Gmail account
Run once manually ("Execute workflow") to confirm everything is wired up, then activate the workflow to let the 30-minute schedule take over
Known limitations (being upfront about these)
Fixed 30-minute interval for every flight — a more mature version would check flights near departure more often and far-out flights less often, rather than treating them all the same
Free Aviationstack tier is request-limited — fine for a demo or a handful of flights, but a real production deployment with many concurrently tracked flights will need a paid plan
Tested primarily with a single real flight at a time — behavior with many simultaneous flights hasn't been load-tested
