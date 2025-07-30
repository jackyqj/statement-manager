# Bank Statement Manager

A React web application for managing and processing bank statement CSV files. Built with Vite and styled-components.

## Features

- **Upload Form**: Upload CSV bank statement files with bank type selection
- **Data Processing**: Process CSV files and display transactions in a styled table
- **Duplicate Prevention**: Automatically prevents duplicate entries based on transaction date and amount
- **Local Storage**: Save processed data to browser's localStorage
- **Responsive Design**: Modern, clean UI with styled-components

## Supported Banks

- HSBC
- HSB
- SBC
- Citi

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Select Bank Type**: Choose your bank from the dropdown menu
2. **Upload CSV File**: Select your bank statement CSV file
3. **Process Data**: Click "Upload & Process" to parse the CSV file
4. **View Results**: Processed transactions will appear in the table below
5. **Save Data**: Click "Save to LocalStorage" to persist the data in your browser

## CSV Format

The application expects CSV files with headers. Common headers include:
- Transaction date
- Description
- Amount
- Balance

The application will automatically detect and display all columns present in your CSV file.

## Data Persistence

- Data is automatically loaded from localStorage when the application starts
- Use the "Save to LocalStorage" button to manually save current data
- Data persists between browser sessions

## Development

- Built with React 18
- Styled with styled-components
- Bundled with Vite for fast development
- ESLint configured for code quality

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint 