# ⏸️ Pause, Resume & Handover Guide

> How to use `/pause`, `/resume`, and `/handover` commands to manage task state across sessions and developers.

---

## Why State Commands?

AI agents lose context between sessions. These commands save/restore state via Jira, so:

- **You can stop mid-task** and continue tomorrow
- **Another developer** can pick up where you left off
- **No progress is lost** — everything is tracked in the Jira ticket

---

## `/pause` — Save & Stop

### When to use
- End of work day, task is half-done
- Need to switch to a higher-priority task
- Lunch break during a complex refactor

### What happens

```
You: /pause

Agent: "I'm pausing this task. Please briefly tell me: 
        what items have you completed so far?"

You: "Finished the repository layer and use cases. 
      BLoC is partially done — event classes are ready 
      but state classes need the error handling added."

Agent: "Are there any code files left unfinished, or any 
        linter errors intentionally left unfixed?"

You: "checkin_state.dart has a TODO comment for error states. 
      No linter errors."

Agent: "What is the next step to take when you return?"

You: "Add CheckinErrorState and CheckinTimeoutState to 
      checkin_state.dart, then build the QR scanner UI page."
```

### Agent saves to Jira:

```yaml
execution_status:
  current_round: "3"
  round_status: "blocked"
  last_action: "Paused — BLoC partially done, states need error handling"
  timestamp: "2026-04-02 18:00"
  completed_steps:
    - "✅ Round 1: Context gathered"
    - "✅ Round 2: Plan approved (10 files)"
    - "🔄 Round 3: 5/10 files done"
    - "⏸️ Paused at: checkin_state.dart needs error states"
  blockers:
    - "Next: Add CheckinErrorState, CheckinTimeoutState, then QR scanner UI"
```

---

## `/resume` — Restore & Continue

### When to use
- Next work day, continuing yesterday's task
- New session after a meeting or break

### What happens

```
You: /resume CB-200

Agent: "🔄 Resuming from Round 3 — Last action: 
        'Paused — BLoC partially done' at 2026-04-02 18:00.

        Completed steps:
        ✅ Round 1: Context gathered
        ✅ Round 2: Plan approved (10 files)
        🔄 Round 3: 5/10 files done
        
        Next step from your notes:
        → Add CheckinErrorState and CheckinTimeoutState
        → Then build QR scanner UI page
        
        Do you want me to continue coding, or review the plan first?"

You: "Continue coding"
```

### Agent resumes exactly where you left off — no repeated work.

---

## `/handover` — Transfer to Another Developer

### When to use
- You're going on vacation mid-task
- Task is being reassigned to another team member
- You need a specialist to complete a specific part

### What happens

```
You: /handover

Agent: "Who will be taking over this task from you?"

You: "Thanh — senior Flutter dev on the Booking team"

Agent: "Besides the progress listed, do you have any warnings, 
        risk notes, or API/Logic caveats for Thanh?"

You: "The QR scanner page needs to handle the case where 
      camera permission is denied — show a manual code input 
      fallback. Also, the checkin API sometimes returns 409 
      if the user already checked in — handle that gracefully."
```

### Agent creates handover package in Jira:

```yaml
execution_status:
  current_round: "3"
  round_status: "blocked"
  last_action: "Handover to Thanh"
  timestamp: "2026-04-02 18:30"
  completed_steps:
    - "✅ Round 1: Context gathered"
    - "✅ Round 2: Plan approved (10 files)"
    - "🔄 Round 3: 5/10 files done"

handover_notes:
  recipient: "Thanh"
  warnings: |
    1. QR scanner needs camera permission denied fallback 
       → show manual code input
    2. Checkin API returns 409 if already checked in 
       → handle gracefully, don't show error
    3. checkin_state.dart has TODO for error states
  handover_date: "2026-04-02"
```

### When Thanh starts:

```
Thanh: /resume CB-200

Agent: "🔄 Resuming from Round 3 — Handed over from previous developer.
        
        ⚠️ Handover notes from previous developer:
        1. QR scanner needs camera permission denied fallback
        2. Checkin API returns 409 — handle gracefully
        3. checkin_state.dart has TODO for error states
        
        5/10 files done. Continue coding?"
```

---

## Quick Reference

| Command | Purpose | Saves to Jira |
|---------|---------|---------------|
| `/pause` | Save state, stop working | `execution_status` + blockers |
| `/resume` | Restore state, continue | Reads `execution_status` |
| `/handover` | Transfer to another dev | `handover_notes` block |

---

## Best Practices

1. **Always `/pause` before ending a session** — don't just close the chat
2. **Be specific in pause notes** — mention exact file names and TODO comments
3. **Include risk warnings in `/handover`** — edge cases your replacement needs to know
4. **Use `/resume` at the start of every session** — even if you remember the context
5. **Check `execution_status` in Jira** — it's the source of truth, not your memory
