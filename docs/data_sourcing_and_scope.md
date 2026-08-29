# Data Sourcing & MVP Scope

In the real world, building a startup on scraped, unversioned PDF data is risky. Regulatory tech companies solve this by writing "watchdog" scrapers that monitor the weekly government **Gazette Notifications** or by buying API feeds from enterprise legal databases (like Manupatra) that have humans constantly updating the records.

For this hackathon MVP, we will heavily scope the data to **three highly relatable, distinct categories**. This will impress the judges because they touch everyday life and cover three *completely different* BIS schemes.

## The 3 MVP Categories

### 1. Everyday Safety: Motorcycle Helmets
*   **The Scheme**: ISI Mark (Mandatory Product Certification)
*   **The Standard**: IS 4151
*   **Why it's great**: It's a physical safety product. Everyone understands why a fake helmet is dangerous.
*   **Where to get the PDF**: Go to `standardsbis.bsbedge.com` (create a free account), search **IS 4151**, and download the PDF.
*   **Where to get the Checklist**: Search for "Product Manual for IS 4151 BIS" on Google. BIS publishes a "Product Manual" for every standard which literally contains the checklist of required testing equipment.

### 2. Consumer Tech: LED Bulbs (or Mobile Chargers)
*   **The Scheme**: Compulsory Registration Scheme (CRS - MeitY)
*   **The Standard**: IS 16102 (LED) or IS 13252 (Chargers)
*   **Why it's great**: Electronics use a completely different scheme (CRS) than helmets. Showing that your AI knows the difference between ISI and CRS proves the platform is intelligent.
*   **Where to get the PDF**: `standardsbis.bsbedge.com`.
*   **Where to get the Checklist**: Go to `crsbis.in`. This is the dedicated portal for electronics. Grab the FAQ or process flowchart from there.

### 3. Trust & Luxury: Gold Jewelry
*   **The Scheme**: Hallmarking
*   **The Standard**: IS 1417
*   **Why it's great**: This lets you demonstrate the **Consumer Verification User Story** (e.g., checking a 6-digit HUID code).
*   **Where to get the data**: `bis.gov.in/hallmarking-overview`. There are simple 1-2 page PDFs explaining how to read a hallmark.

## Where to get the Lab Data (For the Geo-Locator feature)
1. Go to the public BIS lab portal: **`lims.bis.gov.in`**.
2. There is a search tool there: "Search Labs by IS Number".
3. Search for IS 4151 (Helmets) and IS 16102 (LEDs). 
4. It will return a table of labs. Just copy-paste the first 10 or 15 rows for Delhi, Mumbai, and Bangalore into a spreadsheet or JSON file. That is all the data we need to build the MVP feature!
