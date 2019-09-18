<template>
  <v-list dense>
    <v-list-item>
      <v-img
        v-if="athlete"
        :src="athlete.profile"
        :alt="athlete.firstname + ' ' + athlete.lastname"
        :style="{borderRadius: 50 + '%'}"
      />
    </v-list-item>
    <v-list-item v-if="athlete">
      <v-list-item-content>
        <h2>{{ athlete.firstname + ' ' + athlete.lastname }}</h2>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <v-text-field label="Tour Name" v-model="name"></v-text-field>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <v-menu
          ref="menu"
          :close-on-content-click="true"
          v-model="menu"
          transition="scale-transition"
          offset-y
          full-width
          :nudge-right="40"
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field 
              label="Start Date" 
              v-model="startdate" 
              prepend-icon="event" 
              v-on="on" 
              readonly></v-text-field>
          </template>
          <v-date-picker v-model="startdate" no-title scrollable actions>
          </v-date-picker>
        </v-menu>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <v-menu
          ref="menu2"
          :close-on-content-click="true"
          v-model="menu2"
          transition="scale-transition"
          offset-y
          full-width
          :nudge-right="40"
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field label="End Date" v-model="enddate" prepend-icon="event" v-on="on" readonly></v-text-field>
          </template>
          <v-date-picker v-model="enddate" no-title scrollable reactive >
          </v-date-picker>
        </v-menu>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-textarea label="Description" v-model="description" rows="5"></v-textarea>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-switch label="Public" v-model="isPublic" ></v-switch>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-btn @click="getAllActivities">Fetch All Activities</v-btn>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-btn @click="submitTour" >Save</v-btn>
      </v-list-item-content>
    </v-list-item>

    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline" >Successfully Saved Tourmap</v-card-title>
        <v-card-text>
          <p><a :href="'/#/tourmap/' + tourId">View your tourmap here</a></p>
          <p>or click outside the dialog to continue editing your tourmap.</p>  
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-list>
</template>

<script>
import axios from "axios";
import { setInterval, clearInterval } from "timers";
import { API, graphqlOperation } from 'aws-amplify'
import { createTour, updateTour, createActivity, updateAuth, updateActivity, deleteActivity } from '../graphql/mutations'
import { getTour, listAuths } from '../graphql/queries'
import uuid from 'uuid/v4'
import { activityKeys } from '../utilities/activityKeys'
import pick from 'lodash.pick'
import isEqual from 'lodash.isequal'

export default {
  props: {
    tourData: {
      type: Object,
      default: () => {},
    }
  },
  data() {
    return {
      athlete: null,
      refresh: null, // timer for refreshing tokens
      stravaScope: null,
      redirect_uri: process.env.VUE_APP_REDIRECTURI,
      client_id: process.env.VUE_APP_STRAVA_CLIENTID,
      client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
      auth: null,
      name: null,
      description: null,
      startdate: null,
      enddate: null,
      menu: false,
      menu2: false,
      isPublic: false,
      tourId: null,
      tour: null,
      dialog: false,
    };
  },
  methods: {
    loadAuth: async function() {
      // const auths = await this.$Amplify.API.graphql(this.$Amplify.graphqlOperation(listAuths, {id: this.$route.params.mapId}))
      // console.log(auths)
      // this.auth = auths.data.listAuths.items[0]
      this.auth = this.tourData.listAuths.items[0]
      const expire = new Date(this.auth.expires_at * 1000 + 3600 * 1000) // 1 hour before expiry
      if (expire < new Date()) {
        return this.refreshAuth()
      }
      return
    },
    refreshAuth: async function() {
      const data = {
        client_id: process.env.VUE_APP_STRAVA_CLIENTID,
        client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
        refresh_token: this.auth.refresh_token,
        grant_type: "refresh_token"
      }
      let res = await axios.post("https://www.strava.com/oauth/token", data);
      let { athlete, expires_in, ...auth } = res.data;
      console.log('auth', auth)
      auth['id'] = this.tourData.listAuths.items[0].id
      const auths = await this.$Amplify.API.graphql(this.$Amplify.graphqlOperation(updateAuth, {input: auth}))
      console.log('successful submission of new auth', auths)
      this.auth = auth;
      return auth
    },
    loadTour: async function() {
      if (this.$route.params.mapId != 'new') {
        const tour = await this.$Amplify.API.graphql(this.$Amplify.graphqlOperation(getTour, {id: this.$route.params.mapId}))
        // console.log(tour)
        if (tour.data) {
          this.name = tour.data.getTour.name
          this.startdate = tour.data.getTour.start_date
          this.enddate = tour.data.getTour.end_date
          this.description = tour.data.getTour.description
          this.isPublic = tour.data.getTour.isPublic
        } else if (tour.errors) {
          console.error('graphql Error', tour.errors)
        }
      }
    },
    submitTour: async function() {
      const input = {
        id: this.tourId,
        name: this.name,
        start_date: this.startdate,
        end_date: this.enddate,
        description: this.description,
        isPublic: this.isPublic,
      }
      if (this.$route.params.mapId == 'new') {
        const newTour = await API.graphql(graphqlOperation(createTour, { input }))
      } else {
        const updatedTour = await API.graphql(graphqlOperation(updateTour, { input }))
      }
      this.dialog = true
    },
    getAllActivities: async function() {
      const start = new Date(this.startdate);
      const end = this.enddate
        ? new Date(this.enddate)
        : new Date();
      const times = [start.getTime() / 1000, end.getTime() / 1000]
      let page = 1;
      let per_page = 50
      let acts = [];
      let activities = [];
      let beforeStart = false
      const boundSubmitRide = this.submitRide.bind(this)
      let auth = await this.loadAuth()
      do {
        let strava = await axios.get(
          "https://www.strava.com/api/v3/athlete/activities",
          {
            params: {
              per_page,
              page,
              before: times[1] + 43200, // max possible time forward at +12h TZ
              after: times[0] - 43200,  // min possible time backwards at -12h TZ
            },
            headers: {
              Authorization: "Bearer " + this.auth.access_token
            }
          }
        );
        activities = strava.data;

        // don't need with filtered rest query
        // let beforeStart = activities.reduce((a, c) => {
        //   let rideStart = new Date(c.start_date);
        //   if (start > rideStart) {
        //     return true;
        //   } else {
        //     return a;
        //   }
        // }, false);
        activities = activities.filter(c => {
          let rideStart = new Date(c.start_date_local); // use local since that is what people will be thinking on.
          return rideStart >= start && rideStart <= end;
        });
        acts = acts.concat(activities);
        // if (beforeStart) {
          // this.$store.commit("addActivities", acts);
          // this.$emit("update:activities", acts);
          // return;
        // }
        page++;
      } while (activities.length == per_page);

      if (this.$route.params.mapId == 'new') {
        acts.map((c,i) => boundSubmitRide(c))
        } else {
        this.compareRides(acts)
      }
      // acts.map(this.submitRide(c,i))
      // this.$store.commit("addActivities", acts);
      // this.$emit("update:activities", acts);
      return
    },
    compareRides(strava) {
      let stravaIds = new Set(strava.map(c => c.id))
      let app = new Set(this.tourData.getTour.activities.items.map(c => c.strava_id))
      console.log('strava', stravaIds, app, strava, this.tourData.getTour.activities.items)
      strava.map(c => this.compareRide(c))
    },
    compareRide(ride) {
      let app = this.tourData.getTour.activities.items.filter(c => ride.id == c.strava_id)
      const rideSum = pick(ride, ['elapsed_time','moving_time', 'name','start_date_local','type'])
      rideSum['strava_id'] = ride.id
      rideSum['summary_polyline'] = ride.map.summary_polyline
      console.log('compared', app.length, rideSum, app)
      if (app.length < 1) {
        this.submitRide(ride, 'create') // create
      } else if (app.length == 1) {
        console.log('check equal rides', isEqual(rideSum, app[0]))
        this.submitRide(ride, app[0].id)
      } else {
        this.handleMultipleRides(ride, app)
      }
    },
    handleMultipleRides(ride, app) {
      app.map((c,i) => {
        if (i == 0) {
          this.submitRide(ride, c.id)
        } else {
          this.deleteRide(c.id)
        }
      })
    },
    deleteRide: async function(id) {
      console.log('delete', id, {input: {id}})
      const ride = await API.graphql(graphqlOperation(deleteActivity, {input: {id}}))
      console.log('deleted')
      return
    },
    submitRide: async function(c, id = 'create') {
      // let { id, map, athlete, external_id, from_accepted_tag, upload_id_str, ...strava} = c
      let stats = pick(c, activityKeys)
      // console.log(stats, activityKeys)
      const input = {
        activity_type: 'STRAVA',
        strava_id: c.id,
        activityTourId: this.tourId,
        summary_polyline: c.map.summary_polyline,
        ...stats,
      }
      
      if (id == 'create') {
        let ride = await API.graphql(graphqlOperation(createActivity, {input}))
        console.log('created')
      } else {
        input['id'] = id
        let ride = await API.graphql(graphqlOperation(updateActivity, {input}))
        console.log('updated')
      }
      // console.log(`activity ${i}`, ride)
      return
    },
    setTourId() {
      let id = this.$route.params.mapId
      if (id == 'new') {
        id = uuid()
      }
      this.tourId = id
    }
  },
  watch: {
    startdate(newdate) {
      this.$store.commit('setStart', newdate)
    },
    enddate(newdate) {
      this.$store.commit('setEnd', newdate)
    },
  },
  mounted() {
    this.loadTour()
    this.loadAuth()
    this.setTourId()
  },
  destroyed() {
    clearInterval(this.refresh);
  }
};
</script>

<style scoped>
.v-list-item {
  text-align: center;
}
</style>
