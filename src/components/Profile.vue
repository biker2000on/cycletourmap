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
        light
        class="elevation-2 mx-md-6"
      >
        <template v-slot:top>
          <div class="flex-row d-flex justify-space-between" >
          <v-btn color="success" :to="{ name: 'edit', params: { mapId: 'new' }}" class="ma-2" :disabled="!$store.state.hasStravaAuth">
            <v-icon>add</v-icon>New Tour
          </v-btn>
          <auth-strava class="d-inline"/>
          </div>
        </template>
        <template v-slot:item.isPublic="{ item }">
          <v-icon>{{ item.isPublic ? 'visibility' : 'visibility_off' }}</v-icon>
        </template>
        <template v-slot:item.action="{ item }">
          <td class="justify-center layout px-0">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon class="mx-0" :to="{ name: 'map', params: { mapId: item.id }}" >
                  <v-icon color="blue">visibility</v-icon>
                </v-btn>
              </template>
              <span>View</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon class="mx-0" :to="{ name: 'edit', params: { mapId: item.id }}" >
                  <v-icon color="teal">edit</v-icon>
                </v-btn>
              </template>
              <span>Edit</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon class="mx-0" @click.stop="openDialog(item)" >
                  <v-icon color="pink">delete</v-icon>
                </v-btn>
              </template>
              <span>Delete</span>
            </v-tooltip>
          </td>
        </template>
      </v-data-table>
      <v-dialog v-model="dialog" max-width="290">
        <v-card>
          <v-card-title class="headline">Delete Tour?</v-card-title>
          <v-card-text>Are you sure you want to delete {{ activeItem ? activeItem.name : '' }}?</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="dialog = false" >Cancel</v-btn>
            <v-btn text color="error" @click="deleteTour(activeItem)" :loading="deleting">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import AuthStrava from './AuthStrava.vue'
import { toursApi } from '../api/client'

export default {
  components: {
    AuthStrava,
  },
  data() {
    return {
      headers: [
        { text: "Name", value: "name", width: 200 },
        { text: "Start", value: "start_date", width: 120 },
        { text: "End", value: "end_date", width: 120 },
        { text: "Description", value: "description" },
        { text: "Public", value: "isPublic" },
        { text: "Actions", value: "action", align: "center" }
      ],
      tours: [],
      loading: true,
      error: null,
      activeItem: null,
      dialog: false,
      deleting: false,
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
  },
  mounted() {
    this.loadTours();
  }
};
</script>

<style>
</style>
