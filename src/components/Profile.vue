<template>
  <div>
    <v-progress-circular v-if="loading" indeterminate />
    <div v-else-if="error" class="error">We had an error: {{ error }}</div>
    <div v-else>
      <h2 class="text-center ma-6">Hello {{ user ? user.email : '' }}</h2>
      <v-data-table
        :headers="headers"
        :items="tours"
        :items-per-page="10"
        class="elevation-2 mx-md-6"
      >
        <template v-slot:top>
          <div class="flex-row d-flex justify-space-between">
            <v-btn color="success" class="ma-2" :disabled="!$store.state.hasStravaAuth" @click="showCreateModal = true">
              <v-icon start>mdi-plus</v-icon>New Tour
            </v-btn>
            <auth-strava class="d-inline"/>
          </div>
        </template>
        <template v-slot:item.isPublic="{ item }">
          <v-icon>{{ item.isPublic ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
        </template>
        <template v-slot:item.action="{ item }">
          <div class="d-flex justify-center">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn icon variant="text" v-bind="props" :to="{ name: 'map', params: { mapId: item.id }}">
                  <v-icon color="blue">mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>View</span>
            </v-tooltip>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn icon variant="text" v-bind="props" :to="{ name: 'edit', params: { mapId: item.id }}">
                  <v-icon color="teal">mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit</span>
            </v-tooltip>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn icon variant="text" v-bind="props" @click.stop="openDialog(item)">
                  <v-icon color="pink">mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Delete</span>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>

      <!-- Delete confirmation dialog -->
      <v-dialog v-model="dialog" max-width="290">
        <v-card>
          <v-card-title>Delete Tour?</v-card-title>
          <v-card-text>Are you sure you want to delete {{ activeItem ? activeItem.name : '' }}?</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" @click="dialog = false">Cancel</v-btn>
            <v-btn variant="text" color="error" @click="deleteTour(activeItem)" :loading="deleting">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create tour modal -->
      <tour-create-modal
        v-model="showCreateModal"
        @created="onTourCreated"
      />
    </div>
  </div>
</template>

<script>
import AuthStrava from './AuthStrava.vue'
import TourCreateModal from './TourCreateModal.vue'
import { toursApi } from '../api/client'

export default {
  components: {
    AuthStrava,
    TourCreateModal,
  },
  data() {
    return {
      headers: [
        { title: "Name", key: "name", width: 200 },
        { title: "Start", key: "start_date", width: 120 },
        { title: "End", key: "end_date", width: 120 },
        { title: "Description", key: "description" },
        { title: "Public", key: "isPublic", width: 80 },
        { title: "Actions", key: "action", align: "center", sortable: false }
      ],
      tours: [],
      loading: true,
      error: null,
      activeItem: null,
      dialog: false,
      deleting: false,
      showCreateModal: false,
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    }
  },
  methods: {
    async loadTours() {
      this.loading = true;
      this.error = null;
      try {
        const result = await toursApi.listLegacy(this.token);
        this.tours = result.items;
      } catch (err) {
        console.error('Failed to load tours:', err);
        this.error = err.message || 'Failed to load tours';
      } finally {
        this.loading = false;
      }
    },
    openDialog(item) {
      this.dialog = true;
      this.activeItem = item;
    },
    async deleteTour(tour) {
      if (!tour) return;

      this.deleting = true;
      try {
        await toursApi.delete(tour.id, this.token);
        // Remove from local list
        this.tours = this.tours.filter(t => t.id !== tour.id);
        this.dialog = false;
        this.activeItem = null;
      } catch (err) {
        console.error('Failed to delete tour:', err);
        this.error = err.message || 'Failed to delete tour';
      } finally {
        this.deleting = false;
      }
    },
    onTourCreated({ tour, startDate, endDate }) {
      // Store dates in Vuex for the edit page to auto-fetch activities
      this.$store.commit('setStart', startDate);
      this.$store.commit('setEnd', endDate);

      // Navigate to the edit page with the new tour ID
      this.$router.push({
        name: 'edit',
        params: { mapId: tour.id },
        query: { autoFetch: 'true' }
      });
    },
  },
  mounted() {
    this.loadTours();
  }
};
</script>

<style>
</style>
