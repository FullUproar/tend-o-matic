# Illinois Cannabis Retail Compliance Findings for Tend-O-Matic

## Official source map

Illinois adult-use cannabis retail is overseen by the Illinois Department of Financial and Professional Regulation (IDFPR) for dispensing organizations, dispensary agents, and agent education providers. The Cannabis Regulation Oversight Office (CROO) publishes statewide cannabis information, public FAQs, research/data pages, and seed-to-sale migration FAQs. The Illinois General Assembly publishes the Cannabis Regulation and Tax Act, and the Illinois Administrative Code contains operating rules.

IDFPR's Adult Use Cannabis Program page states that the Cannabis Regulation and Tax Act provides controlled legalization of adult-use cannabis beginning January 1, 2020, and that IDFPR is charged with licensing and oversight of dispensing organizations, dispensary agents, and agent education providers. The page links to program notices, consumer information, forms for dispensaries and agents, responsible vendor program materials, Cannabis Quarterly newsletters, annual cannabis reports, and laws/rules.

## Adult-use eligibility and possession limits

The Illinois CROO FAQ states that adults 21 years of age or older may buy cannabis. Illinois residents over 21 may legally possess 30 grams of cannabis flower, 500 mg THC in cannabis-infused product, and 5 grams of cannabis concentrate. Non-residents over 21 may legally possess 15 grams of cannabis flower, 250 mg THC in cannabis-infused product, and 2.5 grams of cannabis concentrate. These totals are cumulative, meaning a person may possess a combination up to each category limit.

For POS design, Illinois requires age-gated checkout and resident/non-resident logic. Tend-O-Matic should not assume a single universal adult-use limit: the checkout limit must branch by customer residency status and product category.

## Seed-to-sale and Metrc transition

Illinois CROO's seed-to-sale FAQs describe a transition from BioTrack to Metrc. The retail-sales FAQ explicitly recommends that dispensaries work with their point-of-sale provider to ensure the smoothest rollout. It also states that all inventory should be recorded in either BioTrack or Metrc during the transition, and that all packages at dispensaries need Metrc tags by the deadline referenced in the FAQ. It notes that IDFPR inspectors will have scanners available for inspections, that dispensaries do not need RFID readers but may use RFID or regular barcode scanners, and that all packages at dispensaries should be tested with valid COA/lab results in BioTrack or Metrc.

The FAQ also states that dispensaries can look up medical patient allotments in Metrc to see how much is available to purchase, including purchases from other dispensaries.

For POS design, Illinois creates a major near-term moat opportunity around transition support, dual-system inventory hygiene during the BioTrack-to-Metrc migration, tag association, package acceptance/rejection workflows, COA/test-result validation, patient allotment lookup, and reconciliation.

## Receiving and package acceptance

Illinois seed-to-sale FAQs state that manifests can be partially accepted at the package level, but packages should generally be fully accepted or fully rejected. If a package contains problematic units, the suggested compliant workflow is to accept the package and create a new tagged package for the rejected/damaged products, then manifest them back or handle destruction as appropriate. Final inventory must match Metrc data to remain compliant.

For POS/inventory design, Tend-O-Matic should model manifests, packages, child packages, package tags, returns to producer, destruction/waste, and audit notes rather than treating inventory as simple SKU counts.

## Product implications

| Area | Illinois requirement signal | Tend-O-Matic product implication |
|---|---|---|
| Age gate | Adults 21+ may buy cannabis. | Mandatory ID/date-of-birth gate before checkout completion. |
| Adult-use limits | IL residents: 30g flower, 500mg THC infused, 5g concentrate; non-residents: half those limits. | Residency-aware cart limits by product category and THC amount. |
| Medical allotments | Metrc can show available patient allotments across dispensaries. | Medical checkout should query remaining allotment and block/adjust transactions. |
| Seed-to-sale | Illinois is transitioning/has transition material from BioTrack to Metrc; inventory must be in tracking systems. | Robust Metrc integration plus migration tooling from legacy identifiers. |
| Inspections | IDFPR inspectors may use scanners; package tags matter. | Package/tag scan audit workflow and inspector-friendly inventory reports. |
| Testing/COA | Products need valid COA/lab results in BioTrack or Metrc to sell. | Checkout should block products lacking required test/COA state when applicable. |
| Package receiving | Manifests can be partially accepted, but package-level acceptance/rejection needs careful handling. | Build receiving workflows around manifests/packages, not just purchase orders. |
| Source monitoring | IDFPR program notices, responsible vendor materials, Cannabis Quarterly, annual reports, laws/rules, and CROO seed-to-sale pages change over time. | Monitor IDFPR/CROO pages and publish compliance-impact summaries. |

## Open items for deeper Illinois pass

Need further review of Illinois Administrative Code retail operating rules, dispensary operating plan requirements, agent training/responsible vendor requirements, sales tax/excise-tax calculation, receipt requirements, packaging/labeling, advertising, security/video retention, diversion controls, privacy, local zoning, and enforcement/disciplinary patterns.
