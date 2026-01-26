<template>
  <div class="edit-panel">
    <!-- Floating control panel -->
    <v-card class="edit-card" elevation="8">
      <v-card-title class="d-flex justify-space-between align-center py-2">
        <span class="text-subtitle-1">{{ tour?.name || 'New Tour' }}</span>
        <v-btn icon variant="text" size="small" @click="expanded = !expanded">
          <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-title>

      <v-expand-transition>
        <div v-show="expanded">
          <v-divider></v-divider>
          <v-card-text class="py-2">
            <div class="text-caption text-grey mb-2">
              {{ formatDateRange }}
            </div>

            <!-- Status indicator -->
            <v-chip
              v-if="fetchingActivities"
              color="primary"
              size="small"
              class="mb-2"
            >
              <v-progress-circular indeterminate size="12" width="2" class="mr-2"></v-progress-circular>
              Loading from database...
            </v-chip>
            <v-chip
              v-else-if="syncInProgress"
              color="info"
              size="small"
              class="mb-2"
            >
              <v-progress-circular indeterminate size="12" width="2" class="mr-2"></v-progress-circular>
              Syncing from Strava... ({{ syncProgress }} new)
            </v-chip>
            <v-chip
              v-else-if="activitiesCount > 0"
              color="success"
              size="small"
              class="mb-2"
            >
              {{ activitiesCount }} activities loaded
            </v-chip>
          </v-card-text>

          <v-card-actions class="pt-0">
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              :loading="fetchingActivities"
              :disabled="!canFetch"
              @click="fetchActivities"
            >
              <v-icon start size="small">mdi-refresh</v-icon>
              Refresh Activities
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              size="small"
              variant="elevated"
              color="success"
              :loading="saving"
              @click="save"
            >
              <v-icon start size="small">mdi-content-save</v-icon>
              Save
            </v-btn>
          </v-card-actions>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- Success dialog -->
    <v-dialog v-model="showSuccess" max-width="350">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          Tour Saved
        </v-card-title>
        <v-card-text>
          Your tour has been saved successfully.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showSuccess = false">Continue Editing</v-btn>
          <v-btn color="primary" variant="elevated" :to="'/tourmap/' + tourId">View Tour</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error snackbar -->
    <v-snackbar v-model="showError" color="error" :timeout="5000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showError = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { activitiesApi } from '../api/client';

export default {
  name: 'EditPanel',
  props: {
    tour: {
      type: Object,
      default: null
    },
    athlete: {
      type: Object,
      required: true
    },
    autoFetch: {
      type: Boolean,
      default: false
    }
  },
  emits: ['activities-fetched'],
  data() {
    return {
      expanded: true,
      fetchingActivities: false,
      syncInProgress: false,
      syncProgress: 0,
      syncJobId: null,
      saving: false,
      showSuccess: false,
      showError: false,
      errorMessage: '',
      tourId: null,
    };
  },
  computed: {
    token() {
      return this.$store.state.token;
    },
    startDate() {
      return this.tour?.start_date || this.$store.state.start;
    },
    endDate() {
      return this.tour?.end_date || this.$store.state.end;
    },
    formatDateRange() {
      if (!this.startDate) return 'No dates set';
      const start = new Date(this.startDate).toLocaleDateString();
      const end = this.endDate ? new Date(this.endDate).toLocaleDateString() : 'ongoing';
      return `${start} - ${end}`;
    },
    activitiesCount() {
      return this.$store.state.activities?.length || 0;
    },
    canFetch() {
      return !!this.startDate;
    }
  },
  methods: {
    async fetchActivities() {
      if (!this.startDate) return;

      this.fetchingActivities = true;

      try {
        // Ensure dates are in ISO format (YYYY-MM-DD)
        const formatDateStr = (date) => {
          if (!date) return null;
          if (typeof date === 'string') {
            // Already a string - might be ISO or YYYY-MM-DD
            return date.split('T')[0];
          }
          // Date object
          return new Date(date).toISOString().split('T')[0];
        };

        const startDateStr = formatDateStr(this.startDate);
        const endDateStr = formatDateStr(this.endDate) || new Date().toISOString().split('T')[0];

        if (!startDateStr) {
          this.showErrorMessage('Start date is required to fetch activities.');
          this.fetchingActivities = false;
          return;
        }

        // Step 1: Fetch existing activities from database first
        let existingActivities = [];
        let existingStravaIds = [];

        try {
          existingActivities = await activitiesApi.getByDateRange(
            startDateStr,
            endDateStr,
            this.token
          );

          // Format and display existing activities immediately
          const formattedExisting = existingActivities.map(a => ({
            ...a,
            id: a.stravaId || a.id,
            summary_polyline: a.summaryPolyline,
            start_date_local: a.startDateLocal,
            map: { summary_polyline: a.summaryPolyline }
          }));

          if (formattedExisting.length > 0) {
            this.$store.commit('setActivities', formattedExisting);
            this.$emit('activities-fetched', formattedExisting);
          }

          existingStravaIds = existingActivities
            .filter(a => a.stravaId)
            .map(a => a.stravaId);
        } catch (dbErr) {
          console.warn('Failed to fetch cached activities, will sync from Strava:', dbErr);
          // Continue with sync even if database fetch fails
        }

        this.fetchingActivities = false;

        // Step 2: Start background sync from Strava for any new activities
        try {
          this.syncInProgress = true;
          this.syncProgress = 0;

          const syncResult = await activitiesApi.startSync(
            startDateStr,
            endDateStr,
            this.token,
            this.tourId,
            existingStravaIds
          );

          this.syncJobId = syncResult.jobId;

          // Step 3: Poll for sync completion
          await this.pollSyncStatus();
        } catch (syncErr) {
          console.warn('Background sync failed:', syncErr);
          // Don't show error if we already have activities from database
          if (existingActivities.length === 0) {
            this.showErrorMessage('Failed to sync activities from Strava.');
          }
        }

      } catch (err) {
        console.error('Failed to fetch activities:', err);
        this.showErrorMessage('Failed to fetch activities. Please try again.');
      } finally {
        this.fetchingActivities = false;
        this.syncInProgress = false;
      }
    },

    async pollSyncStatus() {
      if (!this.syncJobId) return;

      const maxAttempts = 120; // 2 minutes max
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          const status = await activitiesApi.getSyncStatus(this.syncJobId, this.token);
          this.syncProgress = status.progress;

          if (status.status === 'completed') {
            // Refresh activities from database to get the newly synced ones
            if (status.progress > 0) {
              const startDateStr = this.startDate;
              const endDateStr = this.endDate || new Date().toISOString().split('T')[0];

              const allActivities = await activitiesApi.getByDateRange(
                startDateStr,
                endDateStr,
                this.token
              );

              const formatted = allActivities.map(a => ({
                ...a,
                id: a.stravaId || a.id,
                summary_polyline: a.summaryPolyline,
                start_date_local: a.startDateLocal,
                map: { summary_polyline: a.summaryPolyline }
              }));

              this.$store.commit('setActivities', formatted);
              this.$emit('activities-fetched', formatted);
            }
            this.syncInProgress = false;
            return;
          }

          if (status.status === 'error') {
            console.error('Sync error:', status.error);
            this.showErrorMessage('Background sync failed: ' + status.error);
            this.syncInProgress = false;
            return;
          }

          // Wait before next poll
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } catch (err) {
          console.error('Error polling sync status:', err);
          break;
        }
      }

      this.syncInProgress = false;
    },

    async save() {
      // Activities are saved during sync, so this just confirms the tour is complete
      this.saving = true;

      try {
        // Show success - activities were already saved during sync
        this.showSuccess = true;
      } finally {
        this.saving = false;
      }
    },

    showErrorMessage(message) {
      this.errorMessage = message;
      this.showError = true;
    }
  },
  mounted() {
    this.tourId = this.$route.params.mapId;

    // Auto-fetch activities if requested
    if (this.autoFetch) {
      this.fetchActivities();
      // Clear the autoFetch flag from URL
      this.$router.replace({
        ...this.$route,
        query: { ...this.$route.query, autoFetch: undefined }
      });
    }
  }
};
</script>

<style scoped>
.edit-panel {
  position: relative;
  z-index: 1000;
}

.edit-card {
  position: fixed;
  top: 80px;
  right: 16px;
  width: 300px;
  max-width: calc(100vw - 32px);
}

@media (max-width: 600px) {
  .edit-card {
    top: auto;
    bottom: 16px;
    right: 8px;
    left: 8px;
    width: auto;
  }
}
</style>
