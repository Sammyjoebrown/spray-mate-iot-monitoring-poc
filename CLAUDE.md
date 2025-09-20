# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start the development server on port 3000
- `npm run build` - Build the production application
- `npm run test` - Run unit tests with Vitest
- `npm run test:e2e` - Run E2E tests with Playwright

### Database Management
- `npm run db:migrate` - Apply database migrations
- `npm run db:seed` - Seed the database with mock data
- `npm run db:reset` - Reset database and re-seed
- `npm run setup` - Run migrations and seed in one command

## Architecture Overview

This is a Next.js 15 application using the App Router with a focus on production-quality code despite being a POC. The key architectural decisions:

### Core Business Logic (`/lib`)
- **services/label-guard.ts** - Implements the LabelGuard rules engine that composes constraints from multiple chemical products and validates spray conditions
- **services/drift-shield.ts** - Calculates multi-factor drift risk scores and runs micro-simulations
- **utils/units.ts** - Type-safe unit conversion system using Decimal.js for precision
- **utils/farm-generator.ts** - Seeded random generation of farm layouts and weather data

### Database Layer
- SQLite database via Prisma ORM
- Comprehensive schema covering farms, blocks, products, inventory, jobs, and sensors
- Decimal precision for all measurements
- JSON fields for complex data (labels, tank mix lines, GeoJSON polygons)

### API Design
- RESTful routes in `/app/api`
- Zod validation on all inputs
- Consistent error handling
- Type-safe responses

## Key Implementation Details

### Precision Calculations
All calculations use Decimal.js to maintain precision:
```typescript
const qty = new Decimal(value)
const result = qty.mul(rate).div(100)
```

### Label Rule Composition
When multiple products are in a tank mix, take the strictest constraint for each dimension:
- Minimum of max wind speeds
- Maximum of buffer distances
- Union of disallowed wind directions

### Drift Risk Factors
The DriftShield system considers:
- Wind speed (exponential above 15 km/h)
- Cross-wind component relative to boom heading
- Temperature (evaporation risk above 25°C)
- Humidity (drift risk below 45%)
- Nozzle type (fine/medium/coarse droplets)
- Boom height above target

### Mock Data Generation
Uses seeded random number generation for reproducible demos:
- Farm layout with 15 blocks
- 6 chemical products with varying label constraints
- 3 pre-configured tank mixes
- Simulated weather conditions

## Common Development Tasks

### Adding a New Chemical Product
1. Update seed data in `/prisma/seed.ts`
2. Define label rules in JSON format
3. Include concentration and density values
4. Run `npm run db:seed` to update

### Implementing a New API Endpoint
1. Create route in `/app/api/[resource]/route.ts`
2. Define Zod schema in `/lib/validations/index.ts`
3. Use prisma client from `/lib/db.ts`
4. Handle errors consistently

### Modifying Drift Risk Calculation
1. Edit `/lib/services/drift-shield.ts`
2. Adjust factor weights in `calculateDriftRisk`
3. Update risk thresholds if needed
4. Test with various conditions

## Testing Approach

### Unit Tests Focus Areas
- Unit conversions (L/ha to total L, g a.i./ha to product kg)
- Active ingredient calculations with varying concentrations
- Label rule composition logic
- Stock take arithmetic

### E2E Test Scenarios
- Complete spray job workflow from creation to completion
- Rule violations and remediation flow
- Inventory depletion after job completion
- Stock take reconciliation

## Performance Considerations

- Database queries use indexes on foreign keys
- Decimal calculations cached where possible
- Sensor readings throttled to prevent overflow
- Map rendering uses simplified GeoJSON

## Security Notes

- All data stored locally (no external APIs in POC)
- Input validation on all user data
- SQL injection prevented via Prisma
- XSS protection via React's default escaping

## Future Extension Points

- WebSocket implementation for real-time sensors (Socket.io prepared)
- Leaflet map integration (styles ready in globals.css)
- Weather API integration (interface defined)
- Mobile responsive design (Tailwind utilities in place)
- Multi-tenancy support (farm ID throughout schema)