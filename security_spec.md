# Security Specification & Test-Driven Development (TDD) Blueprint

## 1. Data Invariants
*   **User Identity Security:** A user cannot write to `/users/{userId}` where `{userId}` does not match `request.auth.uid`.
*   **XP Integrity:** The experience points (`xp`) field must only be of type integer and cannot contain negative numbers.
*   **Voter Demographics:** A user's `votedIngredients` is capped as a map representation where values represent vote allocation (1 or 0 toggled), preventing double-voting within categories.
*   **Temporal Stability:** Timestamps on dynamic creations like `orders` or `reservations` must align with transaction validity.
*   **Menu Catalog Controls:** Public guest users can read menu catalogs, but modify/price actions command authenticated tokens.
*   **ID Poisoning Defenses:** All document IDs must be verified using ID shape assertions (`^[a-zA-Z0-9_\-]+$`) and must not exceed length boundary limits.

---

## 2. The "Dirty Dozen" Malicious Payloads

### User Profiles (/users/{userId})
1.  **Identity Theft Spoofing:** Creating a record under userId `attacker_id` with credentials spoofing `victim_id`.
2.  **XP Privilege Inflation:** Mutating field `xp` directly to `9999999` without completing missions.
3.  **Voter Double Spoof / Cheat Payload:** Injecting multiple arbitrary keys or illegal structures into `votedIngredients`.
4.  **PII Blanket Data Leak Exploration:** Performing structural get/list requests targeting other players' credentials without security boundaries.

### Orders (/orders/{orderId})
5.  **Unauthenticated Order Spam:** Injecting an order without an active user session state.
6.  **Price Manipulator Exploit:** Creating an order with a price field of `-500` to manipulate bank accounting.
7.  **Order ID Exhaustion Poisoning:** Injecting an extremely large custom string (e.g., 20MB payload) as an order ID to trigger cost anomalies.

### Reservations (/reservations/{reservationId})
8.  **Status State Skipping:** Mutating reservation status from `pending` directly to `completed` without the validation code of the physical local restaurant waiter.
9.  **Diner Size Boundary Exhaustion:** Reserving tables with diner size exceeding maximum capacity limits (e.g. `999999` seats filled).

### Menu Items (/menuItems/{menuItemId})
10. **Malicious Price Manipulation:** Overwriting prices of standard tacos to negative values or setting name string sizes to millions of characters.

### Global Votes (/votes/{voteId})
11. **Vote Fraud Bloating:** Flooding `/votes/{voteId}` by setting the count directly to millions from any client.
12. **Null-State Orphan injection:** Creating sub-documents without matching root categories.

---

## 3. Test Runner Definition: firestore.rules.test.ts
This is the test framework designed to run with `@firebase/rules-unit-testing`:

```typescript
import {
  initializeTestEnvironment,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe('Nexus Gastro-Bar Firestore security tests', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0857232617',
      firestore: {
        host: 'localhost',
        port: 8080
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('Blocks unauthenticated voter profile creations', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, 'users/some_player');
    await expect(setDoc(docRef, { gamertag: 'HACKER', xp: 500, votedIngredients: {} }))
      .rejects.toThrow();
  });

  test('Blocks profile creation with mismatched UID', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid').firestore();
    const docRef = doc(aliceDb, 'users/bob_uid');
    await expect(setDoc(docRef, { gamertag: 'BOB', xp: 150, votedIngredients: {} }))
      .rejects.toThrow();
  });
});
```
