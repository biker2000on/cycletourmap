<template>
  <div>
    <v-layout v-if="loading" justify-center align-center fill-height>
      <v-progress-circular color="primary" indeterminate />
    </v-layout>
    <strava
      v-else-if="isEdit && athlete"
      :tourData="tour ? { getTour: tour } : {}"
      :athlete="athlete"
    />
    <view-nav v-else-if="tour && !isEdit" :tourData="tour" />
    <div v-else-if="error">{{ error }}</div>
  </div>
</template>

<script>
import Strava from "./Strava.vue";
import ViewNav from "./ViewNav.vue";
import { toursApi, athletesApi } from "../api/client";

export default {
  components: {
    Strava,
    ViewNav
  },
  data() {
    return {
      tour: null,
      athlete: null,
      loading: false,
      error: null,
    };
  },
  computed: {
    isEdit() {
      return this.$route.name == "edit";
    },
    signedIn() {
      return this.$store.state.signedIn;
    },
    token() {
      return this.$store.state.token;
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = null;

      try {
        // Load athlete profile if signed in
        if (this.signedIn && this.token) {
          try {
            const athleteData = await athletesApi.me(this.token);
            // Convert to legacy format
            this.athlete = {
              id: athleteData.id,
              strava_id: athleteData.stravaId,
              firstname: athleteData.firstname,
              lastname: athleteData.lastname,
              profile: athleteData.profile,
              profile_medium: athleteData.profileMedium,
              // Note: auth is managed separately now via store
            };
          } catch (err) {
            console.warn('Failed to load athlete profile:', err);
          }
        }

        // Load tour if not new
        const mapId = this.$route.params.mapId;
        if (mapId && mapId !== "new") {
          const result = await toursApi.getLegacy(mapId, this.token);
          this.tour = result.getTour;
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        this.error = err.message || 'Failed to load data';
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    '$route.params.mapId': {
      handler() {
        this.loadData();
      },
      immediate: true
    },
    signedIn() {
      // Reload when sign-in state changes
      this.loadData();
    }
  }
};
</script>

<style>
</style>
