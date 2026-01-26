<template>
  <div>
    <v-layout v-if="loading" justify-center align-center fill-height>
      <v-progress-circular color="primary" indeterminate />
    </v-layout>
    <edit-panel
      v-else-if="isEdit && athlete"
      :tour="tour"
      :athlete="athlete"
      :auto-fetch="autoFetch"
      @activities-fetched="onActivitiesFetched"
    />
    <view-nav v-else-if="tour && !isEdit" :tourData="tour" />
    <div v-else-if="error" class="pa-4 text-center">
      <v-alert type="error">{{ error }}</v-alert>
    </div>
    <div v-else-if="isEdit && !athlete" class="pa-4 text-center">
      <v-alert type="warning">
        Please sign in with Strava to edit tours.
      </v-alert>
      <v-btn color="primary" class="mt-4" to="/auth">Sign In</v-btn>
    </div>
  </div>
</template>

<script>
import EditPanel from "./EditPanel.vue";
import ViewNav from "./ViewNav.vue";
import { toursApi, athletesApi } from "../api/client";

export default {
  components: {
    EditPanel,
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
    autoFetch() {
      return this.$route.query.autoFetch === 'true';
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
            };
          } catch (err) {
            console.warn('Failed to load athlete profile:', err);
          }
        }

        // Load tour data
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
    },
    onActivitiesFetched(activities) {
      // Update store with fetched activities for map display
      this.$store.commit('setActivities', activities);
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
