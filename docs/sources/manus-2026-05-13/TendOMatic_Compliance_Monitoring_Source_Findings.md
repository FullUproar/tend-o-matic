# Tend-O-Matic Compliance Monitoring Source Findings

## Michigan official monitoring sources

The Michigan CRA correct update URL for general press items is `https://www.michigan.gov/cra/news-releases`, not `/newsroom`. The News Releases page includes a searchable archive and dated press releases, including enforcement actions, federal rescheduling response, formal complaints, recalls, and agency announcements. The official CRA site also exposes footer/resource links for Bulletins, Laws/Rules/Other Resources, Metrc - Statewide Marijuana Monitoring System, Disciplinary Actions, Panel & Public Hearing Information, Calendar of Events, license verification, and a visible email-alert signup form.

Monitoring implication: Tend-O-Matic should watch CRA News Releases, Bulletins, Laws/Rules/Other Resources, Metrc pages, Disciplinary Actions, and Panel/Public Hearing pages. News releases catch recalls and enforcement narratives; bulletins and Metrc pages catch operational changes; disciplinary actions reveal failure patterns; laws/rules pages catch statutory/rule updates.

## Illinois official monitoring sources

The Illinois Cannabis Regulation Oversight Office homepage highlights the Seed-to-Sale Transition to Metrc, METRC FAQs, current news, and the agency split: IDFPR regulates dispensaries, dispensary agents, and agent education providers, while IDOA regulates cultivation-side activities. The official CROO newsletters page at `https://cannabis.illinois.gov/media/newsletters.html` shows official recurring communications, including a December 30, 2025 CROO Seed to Sale Newsletter, September 2025 seed-to-sale items, and weekly Seed-to-Sale newsletters during April-June 2025. The page also links to Press Releases, Reports and Public Presentations, Upcoming Dates, and the state footer includes Get Email Updates.

Monitoring implication: Tend-O-Matic should watch CROO Newsletters, CROO Press Releases, Upcoming Dates, seed-to-sale/Metrc pages and FAQs, IDFPR Adult Use Cannabis Program notices, IDFPR laws/rules pages, Responsible Vendor Program materials, and forms for dispensaries and agents.

## Monitoring architecture note

For both states, the operational monitoring priority is: official regulator alerts and bulletins first, seed-to-sale/Metrc technical and FAQ changes second, statutes/rules third, disciplinary/recall/enforcement pages fourth, and secondary legal/compliance commentary fifth. Alerts should be classified by product surface: checkout limits, ID/age, medical allotment, inventory/package, Metrc/API, taxes/receipts, product eligibility/testing/COA, recall/adverse event, licensing/agent training, reporting/deadline, enforcement risk, or local ordinance.
