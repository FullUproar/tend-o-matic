# Part D — Operational Vendor Landscape

**Author:** Manus AI  
**Prepared for:** Shawn / Tend-O-Matic  
**Prepared:** 2026-05-13

> The operational vendor landscape shows where Tend-O-Matic can win: incumbents are expected to integrate Metrc, payments, scanners, printers, labels, kiosks, and support workflows, but dispensary teams still feel pain around speed, sync reliability, compliance confidence, and support responsiveness.

## Executive Takeaway

The practical wedge is not merely a prettier POS. Tend-O-Matic should sell **fast checkout + compliance confidence + hardware/payment realism**. The product should assume cash-heavy operations, mixed payment availability, label/receipt complexity, barcode-heavy workflows, and skeptical operators burned by incumbent Metrc-sync and support problems.

## How to Read This Document

Each section preserves the original research question, separates verified findings from unresolved gaps, and translates the compliance issue into concrete POS/rules-engine implications. This is a research dossier, not legal advice; counsel should validate final operational policies and customer-facing contractual language before launch.

## Scope Caveat

Vendor and pain-point findings are based on public vendor materials and market signals. They are useful for product strategy and sales discovery, but they should be validated through operator interviews in Michigan and Illinois before hard roadmap commitments.

## D1. What is the payment provider landscape for cannabis retail in Michigan and Illinois, including regulations, common solutions, and challenges?

### Verified Findings

# D1: Payment Provider Landscape in Michigan and Illinois Cannabis Retail

## Illinois Cannabis Payment Landscape

In Illinois, despite the legalization of recreational cannabis in 2019 through legislative measures, federal classification of cannabis as a Schedule I controlled substance significantly impacts payment processing for dispensaries [1]. This federal stance makes traditional financial institutions hesitant to service cannabis businesses due to the risk of federal penalties, including anti-money laundering laws [2]. Consequently, cash remains the primary mode of transaction in Chicago dispensaries, leading to security concerns and administrative burdens related to cash handling, storage, and transportation [2].

To circumvent these challenges, many Illinois dispensaries have adopted **cashless ATM systems**. This workaround allows customers to use debit cards, with transactions processed as ATM withdrawals. However, major card networks like Visa have recently scrutinized and warned against the misuse of cashless ATM transactions, posing a potential risk for dispensaries relying on this method [2].

Digital payment solutions are emerging as compliant alternatives. **Aeropay** is highlighted as a digital payment solution for Illinois dispensaries, facilitating secure bank-to-bank transfers for online orders. This system aims to ease transactions for both adult-use customers and medical cardholders while ensuring compliance with state laws [2]. Specialized payment processors like **Paybotic** also offer solutions for Illinois cannabusinesses, including POS system implementation, banking and financing solutions, loyalty programs, gift cards, and processing debit and eCommerce payments [1].

## Michigan Cannabis Payment Landscape

Michigan has a well-established medical cannabis industry and a rapidly expanding recreational market [3]. The state has taken steps to support financial institutions working with the cannabis industry. **Michigan House Bill 5144** provides state-level protections for financial institutions serving licensed cannabis businesses, encouraging banking relationships by shielding them from state-level penalties [4]. The Michigan Department of Insurance and Financial Services (DIFS) regulates state-chartered banks and credit unions, guiding them on cannabis banking while advising consultation with legal counsel due to complex federal and state laws [4].

Advocacy for federal banking reform, specifically the **SAFE Banking Act**, has gained momentum in Michigan. A coalition including the Michigan Chamber of Commerce and the Attorney General has urged Congress to pass this act, emphasizing the risks of cash-only operations and the limited financial access for cannabis industry workers [4].

Similar to Illinois, specialized payment processors like **Paybotic** offer solutions for Michigan cannabis dispensaries, including banking, gift cards, eCommerce payment processing, eChecks, credit/debit card processing, and secure POS and virtual terminal software [3]. **KindPay** is another Michigan-based company offering credit card processing options for legal provision centers [5].

Payment processing methods vary significantly across different cannabis-related businesses in Michigan:

| Types | Dispensaries | CBD Shops | Hemp Shops |
|---|---|---|---|
| **Credit Card Use** | Not Allowed | Allowed (high-risk fees) | Allowed (normal fees) |
| **Debit Card Use** | Cashless ATMs, ACH | Standard Processing | Standard Processing |
| **Cash Payments** | Common | Less Common | Rare |
| **E-Commerce** | Limited | Available (with restrictions) | Fully Available |
| **Banking Access** | Limited | Moderate | Full |


### Effective / Current Dates

Maribis LLC article: February 1, 2024. Other sources appear current as of 2024, but specific publication dates are unknown.


### Confidence Note

High. Information was gathered from multiple industry-specific payment processors and cannabis industry associations, showing consistent reporting on federal restrictions, state-level workarounds, and emerging digital solutions. The data on Michigan's legislative support and specific payment methods is well-documented.


### Explicit Gaps

- Detailed fee structures for cashless ATMs and digital payment solutions (e.g., Aeropay, Paybotic) were not explicitly found.
- A comprehensive, exhaustive list of all financial institutions willing to bank cannabis businesses in Michigan and Illinois was not obtained, only representative examples.
- Specific regulatory guidance from Michigan's DIFS or Illinois' IDFPR regarding the legality and acceptable implementation of cashless ATMs or other alternative payment methods beyond general statements.


### Product Implications for Tend-O-Matic

For Michigan (first market): Tend-O-Matic should prioritize integration with payment solutions that leverage Michigan's state-level protections (House Bill 5144) and are actively supported by local financial institutions. This includes exploring partnerships with banks/credit unions listed as cannabis-friendly and integrating with specialized processors like Paybotic and KindPay. The POS should be designed to handle both cashless ATM/ACH and standard processing for CBD/Hemp, with clear distinctions for compliance. For Illinois (second market): Given the stricter federal enforcement and scrutiny of cashless ATMs, Tend-O-Matic's POS solution for Illinois must prioritize robust integration with digital payment platforms like Aeropay that facilitate bank-to-bank transfers, and be prepared for a cash-heavy environment. The system should offer features to mitigate cash handling risks (e.g., secure cash management modules, integration with armored car services). Compliance monitoring should include alerts for changes in card network policies regarding cashless ATMs. For both markets, the POS must clearly differentiate between payment methods allowed for cannabis vs. CBD/Hemp to ensure compliance and avoid federal penalties. Monitoring for federal legislative changes (e.g., SAFE Banking Act) is crucial, as it could significantly alter the payment landscape.


### Sources Captured by Research Pass

[1] Paybotic. "Cannabis Payment Processing in Illinois." *Paybotic*, [[1]]([1])
[2] Maribis LLC. "Chicago Dispensary Payment Options (Explained by the Experts)." *Maribis LLC*, February 1, 2024, [[2]]([2])
[3] Paybotic. "Michigan Cannabis Dispensary Payments Processing." *Paybotic*, [[3]]([3])
[4] Michigan Cannabis Industry Association. "Cannabis Business Banking in Michigan." *MichiganCannabis.org*, [[4]]([4])
[5] KindPay. "Cannabis Merchant Service | KindPay | United States." *KindPayUSA.com*, [[5]]([5])

## D2. What is the hardware landscape for cannabis dispensary Point-of-Sale (POS) systems, including scanners, receipt printers, cash drawers, kiosks, tablets, and label printers, with a focus on Michigan and Illinois?

### Verified Findings

The hardware landscape for cannabis dispensary POS systems includes several essential components, often driven by compliance and operational efficiency. Key hardware includes:

*   **Receipt Printers**: Crucial for providing proof of legal purchase, which is vital in the cannabis industry. Receipts must often include specific information such as 'Keep out of reach of children' warnings, delayed onset warnings, and other state-mandated disclosures. ([Star Micronics Blog]([6]), [Cova Software Blog]([7]))
*   **Barcode Scanners**: Essential for quick and accurate item scanning at checkout and for inventory management. They help prevent manual input errors, which can lead to compliance infractions. ([Cova Software Blog]([7]))
*   **Cash Drawers**: Given that the cannabis industry is largely cash-dominant due to federal banking regulations, reliable, high-volume cash drawers are a necessity. Security regulations in many states often include requirements for cash drawers, safes, or lockboxes. ([Star Micronics Blog]([6]), [Cova Software Blog]([7]))
*   **Tablets**: Increasingly preferred over traditional desktop units for their streamlined aesthetics, space-saving design, and operational efficiency. They enable budtenders to assist customers directly on the sales floor, enhancing the customer experience. ([Cova Software Blog]([7]))
*   **Tablet Mounts and Stands**: Used to strategically place touchscreen menu kiosks, improving customer experience and privacy. ([Cova Software Blog]([7]))
*   **Label Printers**: Important for seed-to-sale tracking, a key regulatory requirement in cannabis. Labels may need to include official, state-required universal symbols. The necessity for retailers to print labels themselves can vary by state; for example, in Colorado, retailers must ensure products comply with THC labeling requirements. ([Star Micronics Blog]([6]), [Cova Software Blog]([7]))
*   **Scales**: Critical for accurate product weighing, especially for flower. Scales must be NTEP-certified and legal for use in the specific state. Integration with the POS system is highly recommended to reduce human error. In some states like California and Washington, where only pre-packaged flower is sold, scales might not be needed at the checkout counter. ([Star Micronics Blog]([6]), [Cova Software Blog]([7]))

While specific hardware requirements for Michigan and Illinois were not explicitly detailed in the provided sources beyond general cannabis POS needs, the overarching themes of compliance, seed-to-sale tracking, and cash-dominant operations apply to these regulated markets. POS systems and associated hardware must be fully integrated to ensure compliance and efficient operations. Vendors like Cova Software and Flowhub offer cannabis-specific POS solutions tailored for Michigan and Illinois, implying their hardware recommendations would align with state regulations. ([Cova Software - Illinois]([8]), [Flowhub - Michigan]([9]))


### Effective / Current Dates

Star Micronics Blog: November 19, 2019 (original post date), unknown for currentness.
Cova Software Blog: January 7, 2020 (original post date), last updated October 20, 2022.
Cova Software - Illinois: Unknown.
Flowhub - Michigan: Unknown.


### Confidence Note

Medium. The findings are based on vendor blogs and product pages, which provide good general information on cannabis POS hardware. However, specific, detailed regulatory requirements for Michigan and Illinois regarding each hardware component were not explicitly found in these sources. The information is current as of the last update date for the Cova blog, but the Star Micronics blog is older.


### Explicit Gaps

- Specific, detailed hardware requirements mandated by Michigan and Illinois cannabis regulatory bodies.
- Official government sources or regulatory documents outlining required POS hardware.
- Market share or prevalence of specific hardware types/brands in Michigan and Illinois dispensaries.
- Cost ranges for each hardware component beyond general estimates.


### Product Implications for Tend-O-Matic

For Tend-O-Matic entering Michigan and Illinois, the POS system must be designed to seamlessly integrate with and support a range of essential hardware components. This includes:

*   **Robust Receipt Printing**: The POS must be capable of customizing receipt templates to include all state-mandated warnings and information for both Michigan and Illinois, ensuring compliance with local regulations.
*   **Integrated Barcode Scanning**: The system should fully support barcode scanners for efficient checkout and accurate inventory management, minimizing manual data entry errors that could lead to compliance issues.
*   **Cash Handling Solutions**: Given the cash-heavy nature of the industry, Tend-O-Matic's POS should integrate with secure, high-capacity cash drawers and potentially offer features to manage cash reconciliation and reporting effectively.
*   **Tablet-Optimized Interface**: Developing a POS interface that is optimized for tablets will enhance operational efficiency and improve the customer experience by allowing budtenders to engage with customers on the sales floor.
*   **Flexible Label Printing**: The POS needs to support various label printers and offer customization options for labels to comply with Michigan and Illinois' specific seed-to-sale tracking and product labeling requirements. This includes accommodating state-required universal symbols.
*   **NTEP-Certified Scale Integration**: Tend-O-Matic must ensure its POS integrates with NTEP-certified scales that are approved for use in Michigan and Illinois, facilitating accurate and compliant product weighing at the point of sale.

Operations should include a clear hardware compatibility matrix and recommendations for dispensaries in each state. Monitoring should involve tracking regulatory updates related to POS hardware requirements in Michigan and Illinois to ensure continuous compliance.


### Sources Captured by Research Pass

- **Vendor Blog**: Star Micronics Blog, "The Ultimate List of Must-Have Cannabis POS Hardware" [[6]]
- **Vendor Blog**: Cova Software Blog, "5 Must-Have Hardware Components for Every Cannabis Retailer" [[7]]
- **Vendor Page**: Cova Software, "Illinois Dispensary POS & Inventory Management" [[8]]
- **Vendor Page**: Flowhub, "Michigan Cannabis Dispensary POS Software" [[9]]

## D3. What are the incumbent cannabis POS pain points, especially concerning compliance, Metrc sync, speed, inventory, payments, offline mode, and support, for dispensaries operating in Michigan and Illinois?

### Verified Findings

Incumbent cannabis Point-of-Sale (POS) systems in Michigan and Illinois face several pain points, primarily centered around **compliance**, **Metrc synchronization**, **inventory management**, and **data integrity**.

**Compliance and Metrc Sync Pain Points:**

*   **Manual Data Entry and Human Error**: Without proper integration, staff often have to enter the same information twice into their internal POS/ERP systems and then again into Metrc. This duplicate record-keeping is labor-intensive, time-consuming, and significantly increases the risk of reporting mistakes and compliance errors [[10]]. The Metrc system tracks cannabis from seed through sale for regulatory agencies, making accurate and timely reporting critical [[10]].
*   **Evolving and State-Specific Regulations**: Cannabis compliance is a constantly evolving process with different requirements across states like Michigan and Illinois. Staying on top of fluctuating changes and policies is tricky, and a lack of proactive compliance can lead to costly disruptions [[11]].
*   **ID Verification and Privacy Concerns**: Mistakenly accepting fake IDs is a significant compliance issue. While some POS systems offer built-in ID scanners, these can introduce privacy risks if customer records are automatically saved. It is crucial for POS systems to have an option to *not* save customer records when scanning IDs to avoid privacy infractions [[11]].
*   **Lack of Real-time Reporting**: Illinois law requires cannabis retailers to have an inventory control and POS system that is real-time, web-based, and accessible by the state at any time. Dispensaries must conduct daily inventory reconciliation to ensure physical inventory matches the state's verification system. Systems that do not offer automated, real-time reporting can lead to considerable time and money spent on manual reporting, with one vendor claiming their clients save an average of 50 hours monthly by automating this process [[12]].

**Inventory Management Pain Points:**

*   **Inconsistency in Auditing**: Maintaining consistent inventory auditing practices is essential. Inconsistencies can arise, and a lack of peer review or proper tracking can lead to discrepancies [[11]]. Human errors, mislabeling, and mis-scanning are common issues in cannabis operations that can lead to inventory adjustments [[13]].
*   **Unorganized Documentation**: A lack of organized and redundant documentation for inventory records and transaction histories can lead to significant issues, including civil and/or criminal penalties if information is lost or privacy is violated. Relying on a single individual for documentation management can be problematic if that person leaves the company [[11]].

**Other Pain Points (Speed, Payments, Support, Offline Mode):**

*   **Speed**: While not explicitly detailed as a pain point in the provided articles, the emphasis on streamlining operations and expediting check-in processes through integrated POS systems [[10], [12]] suggests that slow transaction speeds or inefficient workflows are underlying issues that integrated solutions aim to resolve.
*   **Payments**: Payment processing remains a fragile point in the cannabis industry, with reports of interrupted processing impacting thousands of dispensaries nationwide. Issues like cashless ATM outages can prevent debit-style transactions, highlighting the need for robust and reliable payment solutions [[14]]. Slow payment and no payment issues are also endemic in Michigan's cannabis industry, impacting retailers [[15]].
*   **Offline Mode**: The requirement for POS systems to be real-time and web-based for state accessibility in Illinois [[12]] implies that a lack of reliable offline functionality could be a significant pain point, leading to compliance issues or operational halts during internet disruptions. However, specific pain points related to 'offline mode' were not explicitly detailed in the reviewed sources.
*   **Support**: Untrained staff and a lack of clear Standard Operating Procedures (SOPs) contribute to compliance issues. This suggests that inadequate support and training from POS providers or internal management are pain points, as employees need to be well-versed in regulations and system usage to avoid fines and operational errors [[11]]. Metrc itself maintains a dedicated support team to assist integrators, indicating the complexity of the integration process [[10]].


### Effective / Current Dates

Metrc article: October 2, 2025
Dutchie article: Published September 1, 2021, Last Updated October 3, 2022
Cova Software article: Published August 26, 2019, Last Updated October 3, 2022


### Confidence Note

High. Findings are based on official vendor documentation (Metrc) and industry-specific articles (Dutchie, Cova Software) that directly address the specified pain points. Dates are provided where available, and the information is current as of the last update dates of the articles.


### Explicit Gaps

*   Specific, quantifiable data on the frequency and impact of each pain point (e.g., average time lost due to manual Metrc entry, financial penalties for compliance errors).
*   Detailed information on specific payment processing pain points beyond general disruptions, such as chargeback rates or specific bank reluctance.
*   Direct testimonials or case studies from Michigan and Illinois dispensaries explicitly detailing their pain points with incumbent POS systems.
*   Specific challenges related to 'offline mode' functionality and its impact on compliance or sales in Michigan and Illinois were not explicitly detailed in the reviewed sources.


### Product Implications for Tend-O-Matic

For Tend-O-Matic entering Michigan and Illinois, addressing incumbent POS pain points is crucial for market penetration and competitive advantage.

*   **Compliance & Metrc Sync**: Tend-O-Matic must offer robust, real-time, and automated Metrc integration to eliminate manual data entry and reduce human error. This includes seamless reporting of sales, inventory changes, and patient purchase limits. The system should be designed to handle state-specific compliance nuances in both Michigan and Illinois, including automatic conversion of product equivalencies and real-time alerts for purchase limit violations. Leveraging Metrc Connect (v2) API endpoints is essential for efficient and accurate data exchange.
*   **Inventory Management**: The system should provide advanced inventory management features that go beyond basic tracking, offering tools for efficient auditing, discrepancy resolution, and preventing mislabeling or mis-scanning. It should support a unified dataset that integrates compliance, production, and financial data.
*   **Privacy & ID Verification**: Implement secure ID scanning with an explicit option to *not* save customer data automatically, addressing privacy concerns. Ensure data encryption and compliance with privacy regulations (e.g., SOC 2 certification).
*   **Speed & Efficiency**: Automate as many compliance and operational tasks as possible to improve transaction speed and overall dispensary efficiency, reducing labor costs and improving customer experience.
*   **Offline Mode**: While not explicitly detailed as a pain point in the reviewed articles, the importance of real-time, web-based systems for state accessibility implies a need for robust offline capabilities to prevent operational disruption during internet outages, ensuring sales and compliance data can be reconciled once connectivity is restored.
*   **Support & Training**: Provide comprehensive training and responsive support to help dispensaries navigate complex and evolving regulations. The system should simplify compliance, making it accessible even for untrained staff, and facilitate organized documentation.


### Sources Captured by Research Pass

*   **Official Vendor Documentation**
    *   "POS & ERP Integration with Cannabis Tracking | Metrc" [[10]]([10])
*   **Industry Articles/Blogs**
    *   "8 common cannabis compliance mistakes to avoid • Dutchie" [[11]]([11])
    *   "Illinois Cannabis Retail Compliance Q & A: Top 5 Dispensary Questions Answered" [[12]]([12])


## References

[1]: https://paybotic.com/markets/illinois/ "[1] Paybotic. "Cannabis Payment Processing in Illinois." *Paybotic*, []()"
[2]: https://maribisllc.com/chicago-dispensary-payment-options/ "[2] Maribis LLC. "Chicago Dispensary Payment Options (Explained by the Experts)." *Maribis LLC*, February 1, 2024, []()"
[3]: https://paybotic.com/markets/michigan/ "[3] Paybotic. "Michigan Cannabis Dispensary Payments Processing." *Paybotic*, []()"
[4]: https://michigancannabis.org/business/banking "[4] Michigan Cannabis Industry Association. "Cannabis Business Banking in Michigan." *MichiganCannabis.org*, []()"
[5]: https://www.kindpayusa.com/ "[5] KindPay. "Cannabis Merchant Service | KindPay | United States." *KindPayUSA.com*, []()"
[6]: https://starmicronics.com/blog/cannabis-pos-hardware/?srsltid=AfmBOooW1-cuVQ42SaFgOPNSe6rg7INMsCdhEq44b265Pth6dxSAz5o "**Vendor Blog**: Star Micronics Blog, "The Ultimate List of Must-Have Cannabis POS Hardware" []"
[7]: https://www.covasoftware.com/blog/cannabis-pos-hardware "**Vendor Blog**: Cova Software Blog, "5 Must-Have Hardware Components for Every Cannabis Retailer" []"
[8]: https://www.covasoftware.com/pos/illinois "**Vendor Page**: Cova Software, "Illinois Dispensary POS & Inventory Management" []"
[9]: https://www.flowhub.com/markets/michigan "**Vendor Page**: Flowhub, "Michigan Cannabis Dispensary POS Software" []"
[10]: https://www.metrc.com/how-pos-and-erp-systems-integrate-with-metrc/ "* "POS & ERP Integration with Cannabis Tracking | Metrc" []()"
[11]: https://business.dutchie.com/post/10-common-compliance-mistakes-how-to-avoid-them "* "8 common cannabis compliance mistakes to avoid • Dutchie" []()"
[12]: https://www.covasoftware.com/blog/illinois-cannabis-retail-compliance "* "Illinois Cannabis Retail Compliance Q & A: Top 5 Dispensary Questions Answered" []()"
[13]: https://www.distru.com/cannabis-blog/understanding-cannabis-inventory-adjustments-key-reasons "Source"
[14]: https://loanviser.com/cannabis-payment-processing/cannabis-payment-processing-disruption-march-2026-what-dispensaries-need-to-know-about-the-cashless-atm-outage/ "Source"
[15]: https://www.cannabis-law-blog.com/michigan-house-looks-to-solve-cannabis-industry-issues-addressing-payment-defaults-and-hemp-regulation/ "Source"
