# @tend-o-matic/payments

Provider abstraction. Concrete implementations land later: cash, cashless-ATM (PIN debit), ACH (Aeropay / CanPay). No card networks — cannabis is federally scheduled and Stripe / Square / Visa / Mastercard are structurally not options.

v0.1 ships only the `PaymentProvider` interface, `TenderType` enum, and `Charge` / `ChargeResult` shapes.
