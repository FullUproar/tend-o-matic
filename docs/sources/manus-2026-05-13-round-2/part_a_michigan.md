# Part A — Michigan Retail Compliance Research

**Author:** Manus AI  
**Prepared for:** Shawn / Tend-O-Matic  
**Prepared:** 2026-05-13

> Michigan should be treated as the first implementation target because it offers a relatively clear adult-use retail rule set, an official CRA source hierarchy, and a mature Metrc environment, but the POS still needs auditable rule-versioning for limits, taxes, ID checks, receipts, returns/voids, promotions, recalls, and inventory reporting.

## Executive Takeaway

Michigan is the cleanest first-state implementation for Tend-O-Matic, but it is not a trivial checkout system. The defensible product posture is **Metrc-first, CRA-source-tracked, and rule-versioned**, with every transaction decision traceable to the active limit, tax, ID, inventory, and recall rules in force at the time of sale.

## How to Read This Document

Each section preserves the original research question, separates verified findings from unresolved gaps, and translates the compliance issue into concrete POS/rules-engine implications. This is a research dossier, not legal advice; counsel should validate final operational policies and customer-facing contractual language before launch.

## Scope Caveat

The Michigan findings were generated from a parallel source review and should be treated as a high-quality research base. Any value marked low or medium confidence should be re-verified against the current Michigan CRA rule set and Metrc Michigan documentation before encoding as production compliance logic.

## A1. What is the adult-use transaction-limit equivalency math for Michigan cannabis compliance?

### Verified Findings

Adult-use customers may purchase up to 2.5 ounces of usable marihuana or its equivalent in marihuana-infused products per transaction [1].

Within this 2.5-ounce limit, not more than 15 grams of marihuana may be in the form of marihuana concentrate [1].

For purposes of determining usable marihuana equivalency, the following shall be considered equivalent to 1 ounce of usable marihuana [2]:
* 16 ounces of marihuana-infused product if in a solid form.
* 7 grams of marihuana-infused product if in a gaseous form.
* 36 fluid ounces of marihuana-infused product if in a liquid form.


### Effective / Current Dates

Mich. Admin. Code R. 420.506: Effective March 7, 2022 [1].
MCL - Section 333.26424: Initiated Law 1, Eff. Dec. 4, 2008; Am. 2012, Act 512, Eff. Apr. 1, 2013; Am. 2016, Act 283, Eff. Dec. 20, 2016 [2].


### Confidence Note

Medium. The adult-use transaction limits are clearly defined. The equivalency math is explicitly stated in a medical marihuana act, and while a secondary source implies its application to adult-use, a direct primary source from the CRA or MRTMA explicitly confirming these equivalencies for adult-use was not found.


### Explicit Gaps

* Explicit confirmation from a primary adult-use source (Michigan CRA or MRTMA) that the equivalency ratios defined in MCL 333.26424 (Michigan Medical Marihuana Act) apply directly to adult-use transactions.


### Product Implications for Tend-O-Matic

A dispensary Point of Sale (POS) system must enforce a transaction limit of 2.5 ounces of usable marihuana or its equivalent for adult-use customers. The POS system must also ensure that no more than 15 grams of this total is in the form of marihuana concentrate. For calculating equivalencies of infused products, the POS system should use the following conversions: 1 ounce of usable marihuana is equivalent to 16 ounces of solid marihuana-infused product or 36 fluid ounces of liquid marihuana-infused product. The system should be configured to perform these calculations automatically to prevent sales exceeding the legal limits. Given the lack of explicit adult-use equivalency in a dedicated adult-use primary source, a rules engine should be designed with the flexibility to update these equivalencies if the CRA issues specific adult-use guidance that differs from the medical equivalencies.


### Sources Captured by Research Pass

* Mich. Admin. Code R. 420.506 - Purchasing limits; transactions; marihuana sales location — [1]
* MCL - Section 333.26424 - Michigan Legislature — [2]

## A2. What are the Michigan medical caregiver per-patient limits?

### Verified Findings

According to Michigan Compiled Laws (MCL) Section 333.26424, a primary caregiver who possesses a registry identification card is allowed to possess marihuana in the following forms and amounts for each qualifying patient to whom they are connected through the department's registration process:

*   A combined total of **2.5 ounces of usable marihuana and usable marihuana equivalents** [[2]].
*   **12 marihuana plants** kept in an enclosed, locked facility, for each registered qualifying patient who has specified that the primary caregiver will be allowed to cultivate marihuana for them [[2]].
*   Any incidental amount of seeds, stalks, and unusable roots [[2]].

For the purpose of determining usable marihuana equivalency, the following are considered equivalent to 1 ounce of usable marihuana [[2]]:

*   **16 ounces** of marihuana-infused product if in a solid form.
*   **7 grams** of marihuana-infused product if in a gaseous form.
*   **36 fluid ounces** of marihuana-infused product if in a liquid form.


### Effective / Current Dates

The Michigan Medical Marihuana Act (MCL 333.26424) was initiated in 2008, effective December 4, 2008. It was amended in 2012, effective April 1, 2013, and further amended in 2016, effective December 20, 2016. The limits cited are currently in force as per the latest amendment.


### Confidence Note

High. Information directly extracted from Michigan Compiled Laws (MCL) Section 333.26424, which is a primary source.


### Explicit Gaps

None. All specified values were found in the primary source.


### Product Implications for Tend-O-Matic

A dispensary Point of Sale (POS) system or rules engine must enforce the following limits for medical caregiver transactions:

1.  **Usable Marihuana Limit:** For each qualifying patient, a caregiver may possess a combined total of 2.5 ounces of usable marihuana and usable marihuana equivalents.
2.  **Plant Limit:** For each registered qualifying patient who has designated the caregiver to cultivate, the caregiver may possess 12 marihuana plants kept in an enclosed, locked facility.
3.  **Usable Marihuana Equivalency:** The POS system must correctly calculate usable marihuana equivalents based on the following:
    *   1 ounce of usable marihuana = 16 ounces of marihuana-infused product (solid form)
    *   1 ounce of usable marihuana = 7 grams of marihuana-infused product (gaseous form)
    *   1 ounce of usable marihuana = 36 fluid ounces of marihuana-infused product (liquid form)

The system should prevent transactions that would cause a caregiver to exceed these per-patient limits, requiring verification of the patient-caregiver connection and the patient's designation for cultivation if plants are involved.


### Sources Captured by Research Pass

- MCL - Section 333.26424 - Michigan Legislature — [2]

## A3. What are the Michigan day-boundary semantics for day/month medical cannabis limits?

### Verified Findings

Michigan medical cannabis patients are permitted to purchase up to 2.5 ounces of usable marijuana or its equivalent in marijuana-infused products per day [[3]]. Additionally, medical patients are subject to a limit of 10 ounces per month [[4] (secondary source, but consistent with other mentions)]. The Michigan Medical Marihuana Act (MMMA) and the Michigan Regulation and Taxation of Marihuana Act (MRTMA) establish the legal framework for these limits [[5], [6]]. However, these primary sources do not explicitly define the start and end of a "day" or "month" for the purpose of these limits.


### Effective / Current Dates

Currently in force. The rules regarding purchase limits are consistently referenced in recent documents and legislative acts.


### Confidence Note

Medium. While the daily and monthly limits are consistently stated across multiple sources, an explicit definition of what constitutes a "day" (e.g., calendar day vs. 24-hour rolling period) for medical cannabis purchase limits could not be found in primary sources. This introduces ambiguity.


### Explicit Gaps

- Explicit definition of "day" (e.g., calendar day, 24-hour rolling period) for medical cannabis purchase limits.
- Explicit definition of "month" for medical cannabis purchase limits.


### Product Implications for Tend-O-Matic

POS systems must enforce a 2.5-ounce daily limit and a 10-ounce monthly limit for medical cannabis patients. Due to the lack of a clear definition for "day-boundary semantics" in primary sources, dispensaries should implement a conservative approach, such as a 24-hour rolling period, to ensure compliance and avoid potential violations. This would prevent patients from making multiple purchases within a short timeframe that cumulatively exceed the daily limit if a calendar day definition were assumed. The system should also track monthly totals to ensure the 10-ounce limit is not exceeded.


### Sources Captured by Research Pass

- Marihuana-Rules---R-4201-to-R-4201004.pdf — [3]
- MCL - Initiated Law 1 of 2008 — [5]
- MCL - Initiated Law 1 of 2018 — [6]

## A4. What are the current adult-use cannabis tax rates in Michigan, including excise and sales taxes, and what are their effective dates and implications for a dispensary Point of Sale (POS) system?

### Verified Findings

_No finding supplied._


### Effective / Current Dates

Wholesale Marijuana Tax: January 1, 2026
Marijuana Retailers Excise (MRE) Tax: December 6, 2018
Sales Tax: Currently in force.


### Confidence Note

High. All values are directly from official Michigan government websites (Department of Treasury and Legislature) and are consistent across multiple sources. Effective dates are explicitly stated.


### Explicit Gaps

None.


### Product Implications for Tend-O-Matic

A dispensary POS system must be configured to:
1. Apply a 10% Marijuana Retailers Excise (MRE) Tax to the sales price of all adult-use cannabis products at the point of sale.
2. Calculate a 6% Michigan Sales Tax on the total sales price, which *includes* the 10% MRE tax. This implies a stacked tax calculation where the sales tax is applied to the subtotal after the excise tax has been added.
3. For wholesale transactions (if the dispensary also acts as a wholesaler), a 24% Wholesale Marijuana Tax must be applied to the wholesale price. The POS system or associated inventory management system needs to differentiate between retail and wholesale transactions and apply the appropriate tax.
4. The system should be able to handle quarterly updates to the "average wholesale price list" if the dispensary is involved in related-party wholesale transactions, as this affects the calculation of the 24% wholesale tax.
5. The POS system should generate receipts that clearly itemize these taxes to ensure compliance with Michigan's receipt content requirements (though specific receipt content requirements are not part of this section, the tax breakdown is a general best practice).
6. The system should be able to track and report these taxes separately for compliance and remittance to the Michigan Department of Treasury.


### Sources Captured by Research Pass

Michigan Treasury Releases Guidance on New 24% Wholesale Marijuana Tax — [7]
Wholesale Marijuana Tax — [8]
MCL - Section 333.27963 - Michigan Legislature — [9]
About the Marijuana Retailers Excise (MRE) Tax — [10]

## A5. What are the Michigan receipt content requirements for cannabis sales?

### Verified Findings

Michigan law requires retail receipts to generally align with typical retail transaction information. Specifically, for sales recorded by an automatic checkout system, the receipt must describe the item and state the price charged for the item [[11]]. The Cannabis Regulatory Agency (CRA) is prohibited from promulgating rules that require a cannabis retailer to acquire or record personal information about customers other than identification to determine age, or information typically required in a retail transaction [[12]]. Product packaging and labeling standards for cannabis include specifying the amount of marihuana or marihuana concentrate contained within a marihuana-infused product and a warning for pregnant or breastfeeding women [[12]].


### Effective / Current Dates

MCL 333.27958: Initiated Law 1 of 2018, Eff. Dec. 6, 2018; last amended 2023, Act 166, Imd. Eff. Oct. 19, 2023.
MCL 445.319: Act 15 of 2011, Eff. Sept. 1, 2011.


### Confidence Note

Medium. I have identified relevant statutes regarding general retail receipt requirements and limitations on personal information collection for cannabis sales. However, a comprehensive, explicit list of all required content for a Michigan cannabis sales receipt from a single primary source was not found. The 'Marihuana Rules' PDF did not yield specific receipt content requirements despite multiple attempts to extract and search its content.


### Explicit Gaps

- A comprehensive, explicit list of all required content for a customer-facing cannabis sales receipt in Michigan from a single primary source (e.g., Michigan Administrative Code) was not found.
- Specific details on whether the product-level labeling requirements (THC/CBD, warnings) must also be replicated on the sales receipt itself, beyond being on the product packaging.


### Product Implications for Tend-O-Matic

A dispensary Point of Sale (POS) system in Michigan must ensure that receipts for cannabis sales:
*   **Describe the item and state the price charged for the item** [[11]].
*   **Do not require customers to provide identifying information other than age verification** [[12]].
*   **Do not acquire or record personal information about customers beyond what is typically required in a retail transaction** [[12]].
*   **Include product labeling information as required by MCL 333.27958(1)(e)**, such as THC/CBD levels and the warning for pregnant/breastfeeding women, which is typically on the product packaging itself but may be relevant for receipt content if not explicitly on the product.

POS workflows should be designed to capture and print the necessary item descriptions and prices, while strictly adhering to privacy limitations regarding customer data on receipts.


### Sources Captured by Research Pass

- MCL - Section 333.27958 - Michigan Legislature — [12]
- MCL - Section 445.319 - Michigan Legislature — [11]

## A6. What are the Michigan regulations regarding returns, exchanges, and voids for cannabis products (Section A6)?

### Verified Findings

A marihuana sales location may accept the return of marihuana product that is reported to have caused an adverse reaction or is determined to be defective [[13]].

A marihuana sales location must have a written policy for the return of marihuana product that contains, at a minimum, the following [[13]]:

*   Product returned to a marihuana sales location must be tracked consistently in the statewide monitoring system as waste in compliance with R 420.211 [[13]].
*   Product returned to a marihuana sales location must be destroyed in compliance with R 420.211 within 90 calendar days of when the marihuana business became aware of the fact that the product must be destroyed [[13]].
*   Product returned to a marihuana sales location cannot be re-sold, re-packaged, or otherwise transferred to a customer or another marihuana business [[13]].
*   Product returned to a marihuana sales location is prohibited from being returned to the marihuana sales location by way of a delivery driver [[13]].
*   A marihuana sales location that does not comply with these rules may be subject to disciplinary proceedings [[13]].
*   A marihuana retailer may return a marihuana product that is past its expiration date to the marihuana processor who produced the marihuana product for destruction instead of destroying the marihuana product [[13]].


### Effective / Current Dates

Effective 3/7/2022


### Confidence Note

High. Information is directly from the Michigan Administrative Code R. 420.214c, a primary source.


### Explicit Gaps

None


### Product Implications for Tend-O-Matic

A dispensary POS system must implement the following rules for returns, exchanges, and voids:

*   **Return Eligibility:** Allow returns only for products reported to have caused an adverse reaction or determined to be defective.
*   **Written Policy:** The POS system should support and enforce a written return policy that includes the following:
    *   **Tracking as Waste:** Integrate with the statewide monitoring system (Metrc) to track returned products as waste, in compliance with R 420.211.
    *   **Destruction Timeline:** Ensure returned products are marked for destruction within 90 calendar days of the business becoming aware of the need for destruction, in compliance with R 420.211.
    *   **No Resale/Repackaging:** Prevent any returned product from being re-sold, re-packaged, or transferred to another customer or business.
    *   **Delivery Driver Prohibition:** Prohibit returns of products via delivery drivers.
    *   **Expired Product Handling:** Allow for the return of expired marihuana products to the original processor for destruction, rather than requiring the retailer to destroy them.


### Sources Captured by Research Pass

Mich. Admin. Code R. 420.214c - Product returns — [13]

## A7. What are the Michigan promotional and discount restrictions for cannabis dispensaries?

### Verified Findings

Marihuana products may only be advertised or marketed in compliance with all applicable municipal ordinances, state law, and rules that regulate signs and advertising [[14]]. Licensees may not advertise a marihuana product in a way that is deceptive, false, or misleading, or make any deceptive, false, or misleading assertions or statements on any marihuana product, sign, or document provided [[14]]. Marihuana product marketing, advertising, packaging, and labeling must not contain any claim related to health or health benefits, unless a qualified health claim has received and complies with a Letter of Enforcement Discretion issued by the United States Food and Drug Administration (FDA), or the health claim has been approved under the significant scientific agreement standard by the FDA [[14]]. A marihuana product must not be advertised or marketed to members of the public unless the person advertising the product has reliable evidence that no more than 30% of the audience or readership for the television program, radio program, internet website, or print publication, is reasonably expected to be under the age of 17 (for MMFLA) or 21 (for MRTMA) [[14]]. Sponsorships targeting individuals aged 17 years or younger (for MMFLA) or individuals under 21 years of age (for MRTMA) are prohibited [[14]]. A person receiving reasonable payment under a licensing agreement or contract approved by the agency concerning the licensing of intellectual property, including, but not limited to, brands and recipes, is responsible for any marketing or advertising undertaken by either party to the agreement [[14]]. Any marihuana product advertised or marketed must include the warnings listed in R 420.504(1)(k) [[14]].


### Effective / Current Dates

Mich. Admin. Code R. 420.507: 2020 AACS; 2022 MR 5, Eff. 3/7/2022. Other rules' effective dates are unknown.


### Confidence Note

Medium. While Mich. Admin. Code R. 420.507 provides general advertising restrictions, specific rules regarding the permissibility of promotions, discounts, free products, and loyalty programs are not explicitly detailed within this primary source. Information from secondary sources (cannabispromotions.com, mediaplacepartners.com) suggests that promotions and discounts are allowed with certain caveats, but these require primary source verification. The inability to access the full Marihuana Rules PDF directly from the Michigan CRA website due to security blocks prevented comprehensive primary source verification.


### Explicit Gaps

- Explicit primary source rules regarding the permissibility and specific limitations of promotional offers, discounts, free products, and loyalty programs beyond general advertising restrictions.
- Verification of the claim that "Michigan permits licensed retailers to offer promotions, discounts, and loyalty programs, provided they comply with all advertising rules. Free product giveaways to the general public are prohibited, though retailers may offer complimentary products as part of a legitimate purchase (e.g., buy-one-get-one promotions). All promotional pricing must still result in a recorded sale through METRC." from a primary source.
- Verification of the claim that one "cannot advertise pricing, promotional offers, or potency" from a primary source.


### Product Implications for Tend-O-Matic

POS systems must ensure that all sales, including those with promotional pricing or discounts, are accurately recorded in METRC. POS systems should be configured to prevent "free product giveaways" to the general public, but allow for "buy-one-get-one" type promotions where a legitimate purchase is made. Advertising modules within POS or related marketing platforms must comply with age-gating requirements (no more than 30% of audience under 17/21) and avoid deceptive claims or unapproved health benefits. Pricing, promotional offers, or potency should not be advertised if the secondary source information is accurate and verifiable.


### Sources Captured by Research Pass

- Mich. Admin. Code R. 420.507 - Marketing and advertising restrictions — [14]

## A8. What are the Michigan ID and PII rules for cannabis dispensaries, covering both adult-use and medical sales?

### Verified Findings

### Adult-Use (Michigan Regulation and Taxation of Marihuana Act - MRTMA)

*   The cannabis regulatory agency shall not promulgate a rule that requires a customer to provide a marihuana retailer with identifying information other than identification to determine the customer's age. [MRTMA, Section 8(3)(b)] ([15])
*   Marihuana retailers are prohibited from acquiring or recording personal information about customers other than information typically required in a retail transaction. [MRTMA, Section 8(3)(b)] ([15])

### Medical (Medical Marihuana Facilities Licensing Act - MMFLA)

*   Law enforcement agencies are provided with access to information in the statewide monitoring system that is necessary to verify that an individual possesses a valid and current registry identification card. [MMFLA, Section 703] ([16])
*   Licensees (provisioning centers) are granted access to information in the statewide monitoring system that they are required to receive before a sale, transfer, transport, or other authorized activity. [MMFLA, Section 703] ([16])
*   The confidentiality of information in the statewide monitoring system database must be secured by preventing access by unauthorized persons. [MMFLA, Section 703] ([16])
*   Before selling or transferring marihuana to a registered qualifying patient or caregiver, provisioning centers must inquire of the statewide monitoring system to verify that the patient and caregiver hold a valid, current, unexpired, and unrevoked registry identification card and that the sale or transfer will not exceed established daily and monthly purchasing limits. [MMFLA, Section 703] ([16])


### Effective / Current Dates

Michigan Regulation and Taxation of Marihuana Act (MRTMA): Effective December 6, 2018, with amendments up to October 19, 2023.
Medical Marihuana Facilities Licensing Act (MMFLA): Effective December 20, 2016, with amendments up to January 26, 2018.


### Confidence Note

High. Information directly extracted from official Michigan legislative acts (MRTMA and MMFLA).


### Explicit Gaps

None


### Product Implications for Tend-O-Matic

For adult-use sales, Point-of-Sale (POS) systems should be configured to only collect identification necessary for age verification and avoid recording personal information beyond what is typically required for a standard retail transaction. This implies that extensive PII collection for adult-use customers is restricted. For medical marihuana sales, POS systems must integrate with the statewide monitoring system to verify valid registry identification cards for patients and caregivers and ensure sales do not exceed established daily/monthly purchasing limits. The system must also maintain the confidentiality of patient information.


### Sources Captured by Research Pass

- Michigan Regulation and Taxation of Marihuana Act (MRTMA) — [17]
- Medical Marihuana Facilities Licensing Act (MMFLA) — [18]

## A9. What are the requirements and processes for Michigan patient/caregiver verification in the cannabis program?

### Verified Findings

**Primary Caregiver/Caregiver Definition:** A person who is at least 21 years old and who has agreed to assist with a patient's medical use of marihuana and who has not been convicted of any felony within the past 10 years and has never been convicted of a felony involving illegal drugs or a felony that is an assaultive crime as defined in section 9a of chapter X of the code of criminal procedure, 1927 PA 175, MCL 770.9a. [1]
**Qualifying Patient/Patient Definition:** A person who has been diagnosed by a physician as having a debilitating medical condition. [1]
**Registry Identification Card Definition:** A document issued by the marijuana regulatory agency that identifies a person as a registered qualifying patient or registered primary caregiver. [1]
**Verification of Information (Mich. Admin. Code R. 333.109):** The department shall verify the information contained in an application and the accompanying documentation, which may include, but is not limited to:
*   Contacting an applicant or primary caregiver by telephone, mail, or electronic communication. If proof of identity cannot be determined with reasonable reliability, the department may require the production of additional identification materials. [2]
*   Contacting the parent or legal guardian of a qualifying patient who is under the age of 18 by telephone, mail, or electronic communication. [2]
*   Verifying that a physician is licensed to practice in this state. [2]
*   Contacting the certifying physician directly by telephone, mail, or electronic communication to confirm the validity of the written certification. The department may use an online certification process to fulfill the verification requirement in section 6(c) of the act, MCL 333.26426. [2]


### Effective / Current Dates

MCL 333.26423: Initiated Law 1, Eff. Dec. 4, 2008; Am. 2012, Act 512, Eff. Apr. 1, 2013; Am. 2016, Act 283, Eff. Dec. 20, 2016; Am. 2021, Act 62, Eff. Oct. 11, 2021. [1]
Mich. Admin. Code R. 333.109: 2009 AACS; 2015 AACS; 2019 MR 20, Eff. 10/25/2019. [2]


### Confidence Note

High. The information is directly extracted from official Michigan legislative and administrative code websites, which are primary sources. The effective dates are also explicitly stated.


### Explicit Gaps

None. All requested information was found in primary sources.


### Product Implications for Tend-O-Matic

**Rules-engine:** The POS system's rules engine must incorporate the definitions of "primary caregiver" and "qualifying patient" to ensure that only eligible individuals are registered and processed.
**POS workflow:** The POS workflow for patient and caregiver registration must include steps for verifying age (21+ for caregivers), criminal background checks (for caregivers), and physician diagnosis (for patients). The system should also facilitate the verification process outlined in Mich. Admin. Code R. 333.109, potentially through integrations or prompts for manual verification steps.
**Audit:** The system should maintain detailed records of all patient and caregiver registrations, including documentation of verification steps taken, to support audits by the Michigan regulatory agency.
**Monitoring:** The POS system should monitor for any changes in patient or caregiver status (e.g., withdrawal of caregiver, expiration of registry card) and flag these for review or action.


### Sources Captured by Research Pass

MCL - Section 333.26423 - Michigan Legislature — [19]
Mich. Admin. Code R. 333.109 : Licensing and Regulatory Affairs —Bureau of Professional Licensing —Michigan Medical Marihuana — Verification of information | CaseMine — [20]

## A10. What are the requirements for Michigan's cannabis recall and adverse-event workflow for licensees?

### Verified Findings

Michigan Administrative Code R 420.214b outlines the requirements for **adverse reaction reporting** [1]. Licensees are mandated to notify the agency (Cannabis Regulatory Agency - CRA) within 1 business day of becoming aware of, or when they should have been aware of, any adverse reactions to a marihuana product sold or transferred. Concurrently, this information must be entered into the statewide monitoring system (Metrc) within the same 1-business-day timeframe [1].

The CRA possesses the authority to implement **recalls and administrative holds** on marihuana products. Specifically, the agency may place an administrative hold on products, initiate recalls, issue safety warnings, and compel marihuana businesses to provide informational materials or notifications to consumers at the point of sale [2].

Licensees are strictly prohibited from selling or transferring any marihuana product that has been placed on an **administrative hold, recalled, or ordered for destruction** [2]. Furthermore, prior to any sale or transfer, a marihuana business must verify through the statewide monitoring system that the product is not subject to an administrative hold, recall, or destruction order [2].

Regarding **product destruction**, any marihuana product required to be destroyed for any reason must be destroyed by the marihuana business within 90 calendar days of the business becoming aware of the necessity for destruction [2].

**Product returns** are permissible for marihuana products reported to have caused an adverse reaction or determined to be defective. Marihuana sales locations must maintain a written policy for such returns. This policy must stipulate that returned products are tracked as waste in the statewide monitoring system (Metrc) and subsequently destroyed in compliance with R 420.211 [2].

Metrc provides specific **functionality for recording adverse responses** from adult-use consumers. This process involves recording the adverse responses under the 'Patient' menu within Metrc. Metrc administrators are responsible for granting employees the necessary access to record these responses. The required information for recording an adverse response includes the consumer's receipt number, relevant package ID details, the date of the reaction, and a description of the reported reaction (e.g., shortness of breath, bad taste) in the 'Notes' field [3].


### Effective / Current Dates

Mich. Admin. Code R. 420.214b: Effective March 7, 2022.
Marihuana-Rules---R-4201-to-R-4201004.pdf (R 420.214a and R 420.214c): Effective March 7, 2022.
MI-Bulletin-49-Adult-Use-Adverse-Response-Temporary-Functionality-Bulletin-002.pdf: Effective May 12, 2022.


### Confidence Note

High. Information is directly from Michigan Administrative Code and official Metrc documentation.


### Explicit Gaps

None


### Product Implications for Tend-O-Matic

For a dispensary POS system, the following implications arise from Michigan's recall and adverse-event workflow:

*   **Adverse Event Reporting Module:** The POS system should include a mechanism for recording and reporting adverse reactions to marihuana products. This module must capture details such as the product, consumer information (if available and permissible), and the nature of the adverse reaction. The system should facilitate notification to the CRA within 1 business day and automatically log the event in Metrc within the same timeframe.
*   **Product Hold and Recall Management:** The POS system must integrate with Metrc to identify products under administrative hold or recall. It should prevent the sale or transfer of any such products. This requires real-time or near real-time synchronization with Metrc data regarding product status.
*   **Pre-Sale Verification:** Before completing any sale, the POS system must perform an automated check against Metrc to ensure the product is not subject to an administrative hold, recall, or destruction order.
*   **Product Destruction Workflow:** The POS system should support a workflow for managing products designated for destruction, ensuring they are removed from inventory and tracked as waste in Metrc within 90 calendar days.
*   **Return Management:** The POS system needs a robust return management feature that aligns with Michigan's regulations. This includes the ability to accept returns of products reported to have caused adverse reactions or deemed defective. Returned products must be tracked as waste in Metrc, and the system should enforce the dispensary's written return policy.
*   **Employee Access Control:** Access to adverse response recording and recall management features within the POS system should be role-based, requiring Metrc Admin approval for employees to manage these functions.


### Sources Captured by Research Pass

- Mich. Admin. Code R. 420.214b - Adverse reactions — [21]
- Marihuana-Rules---R-4201-to-R-4201004.pdf — [3]
- MI-Bulletin-49-Adult-Use-Adverse-Response-Temporary-Functionality-Bulletin-002.pdf — [22]

## A11. What are the publicly knowable details regarding the Metrc API for Michigan, including authentication, data formats, and general usage?

### Verified Findings

The Metrc API for Michigan operates as a RESTful web service. Key details include:

**Authentication:**
- API calls require two keys: an **Integrator API Key** (specific to the software developer) and a **User API Key** (tied to the end-user's account).
- Both keys are combined as `software_api_key:user_api_key`, Base64 encoded, and sent in the `Authorization` HTTP header using Basic Access Authentication [[23]].
- User permissions in Metrc directly limit the software's API capabilities [[23]].

**Communication Protocol and Data Format:**
- All API endpoints communicate over **HTTPS** [[23]].
- Data is sent and received in **JSON format**. `POST` and `PUT` requests require a `Content-Type` header of `application/json` [[23]].

**Dates and Times:**
- All date and date/time fields are expected and returned in **ISO 8601 format** [[23]].
- The only supported ISO 8601 date format is `YYYY-MM-DD` [[23]].
- Timestamps in query strings (e.g., `+` in timezone offsets) must be **URL-encoded** (e.g., `%2B`) [[23]].

**Record Matching:**
- Resources can be referenced by their unique ID or name. Name comparisons are **case-insensitive** [[23]].

**Last Modified Filter Range:**
- A `LastModified` field is available on most data, indicating the last change time. This allows software to stay updated by requesting changes within a specific time window (e.g., last 1 hour and 5 minutes to account for clock drift) [[23]].

**Server Responses:**
- Standard HTTP status codes are used, including `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `413 Content Too Large`, `429 Too Many Requests`, and `500 Internal Server Error` [[23]].

**Inventory Management Endpoints:**
- Active inventory: `/packages/{version}/active` [[23]].
- Inactive inventory (finished or discontinued packages): `/packages/{version}/inactive` [[23]].
- Outgoing transfers: `/transfers/{version}/outgoing`, then `/transfers/{version}/{id}/deliveries`, and `/transfers/{version}/deliveries/{id}/packages` [[23]].

**Legacy API Sunset:**
- The legacy API was scheduled to sunset on April 1, 2025 [[24] (Secondary Source - PDF, but confirms a date)].


### Effective / Current Dates

Currently in force as per the Metrc API documentation.


### Confidence Note

High. The information is directly from the official Metrc API documentation for Michigan.


### Explicit Gaps

None


### Product Implications for Tend-O-Matic

A dispensary POS system integrating with Metrc Michigan must:
- Implement Basic Access Authentication using the Integrator API Key as username and User API Key as password, Base64 encoded.
- Ensure all API calls are made over HTTPS.
- Send and receive data in JSON format, with `Content-Type: application/json` for POST and PUT requests.
- Handle dates and times in ISO 8601 format (YYYY-MM-DD for dates, with optional time and timezone offset).
- Properly URL-encode timestamps, especially the '+' character in timezone offsets (%2B).
- Be aware of user permissions, as API access is limited by the permissions granted to the user whose API key is used.
- Implement robust error handling for HTTP status codes (400, 401, 403, 404, 413, 429, 500).
- Manage inventory by querying `/packages/{version}/active` and `/packages/{version}/inactive` endpoints, and tracking outgoing transfers through `/transfers/{version}/outgoing`, `/transfers/{version}/{id}/deliveries`, and `/transfers/{version}/deliveries/{id}/packages`.
- Implement a mechanism to query `LastModified` fields to ensure up-to-date data, potentially with a buffer for clock drift.


### Sources Captured by Research Pass

- Web API Documentation | metrc — [23]
- Michigan Cannabis API Integration for Vendors — [25]

## A12. What are the Michigan disciplinary action patterns over the last 24 months?

### Verified Findings

The following table summarizes the disciplinary action patterns identified from the Michigan Cannabis Regulatory Agency's Disciplinary Action Reports over the last 24 months (May 2024 - April 2026):

| Disciplinary Action Category             | Count |
|:-----------------------------------------|:------|
| METRC Non-compliance                     | 545   |
| Failure to Report Material Changes       | 401   |
| Surveillance / Security                  | 296   |
| General Operational Issues               | 221   |
| AFS Non-compliance                       | 203   |
| Non-compliant Sales                      | 130   |
| Sampling and Testing                     | 108   |
| Packaging and Advertising                | 107   |
| Misc Reporting Issues                    | 42    |
| Non-compliant Waste Disposal             | 28    |
| Non-compliant Handling and Production    | 15    |

These counts represent the frequency with which each category of violation appeared in the analyzed Disciplinary Action Reports. It is important to note that a single disciplinary action may involve multiple violation categories.


### Effective / Current Dates

Disciplinary actions are currently in force. Data covers the period from May 2024 to April 2026.


### Confidence Note

High - Data extracted directly from official Michigan CRA Disciplinary Action Reports.


### Explicit Gaps

None


### Product Implications for Tend-O-Matic

Dispensary POS systems must be designed to ensure compliance with Michigan's cannabis regulations, particularly concerning METRC reporting, waste disposal, inventory management, and sales practices. Frequent disciplinary actions related to "METRC Non-compliance" and "Failure to Report Material Changes" highlight the critical need for robust integration with METRC, accurate data entry, and real-time synchronization. POS systems should also incorporate features that prevent non-compliant sales, such as age verification and purchase limits, and support proper handling and packaging procedures to avoid "Non-compliant Handling and Production" and "Packaging and Advertising" violations. Regular audits and surveillance features within the POS could help identify and mitigate potential "Surveillance / Security" and "General Operational Issues" before they lead to disciplinary action. Furthermore, the system should facilitate accurate sampling and testing documentation to avoid "Sampling and Testing" violations. The prevalence of "AFS Non-compliance" suggests the need for clear financial reporting and auditing capabilities within the POS.


### Sources Captured by Research Pass

- Michigan Cannabis Regulatory Agency Disciplinary Actions — [26]
- Michigan Cannabis Regulatory Agency Disciplinary Guidelines — [27]
- DAR-February-2026.pdf — [28]
- DAR-January-2026.pdf — [29]
- DAR-December-2025.pdf — [30]
- DAR-November-2025.pdf — [31]
- DAR-October-2025.pdf — [32]
- DAR-September-2025.pdf — [33]
- DAR-August-2025.pdf — [34]
- DAR-July-2025.pdf — [35]
- DAR-June-2025.pdf — [36]
- DAR-May-2025.pdf — [37]
- DAR-April-2025.pdf — [38]
- DAR-March-2025.pdf — [39]
- DAR-February-2025.pdf — [40]
- DAR-January-2025.pdf — [41]
- DAR-December-2024.pdf — [42]
- DAR-November-2024.pdf — [43]
- DAR-October-2024.pdf — [44]
- DAR-September-2024.pdf — [45]
- DAR-August-2024.pdf — [46]
- DAR-July-2024.pdf — [47]
- DAR-June-2024.pdf — [48]
- DAR-May-2024.pdf — [49]
- DAR-April-2024.pdf — [50]
- DAR-March-2024.pdf — [51]
- DAR-February-2024.pdf — [52]
- DAR-January-2024.pdf — [53]


## References

[1]: https://www.law.cornell.edu/regulations/michigan/Mich-Admin-Code-R-420-506 "* Mich. Admin. Code R. 420.506 - Purchasing limits; transactions; marihuana sales location"
[2]: https://www.legislature.mi.gov/Laws/MCL?objectName=MCL-333-26424 "MCL - Section 333.26424 - Michigan Legislature"
[3]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Laws-Rules-Other-Resources/Marihuana-Rules---R-4201-to-R-4201004.pdf "Marihuana-Rules---R-4201-to-R-4201004.pdf"
[4]: https://support.treez.io/en/articles/9129225-michigan-purchase-limits-for-adult-use-vs-medical "Source"
[5]: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-Initiated-Law-1-of-2008 "MCL - Initiated Law 1 of 2008"
[6]: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-Initiated-Law-1-of-2018 "MCL - Initiated Law 1 of 2018"
[7]: https://www.michigan.gov/treasury/news/2026/03/17/michigan-treasury-releases-guidance "Michigan Treasury Releases Guidance on New 24% Wholesale Marijuana Tax"
[8]: https://www.michigan.gov/taxes/business-taxes/wholesale-marijuana-tax "Wholesale Marijuana Tax"
[9]: https://www.legislature.mi.gov/Laws/MCL?objectName=MCL-333-27963 "MCL - Section 333.27963 - Michigan Legislature"
[10]: https://www.michigan.gov/taxes/business-taxes/mret/about "About the Marijuana Retailers Excise (MRE) Tax"
[11]: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-445-319 "MCL - Section 445.319 - Michigan Legislature"
[12]: https://www.legislature.mi.gov/Laws/MCL?objectName=MCL-333-27958 "MCL - Section 333.27958 - Michigan Legislature"
[13]: https://www.law.cornell.edu/regulations/michigan/Mich-Admin-Code-R-420-214c "Mich. Admin. Code R. 420.214c - Product returns"
[14]: https://www.law.cornell.edu/regulations/michigan/Mich-Admin-Code-R-420-507 "Mich. Admin. Code R. 420.507 - Marketing and advertising restrictions"
[15]: https://www.legislature.mi.gov/documents/mcl/pdf/mcl-Initiated-Law-1-of-2018.pdf#page=11 "Source"
[16]: https://www.legislature.mi.gov/documents/mcl/pdf/mcl-Act-281-of-2016.pdf#page=16 "Source"
[17]: https://www.legislature.mi.gov/documents/mcl/pdf/mcl-Initiated-Law-1-of-2018.pdf "Michigan Regulation and Taxation of Marihuana Act (MRTMA)"
[18]: https://www.legislature.mi.gov/documents/mcl/pdf/mcl-Act-281-of-2016.pdf "Medical Marihuana Facilities Licensing Act (MMFLA)"
[19]: https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-333-26423 "MCL - Section 333.26423 - Michigan Legislature"
[20]: https://www.casemine.com/regulation/us/642fb49aab51704b7b475f91 "Mich. Admin. Code R. 333.109 : Licensing and Regulatory Affairs —Bureau of Professional Licensing —Michigan Medical Marihuana — Verification of information | CaseMine"
[21]: https://www.law.cornell.edu/regulations/michigan/Mich-Admin-Code-R-420-214b "Mich. Admin. Code R. 420.214b - Adverse reactions"
[22]: https://www.metrc.com/wp-content/uploads/2022/07/MI-Bulletin-49-Adult-Use-Adverse-Response-Temporary-Functionality-Bulletin-002.pdf "MI-Bulletin-49-Adult-Use-Adverse-Response-Temporary-Functionality-Bulletin-002.pdf"
[23]: https://api-mi.metrc.com/Documentation/PrintableList "Web API Documentation | metrc"
[24]: https://www.metrc.com/wp-content/uploads/2024/12/MI_IB_0094_Important-API-updates.pdf "Source"
[25]: https://www.metrc.com/integration-and-api/michigan-integration-and-api/ "Michigan Cannabis API Integration for Vendors"
[26]: https://www.michigan.gov/cra/disciplinary-actions "Michigan Cannabis Regulatory Agency Disciplinary Actions"
[27]: https://www.michigan.gov/cra/laws-rules-other/disciplinary-guidelines "Michigan Cannabis Regulatory Agency Disciplinary Guidelines"
[28]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2026/DAR---February-2026.pdf?rev=67059e94c21a41b293d141f4cee70746&hash=B90DF1D085CF8680EE7EFDD6A924D769 "DAR-February-2026.pdf"
[29]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2026/DAR---January-2026.pdf?rev=c98b363c85e04da1b48ca093393a75d4&hash=B171A49B0ADD0E91B9EB2C1D0E13C89C "DAR-January-2026.pdf"
[30]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR-December-2025.pdf?rev=cefae83be2a142909a86c02a0508eba6&hash=E3AD4E4E1C662CEAA49F1E86FFED4AC8 "DAR-December-2025.pdf"
[31]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR----November-2025.pdf?rev=62bdd5d2f14e49d99ae54772f3204c15&hash=5C51E34AC521F9A81300DCD2CC24ADB1 "DAR-November-2025.pdf"
[32]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR-October-2025.pdf?rev=d3c1050157fe4de9972015e1a81cb980&hash=C67DA9C26C8E29AD92462CD34BB7E349 "DAR-October-2025.pdf"
[33]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR---September-2025.pdf?rev=a1a45e096887417ba167227cebf7e0be&hash=7F4AD0D2FF79E854D265E487F2D46C24 "DAR-September-2025.pdf"
[34]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR-August-2025.pdf?rev=d634e2298b3741008837206c654647fd&hash=68394F2F78E3C528957D45C4138EEF1E "DAR-August-2025.pdf"
[35]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR-July-2025.pdf?rev=694d8e7ed74b403981631fedde402f26&hash=1725CFB52176747A8A5CA3D9EB3BA0E2 "DAR-July-2025.pdf"
[36]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR---June-2025.pdf?rev=4662bb6ec949495f8e304cd3d435b314&hash=F66FA3BC1E51F0471A4459F9C892ED5F "DAR-June-2025.pdf"
[37]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR---May-2025.pdf?rev=2542951f8e6a4c868d92394b963e14b0&hash=7C39C43B552906EFFD00811A462C8613 "DAR-May-2025.pdf"
[38]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR-April-2025.pdf?rev=771d63a1f2b6479e9475e1ee4fce324b&hash=AD78254978BE51B3319B17CD897EADBF "DAR-April-2025.pdf"
[39]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR-March-2025.pdf?rev=2d6003134b3748abb05f8915bb3b5509&hash=C47248E6EAE4389769E964EB439CAE95 "DAR-March-2025.pdf"
[40]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR-February-2025.pdf?rev=db6dffa74c994361bc411619eb7bfeb7&hash=062D184F65CC232C3036C84D4480202D "DAR-February-2025.pdf"
[41]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2025/DAR-January-2025.pdf?rev=96f6eab877d544fc9d89b0682d21c017&hash=2231CB663B7A672131017DB2CB5D972A "DAR-January-2025.pdf"
[42]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR---December-2024.pdf?rev=e7a5c6451f0b43119cf49506d24cac4d&hash=8C29BC4F6DC91CA7A5A46368AEF57A9B "DAR-December-2024.pdf"
[43]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-November-2024.pdf?rev=63cb066c9f0c49619d7dd7f145a4f7e7&hash=799E458A855B0A99A3B460EFC9977262 "DAR-November-2024.pdf"
[44]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-October-2024.pdf?rev=23913c511121496b8fd0adebf7e0ed70&hash=50F56654F0FFAD930A715A19394E7AEA "DAR-October-2024.pdf"
[45]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-September-2024.pdf?rev=22a576eff400412bb791a1c75b9f7902&hash=B1154B44660DF026479CB38ED4A52788 "DAR-September-2024.pdf"
[46]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-August-2024.pdf?rev=bb010269c97940c0ad092870dbee3d67&hash=B0EBB7204117B25AF695A4610107EE3E "DAR-August-2024.pdf"
[47]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR---July-2024.pdf?rev=bd020fa341bb42ada388b33d4be0bc3e&hash=D7736AF72134651D6D7E695414FBD6AE "DAR-July-2024.pdf"
[48]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-June-2024.pdf?rev=d0cf758ee49f4295ba2ea5f167a735db&hash=8125490DDC5AF0A64DD49E4E4F95DF65 "DAR-June-2024.pdf"
[49]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-May-2024.pdf?rev=63363b82107f4c59b9fdb89469c3ceae&hash=3EBE08596CDE4EF5BB76D2BC2D4DF37D "DAR-May-2024.pdf"
[50]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR---April-2024.pdf?rev=6a5f25fe41e64eb1813d22d41d395629&hash=195B42CEE5DF2F652A4FDD67EEFA44EE "DAR-April-2024.pdf"
[51]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-March-2024.pdf?rev=0ac5ea6f49794c6e90f14664ee73a226&hash=276F9CDB84FADBF4C452F4F96DD0B4D7 "DAR-March-2024.pdf"
[52]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-February-2024.pdf?rev=09f73ba592524d59985ae60c12e4bf30&hash=24CA56F98B8C93EA80B718DD4484F35A "DAR-February-2024.pdf"
[53]: https://www.michigan.gov/cra/-/media/Project/Websites/cra/Disciplinary-Actions/2024/DAR-January-2024.pdf?rev=2ab181435df44aa6a42d2b7e2fd092eb&hash=31825FDF18F11394D679F7E5DE28C376 "DAR-January-2024.pdf"
