# Enhanzer Frontend - Purchase Bill UI

This is the frontend application for the Enhanzer Purchase Bill module, built with Angular 17+ using Standalone Components.

## Technologies Used
- Angular (Standalone Components)
- TypeScript
- SCSS for styling
- Reactive Forms

## Features
- **Authentication**: Login page that authenticates against the backend API and stores the JWT token.
- **Purchase Bill Form**: A fully styled, interactive form to enter purchase bill details, calculate gross totals, taxes, and net totals dynamically.
- **Auto-complete**: Type-ahead item selection for adding new items.
- **Real-time Table**: Displays currently added items and all historically saved items fetched from the backend.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Angular CLI installed globally (`npm install -g @angular/cli`)

### Running the Application Locally

1. Open a terminal in the project root directory (`purchase-bill-ui`).
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   ng serve
   ```
4. Navigate to `http://localhost:4200/` in your web browser. The app will automatically reload if you change any of the source files.

## Project Structure Highlights
- `src/app/core/services/` - Contains services to communicate with the backend (`auth.service.ts`, `location.service.ts`, `purchase-bill.service.ts`).
- `src/app/features/login/` - The login component and styling.
- `src/app/features/purchase-bill/` - The main purchase bill form, layout, and logic.

## Connecting to Backend
Ensure that the ASP.NET Core backend is running simultaneously (usually on `https://localhost:7105`) so the Angular frontend can successfully make API requests.
