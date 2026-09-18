export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type EntryDirection = 'DEBIT' | 'CREDIT';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  isActive: boolean;
  createdAt: Date;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  amountCents: bigint;
  direction: EntryDirection;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  idempotencyKey: string;
  description: string;
  postedAt: Date;
  createdAt: Date;
  entries: LedgerEntry[];
}

/**
 * Enforces the core accounting invariant:
 * Sum(Debits) - Sum(Credits) === 0
 */
export function assertTransactionBalanced(entries: LedgerEntry[]): void {
  if (!entries || entries.length < 2) {
    throw new Error('A transaction must contain at least two entries.');
  }

  let debitSum = 0n;
  let creditSum = 0n;

  for (const entry of entries) {
    if (entry.amountCents <= 0n) {
      throw new Error(`Invalid entry amount: ${entry.amountCents}. Must be strictly positive.`);
    }

    if (entry.direction === 'DEBIT') {
      debitSum += entry.amountCents;
    } else if (entry.direction === 'CREDIT') {
      creditSum += entry.amountCents;
    }
  }

  if (debitSum !== creditSum) {
    throw new Error(
      `Transaction unbalanced: Debits (${debitSum}) do not equal Credits (${creditSum}). Variance: ${debitSum - creditSum}`
    );
  }
}
