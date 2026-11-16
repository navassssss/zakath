# **Amanah — Zakat Calculator: Steps and Considerations**

The calculator should guide a donor through **entering Zakatable assets, applying eligible deductions, checking Nisab and Hawl, and calculating the amount due**.

For the MVP, keep the interface minimal: group related assets, avoid unnecessary questions, and make disputed fiqh rules configurable rather than hardcoded.

## **1. Calculation overview**

\\[ \text{Net Zakatable Wealth} = \text{Zakatable Assets} - \text{Eligible Liabilities} \\]

If the wealth meets the applicable Nisab and Hawl conditions:

\\[ \text{Zakat Due}=\text{Net Zakatable Wealth}\times 2.5\\% \\]

The 2.5% rate applies to the standard lunar-year calculation for qualifying monetary and trade wealth. The system must not apply it indiscriminately to every type of asset.

## **2. Step-by-step calculation**

### **Step 1 — Choose calculation settings**

Before entering assets, establish:

| Setting          | What it controls                                            |
| ---------------- | ----------------------------------------------------------- |
| Currency         | INR (₹) for the MVP                                         |
| Calculation date | Date on which the donor calculates Zakat                    |
| Nisab basis      | Gold or silver                                              |
| Fiqh methodology | Rules for jewellery, combining assets, liabilities and Hawl |
| Zakat period     | One lunar year (Hawl)                                       |

**Important:** The gold and silver Nisab values commonly used are:

- Gold: **87.48 grams of pure gold**
- Silver: **612.36 grams of pure silver**

Their monetary values change with market prices. The Nisab basis and rules for combining gold and silver should follow the selected scholarly methodology.&#x20;


### **Step 2 — Cash and financial assets**

One grouped input:

**Cash & Financial Assets — ₹**

Include the applicable value of:

- Cash in hand.
- Bank account balances.
- Savings and fixed deposits.
- Shares and mutual funds.
- Other Zakatable financial investments.
- Recoverable money owed to the donor, where applicable.

For the MVP, allow the donor to enter one combined value.

Considerations:

- Do not count the same money twice.
- Personal-use possessions are not included.
- Investment treatment can vary; not every investment's full market value is necessarily Zakatable.



### **Step 3 — Gold**

One grouped input for gold bars, coins and jewellery.

Required inputs:

- Total gold weight (grams).
- Purity: 24K, 22K, 18K or Other.

**Valuation formula:**

\\[ \text{Pure gold weight} = \text{Total weight}\times\frac{\text{Karat}}{24} \\]

\\[ \text{Gold value} = \text{Pure gold weight}\times\text{24K market price per gram} \\]

Example:

- Total weight: 100g
- Purity: 22K
- Pure gold: \\(100 \times 22/24 = 91.67g\\)

Considerations:

- Exclude stones and non-gold components from the metal weight.
- Use the market value of the pure gold content, not jewellery making charges.
- Personal-use jewellery treatment differs by fiqh methodology.
- If holdings have different purities, allow **Add another purity** rather than forcing one average.

### **Step 4 — Silver**

One grouped input for silver bars, coins and jewellery.

Required inputs:

- Total silver weight (grams).
- Purity.

\\[ \text{Pure silver weight} = \text{Total weight}\times\text{Purity fraction} \\]

\\[ \text{Silver value} = \text{Pure silver weight}\times\text{Pure silver market price per gram} \\]

Considerations:

- Exclude stones and non-silver components.
- Support multiple purities when needed.
- Use the market price on the calculation date.

### **Step 5 — Business and trading assets**

One grouped input:

**Business & Trading Assets — ₹**

Include the Zakatable value of:

- Trading inventory and merchandise.
- Business cash.
- Eligible business receivables.

Do not automatically include:

- Business buildings.
- Machinery and equipment.
- Furniture.
- Vehicles used for business operations.

The donor should enter the total eligible value, rather than the value of the entire business.



Islamic Relief South Africa+1

### **Step 6 — Liabilities**

One grouped input:

**Eligible Outstanding Liabilities — ₹**

Potential deductions:

- Eligible debts due.
- Overdue payments.
- Immediate bills and financial obligations.
- Applicable short-term business liabilities.

Considerations:

- Do not automatically deduct the entire outstanding balance of a long-term loan or mortgage.
- Future expenses that are not yet due may not qualify.
- The treatment of debts and deductions varies by methodology.

The application should explain what qualifies under the selected calculation policy.&#x20;



Islamic Relief+1



## **3. Step 7 — Calculate net Zakatable wealth**

The system aggregates the entered values:

\\[ \begin{aligned} \text{Total Assets} ={}& \text{Cash and Financial Assets}\\\ &+\text{Gold Value}\\\ &+\text{Silver Value}\\\ &+\text{Business and Trading Assets} \end{aligned} \\]

Then:

\\[ \text{Net Wealth}=\text{Total Assets}-\text{Eligible Liabilities} \\]

Example:

| Category                  | Amount        |
| ------------------------- | ------------- |
| Cash and financial assets | ₹1,00,000     |
| Gold                      | ₹50,000       |
| Silver                    | ₹10,000       |
| Business assets           | ₹40,000       |
| **Total assets**          | **₹2,00,000** |
| Eligible liabilities      | ₹20,000       |
| **Net wealth**            | **₹1,80,000** |

## **4. Step 8 — Check Nisab**

Compare net Zakatable wealth against the selected Nisab threshold.

**Nisab assessment**

Net wealth

**₹1,80,000**

Selected Nisab value

**₹XX,XXX**

Meets Nisab — illustrative example

The actual threshold must be calculated using the selected gold or silver standard and current market price.

Important considerations:

- The gold and silver thresholds are alternative Nisab standards.
- Whether gold and silver holdings can be combined to reach Nisab is a matter of scholarly disagreement.
- The calculator must not silently combine them using one universal rule.
- Keep the selected Nisab method visible in the calculation result.

## **5. Step 9 — Check Hawl**

Hawl means one complete lunar year.

The calculator should establish:

1. When the donor first acquired wealth reaching Nisab.
2. The corresponding annual Zakat date.
3. Whether the applicable Hawl condition has been fulfilled.
4. The value of Zakatable assets on the calculation date.

**Important:** Rules concerning wealth falling below Nisab during the year, newly acquired wealth and the start or interruption of Hawl differ between scholarly methodologies. Do not implement a universal daily-balance rule.

For the MVP, let the donor enter or confirm their Zakat due date and provide guidance if they do not know it.

## **6. Step 10 — Calculate Zakat due**

If the applicable Nisab and Hawl conditions are satisfied:

\\[ \text{Zakat Due}=\text{Net Zakatable Wealth}\times0.025 \\]

Using the example:

\\[ ₹1,80,000\times0.025=\boxed{₹4,500} \\]

Illustrative Zakat calculation

# **₹4,500**

Net Zakatable wealth

**₹1,80,000**

Zakat rate

**2.5%**

Nisab condition

**Satisfied**

Hawl condition

**Satisfied**

Illustrative figures only, not a personal Zakat ruling.

## **7. Final calculation summary**

The donor should see:

- Total value of each asset category.
- Total assets.
- Eligible liabilities and deductions.
- Net Zakatable wealth.
- Selected Nisab standard and its current value.
- Hawl assessment.
- Applicable Zakat rate.
- Final Zakat amount.

Provide options to save the calculation, recalculate, or proceed to direct recipient discovery.

## **8. Important implementation considerations**

| Area               | Requirement                                                         |
| ------------------ | ------------------------------------------------------------------- |
| Market prices      | Obtain gold and silver rates for the calculation date               |
| Gold/silver purity | Calculate pure metal content                                        |
| Different purities | Optional additional purity entries                                  |
| Jewellery          | Apply selected fiqh methodology                                     |
| Nisab              | Support gold and silver standards                                   |
| Combining metals   | Configurable scholarly rule                                         |
| Hawl               | Support methodology-specific rules                                  |
| Shares/investments | Do not assume the entire portfolio is Zakatable                     |
| Liabilities        | Apply approved deduction rules                                      |
| Currency           | INR for MVP                                                         |
| Rounding           | Keep precision internally; round final payable amount appropriately |
| Transparency       | Show calculation breakdown and methodology                          |

### **Recommended MVP calculator interface**

Keep the donor-facing experience to these screens:

1. **Calculation settings**

   Currency, Nisab basis, calculation date and methodology.
2. **Cash & Financial Assets**

   One total amount.
3. **Gold**

   Weight and purity.
4. **Silver**

   Weight and purity.
5. **Business & Trading Assets**

   One total amount.
6. **Liabilities**

   One total amount.
7. **Calculation result**

   Nisab, Hawl, asset breakdown and Zakat due.
8. **Proceed to recipient discovery**

### **Decisions to settle before implementation**

1. Which scholarly methodology or approved set of methodologies will Amanah support?
2. Will donors choose their own Nisab basis, or will Amanah provide an approved default?
3. How will personal-use gold jewellery be treated?
4. Which liabilities are deductible?
5. How will the system handle combining gold and silver for Nisab?

These decisions should be reviewed by qualified scholars. The calculator should clearly identify the methodology used and avoid presenting disputed rules as universally agreed.

**Scope reminder:** This MVP excludes cryptocurrency and has no separate investment-jewellery category, as previously decided.

**Reference material:** [Islamic Relief UK — Zakat Calculator](https://www.islamic-relief.org.uk/giving/islamic-giving/zakat/zakat-calculator/?utm_source=chatgpt.com) · [Islamic Relief — Zakat Calculator](https://islamic-relief.org/zakat-calculator/?utm_source=chatgpt.com) · [Islamic Relief South Africa — Zakat Calculator](https://islamic-relief.org.za/zakat/calculator/?utm_source=chatgpt.com).
