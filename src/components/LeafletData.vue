<template>
  <div>
    <leaflet v-if="$route.params.mapId == 'new'" :activities="$store.state.activities" />
    <leaflet v-else-if="tour" :activities="tour.activities.items" />
    <v-layout v-else-if="loading" justify-center align-center fill-height>
      <v-progress-circular color="primary" indeterminate />
    </v-layout>
    <div v-else-if="error">{{ error }}</div>
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
