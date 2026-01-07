# Remaining Requirements (Gap Summary)

This document lists **only the unmet or partially met requirements** versus the SRS documents for the two modules.

## Smart Printing & Document Services (InstaPrint)
- Marketplace & Routing: multi-shop discovery sorted by proximity/price; live status (open/closed/busy/resource alerts); routing jobs to target shop IDs; multi-tenant/device ID handling.
- File & Config UX: drag/drop upload; file validation/preview; richer config (paper sizes, color/BW, duplex, copies) with eco-nudges; max file size enforcement; secure blob storage lifecycle.
- Payments: hybrid UPI/wallet; payment success gating job routing; reconciliation and status updates; campus wallet balances.
- Queue & Status: live status updates via WebSockets; job lifecycle beyond “queued”; ETA; live kanban for shops.
- OTP & Pickup: shop-side OTP verification flow; secure handoff process.
- Shop Owner Dashboard: online/offline toggle; auto-offline on network loss; resource toggles (e.g., disable color/A3); manual download fallback.
- IoT Automation: shop PC agent integration, device twin mapping, one-click print with driver config.
- Data & Persistence: persistent storage (shops, jobs); audit/logging; Cosmos DB alignment.
- NFRs: latency targets (<5s status), accessibility (a11y/high-contrast), scalability (50+ shops), reliability (no job loss), security.

## Food & Dining (Canteen / Mess / Offers / Delivery)
- Auth & Identity: registration with PRN/Teacher ID; unified login flows; role-based access (student/faculty/canteen admin/mess admin/super admin); password reset.
- Ordering & Delivery: cart/checkout for multiple items; free delivery logic; delivery location selection UI; real-time order tracking (sockets); OTP generation on dispatch and verification on delivery; transaction history.
- Payments: online/cash flow integration with gateway; initiate/payment webhook endpoints; payment status transitions; final amount after offers; PCI/HTTPS requirements.
- Menu & Offers: admin CRUD for menu and offers; offer limits per user; validity windows enforcement; reporting on offer usage and revenue.
- Admin Dashboards: canteen admin order dashboard with status updates; mess admin voting management/analytics; super-admin multi-college oversight.
- Mess & QR: QR-based meal redemption; mess menu publishing; vote limits (one per user per poll); analytics for votes.
- Food Wastage Tracker: input of waste weights; public dashboard (daily/historical trends).
- APIs & Paths: align to specified /api endpoints; add payment webhook; ensure multi-tenant collegeId scoping across collections.
- NFRs: performance (<500ms critical APIs, <3s initial load), scalability (stateless/horizontal), security (RBAC, XSS/CSRF protections, OTP storage), reliability (99.9% target), usability cues.
