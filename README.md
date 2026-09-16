# ledger-core

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Architecture: Clean](https://img.shields.io/badge/Architecture-Clean%20%2F%20Hexagonal-informational)](docs/adr/0001-immutable-double-entry-ledger.md)
[![Design: Double--Entry](https://img.shields.io/badge/Design-Double--Entry%20Ledger-success)](docs/adr/0001-immutable-double-entry-ledger.md)

> High-reliability, double-entry financial transaction engine engineered for absolute auditability, concurrency safety, and zero data loss.

---

## Architectural Overview

`ledger-core` implements an immutable, append-only double-entry financial ledger based on foundational distributed systems and accounting invariants. It eliminates destructive state mutations (`UPDATE`/`DELETE`) to guarantee mathematically verifiable provenance and forensic auditability.

### Core Invariants
* **Double-Entry Balance Constraint:** Every posted transaction must balance algebraically:
  $$\sum \text{Debits} - \sum \text{Credits} = 0$$
* **Immutability:** Once written, ledger entries cannot be updated or destroyed. Rectification is conducted exclusively via compensatory reversal transactions.
* **Strict Idempotency:** Client retries and network duplicates are intercepted using atomic deduplication keys.
* **Integer-Centric Arithmetic:** All monetary quantities are recorded as 64-bit integers (`BIGINT`) at minor currency units (e.g., cents/halalas) to prevent floating-point anomalies.

---

## Project Structure

```text
ledger-core/
├── docs/
│   └── adr/            # Architecture Decision Records
├── src/
│   ├── domain/         # Pure domain models and financial invariants
│   ├── application/    # Use cases, transaction orchestration, idempotency handling
│   └── infrastructure/ # Database adapters (PostgreSQL), migrations, external boundaries
└── tests/
    ├── unit/           # High-speed deterministic domain invariant tests
    └── integration/    # Concurrency and transactional isolation verification
```

---

## Architecture Decision Records (ADRs)
* [ADR-0001: Immutable Double-Entry Ledger Core Architecture](docs/adr/0001-immutable-double-entry-ledger.md)

---

## License
MIT