# Coding Conventions

**Analysis Date:** 2026-01-24

## Naming Patterns

**Files:**
- Vue components: PascalCase (e.g., `Home.vue`, `Auth.vue`, `Leaflet.vue`)
- JavaScript modules: camelCase or snake_case for GraphQL fields (e.g., `queries.js`, `mutations.js`, `activityKeys.js`)
- Backend functions: camelCase (e.g., `handleInput`, `getActivity`, `refreshAuth`)

**Functions:**
- camelCase for all JavaScript functions (e.g., `handleActivity`, `getAthleteAll`, `zoomUpdated`)
- Methods in Vue components use camelCase (e.g., `handleSignin`, `zoomAll`)
- Event handlers use camelCase with `handle` prefix or past tense pattern (e.g., `handleInput`, `zoomUpdated`)

**Variables:**
- camelCase for standard variables (e.g., `athleteInfo`, `windowHeight`, `computedHeight`)
- snake_case for Strava API response fields (e.g., `start_date_local`, `average_speed`, `total_elevation_gain`)
- Uppercase for constants and API keys (e.g., `VUE_APP_GOOGLE_MAPS_APIKEY`, `AUTH_TYPE`)

**Types:**
- Vue component data properties use camelCase: `athleteInfo`, `tableData2`, `tabulatorSettings`
- No explicit TypeScript types in use; Vue 2/3 with JavaScript

**Vue Component Structure:**
- `name` field used as lowercase identifier (e.g., `name: 'auth'`, `name: 'profile'`)
- Component filenames start with capital letter matching Vue component style

## Code Style

**Formatting:**
- No explicit `.eslintrc` or `.prettierrc` config found
- ESLint present in package.json but not configured
- Indentation observed: 2 spaces (standard Vue/Node.js)
- Line length: varies, no strict limit observed

**Linting:**
- Vue CLI ESLint plugin included (`@vue/cli-plugin-babel`)
- Config command exists: `npm run lint` via `vue-cli-service lint`
- ESLint disabled comment used: `/* eslint-disable */` in auto-generated files like `src/graphql/queries.js`

**Vue Template Patterns:**
- Reactive binding with `v-model` (e.g., `v-model="isMetric"`)
- Conditional rendering with `v-if` and `v-for` for lists
- Event binding with `@` syntax (e.g., `@update:zoom="zoomUpdated"`)
- Style binding with `:style="{}"` or `:class=""` for computed values

## Import Organization

**Order:**
1. Vue framework imports: `import { ... } from 'vue'`
2. Plugin imports: Vuetify, Apollo, Router, Store
3. Local components: `import ComponentName from './ComponentName.vue'`
4. Utilities and helpers: relative imports from `./utilities/`
5. Constants and keys: `import { keys } from './utilities/keys'`

**Path Aliases:**
- `@` alias configured in `vite.config.js`: `'@': path.resolve(__dirname, 'src')`
- Not widely used in observed code; mostly relative imports

**Example from `src/main.js`:**
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import router from './router'
```

## Error Handling

**Patterns:**
- Try-catch blocks used for async operations: `try { ... } catch (error) { console.warn(...) }`
- Console warnings for non-critical errors: `console.warn("couldn't retrieve athleteInfo", error)`
- Conditional checks for null/undefined: `if (req.query["hub.challenge"])` or `isNullOrUndefined(c)`
- Error propagation: Errors logged but execution continues in many cases

**Example from `amplify/backend/function/stravaListener/src/graphql.js`:**
```javascript
try {
  athleteInfo = await client(queries.getAthleteAll, { strava_id: body.owner_id })
  console.log("result from API query", athleteInfo.data.getAthleteByStravaId.items[0].tours);
} catch (error) {
  console.warn("couldn't retrieve athleteInfo", error);
}
```

**Express Routes (Backend):**
- HTTP status codes returned: 200, 404, 500 for various outcomes
- JSON responses with `res.json()` for success, error objects included in response

## Logging

**Framework:** Native `console` object

**Patterns:**
- `console.log()` for informational messages: `console.log("Subscription setup: ", req.query)`
- `console.warn()` for warnings and caught errors: `console.warn("Error fetching strava Activity detail", error)`
- Event logging in Lambda handlers: `console.log('EVENT: ${JSON.stringify(event)}')`
- Debugging traces: `console.log('before refresh')`, `console.log('after refresh')`

**When to Log:**
- API subscription confirmations: `console.log("Subscription setup: ")`
- GraphQL query results: `console.log("result from API query", result)`
- Auth refresh operations: `console.log('before refresh')`
- Error scenarios: `console.warn("error creating new activities", error)`

## Comments

**When to Comment:**
- Auto-generated files marked: `// this is an auto generated file. This will be overwritten` in `src/graphql/queries.js`
- Configuration explanations: `// Enable CORS for all methods`
- Non-obvious business logic: `// (new, old)` for Vue watch patterns
- Uncommented/disabled code: Often left in place with no explanation (see `src/components/Leaflet.vue` line 159-160)

**JSDoc/TSDoc:**
- Not used in observed code
- Vue components use `export default { name: '...', ... }` without JSDoc

**Code Comments Convention:**
- Inline comments for algorithms: `//reduces to bounding box of values`
- Conditional block explanations: `// route level code-splitting` in router configuration
- Single-line comments for logic clarity

## Function Design

**Size:**
- Small utility functions: 3-10 lines (e.g., `pick()` function)
- Component methods: 10-30 lines typical
- Complex handlers: 30-50+ lines acceptable (e.g., `handleActivity()`, `zoomAll()`)

**Parameters:**
- Single parameter common: `handleSignin(val)`, `zoomUpdated(zoom)`
- Object destructuring used: `{ athleteInfo }` from async results
- Spread operator for data preparation: `{ ...activity, activity_type: "STRAVA", ... }`

**Return Values:**
- Implicit returns in arrow functions: `const pick = (obj, keys) => Object.keys(obj)...`
- Explicit returns in regular functions
- Mapped array returns common: `.map(c => ({ ... }))`
- Filter chains: `.filter(c => c).reduce(...)` pattern used

**Example Small Function:**
```javascript
const pick = (obj, keys) =>
  Object.keys(obj)
    .filter(i => keys.includes(i))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
```

## Module Design

**Exports:**
- `export default` for Vue components
- Named exports for utility modules: `export const getTour = ...`
- CommonJS `module.exports = { ... }` for backend Node.js functions
- Single default export pattern: `export default router`, `export default store`

**Barrel Files:**
- No explicit barrel files observed
- Components imported directly: `import Home from '../views/Home.vue'`
- Utilities imported individually: `import { activityKeys } from './utilities/activityKeys.js'`

**Vue File Structure Pattern:**
```vue
<template>
  <!-- HTML template -->
</template>

<script>
export default {
  name: 'ComponentName',
  components: { ... },
  props: { ... },
  data() { return { ... } },
  computed: { ... },
  watch: { ... },
  methods: { ... },
  mounted() { ... },
  beforeDestroy() { ... }
}
</script>

<style lang="scss">
/* Scoped or global styles */
</style>
```

---

*Convention analysis: 2026-01-24*
