<template>
  <div>
    <!-- Show map with activities from store (edit mode) or tour data (view mode) -->
    <leaflet v-if="displayActivities.length > 0" :activities="displayActivities" />
    <leaflet v-else-if="!loading && !error" :activities="[]" />
    <v-overlay v-if="loading" contained class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>
    <v-alert v-if="error" type="error" class="ma-4">{{ error }}</v-alert>
  </div>
</template>

<script>
import Leaflet from "./Leaflet.vue";
import { toursApi } from "../api/client";

export default {
  components: {
    Leaflet
  },
  data() {
    return {
      tour: null,
      loading: false,
      error: null,
    };
  },
  computed: {
    signedIn() {
      return this.$store.state.signedIn;
    },
    token() {
      return this.$store.state.token;
    },
    isEditMode() {
      return this.$route.name === 'edit';
    },
    storeActivities() {
      return this.$store.state.activities || [];
    },
    tourActivities() {
      return this.tour?.activities?.items || [];
    },
    displayActivities() {
      // In edit mode, prefer store activities (freshly fetched from Strava)
      // Otherwise show saved tour activities
      if (this.isEditMode && this.storeActivities.length > 0) {
        return this.storeActivities;
      }
      return this.tourActivities;
    }
  },
  methods: {
    async loadTour() {
      const mapId = this.$route.params.mapId;
      if (mapId === "new") return;

      this.loading = true;
      this.error = null;

      try {
        const result = await toursApi.getLegacy(mapId, this.token);
        this.tour = result.getTour;
      } catch (err) {
        console.error('Failed to load tour:', err);
        this.error = err.message || 'Failed to load tour';
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    '$route.params.mapId': {
      handler() {
        this.loadTour();
      },
      immediate: true
    },
    signedIn() {
      // Reload when sign-in state changes
      this.loadTour();
    }
  }
};
</script>

<style>
</style>
