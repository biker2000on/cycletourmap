<template>
  <v-list dense >
    <v-list-item v-if="athlete" >
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
          :close-on-content-click="false"
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
          <v-date-picker v-model="startdate" no-title scrollable @input="menu = false" >
          </v-date-picker>
        </v-menu>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <v-menu
          ref="menu2"
          :close-on-content-click="false"
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
          <v-date-picker v-model="enddate" no-title scrollable @input="menu2 = false" >
          </v-date-picker>
        </v-menu>
      </v-list-item-content>
    </v-list-item>
    <v-list-item >
      <v-list-item-content class="my-0 py-0" >
        <v-textarea label="Description" v-model="description" rows="5"></v-textarea>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content class="my-0 py-0">
        <v-switch label="Public" class="mx-auto" v-model="isPublic" ></v-switch>
        <br>
        <!-- <p class="text-center">{{ '# of Activities: ' + tourdata ? tourData.getTour.activities.items.length : ''}}</p> -->
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-btn @click="getAllActivities" color="primary">Fetch All Activities</v-btn>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-btn @click="submitTour" color="primary">Save</v-btn>
      </v-list-item-content>
    </v-list-item>

    <v-dialog v-model="dialog" max-width="290">
      <v-card :loading="isSaving">
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
import uuid from 'uuid/v4'
import { activityKeys } from '../utilities/activityKeys'
import pick from 'lodash.pick'

// queries
import CREATE_TOUR from '../gql/createTour.gql'
import CREATE_ACTIVITY from '../gql/createActivity.gql'
import CREATE_ACTIVITIES from '../gql/createActivities.gql'
import UPDATE_TOUR from '../gql/updateTour.gql'
import UPDATE_ACTIVITY from '../gql/updateActivity.gql'
import UPDATE_AUTH from '../gql/updateAuth.gql'
import DELETE_ACTIVITY from '../gql/deleteActivity.gql'
import GET_TOUR_ACTIVITIES from '../gql/getTourActivities.gql'
import LIST_AUTHS from '../gql/listAuths.gql'
import LIST_TOURS from '../gql/listTours.gql'

export default {
  props: {
    tourData: {
      type: Object,
      default: () => {},
    },
    authProp: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      athlete: null,
      refresh: null, // timer for refreshing tokens
      stravaScope: null,
      isSaving: false,
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
    loadAuth: function() {
      this.auth = this.authProp[0]
      const expire = new Date(this.auth.expires_at * 1000 - 3600 * 1000) // 1 hour before expiry
      if (expire < new Date()) {
        this.refreshAuth()
      }
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
      auth['id'] = this.auth.id
      // const auths = await this.$Amplify.API.graphql(this.$Amplify.graphqlOperation(updateAuth, {input: auth}))
      // console.log('update auth', auth)
      this.$apollo.mutate({
        mutation: UPDATE_AUTH,
        variables: { input: auth },
        update: (store, { data: { updateAuth } }) => {
          const data = store.readQuery({query: LIST_AUTHS})
          data.listAuths.items = [ updateAuth ]
          store.writeQuery({ query: LIST_AUTHS, data })
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateAuth: {
            __typename: 'Auth',
            ...auth
          }
        }
      })
      // console.log('successful submission of new auth', auths)
      this.auth = auth;
      return auth
    },
    loadTour: async function() {
      if (this.$route.params.mapId != 'new') {
        if (this.tourData.getTour) {
          this.name = this.tourData.getTour.name
          this.startdate = this.tourData.getTour.start_date
          this.enddate = this.tourData.getTour.end_date
          this.description = this.tourData.getTour.description
          this.isPublic = this.tourData.getTour.isPublic
        }
      }
    },
    submitTour: async function() {
      this.isSaving = true
      this.dialog = true
      const input = {
        id: this.tourId,
        name: this.name,
        start_date: this.startdate,
        end_date: this.enddate,
        description: this.description,
        isPublic: this.isPublic,
      }
      if (this.$route.params.mapId == 'new') {
        await this.$apollo.mutate({
          mutation: CREATE_TOUR,
          variables: { input },
          update: (store, { data: { createTour }}) => {
            let data = store.readQuery({ query: LIST_TOURS })
            // console.log('cached tours', data.listTours.items, 'createTour', createTour)
            let index = data.listTours.items.findIndex(c => c.id == input.id)
            if (index == -1) {
              data.listTours.items.push(createTour)
            } else {
              data.listTours.items[index] = createTour
            }
              store.writeQuery({ query: LIST_TOURS, data })
          },
          optimisticResponse: {
            __typename: 'Mutation',
            createTour: {
              __typename: 'Tour',
              ...input
            }
          }
        })
        await this.batchSubmitNewRides(this.$store.state.activities)
        this.$store.commit('setActivities', []) // possibly to reset State
      } else {
        await this.$apollo.mutate({
          mutation: UPDATE_TOUR,
          variables: { input },
          update: ( store, { data: { updateTour }} ) => {
            let data = store.readQuery({ query: LIST_TOURS })
            let index = data.listTours.items.findIndex(c => c.id == updateTour.id )
            data.listTours.items[index] = updateTour
            store.writeQuery({ query: LIST_TOURS, data })
          },
          optimisticResponse: {
            __typename: 'Mutation',
            updateTour: {
              __typename: 'Tour',
              ...input
            }
          }
        })
      }
      this.isSaving = false
    },
    batchSubmitNewRides: async function(rides) {
      // batch in collections of 25 max
      while (rides.length) {
        let activities = rides.splice(0,25)
        activities = activities.map(c => {
          let stats = pick(c, activityKeys)
          return {
            id: uuid(),
            activity_type: 'STRAVA',
            strava_id: c.id,
            activityTourId: this.tourId,
            summary_polyline: c.map.summary_polyline,
            ...stats
          }
        })
        this.$apollo.mutate({
          mutation: CREATE_ACTIVITIES,
          variables: {
            input: activities, 
          },
          fetchPolicy: 'no-cache',
        }) 
      }
    },
    getAllActivities: async function() {
      const start = new Date(this.startdate);
      const end = this.enddate
        ? new Date(this.enddate)
        : new Date();
      const times = [parseInt(start.getTime() / 1000), parseInt(end.getTime() / 1000)]
      let page = 1;
      let per_page = 50
      let acts = [];
      let activities = [];
      await this.loadAuth()
      do {
        let strava = await axios.get(
          "https://www.strava.com/api/v3/athlete/activities",
          {
            params: {
              per_page,
              page,
              // before: times[1] + 43200, // max possible time forward at +12h TZ
              after: times[0] - 43200,  // min possible time backwards at -12h TZ
            },
            headers: {
              Authorization: "Bearer " + this.auth.access_token
            }
          }
        );
        activities = strava.data;

        activities = activities.filter(c => {
          let rideStart = new Date(c.start_date_local); // use local since that is what people will be thinking on.
          return rideStart >= start && rideStart <= end;
        });
        acts = acts.concat(activities);
        page++;
      } while (activities.length == per_page);

      if (this.$route.params.mapId == 'new') {
        // console.log('inside new')
        this.$store.commit('setActivities', acts.map(c => { 
          return { ...c, summary_polyline: c.map.summary_polyline } 
        }))
      } else {
        this.compareRides(acts, start, end)
      }
      return
    },
    compareRides(strava, start, end) {
      let toBeDeleted = this.tourData.getTour.activities.items.filter(c => {
        // console.log('before Start', rideStart < start, 'after End', rideStart > end)
        let rideStart = new Date(c.start_date_local)
        if (rideStart < start || rideStart > end) return true
        return false
      })
      toBeDeleted.map(c => this.deleteRide(c.id))
      // console.log('toBeDeleted', toBeDeleted)
      // let stravaIds = new Set(strava.map(c => c.id))
      // let app = new Set(this.tourData.getTour.activities.items.map(c => c.strava_id))
      // console.log('strava', stravaIds, app, strava, this.tourData.getTour.activities.items)
      strava.map(c => this.compareRide(c))
    },
    compareRide(ride) {
      let app = this.tourData.getTour.activities.items.filter(c => ride.id == c.strava_id)
      const rideSum = pick(ride, ['elapsed_time','moving_time', 'name','start_date_local','type'])
      rideSum['strava_id'] = ride.id
      rideSum['summary_polyline'] = ride.map.summary_polyline
      // console.log('compared', app.length, rideSum, app)
      if (app.length < 1) {
        this.submitRide(ride, 'create') // create
      } else if (app.length == 1) {
        // console.log('check equal rides', isEqual(rideSum, app[0]))
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
      // console.log('delete', id, {input: {id}})
      this.$apollo.mutate({
        mutation: DELETE_ACTIVITY,
        variables: { input: { id }},
        update: ( store, { data: {deleteActivity} }) => {
          // console.log('delete Activity', deleteActivity)
          const data = store.readQuery({query: GET_TOUR_ACTIVITIES, variables: { id: this.tourId } })
          // console.log('data from delete query', data)
          data.getTour.activities.items = data.getTour.activities.items.filter(c => c.id != id)
          store.writeQuery({ query: GET_TOUR_ACTIVITIES, variables: { id: this.tourId }, data })
        },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteActivity: {
            __typename: 'Activity',
            id: id,
          }
        }
      })
      // console.log('deleted')
      return
    },
    submitRide: async function(c, id = 'create') {
      let stats = pick(c, activityKeys)
      const input = {
        activity_type: 'STRAVA',
        strava_id: c.id,
        activityTourId: this.tourId,
        summary_polyline: c.map.summary_polyline,
        ...stats,
      }
      let { activityTourID, ...hopefulResponse } = input
      if (id == 'create') {
        input['id'] = uuid()
        this.$apollo.mutate({
          mutation: CREATE_ACTIVITY,
          variables: { input },
          update: ( store, { data: createActivity }) => {
            if (this.$route.params.mapId != 'new') {
              const data = store.readQuery({query: GET_TOUR_ACTIVITIES, variables: { id: this.tourId } })
              data.getTour.activities.items.push(createActivity.createActivity)
              store.writeQuery({ query: GET_TOUR_ACTIVITIES, variables: { id: this.tourId }, data })
            }
          },
          optimisticResponse: {
            __typename: 'Mutation',
            createActivity: {
              __typename: 'Activity',
              ...hopefulResponse,
              id: input.id
            }
          }
        })

        // console.log('created')
      } else {
        input['id'] = id
        this.$apollo.mutate({
          mutation: UPDATE_ACTIVITY,
          variables: { input },
          optimisticResponse: {
            __typename: 'Mutation',
            updateActivity: {
              __typename: 'Activity',
              ...hopefulResponse,
              id
            }
          }
        })
        // console.log('updated')
      }
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
};
</script>

<style scoped>
.v-list-item {
  text-align: center;
}
</style>
