# ReflectAI Agent Guidelines & Custom Directives

## 1. Google Maps Platform Directive
- **Attribution & Usage Tracking**: Always include `gmp_mcp_codeassist_v1_aistudio` in all Google Maps Platform API calls and SDK components.
- **Server-Side Proxy Architecture**: Never expose private Google Maps API keys to the browser. Route geocoding, places search, and location resolutions through `/api/maps/*` endpoints.
- **Zero Hallucination Guarantee**: All place coordinates, addresses, and location identifiers must originate from real Google Maps Platform APIs or verified browser geolocation coordinates.
- **Cost & Prototyping Awareness**: Support seamless fallback to Maps Demo Key or mock coordinates when testing locally or without configured billing.

## 2. Admin Roles & Access Control (RBAC) Directive
- **Zero-Trust ABAC Verification**: Authenticate all administrative operations server-side. Never rely on client-asserted claims or unchecked front-end state.
- **Principle of Least Privilege**:
  - `admin`: System-wide telemetry, user directory access, security audit log inspection, and role provisioning.
  - `editor`: Journal entry authoring, editing, sharing, and tag categorization.
  - `member`: Personal journal authoring and AI reflection conversations.
- **Audit Logging**: Every administrative action (role changes, flagged entries, session terminations) must record an immutable audit entry containing timestamp, actor UID, target resource, and operation type.

## 3. Notification & External Webhook API Directive
- **SSRF Mitigation & Host Allowlisting**:
  - Validate all outgoing webhook URLs strictly against HTTP/HTTPS schemes.
  - Deny loopback addresses (`127.0.0.1`, `localhost`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and Cloud metadata endpoints (`169.254.169.254`).
- **Structured Payload Schema**:
  - Outgoing notifications to Slack/Discord/custom webhooks must adhere to standardized event schemas containing `event_type`, `timestamp`, `summary`, `sentiment_tag`, and optional `action_items`.
- **Failure Resilience**: Wrap dispatches in non-blocking try/catch handlers to ensure webhook timeouts or remote server errors never interrupt the core journaling experience.
