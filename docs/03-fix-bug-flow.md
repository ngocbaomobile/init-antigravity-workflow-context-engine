# 🐛 Real-World Walkthrough — Fix a Bug

> Step-by-step example of using the 4-Round Wizard to fix a real bug.

![4-Round Wizard](./four-round-wizard.png)

---

## Scenario

**Bug Report:** "Booking confirmation email is not sent when a user books a meeting room via the mobile app."

**Module:** Booking (Flutter)  
**You are:** Module Owner of Booking

---

## Round 0 — Task Initialization

> You don't have a Jira ticket yet. The agent creates one for you.

### You say:
```
Booking confirmation email is not sent when a user books a meeting room 
via the mobile app. The web version works fine.
```

### Agent asks (interview mode):
```
1. "What is the title for this task?"
   → "Bug: Booking confirmation email not sent from mobile app"

2. "What type is this? (Bug/Feature/Refactor)"
   → "Bug"

3. "Can you describe the expected vs actual behavior?"
   → Expected: user books room → receives email confirmation
     Actual: user books room → no email sent (web works, mobile doesn't)

4. "What are the acceptance criteria?"
   → - Mobile booking sends confirmation email
     - Email contains room name, date, time, and booking ID
     - Works for both iOS and Android
```

### Agent drafts ticket:
```
📋 Jira Ticket Draft:
   Title: Bug: Booking confirmation email not sent from mobile app
   Type: Bug
   Priority: High
   Description: [compiled from interview]
   Acceptance Criteria: [as provided]

   "Do you approve me to create this Jira ticket?"
```

### You approve → Agent creates `CB-195` via Jira MCP

---

## Round 1 — Context Gathering

### Agent gathers context from 3 sources:

| Source | What it finds |
|--------|--------------|
| **Jira** | CB-195 details, linked issues (CB-120 was similar bug in web) |
| **Confluence** | PRD for Booking feature, API contract for `/api/bookings` |
| **AI Context Engine** | `[Convention] API Design` — all POST requests must include `notify: true` header. `[Troubleshooting] CB-120` — web had same bug, fixed by adding `send_email` flag to request body |

### Agent builds Context Manifest:

```yaml
task_info:
  id: "CB-195"
  type: "bugfix"
  scope: "Mobile-Flutter"

context_sources:
  - priority: 1
    source: "Confluence"
    query: "Booking API Contract v2"
    finding: "POST /api/bookings requires body.send_notification = true"
  - priority: 2
    source: "AI Context Engine"
    query: "[Convention] API Design"
    finding: "All mutation endpoints must pass notification flags"
  - priority: 3
    source: "AI Context Engine"
    query: "[Troubleshooting] CB-120"
    finding: "Web had identical issue — fixed by adding send_email: true"
  - priority: 4
    source: "AI Context Engine"
    query: "BookingRepository.createBooking()"
    finding: "Mobile code does NOT pass send_notification flag"
```

### Agent asks: *"Is this context complete and accurate?"*
### You approve ✅

---

## Round 2 — Execution Plan

### Agent generates plan:

```
📋 Execution Plan for CB-195:

Root Cause: Mobile BookingRepository.createBooking() does not pass 
            send_notification: true in the request body.
            Web version does — hence web works, mobile doesn't.

Files to modify:
  1. lib/features/booking/data/repositories/booking_repository_impl.dart
     → Add send_notification: true to createBooking() request body
  
  2. lib/features/booking/data/models/booking_request_model.dart
     → Add sendNotification field to the request model
  
  3. test/features/booking/data/repositories/booking_repository_test.dart
     → Add test case verifying send_notification is included

Convention compliance:
  ✅ Follows [Convention] API Design — notification flags required
  ✅ Matches fix from [Troubleshooting] CB-120

Risk areas:
  ⚠️ Low risk — isolated change, matches proven web fix
  
Estimated effort: 15 minutes

"Do you approve this execution plan?"
```

### You approve ✅

---

## Round 3 — Execution & Closure

### Agent writes code:

**File 1:** `booking_request_model.dart`
```dart
class BookingRequestModel {
  final String roomId;
  final DateTime startTime;
  final DateTime endTime;
  final bool sendNotification; // ← ADDED

  Map<String, dynamic> toJson() => {
    'room_id': roomId,
    'start_time': startTime.toIso8601String(),
    'end_time': endTime.toIso8601String(),
    'send_notification': sendNotification, // ← ADDED
  };
}
```

**File 2:** `booking_repository_impl.dart`
```dart
Future<Booking> createBooking(BookingRequest request) async {
  final response = await apiClient.post(
    '/api/bookings',
    body: BookingRequestModel(
      roomId: request.roomId,
      startTime: request.startTime,
      endTime: request.endTime,
      sendNotification: true, // ← FIXED: was missing
    ).toJson(),
  );
  return BookingMapper.fromJson(response.data);
}
```

### Agent runs linter:
```
$ flutter analyze
No issues found! ✅
```

### Agent updates Jira:
```yaml
execution_status:
  current_round: "done"
  round_status: "approved"
  last_action: "Fixed send_notification flag, linter passes"
  timestamp: "2026-04-02 16:45"
  completed_steps:
    - "✅ Round 0: Jira ticket CB-195 created"
    - "✅ Round 1: Root cause identified from Troubleshooting CB-120"
    - "✅ Round 2: Execution plan approved (3 files)"
    - "✅ Round 3: Code fixed, tests added, linter passes"
```

### Agent asks: *"Shall I publish a Troubleshooting summary to Confluence?"*

### You say yes → Agent creates:
```
Confluence Page: [Module-Booking] Troubleshooting_CB-195_Email_Not_Sent

Content:
- Root cause: Mobile missing send_notification flag
- Fix: Added sendNotification to BookingRequestModel
- Related: CB-120 (same issue on web)
- Prevention: [Convention] API Design already requires notification flags
```

**Done!** 🎉 The Context Engine auto-indexes the new Troubleshooting page.

---

## Timeline

| Time | Round | What happened |
|------|-------|--------------|
| 0:00 | Round 0 | Agent interviewed you, created CB-195 |
| 0:03 | Round 1 | Agent gathered context, found root cause |
| 0:05 | Round 2 | Execution plan approved |
| 0:10 | Round 3 | Code fixed, tested, Jira updated |
| 0:12 | Closure | Troubleshooting published to Confluence |

**Total time: ~12 minutes** for a complete bug fix with documentation.
