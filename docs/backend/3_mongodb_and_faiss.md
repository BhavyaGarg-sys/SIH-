# Database Separation: MongoDB vs FAISS

Since we are introducing MongoDB for CRUD operations, we need a clear rule on what goes into MongoDB vs what stays in FAISS.

## 1. MongoDB (The Business Database)
MongoDB handles the structured, relational data of the platform. If the data fits nicely into rows, columns, or standard JSON objects, it belongs here.

**Collections we will need:**
1. **`users` & `sessions`**: 
   - Stores chat history so the user can refresh the page and not lose their conversation.
2. **`product_rules`**: 
   - A mapping of products to their BIS schemes. 
   - Example: `{ "product": "LED Bulb", "standard": "IS 16102", "scheme": "CRS", "is_mandatory": true }`. 
   - This powers the Compliance Dashboard (User Story 1).
3. **`labs`**:
   - A database of testing labs. 
   - Example: `{ "name": "Delhi Test Lab", "city": "Delhi", "tests_standards": ["IS 16102"] }`.
   - Used to suggest nearby labs to the user at the end of User Story 1.

## 2. FAISS (The Knowledge Database)
FAISS handles the unstructured data. It is literally just a massive search engine for text chunks.

- **What goes here**: The chunked text of the 22,000 Indian Standard PDFs.
- **When is it used**: ONLY when the Intent Router determines the user is asking a `TECHNICAL_QUERY`. 
- **Rule of Thumb**: We never use FAISS to figure out *what* process a user should follow. We only use FAISS to answer *how* a specific technical rule is defined.

## Why this split is magic
By keeping compliance checklists in MongoDB, we guarantee 100% accuracy for the MSME (no LLM hallucinations). By keeping the PDFs in FAISS, we allow researchers to ask infinitely complex questions without having to manually enter 22,000 PDFs into a SQL database.
