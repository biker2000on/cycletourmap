<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="!isAuthenticated">
      <a :href="stravaAuthUrl">
        <img src="/strava/btn_strava_connectwith_orange.svg" height="48" />
      </a>
    </div>
    <div v-else-if="error">{{ error }}</div>
    <!-- User is authenticated, nothing to show -->
  </div>
</template>

<script>
import { authApi, athletesApi } from '../api/client'

export default {
  data() {
    return {
      loading: false,
      error: null,
      redirect_uri: import.meta.env.VITE_REDIRECTURI || window.location.origin,
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
    stravaAuthUrl() {
      return 'https://www.strava.com/oauth/authorize?client_id=' + this.client_id +
        '&redirect_uri=' + this.redirect_uri +
        '&response_type=code' +
        '&approval_prompt=auto' +
        '&scope=read,profile:read_all,activity:read';
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
        this.error = "You didn't give us the right permissions";
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
      } catch (err) {
        console.error('Strava callback failed:', err);
        this.error = err.message || 'Authentication failed';
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
