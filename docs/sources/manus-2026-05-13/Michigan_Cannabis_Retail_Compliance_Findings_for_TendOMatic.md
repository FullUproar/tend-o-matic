# Michigan Cannabis Retail Compliance Findings for Tend-O-Matic

## Official source map

Michigan retail cannabis is regulated by the Michigan Cannabis Regulatory Agency (CRA). The CRA homepage and adult-use page expose the operational source set that Tend-O-Matic should monitor: adult-use establishments, medical marijuana facilities licensing, laws/rules/resources, bulletins, disciplinary actions, Metrc statewide monitoring system resources, news releases, license verification, annual financial statement filing, material-change notices, and adverse consumer reaction reporting.

## Retailer license and checkout obligations

Michigan Administrative Code R. 420.104 provides the core adult-use retailer checkout obligations. A marihuana retailer may buy or receive product only from licensed marijuana establishments and may sell/transfer to licensed establishments or individuals 21 years of age or older. Retail products sold to adults must have been tested and must bear the required label for retail sale. Before sale or transfer to an adult, the retailer must verify the person appears 21 or older using government-issued photographic identification with date of birth, and must ensure the transaction does not exceed the single-transaction limit.

For POS design, this creates hard requirements for age/ID workflow, product eligibility state, required label/test status, license-type separation, and checkout blocking when limits would be exceeded.

## Purchase limits

Michigan Administrative Code R. 420.506 states that medical sales must be verified in the statewide monitoring system against daily and monthly purchase limits. A registered qualifying patient is limited to 2.5 ounces of marijuana product or marijuana equivalent per day, and the monthly medical purchasing limit is 10 ounces. A registered primary caregiver is also limited to 2.5 ounces per day for each connected qualifying patient. For adult-use sales under MRTMA, a marihuana retailer may not sell/transfer more than 2.5 ounces to an adult 21+ in a single transaction, and not more than 15 grams may be marijuana concentrate. A sales location may sell no more than 3 immature plants to a customer per transaction.

For POS design, Michigan needs transaction-level limit math, category-aware equivalent calculations, adult-use versus medical logic, caregiver/patient relationship handling if medical is supported, and real-time statewide-system verification for medical purchases.

## Metrc / statewide monitoring

Michigan CRA identifies Metrc as Michigan's statewide seed-to-sale marijuana tracking system. The CRA page states that Metrc uses serialized plant tags and labels attached to wholesale packages to track marijuana inventory through growth, drying/curing, and eventual retail sale. The CRA page links to Michigan Metrc pages, a Michigan FAQ, educational training, an authorized third-party integrator list, and an API agreement for Metrc integrators.

For POS design, Metrc is not an optional integration. Tend-O-Matic should treat Michigan compliance as a Metrc-first workflow: package ingest, inventory reconciliation, sales reporting, returns/voids/adjustments, audit logs, and outage mode.

## Product implications

| Area | Michigan requirement signal | Tend-O-Matic product implication |
|---|---|---|
| ID/age gate | Verify adult appears 21+ with government photo ID/date of birth before sale. | Make ID verification a mandatory checkout checkpoint with manager override audit trail. |
| Product eligibility | Retail product must be tested and properly labeled. | Do not allow sale of untested, unmanifested, untagged, recalled, or non-retail packages. |
| Adult-use limits | 2.5 oz single transaction; max 15g concentrate; max 3 immature plants. | Build state-specific category/equivalency engine and checkout blocking. |
| Medical limits | Verify daily and monthly patient/caregiver limits in statewide system. | Integrate patient/caregiver validation and remaining-limit checks if serving medical stores. |
| Seed-to-sale | Transactions/current inventory must be accurately entered into statewide monitoring. | Metrc sync reliability, reconciliation reports, queued submissions, and error handling are core moat features. |
| Monitoring | CRA bulletins, Metrc pages, laws/rules/resources, disciplinary actions, and news releases are operationally relevant. | Build source monitors and compliance release notes around Michigan CRA and Metrc updates. |

## Open items for deeper Michigan pass

Need further extraction of official Michigan rules for taxes, receipt content, delivery/curbside if supported, advertising/signage restrictions, record retention, returns/voids, recalls/adverse reactions, package labeling, local authorization, and enforcement penalty patterns.
