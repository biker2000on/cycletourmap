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
          :close-on-content-click="false"
          :return-value.sync="startdate"
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
            <div class="flex-grow-1"></div>
            <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
            <v-btn text color="primary" @click="$refs.menu.save(startdate)">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <v-menu
          ref="menu2"
          :close-on-content-click="false"
          :return-value.sync="enddate"
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
          <v-date-picker v-model="enddate" no-title scrollable actions>
            <div class="flex-grow-1"></div>
            <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
            <v-btn text color="primary" @click="$refs.menu2.save(enddate)">OK</v-btn>
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
        <v-btn @click="submitTour" >Save</v-btn>
      </v-list-item-content>
    </v-list-item>

    <v-list-item>
      <v-list-item-content>
        <v-btn @click="getAllActivities">Fetch All Activities</v-btn>
      </v-list-item-content>
    </v-list-item>
    <!-- <v-list-item>
      <v-list-item-content>
        <v-btn
          :href="'https://www.strava.com/oauth/authorize?client_id=28538' +
              '&redirect_uri=' + redirect_uri +
              '&response_type=' + 'code' +
              '&approval_prompt=' + 'auto' + // could be 'force'
              '&scope=' + 'read,profile:read_all,activity:read'"
        >Authorize App</v-btn>
      </v-list-item-content>
    </v-list-item> -->
  </v-list>
</template>

<script>
import axios from "axios";
import { setInterval, clearInterval } from "timers";
import { API, graphqlOperation } from 'aws-amplify'
import { createTour, updateTour, createActivity } from '../graphql/mutations'
import { getTour, listAuths } from '../graphql/queries'
import uuid from 'uuid/v4'

export default {
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
    };
  },
  methods: {
    loadAuth: async function() {
      const auths = await this.$Amplify.API.graphql(this.$Amplify.graphqlOperation(listAuths, {id: this.$route.params.mapId}))
      console.log(auths)
      this.auth = auths.data.listAuths.items[0]
      const expire = new Date(this.auth.expires_at * 1000)
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
      let { athlete, ...auth } = res.data;
      this.auth = auth;
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
      if (this.$route.params.mapId == 'new') {
        const input = {
          name: this.name,
          start_date: this.startdate,
          end_date: this.enddate,
          description: this.description,
          isPublic: this.isPublic,
        }
        console.log('input', input)
        const newTour = await API.graphql(graphqlOperation(createTour, {input}))
        console.log('created new tour', newTour)
      } else {
        const updatedTour = await API.graphql(graphqlOperation(updateTour, {
          input: {  
            id: this.$route.params.mapId,
            name: this.name,
            start_date: this.startdate,
            end_date: this.enddate,
            description: this.description,
            isPublic: this.isPublic
          }
        }))
        console.log('updated tour', updatedTour)
      }
    },
    getAllActivities: async function() {
      const start = new Date(this.startdate);
      const end = this.enddate
        ? new Date(this.enddate)
        : new Date();
      let page = 1;
      let acts = [];
      let activities = "";
      const boundSubmitRide = this.submitRide.bind(this)
      do {
        let strava = await axios.get(
          "https://www.strava.com/api/v3/activities?per_page=50&page=" + page,
          {
            headers: {
              Authorization: "Bearer " + this.auth.access_token
            }
          }
        );
        // activities = await strava.json();
        activities = strava.data;
        let dates = activities.reduce((a, c) => {
          let rideStart = new Date(c.start_date);
          if (start > rideStart) {
            return true;
          } else {
            return a;
          }
        }, false);
        activities = activities.filter(c => {
          let rideStart = new Date(c.start_date);
          return rideStart >= start && rideStart <= end;
        });
        acts = acts.concat(activities);
        if (dates) {
          acts.map((c,i) => boundSubmitRide(c,i))
          this.$store.commit("addActivities", acts);
          this.$emit("update:activities", acts);
          return;
        }
        page++;
      } while (activities != "");
      acts.map(this.submitRide(c,i))
      this.$store.commit("addActivities", acts);
      this.$emit("update:activities", acts);
      return
    },
    submitRide: async function(c,i) {
      let { id, map, athlete, external_id, from_accepted_tag, upload_id_str, ...strava} = c
      const input = {
        activity_type: 'STRAVA',
        strava_id: id,
        activityTourId: this.tourId,
        summary_polyline: map.summary_polyline,
        ...strava,
      }
      let ride = await API.graphql(graphqlOperation(createActivity, {input}))
      console.log(`activity ${i} ${ride}`)
      return
    },
    setTourId() {
      let id = this.$route.params.mapId
      if (id == 'new') {
        id = uuid()
      }
      this.tourId = id
    }
  //   getAuth: function() {
  //     var data = {
  //       client_id: process.env.VUE_APP_STRAVA_CLIENTID,
  //       redirect_uri: "localhost:8080",
  //       response_type: "code",
  //       approval_prompt: "auto",
  //       scope: "read,profile:read_all,activity:read"
  //     };
  //     axios.get("https://www.strava.com/oauth/authorize", data);
  //   },
  //   checkCookie() {
  //     if (this.$cookies.isKey("auth")) {
  //       let now = new Date();
  //       if (this.$cookies.get("auth").expires_at > now.getTime() / 1000) {
  //         this.auth = this.$cookies.get("auth");
  //         return;
  //       }
  //     }
  //   },
  //   refreshToken() {
  //     const vm = this;
  //     if (this.auth) {
  //       this.refresh = setInterval(() => {
  //         let now = new Date();
  //         if (vm.auth.expires_at < now.getTime() / 1000 + 3600) {
  //           vm.getTokens();
  //         }
  //       }, 3600);
  //     }
  //   },
  //   getTokens: async function() {
  //     let data;
  //     if (this.$cookies.isKey("auth")) {
  //       let now = new Date();
  //       this.auth = this.$cookies.get("auth");
  //       this.athlete = this.$cookies.get("athlete");
  //       // console.log("inside cookie check");
  //       if (this.auth.expires_at > now.getTime() / 1000 + 3600) return;
  //       data = {
  //         client_id: process.env.VUE_APP_STRAVA_CLIENTID,
  //         client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
  //         refresh_token: this.auth.refresh_token,
  //         grant_type: "refresh_token"
  //       };
  //     }
  //     if (window.location.search) {
  //       const params = new window.URLSearchParams(window.location.search);
  //       window.history.replaceState({}, document.title, "/"); // removes query string from URL
  //       if (params.has("error")) {
  //         // console.error("You didn't give us the right permissions");
  //         return;
  //       }
  //       const code = params.get("code");
  //       if (params.has("scope")) {
  //         this.stravaScope = params.get("scope").split(",");
  //       }
  //       data = {
  //         client_id: process.env.VUE_APP_STRAVA_CLIENTID,
  //         client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
  //         code: code,
  //         grant_type: "authorization_code"
  //       };
  //     }
  //     // console.log("check data before send", data);
  //     if (!data) return;
  //     let res = await axios.post("https://www.strava.com/oauth/token", data);
  //     let { athlete, ...auth } = res.data;
  //     this.auth = auth;
  //     if (!this.athlete && !athlete) {
  //       // send request to get athlete object
  //       const res2 = await axios.get("https://www.strava.com/api/v3/athlete", {
  //         headers: {
  //           Authorization: "Bearer " + this.auth.access_token //the token is a variable which holds the token
  //         }
  //       });
  //       athlete = res2.data;
  //     }
  //     this.athlete = athlete;
  //     this.$cookies.set("auth", auth, "30d").set("athlete", athlete, "30d");
  //     if (this.refresh == null) {
  //       this.refreshToken();
  //     }

  //     // console.log("Strava refresh token response: ", res.data);
  //     // console.log("From cookie: ", this.$cookies.get("auth"));
  //   }
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
    // this.getTokens();
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
input {
  height: 2em;
  border: 2px solid indigo;
  border-radius: 5px;
  box-shadow: 3px 3px;
  padding: 6px;
}
</style>
