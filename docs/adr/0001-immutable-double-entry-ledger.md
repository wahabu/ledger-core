# ADR 0001: Immutable Double-Entry Ledger Core Architecture

## Status
Accepted

## Context
Financial and transactional systems demand mathematically verifiable auditability, zero data loss, and deterministic state recovery. 

A naive balance-mutation design (e.g., executing `UPDATE accounts SET balance = balance - amount`) introduces critical architectural flaws:
1. **Destructive Updates:** Overwriting balance states destroys the audit trail and temporal history, making retroactive forensic reconciliation mathematically impossible.
2. **Concurrency Anomalies:** Direct mutable updates suffer from high lock contention, lost updates, and race conditions under concurrent execution.
3. **Implicit Invariants:** In single-entry accounting, funds can materialize or vanish through partial writes or unchecked runtime exceptions.

A mission-critical financial core requires an architecture where money cannot simply change state without an immutable, auditable counterparty entry.

## Decision
We adopt an **immutable, append-only double-entry ledger architecture**.

### 1. The Fundamental Accounting Invariant
Every transaction must consist of at least two balanced ledger entries (Debits and Credits). The system enforces that the algebraic sum of entries within any transaction strictly equals zero:

$$\sum \text{Debits} - \sum \text{Credits} = 0$$

All monetary amounts are represented as positive 64-bit integers (`BIGINT`) representing the minor currency unit (e.g., cents, halalas) to eliminate IEEE 754 floating-point rounding errors.

### 2. Append-Only Invariant (Immutability)
* Ledger entries and transactions are **strictly insert-only**.
* Database-level permissions and application logic prohibit `UPDATE` and `DELETE` operations on transactional tables.
* Corrections, cancellations, or refunds are executed exclusively through compensatory transactions (reversals), preserving full chronological provenance.

### 3. Separation of Transaction Intake and Ledger Settlement
* **Transaction Record:** Acts as the business-intent envelope, carrying an external idempotency key, metadata, and state timestamps.
* **Ledger Entries:** Act as the atomic financial movements executed within a single database transaction block.

## Consequences

### Positive (Gains)
* **Complete Verifiable Auditability:** The exact historical state of any account at any point in time ($t$) can be reconstructed deterministically by replaying ledger entries up to $t$.
* **Mitigation of Concurrency Conflicts:** Writing append-only records eliminates update-lock contention on central account records during ingestion.
* **Operational Integrity:** Compliance and regulatory requirements (e.g., SOC 2, banking regulations) are satisfied at the database schema layer rather than relying solely on transient application code.

### Negative (Trade-offs & Mitigations)
* **Storage Growth:** Append-only ledgers generate substantial row volume over time.  
  * *Mitigation:* Implement historical table partitioning by date range (`posted_at`).
* **Balance Read Latency:** Calculating account balances on the fly via `SUM(amount)` across millions of rows introduces latency.  
  * *Mitigation:* Implement periodic, asynchronously generated account balance snapshots / materialized views to bound query scan windows.