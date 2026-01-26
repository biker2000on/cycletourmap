<template>
  <v-list density="compact">
    <v-list-item>
      <v-text-field label="Tour Name" v-model="name" density="compact"></v-text-field>
    </v-list-item>
    <v-list-item>
      <v-menu
        ref="menu"
        :close-on-content-click="false"
        v-model="menu"
        transition="scale-transition"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            label="Start Date"
            v-model="startdate"
            prepend-icon="mdi-calendar"
            v-bind="props"
            readonly
            density="compact"
          ></v-text-field>
        </template>
        <v-date-picker v-model="startdateObj" @update:model-value="onStartDateSelect" hide-header>
        </v-date-picker>
      </v-menu>
    </v-list-item>
    <v-list-item>
      <v-menu
        ref="menu2"
        :close-on-content-click="false"
        v-model="menu2"
        transition="scale-transition"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            label="End Date"
            v-model="enddate"
            prepend-icon="mdi-calendar"
            v-bind="props"
            readonly
            density="compact"
          ></v-text-field>
        </template>
        <v-date-picker v-model="enddateObj" @update:model-value="onEndDateSelect" hide-header>
        </v-date-picker>
      </v-menu>
    </v-list-item>
    <v-list-item>
      <v-textarea label="Description" v-model="description" rows="5" density="compact"></v-textarea>
    </v-list-item>
    <v-list-item>
      <v-switch label="Public" v-model="isPublic" color="primary" hide-details></v-switch>
    </v-list-item>
    <v-list-item>
      <v-btn @click="getAllActivities" color="primary" :loading="fetchingActivities" block>Fetch All Activities</v-btn>
    </v-list-item>
    <v-list-item>
      <v-btn @click="submitTour" color="primary" :loading="isSaving" block>Save</v-btn>
    </v-list-item>

    <v-dialog v-model="dialog" max-width="290">
      <v-card :loading="isSaving">
        <v-card-title>Successfully Saved Tourmap</v-card-title>
        <v-card-text>
          <p><a :href="'/tourmap/' + tourId">View your tourmap here</a></p>
          <p>or click outside the dialog to continue editing your tourmap.</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-list>
</template>

<script>
import axios from "axios";
import { v4 as uuidv4 } from 'uuid'
import { activityKeys } from '../utilities/activityKeys'
import pick from 'lodash.pick'
import { toursApi, activitiesApi, authApi } from '../api/client'

export default {
  props: {
    tourData: {
      type: Object,
      default: () => {},
    },
    athlete: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      fetchingActivities: false,
      isSaving: false,
      name: null,
      description: null,
      startdate: null,
      enddate: null,
      startdateObj: null,
      enddateObj: null,
      menu: false,
      menu2: false,
      isPublic: false,
      tourId: null,
      tour: null,
      dialog: false,
      stravaAccessToken: null,
    };
  },
  computed: {
    token() {
      return this.$store.state.token;
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    onStartDateSelect(date) {
      this.startdate = this.formatDate(date);
      this.menu = false;
    },
    onEndDateSelect(date) {
      this.enddate = this.formatDate(date);
      this.menu2 = false;
    },
    async loadAuth() {
      // Try to get Strava access token from our backend
      if (!this.token) return;

      try {
        const response = await authApi.refresh(this.token);
        this.stravaAccessToken = response.accessToken;
      } catch (err) {
        console.warn('Failed to get Strava access token:', err);
      }
    },

    loadTour() {
      if (this.$route.params.mapId != 'new') {
        if (this.tourData.getTour) {
          this.name = this.tourData.getTour.name;
          this.startdate = this.tourData.getTour.start_date;
          this.enddate = this.tourData.getTour.end_date;
          this.startdateObj = this.startdate ? new Date(this.startdate) : null;
          this.enddateObj = this.enddate ? new Date(this.enddate) : null;
          this.description = this.tourData.getTour.description;
          this.isPublic = this.tourData.getTour.isPublic;
        }
      }
    },

    async submitTour() {
      this.isSaving = true;
      this.dialog = true;

      try {
        if (this.$route.params.mapId == 'new') {
          // Create new tour
          const tourInput = {
            name: this.name,
            description: this.description,
            startDate: this.startdate,
            endDate: this.enddate,
            isPublic: this.isPublic,
          };

          const newTour = await toursApi.create(tourInput, this.token);
          this.tourId = newTour.id;

          // Submit activities
          await this.batchSubmitNewRides(this.$store.state.activities);
          this.$store.commit('setActivities', []);
        } else {
          // Update existing tour
          const tourInput = {
            name: this.name,
            description: this.description,
            startDate: this.startdate,
            endDate: this.enddate,
            isPublic: this.isPublic,
          };

          await toursApi.update(this.tourId, tourInput, this.token);
        }
      } catch (err) {
        console.error('Failed to save tour:', err);
        // Could show error to user here
      } finally {
        this.isSaving = false;
      }
    },

    async batchSubmitNewRides(rides) {
      if (!rides || rides.length === 0) return;

      // Process in batches of 25
      const ridesToProcess = [...rides];

      while (ridesToProcess.length) {
        const batch = ridesToProcess.splice(0, 25);
        const activities = batch.map(c => {
          const stats = pick(c, activityKeys);
          return {
            activityType: 'STRAVA',
            stravaId: c.id,
            summaryPolyline: c.map?.summary_polyline || c.summary_polyline,
            tourId: this.tourId,
            ...this.convertToApiFormat(stats)
          };
        });

        try {
          await activitiesApi.createBatch(activities, this.token);
        } catch (err) {
          console.error('Failed to create activities batch:', err);
        }
      }
    },

    // Convert snake_case Strava fields to camelCase API format
    convertToApiFormat(stats) {
      const mapping = {
        achievement_count: 'achievementCount',
        athlete_count: 'athleteCount',
        average_heartrate: 'averageHeartrate',
        average_speed: 'averageSpeed',
        average_temp: 'averageTemp',
        average_watts: 'averageWatts',
        comment_count: 'commentCount',
        device_watts: 'deviceWatts',
        display_hide_heartrate_option: 'displayHideHeartrateOption',
        elapsed_time: 'elapsedTime',
        elev_high: 'elevHigh',
        elev_low: 'elevLow',
        end_latlng: 'endLatlng',
        gear_id: 'gearId',
        has_heartrate: 'hasHeartrate',
        has_kudoed: 'hasKudoed',
        heartrate_opt_out: 'heartrateOptOut',
        kudos_count: 'kudosCount',
        location_city: 'locationCity',
        location_country: 'locationCountry',
        location_state: 'locationState',
        max_heartrate: 'maxHeartrate',
        max_speed: 'maxSpeed',
        moving_time: 'movingTime',
        photo_count: 'photoCount',
        pr_count: 'prCount',
        resource_state: 'resourceState',
        start_date: 'startDate',
        start_date_local: 'startDateLocal',
        start_latitude: 'startLatitude',
        start_longitude: 'startLongitude',
        start_latlng: 'startLatlng',
        total_elevation_gain: 'totalElevationGain',
        total_photo_count: 'totalPhotoCount',
        upload_id: 'uploadId',
        utc_offset: 'utcOffset',
        workout_type: 'workoutType',
      };

      const result = {};
      for (const [key, value] of Object.entries(stats)) {
        const newKey = mapping[key] || key;
        // Convert arrays to JSON strings if needed
        if (Array.isArray(value)) {
          result[newKey] = JSON.stringify(value);
        } else {
          result[newKey] = value;
        }
      }
      return result;
    },

    async getAllActivities() {
      this.fetchingActivities = true;

      try {
        const start = new Date(this.startdate);
        const end = this.enddate
          ? new Date(this.enddate)
          : new Date();
        const times = [parseInt(start.getTime() / 1000), parseInt(end.getTime() / 1000)];
        let page = 1;
        const per_page = 50;
        let acts = [];
        let rawCount = 0;

        await this.loadAuth();

        if (!this.stravaAccessToken) {
          console.error('No Strava access token available');
          return;
        }

        do {
          const strava = await axios.get(
            "https://www.strava.com/api/v3/athlete/activities",
            {
              params: {
                per_page,
                page,
                after: times[0] - 43200,  // min possible time backwards at -12h TZ
              },
              headers: {
                Authorization: "Bearer " + this.stravaAccessToken
              }
            }
          );
          const activities = strava.data;
          rawCount = activities.length;

          const filtered = activities.filter(c => {
            const rideStart = new Date(c.start_date_local);
            return rideStart >= start && rideStart <= end;
          });
          acts = acts.concat(filtered);
          page++;
        } while (rawCount === per_page);

        if (this.$route.params.mapId == 'new') {
          this.$store.commit('setActivities', acts.map(c => {
            return { ...c, summary_polyline: c.map.summary_polyline };
          }));
        } else {
          await this.compareRides(acts, start, end);
        }
      } catch (err) {
        console.error('Failed to fetch Strava activities:', err);
      } finally {
        this.fetchingActivities = false;
      }
    },

    async compareRides(strava, start, end) {
      const existingActivities = this.tourData.getTour?.activities?.items || [];

      // Find activities to delete (outside date range)
      const toBeDeleted = existingActivities.filter(c => {
        const rideStart = new Date(c.start_date_local);
        return rideStart < start || rideStart > end;
      });

      // Delete activities outside date range
      for (const activity of toBeDeleted) {
        await this.deleteRide(activity.id);
      }

      // Process each Strava activity
      for (const ride of strava) {
        await this.compareRide(ride, existingActivities);
      }
    },

    async compareRide(ride, existingActivities) {
      const existing = existingActivities.filter(c => ride.id == c.strava_id);

      if (existing.length < 1) {
        await this.submitRide(ride, 'create');
      } else if (existing.length == 1) {
        await this.submitRide(ride, existing[0].id);
      } else {
        await this.handleMultipleRides(ride, existing);
      }
    },

    async handleMultipleRides(ride, existing) {
      for (let i = 0; i < existing.length; i++) {
        if (i == 0) {
          await this.submitRide(ride, existing[i].id);
        } else {
          await this.deleteRide(existing[i].id);
        }
      }
    },

    async deleteRide(id) {
      try {
        await activitiesApi.delete(id, this.token);
      } catch (err) {
        console.error('Failed to delete activity:', err);
      }
    },

    async submitRide(c, id = 'create') {
      const stats = pick(c, activityKeys);
      const input = {
        activityType: 'STRAVA',
        stravaId: c.id,
        summaryPolyline: c.map?.summary_polyline || c.summary_polyline,
        tourId: this.tourId,
        ...this.convertToApiFormat(stats),
      };

      try {
        if (id == 'create') {
          await activitiesApi.create(input, this.token);
        } else {
          await activitiesApi.update(id, input, this.token);
        }
      } catch (err) {
        console.error('Failed to save activity:', err);
      }
    },

    setTourId() {
      let id = this.$route.params.mapId;
      if (id == 'new') {
        id = uuidv4();
      }
      this.tourId = id;
    }
  },
  watch: {
    startdate(newdate) {
      this.$store.commit('setStart', newdate);
    },
    enddate(newdate) {
      this.$store.commit('setEnd', newdate);
    },
  },
  mounted() {
    this.loadTour();
    this.loadAuth();
    this.setTourId();
  },
};
</script>

<style scoped>
.v-list-item {
  text-align: center;
}
</style>
