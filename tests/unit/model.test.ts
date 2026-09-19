import { assertTransactionBalanced, LedgerEntry } from '../../src/domain/model';

describe('assertTransactionBalanced', () => {
  const timestamp = new Date();

  it('should pass when debits strictly equal credits', () => {
    const balancedEntries: LedgerEntry[] = [
      {
        id: 'entry-1',
        transactionId: 'tx-100',
        accountId: 'acc-asset-cash',
        amountCents: 50000n, // 500.00
        direction: 'DEBIT',
        createdAt: timestamp,
      },
      {
        id: 'entry-2',
        transactionId: 'tx-100',
        accountId: 'acc-revenue-sales',
        amountCents: 50000n, // 500.00
        direction: 'CREDIT',
        createdAt: timestamp,
      },
    ];

    expect(() => assertTransactionBalanced(balancedEntries)).not.toThrow();
  });

  it('should throw an error when entries are unbalanced', () => {
    const unbalancedEntries: LedgerEntry[] = [
      {
        id: 'entry-1',
        transactionId: 'tx-101',
        accountId: 'acc-asset-cash',
        amountCents: 50000n,
        direction: 'DEBIT',
        createdAt: timestamp,
      },
      {
        id: 'entry-2',
        transactionId: 'tx-101',
        accountId: 'acc-revenue-sales',
        amountCents: 49000n,
        direction: 'CREDIT',
        createdAt: timestamp,
      },
    ];

    expect(() => assertTransactionBalanced(unbalancedEntries)).toThrow(
      /Transaction unbalanced/
    );
  });

  it('should reject transactions with fewer than two entries', () => {
    const singleEntry: LedgerEntry[] = [
      {
        id: 'entry-1',
        transactionId: 'tx-102',
        accountId: 'acc-asset-cash',
        amountCents: 1000n,
        direction: 'DEBIT',
        createdAt: timestamp,
      },
    ];

    expect(() => assertTransactionBalanced(singleEntry)).toThrow(
      'A transaction must contain at least two entries.'
    );
  });

  it('should reject zero or negative amounts', () => {
    const zeroAmountEntries: LedgerEntry[] = [
      {
        id: 'entry-1',
        transactionId: 'tx-103',
        accountId: 'acc-asset-cash',
        amountCents: 0n,
        direction: 'DEBIT',
        createdAt: timestamp,
      },
      {
        id: 'entry-2',
        transactionId: 'tx-103',
        accountId: 'acc-liability',
        amountCents: 0n,
        direction: 'CREDIT',
        createdAt: timestamp,
      },
    ];

    expect(() => assertTransactionBalanced(zeroAmountEntries)).toThrow(
      /Must be strictly positive/
    );
  });
});
