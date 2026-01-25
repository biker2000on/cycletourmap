# Architecture

**Analysis Date:** 2026-01-24

## Pattern Overview

**Overall:** Vue 3 SPA (Single Page Application) with GraphQL backend

**Key Characteristics:**
- Frontend: Vue 3 with Vuetify component framework and Leaflet map visualization
- Backend: PostgreSQL database with PostGraphile GraphQL layer, managed via migrations
- State Management: Vuex (store initialized but minimal state usage)
- GraphQL: Apollo Client for query/mutation execution
- Build Tool: Vite for development and production builds
- Styling: Vuetify Material Design + custom SCSS

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `src/components/`, `src/views/`
- Contains: Vue single-file components (.vue), Vuetify Material Design components, Leaflet map integrations
- Depends on: Apollo Client, Vuex, Vue Router
- Used by: End users via browser

**Routing Layer:**
- Purpose: Client-side navigation and route management
- Location: `src/router/index.js`, `src/router/router.js`
- Contains: Route definitions and lazy-loaded view components
- Depends on: Vue Router 4
- Used by: App.vue entry point

**State Management Layer:**
- Purpose: Centralized application state (currently minimal)
- Location: `src/store/index.js`
- Contains: Vuex store with state, mutations, actions, modules (empty)
- Depends on: Vuex 4
- Used by: Components for global state

**Data Access Layer:**
- Purpose: Execute GraphQL queries, mutations, and handle data fetching
- Location: `src/graphql/queries.js`, `src/graphql/mutations.js`, `src/graphql/subscriptions.js`
- Contains: Auto-generated GraphQL operation strings (queries, mutations, subscriptions)
- Depends on: Apollo Client, GraphQL
- Used by: Components needing data

**Plugin/Configuration Layer:**
- Purpose: Initialize third-party integrations and configurations
- Location: `src/plugins/`
- Contains: Apollo, Vuetify, Analytics, Amplify, WebFontLoader configurations
- Depends on: Third-party SDKs
- Used by: Main.js application bootstrap

**Utility Layer:**
- Purpose: Shared helper constants and functions
- Location: `src/utilities/activityKeys.js`, `src/utilities/athleteKeys.js`
- Contains: Constants mapping object field names for Activities and Athletes
- Depends on: None
- Used by: Components and queries

**Backend Layer:**
- Purpose: Data persistence and business logic enforcement
- Location: `backend/migrations/`
- Contains: PostgreSQL schema definitions, role-based access control, user functions
- Database: PostgreSQL with PostGraphile wrapper
- Used by: Apollo Client via GraphQL endpoint

## Data Flow

**User Activity to Map Visualization:**

1. User authenticates via `AuthStrava.vue` component
2. Strava OAuth tokens stored in `Auth` table
3. Component queries `GetAthleteByStravaId` from Strava API
4. Activities fetched via `ListActivities` query
5. Leaflet map renders polylines and markers from activity coordinates
6. Activity details shown in popups via `Popups.vue` component

**Tour Creation:**

1. User creates tour via UI component
2. `createTour` mutation sent to GraphQL endpoint
3. PostgreSQL stores tour in `Tour` table
4. Activities linked via junction table `TourActivities`
5. Tour persisted with user ownership via `user_id` foreign key

**State Management:**

- Vuex store initialized but minimal usage - components directly query GraphQL via Apollo Client
- No global state modules defined - suggests single-page or feature-scoped state
- Application relies on Apollo Client cache for reactive data

## Key Abstractions

**GraphQL Schema (Auto-generated):**
- Purpose: Defines all data types and operations
- Examples: `src/graphql/queries.js`, `src/graphql/mutations.js`
- Pattern: Apollo query/mutation document strings with inline field selections

**Vue Components:**
- Purpose: Encapsulate UI and interaction logic
- Examples: `src/components/Leaflet.vue`, `src/components/Home.vue`, `src/components/Auth.vue`
- Pattern: Single-file components with template, script, and scoped styles

**Leaflet Map Component (`src/components/Leaflet.vue`):**
- Purpose: Display interactive cycling routes on map
- Abstracts: Leaflet library complexity, tile layers (OSM, Google Maps), polyline rendering
- Features: Fullscreen toggle, unit selection (metric/imperial), multiple map providers
- Uses: `@vue-leaflet/vue-leaflet` for Vue 3 integration

**PostgreSQL Schema:**
- Purpose: Define data model with relationships and constraints
- Core Tables: `Activity`, `Athlete`, `Auth`, `Tour`, `TourActivities`
- Enforces: Foreign key constraints, unique constraints, role-based access control
- Authentication: JWT tokens via `basic_auth.users` table

## Entry Points

**Frontend Entry Point (`src/main.js`):**
- Location: `src/main.js`
- Triggers: Browser loads index.html
- Responsibilities:
  - Create Vue 3 app instance
  - Register plugins (Vuex store, router, Vuetify, Apollo, analytics)
  - Mount to `#app` div
  - Load web fonts

**Application Root (`src/App.vue`):**
- Location: `src/App.vue`
- Triggers: After main.js creates app
- Responsibilities:
  - Render navigation bar
  - Render router view outlet
  - Layout management

**Home Route (`src/views/Home.vue` via `src/router/index.js`):**
- Path: `/`
- Component: Home
- Responsibilities: Landing page with hero image, getting started section

**Lazy-Loaded Routes:**
- About: `/about` (code-splitting via dynamic import)

**Backend Entry Point (PostgreSQL):**
- Location: `backend/migrations/` (applied in order)
- Triggers: Database initialization
- Responsibilities:
  - Create schema, roles, tables
  - Apply row-level security (RLS) policies
  - Create indexes and constraints

**PostGraphile GraphQL Endpoint:**
- Exposes: PostgreSQL schema as GraphQL API
- Authentication: JWT tokens from `basic_auth.users`
- Command: `npm run graphql` starts server with PostGraphile

## Error Handling

**Strategy:** Implicit error handling via Vue component lifecycle and Apollo Client

**Patterns:**
- Vue `beforeDestroy()` for cleanup (e.g., event listener removal in Home.vue)
- Apollo Client handles GraphQL errors in responses
- No explicit error boundary components detected
- No centralized error logging visible

## Cross-Cutting Concerns

**Logging:**
- Analytics via `src/plugins/analytics.js` (vue3-analytics plugin)
- Console logs available in components

**Validation:**
- No explicit validation layer detected
- PostgreSQL constraints enforce data integrity
- GraphQL type system provides client-side type safety

**Authentication:**
- Strava OAuth via `AuthStrava.vue` component
- JWT token storage in PostgreSQL `Auth` table
- Apollo Client configured with JWT token injection for authenticated requests
- Multiple auth strategies: Cognito, API Key, AWS IAM (legacy AWS AppSync configs still present)

**Authorization:**
- Row-level security (RLS) policies on PostgreSQL tables via `backend/migrations/004-add-rls.sql`
- Roles: `anon`, `webuser`, `authenticator`
- User-based data isolation via `user_id` column

**Styling:**
- Vuetify Material Design framework
- Custom SCSS in `src/styles/`
- Component-scoped styles in Vue SFCs
- Responsive design via Vuetify's grid system

---

*Architecture analysis: 2026-01-24*
