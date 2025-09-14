# acapy-minimal-backend

A minimal TypeScript backend using Express.js.

## Setup

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Build the project:
   ```powershell
   npm run build
   ```
3. Start the server:
   ```powershell
   npm start
   ```

## Development

To run in development mode with auto-reload (nodemon + ts-node):
```powershell
npm run dev:nodemon
```

Or for basic TypeScript execution (no auto-reload):
```powershell
npm run dev
```

## Project Structure
- `src/index.ts`: Main Express server
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project metadata and scripts
