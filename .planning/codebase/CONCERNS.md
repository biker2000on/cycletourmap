# Codebase Concerns

**Analysis Date:** 2026-01-24

## Security Issues

**Hardcoded Credentials in Production Code:**
- Issue: Strava API credentials (client_id and client_secret) are hardcoded directly in source code
- Files: `amplify/backend/function/stravaListener/src/graphql.js` (line 168-169)
- Current code:
  ```javascript
  client_id: "28538",
  client_secret: "97c7dc5efcafb04becb6bbaedd0d9ba1e84efec9",
  ```
- Impact: API credentials exposed to anyone with access to the repository. These credentials should never be committed. Anyone with these values can authenticate with Strava on behalf of the application.
- Fix approach: Move to environment variables (`process.env.STRAVA_CLIENTID` and `process.env.STRAVA_CLIENT_SECRET`). The frontend already attempts this pattern in `src/components/AuthStrava.vue` but the backend does not.

**Weak JWT Secret:**
- Issue: Package.json script uses plaintext, guessable JWT secret
- Files: `package.json` (line 11)
- Current code:
  ```json
  "graphql": "npx postgraphile -c postgresql://cyclist:cyclist@192.168.4.134:5432/cycletourmap?schema=public --enhance-graphiql --default-role anon --jwt-secret myverysecurestring --jwt-token-identifier public.jwt_token"
  ```
- Impact: JWT secret "myverysecurestring" is trivial to guess. Anyone knowing this value can forge valid JWT tokens for the GraphQL API.
- Fix approach: Replace with cryptographically random secret. Use environment variable `JWT_SECRET` instead of hardcoding. Generate via: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Database Credentials Exposed:**
- Issue: Database connection string contains plaintext username and password
- Files: `package.json` (line 11)
- Current connection: `postgresql://cyclist:cyclist@192.168.4.134:5432/cycletourmap`
- Impact: Credentials visible in version control and any CI/CD logs. Database accessible to anyone with this string.
- Fix approach: Use environment variables for all connection parameters. Store in `.env` file (already in `.gitignore`).

**Hardcoded API Endpoint:**
- Issue: AppSync GraphQL endpoint and AWS region hardcoded
- Files: `amplify/backend/function/stravaListener/src/client.js` (line 4)
- Current code: `const appsyncUrl = "https://yi7zd2l4ejcsnmqr6r2ib26aum.appsync-api.us-east-1.amazonaws.com/graphql"`
- Impact: Endpoint is public/searchable. While not a direct vulnerability, combined with weak auth creates risk.
- Fix approach: Move to environment variables or AWS Secrets Manager.

**Missing CORS Protection:**
- Issue: No visible CORS configuration preventing cross-origin requests
- Files: Unknown - appears to be infrastructure concern
- Impact: Frontend can be accessed from any domain. If third-party sites can make requests as authenticated users, they could access data.
- Fix approach: Implement proper CORS headers on API endpoints restricting to known domains only.

**Client-Side Secret Storage:**
- Issue: Strava client_secret stored in environment variables accessible from frontend
- Files: `src/components/AuthStrava.vue` (line 42), `src/components/Strava.vue` (line 123)
- Impact: Client secret transmitted to browser, visible in network requests and localStorage. Should be server-side only.
- Fix approach: Move Strava OAuth token exchange to backend-only operation. Frontend should only receive tokens via secure HTTP-only cookies.

## Known Bugs

**Router Navigation Logic Bug:**
- Symptoms: Home page navigation has race condition. Multiple `next()` calls can occur.
- Files: `src/router/router.js` (lines 92-114)
- Trigger: Navigate to home while authenticated
- Current issue:
  ```javascript
  router.beforeResolve((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // ... async call then next()
    }
    if (to.name === 'home') {
      // ... another async call then next()
    }
    next()  // Always called, even if previous async next() was called
  })
  ```
- Workaround: Browser handles double-next() gracefully but logs warnings
- Fix approach: Use proper Promise handling or return early after first next() call

**Missing Logic in Update Athlete Callback:**
- Symptoms: Athlete list update fails silently
- Files: `src/components/AuthStrava.vue` (lines 117-121)
- Issue:
  ```javascript
  let updatedIndex = data.listAthletes.items.findIndex(
    c => {
      console.log("athlete", c)
      c.id == updateAthlete.id  // Missing return statement!
    }
  );
  ```
- Impact: `findIndex` always returns -1 because callback returns undefined instead of boolean. Athlete data doesn't update in Apollo cache.
- Fix approach: Add `return` statement: `return c.id == updateAthlete.id`

**Console Logging Exposed in Strava Listener:**
- Symptoms: Sensitive data logged to CloudWatch
- Files: `amplify/backend/function/stravaListener/src/graphql.js` (multiple console.log calls)
- Current lines: 12, 24, 25, 27, 41, 75, 96, 119, etc.
- Impact: Access tokens, athlete IDs, and full GraphQL responses logged. Anyone with CloudWatch access sees this data.
- Fix approach: Remove or conditionally enable debug logging. Never log tokens or PII.

## Tech Debt

**Amplify Removal In Progress:**
- Issue: Project has "remove-amplify" branch merged into master but still contains Amplify code
- Files: `src/plugins/amplify.js`, `src/plugins/apollo.js`, `amplify/` directory still present
- Impact: Conflicting authentication mechanisms. AWS AppSync client code coexists with Postgres/PostGraphile setup.
- Current state: Schema migrated to Postgres, but frontend still uses AWS Amplify Auth
- Fix approach: Complete Amplify removal - delete `src/plugins/amplify.js`, `amplify/` directory. Replace with PostgreSQL-native JWT auth in frontend.

**Vuex Store Unused:**
- Issue: Store exists but is completely empty
- Files: `src/store/index.js` (11 lines, no state/mutations/actions)
- Impact: No centralized state management being used. Components maintain local state, making data sharing difficult.
- Fix approach: Either populate store with application state (tours, activities, auth) or remove it

**Vue 2 to Vue 3 Migration Incomplete:**
- Issue: Code uses both Vue 2 and Vue 3 APIs
- Files: Multiple components
- Examples:
  - `src/router/router.js` uses `Vue.prototype.$Amplify` (Vue 2 style)
  - `src/main.js` creates app with `createApp()` (Vue 3)
  - Vuetify alpha version v3.0.0-alpha.0 (very unstable)
- Impact: Type safety lost, performance issues, components may break in next updates
- Fix approach: Standardize on Vue 3 composition API, update Vuetify to stable v3.x or v2.x

**No Error Boundaries / Error Handling:**
- Issue: No global error handler for failed async operations
- Files: Throughout components, especially `src/components/Strava.vue`, `src/components/AuthStrava.vue`, `src/components/LeafletData.vue`
- Impact: Failed API calls silently fail. Users see blank screens or "Loading..." indefinitely.
- Example: `Strava.vue` line 161 catches error but only `console.warn()`, doesn't notify user
- Fix approach: Add centralized error handler, show user-facing error messages for failed requests

**Dead Code / Commented Routes:**
- Issue: Multiple commented-out routes and components
- Files: `src/router/router.js` (lines 73-84)
- Commented routes: `/summary/:mapId`, `/rides/:mapId`
- Impact: Code bloat, confusion about intended features
- Fix approach: Remove or create issues to implement these routes

**No Input Validation:**
- Issue: GraphQL mutations accept user input without validation
- Files: Throughout `src/graphql/mutations.js`
- Impact: Could send invalid data to database (null fields, wrong types, oversized strings)
- Fix approach: Add schema validation on frontend before mutation

## Performance Bottlenecks

**Large Component Files:**
- Problem: Components exceed 400+ lines, mixing template, script, styles
- Files: `src/components/Strava.vue` (456 lines), `src/components/Leaflet.vue` (331 lines)
- Impact: Harder to test, debug, and maintain. Single responsibility violated.
- Improvement path: Split into smaller focused components. Extract form logic to composables.

**Inefficient GraphQL Queries:**
- Problem: Activities queried with all 50+ fields every time
- Files: `src/graphql/mutations.js` (auto-generated, but over-fetching)
- Example: Creating activity fetches all nested Tour data with all its activity data
- Impact: Large payloads over network, slow mutations
- Improvement path: Use GraphQL field selection to fetch only needed fields

**Missing Pagination:**
- Problem: Activities loaded all at once from database
- Files: Tour activities have `nextToken` but component doesn't fully implement pagination
- Impact: Thousands of activities loaded into memory on large tours
- Improvement path: Implement proper pagination with load-more buttons

**Unoptimized Leaflet Map:**
- Problem: All activities rendered as layers simultaneously
- Files: `src/components/Leaflet.vue` (331 lines)
- Impact: Maps with 1000+ activities become very slow
- Improvement path: Implement clustering (leaflet-markercluster), viewport-based rendering

## Fragile Areas

**Strava OAuth Flow:**
- Files: `src/components/AuthStrava.vue` (237 lines)
- Why fragile:
  - Hardcoded client_id (line 8: `client_id=28538`)
  - No PKCE implementation
  - Token refresh happens client-side, could miss expiry edge cases
  - Multiple places refreshing tokens: `Strava.vue`, `AuthStrava.vue`, backend `graphql.js`
- Safe modification: Standardize token refresh to single location (preferably backend)
- Test coverage: No tests visible

**GraphQL Request Signing:**
- Files: `amplify/backend/function/stravaListener/src/client.js` (46 lines)
- Why fragile:
  - Custom HTTPS request implementation instead of using library
  - Error handling is basic (Promise not rejected on HTTP errors)
  - Hardcoded endpoint (line 4)
- Safe modification: Use AWS SDK's GraphQL client or AppSync client library
- Test coverage: No tests visible

**Activity Data Transformation:**
- Files: `amplify/backend/function/stravaListener/src/graphql.js`, `src/utilities/activityKeys.js`
- Why fragile:
  - Strava API schema changes would break data mapping
  - No schema validation, just spreads all fields
  - Tour-Activity matching by date is fragile (line 68: `if (start >= tourStart && start <= tourEnd)`)
- Safe modification: Add activity-tour relationship validation in database
- Test coverage: No tests visible

## Scaling Limits

**Database Connection Management:**
- Current: Direct PostgreSQL connection from serverless Lambda
- Limit: Each Lambda creates new connection, connection pool exhausted with 100+ concurrent requests
- Scaling path: Implement connection pooling (PgBouncer or RDS Proxy)

**Strava API Rate Limits:**
- Current: No rate limit handling
- Limit: 600 requests per 15 minutes per app
- Impact: Bulk importing athletes' activities could hit limit
- Scaling path: Add request queuing and backoff logic

**Webhook Handler Scaling:**
- Problem: Strava sends webhooks sequentially, all processed in single Lambda
- Limit: If one webhook takes 30+ seconds, Strava times out
- Impact: Missing activity updates for large athlete bases
- Scaling path: Queue webhooks to SQS for async processing

## Dependencies at Risk

**Vuetify v3.0.0-alpha.0:**
- Risk: Alpha version, unstable API
- Impact: Breaking changes possible with next release
- Migration plan: Upgrade to latest stable v3.x or downgrade to v2.x (well-maintained)

**Vue 2 Libraries Mixed with Vue 3:**
- Risk: `vue-cli-plugin-apollo`, `vue-cli-plugin-vuetify` are Vue 2 era
- Impact: May not work correctly with Vue 3. Community support declining.
- Migration plan: Use `@apollo/client` directly with Vue 3 composition API

**Node Version Ambiguity:**
- Risk: No `.nvmrc` or `engines` field in package.json
- Impact: Local development might use different Node version than production (Lambda runtime)
- Fix: Add `"engines": {"node": "18.x"}` to package.json

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: Service functions, utility functions, component logic
- Files: `src/utilities/activityKeys.js`, `src/utilities/athleteKeys.js` - trivial to test but don't have tests
- Risk: Refactoring breaks silently

**No Integration Tests:**
- What's not tested: GraphQL mutations/queries, Strava OAuth flow, database operations
- Files: All `src/graphql/` files, `src/components/AuthStrava.vue`
- Risk: Auth flow breaks and is only discovered in production

**No E2E Tests:**
- What's not tested: Full user journey (login → create tour → import activities → view map)
- Risk: Complete application failure missed until deployment

**No API Contract Tests:**
- What's not tested: Strava API response schema changes
- Files: `amplify/backend/function/stravaListener/src/graphql.js`
- Risk: Strava API breaks and application silently ignores new/removed fields

## Missing Critical Features

**Row-Level Security (RLS):**
- Problem: No RLS on Postgres database
- Blocks: Users can see/modify other users' data via direct GraphQL queries
- Current: Relies on GraphQL layer to enforce ownership, but direct database access has no controls
- Recent commit message: "schema seems to be mostly ready for use" suggests RLS not implemented
- Impact: High-risk data exposure vulnerability

**Session Management:**
- Problem: No session invalidation endpoint
- Blocks: Users cannot effectively "logout" - old tokens still valid until expiry
- Current: Token refresh happens but no revocation mechanism
- Impact: Compromised tokens remain valid

**Audit Logging:**
- Problem: No logging of who accessed/modified what data
- Blocks: Cannot track data breaches or unauthorized access
- Impact: Regulatory compliance issues (GDPR, HIPAA if applicable)

**Input Rate Limiting:**
- Problem: No rate limiting on mutations
- Blocks: Users could spam database with thousands of tour/activity mutations
- Impact: DoS attacks possible

---

*Concerns audit: 2026-01-24*
