# Finance Tracker Pro

Finance Tracker Pro is a web application built with React, TypeScript, and Tailwind CSS designed to help users track their personal finances effectively. It allows for manual transaction entry, bulk import of transactions via CSV or AI-powered PDF parsing, and provides insightful summaries and visualizations of financial data.

## Features

*   **Manual Transaction Entry**: Easily add individual income or expense transactions with details like date, description, category, and amount.
*   **Transaction Import**:
    *   **CSV Import**: Import multiple transactions using a specified CSV format (`YYYY-MM-DD,Description,Category,Amount,Type`).
    *   **PDF Statement Import (AI-Powered)**: Upload PDF bank or credit card statements. The application uses the Google Gemini API to intelligently extract transaction data.
*   **Dashboard View**:
    *   Overall financial summary (total income, total expenses, net balance).
    *   Pie chart visualizing expenses by category.
    *   List of recent transactions.
*   **Monthly View**:
    *   Transactions grouped by month and year.
    *   Dedicated financial summary (income, expenses, net) for each month.
*   **Categorization**: Organize transactions using default or custom categories.
*   **Data Persistence**: Transactions are saved locally in the browser's localStorage.
*   **Responsive Design**: User-friendly interface accessible on various devices.
*   **Secure API Key Handling**: The Google Gemini API key is accessed via environment variables and is not exposed in the client-side code or UI.

## Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **Charting**: Recharts
*   **PDF Processing (Client-side text extraction)**: `pdfjs-dist`
*   **AI for PDF Parsing**: Google Gemini API (`@google/genai`)
*   **Build/Module System**: ES Modules, Vite (implied by typical React setup, though running in a specialized environment)

## Getting Started

### Prerequisites

*   A modern web browser.
*   A Google Gemini API Key for the PDF import feature.

### Environment Variables

To enable the AI-powered PDF import feature, you need to configure your Google Gemini API Key.

*   `API_KEY`: Your Google Gemini API Key.

**IMPORTANT**: This application is designed to retrieve the `API_KEY` from `process.env.API_KEY`. **Do not hardcode your API key into the source code.** Ensure this environment variable is properly set in the deployment or local execution environment where the application's backend logic (or server-side rendering, if applicable, though here it's client-side calls proxied or directly made based on environment setup) would typically access it. For client-side focused examples running in specific sandboxed environments, this variable needs to be pre-configured in that environment. The application **will not** ask you to enter it.

### Running the Application

This application is designed to run in an environment where `index.html` can directly import ES modules (`index.tsx`).

1.  **Ensure API Key is set**: If you plan to use the PDF import feature, make sure the `API_KEY` environment variable is accessible to the application context as `process.env.API_KEY`.
2.  **Open `index.html`**: Launch the `index.html` file in your web browser. The application should load and initialize.

(In a typical local development setup, you would use Node.js and npm/yarn):
```bash
# 1. Clone the repository (if applicable)
# git clone <repository-url>
# cd finance-tracker-pro

# 2. Install dependencies
# npm install

# 3. Set up your .env file with API_KEY (if using a build process that supports .env)
# echo "API_KEY=your_gemini_api_key_here" > .env

# 4. Start the development server
# npm run dev # or npm start, depending on project scripts
```

## Usage

1.  **Adding Transactions Manually**:
    *   Click the "Add Transaction" button in the navbar.
    *   Fill in the date, description, category (select from dropdown or add a custom one), amount, and type (income/expense).
    *   Click "Add Transaction" in the modal.

2.  **Importing Transactions**:
    *   Click the "Import Transactions" button in the navbar.
    *   **To import from PDF (AI-Powered)**:
        *   Click "Choose File" and select your PDF bank or credit card statement.
        *   The application will extract text using `pdf.js` and then send this text to the Gemini API for parsing.
        *   Review extracted transactions (if any) and click "Import Transactions".
        *   **Note**: The AI parsing relies on the structure and clarity of the PDF text. Results may vary.
    *   **To import from CSV**:
        *   Ensure your data is in the format: `YYYY-MM-DD,Description,Category,Amount,Type` (e.g., `2023-10-26,Groceries,Food,55.25,expense`).
        *   Paste the CSV data into the text area.
        *   Click "Import Transactions".

3.  **Viewing Data**:
    *   **Dashboard View**: The default view, showing an overview summary, expense chart, and recent transactions.
    *   **Monthly View**: Click the "Monthly" button in the navbar to see transactions grouped by month, each with its own summary.

4.  **Deleting Transactions**:
    *   In either the Dashboard's "Recent Transactions" list or any "Transactions for this month" list in the Monthly View, click the X icon next to a transaction to delete it.

## Notes on AI (Gemini API)

*   The PDF import feature uses the Google Gemini API to understand the text content extracted from PDF files and convert it into structured transaction data.
*   The quality of AI-extracted transactions depends on the clarity and format of the PDF statement.
*   Your `API_KEY` is crucial for this feature. It is handled as an environment variable and should be kept confidential. The application does not include any UI for managing this key.

## Offline Functionality

*   Transaction data is stored in the browser's localStorage, allowing you to access your data even when offline (once loaded).
*   The AI-powered PDF import feature requires an internet connection to communicate with the Gemini API.

---

This README provides a basic overview. Feel free to expand it with more details as the project grows!
