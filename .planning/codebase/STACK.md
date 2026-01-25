# Technology Stack

**Analysis Date:** 2026-01-24

## Languages

**Primary:**
- JavaScript (ES6+) - Vue components and application logic
- SQL - PostgreSQL database schema and migrations

**Markup:**
- HTML - Index and Vue templates
- CSS - Vue component scoped styles and global stylesheets

## Runtime

**Environment:**
- Node.js (Latest, via npm scripts)

**Package Manager:**
- npm v8+ (inferred from package-lock.json)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Vue 3 (3.2.26) - Progressive JavaScript framework for UI
- Vue Router 4 (4.0.0-0) - Client-side routing
- Vuex 4 (4.0.0-0) - State management
- Vuetify 3 (3.0.0-alpha.0) - Material Design UI component library

**GraphQL:**
- Apollo Client (3.5.6) - GraphQL client for data fetching
- GraphQL (16.2.0) - Query language and runtime
- graphql-tag (2.12.6) - GraphQL query/mutation parsing
- PostGraphile (4.12.8) - GraphQL API generation from PostgreSQL

**Maps:**
- Leaflet (1.7.1) - Open-source mapping library
- Leaflet Fullscreen (2.2.0) - Fullscreen plugin for Leaflet
- Leaflet.gridlayer.googlemutant (0.13.4) - Google Maps integration for Leaflet
- @mapbox/leaflet-omnivore (0.3.4) - Multi-format data loader for Leaflet
- vue2-leaflet (0.6.1) - Vue wrapper for Leaflet

**Build/Dev:**
- Vite (2.0.0) - Next-generation frontend build tool
- @vitejs/plugin-vue (1.2.4) - Vue 3 plugin for Vite
- @vuetify/vite-plugin (1.0.0-alpha.3) - Vuetify plugin for Vite
- Sass (1.38.0) - CSS preprocessor
- sass-loader (10.0.0) - Webpack loader for Sass
- Babel (@vue/cli-plugin-babel) - JavaScript transpiler
- Vue CLI (5.0.0-beta.7) - Legacy Vue tooling (babel, router, vuex plugins)

**Testing:**
- Not configured in package.json

**Analytics:**
- vue-analytics (1.0.0) - Google Analytics integration for Vue

**Utilities:**
- axios (0.24.0) - Promise-based HTTP client
- uuid (8.3.2) - UUID generation
- date-fns (2.28.0) - Modern date utility library
- moment (2.29.1) - Date/time parsing and formatting
- webfontloader (1.0.0) - Font loading library
- roboto-fontface (*) - Roboto font files
- @mdi/font (5.9.55) - Material Design Icons
- lodash.pick - Object property selection utility (imported in code, not in package.json)

## Configuration

**Environment:**
- Variables in `.env.sample`:
  - `VUE_APP_REDIRECTURI` - OAuth redirect URL
  - `VUE_APP_STRAVA_CLIENTID` - Strava OAuth client ID
  - `VUE_APP_STRAVA_CLIENT_SECRET` - Strava OAuth client secret
  - `VUE_APP_GOOGLE_MAPS_APIKEY` - Google Maps API key

**Build:**
- `vite.config.js` - Vite configuration with Vue and Vuetify plugins, path aliases (@)
- `vue.config.js` - Legacy Vue CLI configuration for GraphQL loader
- `babel.config.js` - Babel transpilation config (Vue presets)

**Development Server:**
- Vite preview server on specified host
- Vite dev server with HMR support

## Platform Requirements

**Development:**
- Node.js with npm
- PostgreSQL 14+ (via Docker: postgis/postgis:14-master)
- Internet connectivity for external APIs (Strava, Google Maps)

**Production:**
- Node.js runtime
- PostgreSQL database (PostGIS extension for geospatial data)
- Access to Strava API v3
- Access to Google Maps API

## Backend Infrastructure

**Database Server:**
- PostgreSQL 14 with PostGIS extension (from docker-compose.yml)
- Schema managed via `tusker` migration tool
- Connection: `postgresql://cyclist:cyclist@192.168.4.134:5432/cycletourmap`
- Migration files in `backend/migrations/`

**GraphQL Server:**
- PostGraphile CLI serving from PostgreSQL
- Default role: `anon` (unauthenticated)
- JWT authentication with secret: `myverysecurestring` (hardcoded, see CONCERNS)
- Endpoint on localhost with enhanced GraphiQL

---

*Stack analysis: 2026-01-24*
