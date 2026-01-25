# Testing Patterns

**Analysis Date:** 2026-01-24

## Test Framework

**Runner:**
- No test framework detected in package.json
- Not detected: Jest, Vitest, Mocha, Chai, or any test runner

**Assertion Library:**
- Not configured

**Run Commands:**
- No test commands in `package.json` scripts section
- Linting only: `npm run lint` via `vue-cli-service lint`

## Test File Organization

**Location:**
- No test files found in the codebase
- Glob search for `*.test.*` and `*.spec.*` returned zero results

**Naming:**
- Not applicable (no tests found)

**Structure:**
- Not applicable (no tests found)

## Test Structure

**Suite Organization:**
- Not applicable

**Patterns:**
- Not applicable

**Code Example:**
Not applicable. No testing framework is set up in this project.

## Mocking

**Framework:**
- Not configured

**Patterns:**
- Not applicable (no tests exist)

**What to Mock:**
- If tests are added: External API calls (Strava API in `src/components/StravaData.vue`)
- GraphQL client calls from `src/plugins/apollo.js`
- Browser APIs: `window.addEventListener`, `window.innerHeight`
- Vuetify framework utilities: `this.$vuetify.application`
- Leaflet map components and omnivore polyline parsing

**What NOT to Mock:**
- Vue component lifecycle hooks (test actual behavior)
- Router navigation (use router test utilities when added)
- Store mutations/actions (test state changes)

## Fixtures and Factories

**Test Data:**
- Not configured

**Location:**
- Could be placed in: `tests/fixtures/` or `src/__tests__/fixtures/`
- Activity data structure example (from `src/utilities/activityKeys.js`):
```javascript
{
  id: string,
  activity_type: string,
  strava_id: number,
  achievement_count: number,
  athlete_count: number,
  average_heartrate: number,
  average_speed: number,
  distance: number,
  elapsed_time: number,
  moving_time: number,
  start_date_local: string,
  summary_polyline: string,
  type: string,
  owner: string
}
```

- Athlete data structure (from `src/graphql/queries.js`):
```javascript
{
  id: string,
  strava_id: number,
  firstname: string,
  lastname: string,
  profile: string,
  profile_medium: string,
  sex: string,
  city: string,
  state: string,
  country: string,
  weight: number,
  owner: string,
  auth: {
    id: string,
    access_token: string,
    expires_at: number,
    refresh_token: string,
    token_type: string,
    strava_scope: string,
    owner: string
  }
}
```

## Coverage

**Requirements:**
- No coverage requirements enforced

**View Coverage:**
- No coverage tools installed

## Test Types

**Unit Tests:**
- Should test: Utility functions like `pick()` in `amplify/backend/function/stravaListener/src/graphql.js`
- Should test: GraphQL query construction and variable handling
- Should test: Data transformation in components (e.g., distance/speed conversions in `src/components/Rides.vue`)
- Example function to test:
```javascript
const pick = (obj, keys) =>
  Object.keys(obj)
    .filter(i => keys.includes(i))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
```

**Integration Tests:**
- Should test: Apollo GraphQL client connectivity
- Should test: Strava API authentication flow and token refresh
- Should test: Activity webhook handling in `amplify/backend/function/stravaListener/src/app.js`
- Should test: Vue component interaction with Vuex store
- Example scenario from `src/components/Leaflet.vue`:
  - Load activities from store
  - Render polylines on map
  - Trigger map zoom calculation

**E2E Tests:**
- Not set up
- When added, should cover:
  - User authentication flow
  - Map loading with real/mock activity data
  - Profile data display
  - Route navigation

## Common Patterns to Test

**Async Testing:**
```javascript
// Pattern observed in src/App.vue beforeDestroy hook:
// Should test cleanup on component unmount
// Should test event listener removal

// Pattern from graphql.js handleInput function:
// Should await Promise.all for concurrent operations
// Should test error handling in try-catch
```

**API Call Testing:**
```javascript
// Pattern from amplify/backend/function/stravaListener/src/graphql.js:
// Mock axios.get() for Strava API calls
// Mock client() function for GraphQL mutations
// Test activity fetch, parse, and DB persistence

// Example to test:
const getActivity = async (id, access_token) => {
  try {
    const activity = await axios.get(
      "https://www.strava.com/api/v3/activities/" + id,
      { headers: { Authorization: "Bearer " + access_token } }
    );
    // Should mock axios and test response transformation
    return preppedActivity;
  } catch (error) {
    console.warn("Error fetching strava Activity detail", error);
  }
};
```

**Error Testing:**
```javascript
// Pattern from graphql.js:
// Test that errors are caught and logged
// Test that execution continues after catch
// Test console.warn calls

// Should test:
try {
  athleteInfo = await client(queries.getAthleteAll, { ... })
} catch (error) {
  console.warn("couldn't retrieve athleteInfo", error);
  // Application should handle missing athleteInfo gracefully
}
```

**Vue Component Testing:**
```javascript
// Pattern from src/components/Rides.vue:
// Should test computed property `tableData2` transformation
// Should test columns configuration returns correct structure
// Should test isMetric toggle updates displayed units

// Pattern from src/components/Leaflet.vue:
// Should test zoomAll() calculation with activity coordinates
// Should test bounds calculation with multiple activities
// Should test window resize event listener and cleanup
```

**State Management Testing:**
```javascript
// Pattern from src/store/index.js:
// Currently empty - when populated should test:
// - Mutations: setMetric (observed in Leaflet.vue)
// - State: isMetric, activities, activeActivityId (used in components)
// - Actions: async API calls for athlete/activity data

// Pattern from src/components/Leaflet.vue:
this.$store.state.isMetric
this.$store.state.activities
this.$store.state.activeActivityId
this.$store.commit("setMetric", val)
```

## Recommended Test Setup (If Tests Are Added)

**Framework Recommendation:**
- Vitest (modern, Vue 3 compatible, fast)
- Or Jest with `@vue/test-utils` for Vue 3

**Test Files Should Be Located At:**
- `src/__tests__/unit/` for unit tests
- `src/__tests__/integration/` for integration tests
- `src/components/__tests__/` for component tests (co-located)

**Mock Configuration Would Need:**
- `jest.config.js` or `vitest.config.ts`
- Mock for Axios (Strava API calls)
- Mock for Apollo Client
- Mock for Leaflet map library
- Mock for Vuetify components

## Files with No Test Coverage (Gap Analysis)

**Critical Paths:**
- `amplify/backend/function/stravaListener/src/graphql.js` - Main Strava webhook handler
- `amplify/backend/function/stravaListener/src/app.js` - Express endpoint handler
- `src/components/Leaflet.vue` - Map rendering and coordinate processing
- `src/components/Rides.vue` - Activity data transformation and display
- `src/plugins/apollo.js` - GraphQL client configuration
- `src/graphql/queries.js` - All GraphQL queries (auto-generated but critical)

**Low-Risk Areas (Could Skip):**
- `src/App.vue` - Root router wrapper
- `src/components/HelloWorld.vue` - Demo component
- Configuration files (`babel.config.js`, `vite.config.js`)

---

*Testing analysis: 2026-01-24*
