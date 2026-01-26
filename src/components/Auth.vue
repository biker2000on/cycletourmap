<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" class="text-center">
        <v-card class="pa-8" elevation="8">
          <v-card-title class="text-h4 justify-center mb-4">
            Sign In to Cycle Tourmap
          </v-card-title>

          <v-card-text>
            <div v-if="loading" class="d-flex justify-center my-8">
              <v-progress-circular indeterminate color="primary" size="64" />
            </div>

            <div v-else-if="error" class="my-4">
              <v-alert type="error" class="mb-4">{{ error }}</v-alert>
              <v-btn color="primary" @click="error = null">Try Again</v-btn>
            </div>

            <div v-else-if="isAuthenticated" class="my-4">
              <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
              <p class="text-h6 mb-4">You're signed in!</p>
              <v-btn color="primary" size="large" :to="{ name: 'profile' }">
                Go to Dashboard
              </v-btn>
            </div>

            <div v-else class="my-4">
              <p class="text-body-1 mb-6">
                Connect your Strava account to create and share your cycling tour maps.
              </p>

              <v-btn
                :href="stravaAuthUrl"
                color="orange-darken-1"
                size="x-large"
                class="mb-4"
              >
                <img
                  src="/strava/btn_strava_connectwith_orange.svg"
                  height="48"
                  alt="Connect with Strava"
                  style="filter: brightness(0) invert(1);"
                />
              </v-btn>

              <p class="text-caption text-grey mt-4">
                We only request read access to your activities and profile.
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { authApi, athletesApi } from '../api/client'

export default {
  name: 'Auth',
  data() {
    return {
      loading: false,
      error: null,
      client_id: import.meta.env.VITE_STRAVA_CLIENTID,
    };
  },
  computed: {
    isAuthenticated() {
      return this.$store.state.hasStravaAuth;
    },
    token() {
      return this.$store.state.token;
    },
    redirect_uri() {
      // Always use current origin to handle dynamic ports in development
      return window.location.origin + '/auth';
    },
    stravaAuthUrl() {
      const params = new URLSearchParams({
        client_id: this.client_id,
        redirect_uri: this.redirect_uri,
        response_type: 'code',
        approval_prompt: 'auto',
        scope: 'read,profile:read_all,activity:read'
      });
      return 'https://www.strava.com/oauth/authorize?' + params.toString();
    }
  },
  methods: {
    async handleStravaCallback() {
      if (!window.location.search) {
        // No callback params, check if we're already authenticated
        if (this.token) {
          await this.checkAuthStatus();
        }
        return;
      }

      const params = new URLSearchParams(window.location.search);

      if (params.has("error")) {
        this.error = "Authorization was denied. Please grant the required permissions.";
        console.error("Strava auth error:", params.get("error"));
        return;
      }

      const code = params.get("code");
      if (!code) {
        // No code, might be already authenticated
        if (this.token) {
          await this.checkAuthStatus();
        }
        return;
      }

      // Exchange code for token via our backend
      this.loading = true;
      try {
        const response = await authApi.stravaCallback(code);

        // Store authentication data
        this.$store.commit('setToken', response.token);
        this.$store.commit('setUser', response.user);
        this.$store.commit('setHasStravaAuth', true);

        if (response.athlete) {
          // Fetch full athlete profile
          await this.loadAthleteProfile(response.token);
        }

        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect to dashboard after successful auth
        this.$router.push({ name: 'profile' });
      } catch (err) {
        console.error('Strava callback failed:', err);
        this.error = err.message || 'Authentication failed. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async checkAuthStatus() {
      if (!this.token) return;

      try {
        const meResponse = await authApi.me(this.token);
        this.$store.commit('setUser', meResponse.user);
        this.$store.commit('setHasStravaAuth', meResponse.stravaConnected);

        if (meResponse.athlete) {
          await this.loadAthleteProfile(this.token);
        }

        // If token is about to expire, refresh it
        if (meResponse.stravaConnected && !meResponse.stravaTokenValid) {
          await this.refreshStravaToken();
        }
      } catch (err) {
        console.warn('Auth check failed:', err);
        // Token might be invalid, clear auth state
        if (err.status === 401) {
          this.$store.commit('logout');
        }
      }
    },

    async loadAthleteProfile(token) {
      try {
        const athlete = await athletesApi.me(token);

        // Convert to legacy format for compatibility
        const legacyAthlete = {
          id: athlete.id,
          strava_id: athlete.stravaId,
          firstname: athlete.firstname,
          lastname: athlete.lastname,
          profile: athlete.profile,
          profile_medium: athlete.profileMedium,
          sex: athlete.sex,
          city: athlete.city,
          state: athlete.state,
          country: athlete.country,
          date_preference: athlete.datePreference,
          measurement_preference: athlete.measurementPreference,
          weight: athlete.weight,
        };

        this.$store.commit('setAthlete', legacyAthlete);
      } catch (err) {
        console.warn('Failed to load athlete profile:', err);
      }
    },

    async refreshStravaToken() {
      try {
        await this.$store.dispatch('refreshStravaToken');
      } catch (err) {
        console.warn('Failed to refresh Strava token:', err);
      }
    }
  },
  async mounted() {
    await this.handleStravaCallback();
  }
};
</script>

<style scoped>
.v-card {
  max-width: 500px;
  margin: 0 auto;
}
</style>
