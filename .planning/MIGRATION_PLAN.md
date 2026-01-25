# Vue3 + Postgres Migration Plan

**Branch:** `feature/vue3-postgres-migration`
**Created:** 2026-01-24

## Overview

Migrate cycletourmap from legacy Vue ecosystem to modern stack with proper ORM.

### Current State
- Vue 3.2.26, Vuetify 3.0.0-alpha.0, Vite 2.0
- PostgreSQL 14 + PostGIS (already in place)
- PostGraphile for GraphQL
- Amplify remnants still in codebase
- No ORM - raw SQL migrations via tusker

### Target State
- Vue 3.5.x, Vuetify 3.7.x, Vite 6.x
- PostgreSQL 14 + PostGIS (unchanged)
- **Drizzle ORM** with native PostGIS support
- No Amplify code
- Type-safe database access

## ORM Decision: Drizzle vs Prisma

| Feature | Prisma | Drizzle |
|---------|--------|---------|
| PostGIS support | Via `Unsupported` + raw SQL | Native geometry types |
| Type safety | Excellent | Excellent |
| SQLite compatibility | Yes | Yes |
| Performance | Good | Better (SQL-like) |
| Bundle size | Larger | Smaller |

**Choice: Drizzle ORM** - Native PostGIS geometry/geography column support with proper typing.

Reference: [Drizzle PostGIS Geometry](https://orm.drizzle.team/docs/guides/postgis-geometry-point)

## SQLite for Development

**Note:** SQLite does not support PostGIS. Since this app uses geospatial data (cycling routes with coordinates), we must use PostgreSQL for both dev and production.

The existing Docker Compose setup provides Postgres for development - this is the correct approach.

---

## Phase 1: Remove Amplify Remnants

### Tasks
- [ ] 1.1 Delete `amplify/` directory
- [ ] 1.2 Delete `src/plugins/amplify.js`
- [ ] 1.3 Remove AWS/Amplify imports from components
- [ ] 1.4 Clean `src/plugins/apollo.js` of AppSync references
- [ ] 1.5 Update `src/router/router.js` to remove Vue.prototype.$Amplify
- [ ] 1.6 Commit: "chore: remove Amplify remnants"

---

## Phase 2: Update Vue Ecosystem

### Tasks
- [ ] 2.1 Update Vue to 3.5.x
- [ ] 2.2 Update Vuetify to 3.7.x (stable)
- [ ] 2.3 Update Vite to 6.x
- [ ] 2.4 Update Vue Router to latest 4.x
- [ ] 2.5 Update @vitejs/plugin-vue to latest
- [ ] 2.6 Update @vue-leaflet/vue-leaflet to latest
- [ ] 2.7 Remove deprecated Vue CLI dependencies
- [ ] 2.8 Fix any breaking changes in components
- [ ] 2.9 Commit: "chore: update Vue ecosystem to latest versions"

---

## Phase 3: Install and Configure Drizzle ORM

### Tasks
- [ ] 3.1 Install Drizzle ORM and dependencies
- [ ] 3.2 Create `drizzle.config.ts` with PostGIS extension filter
- [ ] 3.3 Create schema from existing PostgreSQL tables:
  - `db/schema/athlete.ts`
  - `db/schema/activity.ts`
  - `db/schema/tour.ts`
  - `db/schema/auth.ts`
- [ ] 3.4 Generate Drizzle migrations from existing schema
- [ ] 3.5 Create database client module
- [ ] 3.6 Add npm scripts for migrations
- [ ] 3.7 Commit: "feat: add Drizzle ORM with PostGIS support"

---

## Phase 4: Create API Layer with Drizzle

### Tasks
- [ ] 4.1 Create server/API structure (Express or tRPC)
- [ ] 4.2 Create API routes for existing GraphQL operations:
  - Tours CRUD
  - Activities CRUD
  - Athletes CRUD
  - Auth operations
- [ ] 4.3 Implement GIS queries using Drizzle's geometry type
- [ ] 4.4 Add proper environment variable handling
- [ ] 4.5 Commit: "feat: add API layer with Drizzle queries"

---

## Phase 5: Update Frontend to Use New API

### Tasks
- [ ] 5.1 Remove Apollo Client and GraphQL dependencies
- [ ] 5.2 Create API client module (fetch/axios based)
- [ ] 5.3 Update components to use new API:
  - `src/components/Strava.vue`
  - `src/components/AuthStrava.vue`
  - `src/components/Leaflet.vue`
  - `src/components/LeafletData.vue`
- [ ] 5.4 Remove `src/graphql/` directory
- [ ] 5.5 Commit: "refactor: migrate frontend to REST API"

---

## Phase 6: Security and Cleanup

### Tasks
- [ ] 6.1 Move all credentials to environment variables
- [ ] 6.2 Generate secure JWT secret
- [ ] 6.3 Remove hardcoded Strava credentials
- [ ] 6.4 Add `.nvmrc` with Node version
- [ ] 6.5 Update package.json scripts
- [ ] 6.6 Remove unused dependencies
- [ ] 6.7 Commit: "chore: security hardening and cleanup"

---

## Files to Delete

```
amplify/                           # Entire directory
src/plugins/amplify.js             # Amplify config
backend/migrations/                # Old tusker migrations (replaced by Drizzle)
```

## New Files to Create

```
drizzle.config.ts                  # Drizzle configuration
db/
  schema/
    index.ts                       # Schema exports
    athlete.ts                     # Athlete table schema
    activity.ts                    # Activity table schema
    tour.ts                        # Tour + TourActivities schemas
    auth.ts                        # Auth table schema
  index.ts                         # Database client
  migrations/                      # Drizzle migrations
server/
  index.ts                         # API server entry
  routes/
    tours.ts                       # Tour routes
    activities.ts                  # Activity routes
    auth.ts                        # Auth routes
.nvmrc                             # Node version
```

## Dependencies to Add

```json
{
  "drizzle-orm": "^0.40.x",
  "drizzle-kit": "^0.30.x",
  "pg": "^8.x",
  "@types/pg": "^8.x",
  "dotenv": "^16.x"
}
```

## Dependencies to Remove

```json
{
  "@apollo/client": "remove",
  "graphql": "remove",
  "graphql-tag": "remove",
  "postgraphile": "remove",
  "vue-cli-plugin-apollo": "remove",
  "@vue/cli-plugin-babel": "remove",
  "@vue/cli-plugin-router": "remove",
  "@vue/cli-plugin-vuex": "remove",
  "@vue/cli-service": "remove",
  "vue-cli-plugin-vuetify": "remove"
}
```

---

## Success Criteria

- [ ] No Amplify code in repository
- [ ] Vue 3.5.x, Vuetify 3.7.x, Vite 6.x
- [ ] Drizzle ORM with typed PostGIS columns
- [ ] All existing features working
- [ ] No hardcoded credentials
- [ ] Clean npm audit (no vulnerabilities)
