# Indiana Entity Risk Posture

> **Not legal advice.** This document captures the working posture derived from Manus AI's 2026-05-13 prohibition-state findings (`docs/sources/manus-2026-05-13/Indiana_ProhibitionState_Findings_for_TendOMatic.md`). Before any cannabis customer is onboarded, this posture must be reviewed and signed off by cannabis counsel familiar with Indiana, Michigan, Illinois, federal CSA / FinCEN, and SaaS contracting.

## Why this document exists

The operating team is in Indiana. Indiana remains a prohibition state for marijuana. The customers Tend-O-Matic will serve (Michigan, Illinois dispensaries) are in legal states. The risk is not in writing software — it is in becoming characterized as a cannabis operator, broker, custodian, financier, or party to product movement from inside a prohibition state.

## Working posture

Tend-O-Matic operates as a **neutral B2B compliance-software provider**. Specifically:

- **No physical cannabis** is handled, stored, transported, sampled, demoed, or received in Indiana.
- **No title** to cannabis or cannabis proceeds is taken by Tend-O-Matic in any jurisdiction.
- **No brokerage** or wholesale-movement arrangement is performed; the licensed dispensary is the operator, Tend-O-Matic is its software vendor.
- **No payment custody** unless counsel clears the model. Payment provider integrations are passthrough; the licensed operator and the payment provider hold the cannabis-specific obligations.
- **No Indiana-facing cannabis marketing.** Marketing is B2B to licensed operators in legal states only.
- **Employees** in Indiana operate under written no-cannabis-handling policies. Support staff may view transaction / inventory data for legal-state customers as software support, never as transaction authorization or product advice.
- **Data hosting and access** is contractually scoped, encrypted at rest, access-logged, and audited.

## Open decisions that need counsel

1. Can an Indiana entity safely provide POS/compliance software to licensed dispensaries in Michigan and Illinois without being characterized under Indiana criminal statutes regarding delivery / financing delivery of marijuana?
2. Should the operating entity be formed outside Indiana (Delaware, Michigan, or Illinois) with Indiana retained as an engineering / office location, contracting via the out-of-state entity?
3. What contract language must SaaS agreements carry to disclaim possession, custody, title, agency, brokerage, delivery, payment custody, or cannabis-operating characterization?
4. Are there banking, insurance, employment, or tax restrictions triggered by cannabis-adjacent revenue while headquartered in Indiana?
5. How should payment-processing integrations (Aeropay, CanPay, etc.) be structured so funds never touch a Tend-O-Matic account?

## Effect on Phase 0 / Phase 1

- LICENSE entity name remains `[TBD entity]` until decisions 1–2 resolve.
- Tenant onboarding (Phase 1+) gates on contract template completion (decision 3) and counsel sign-off on the dossier (`docs/compliance-dossier.md`).
- The compliance kernel itself does not depend on entity structure and continues development.
