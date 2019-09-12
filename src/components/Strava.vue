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
            <v-text-field label="Start Date" v-model="date" prepend-icon="event" v-on="on" readonly></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title scrollable actions></v-date-picker>
        </v-menu>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <v-menu
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
          <v-date-picker v-model="enddate" no-title scrollable actions></v-date-picker>
        </v-menu>
      </v-list-item-content>
    </v-list-item>
    <!-- <v-list-item dense>
      <v-list-item-content>
        <h3>Start Date:</h3>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <input type="date" value="start" @input="$store.commit('setStart',$event.target.value)" />
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <h3>End Date:</h3>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <input type="date" value="end" @input="$store.commit('setEnd',$event.target.value)" />
      </v-list-item-content>
    </v-list-item> -->
    <v-list-item>
      <v-list-item-content>
        <v-textarea label="Description" v-model="description" rows="5"></v-textarea>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-btn @click="getAllActivities">Fetch All Activities</v-btn>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-btn
          :href="'https://www.strava.com/oauth/authorize?client_id=28538' +
              '&redirect_uri=' + redirect_uri +
              '&response_type=' + 'code' +
              '&approval_prompt=' + 'auto' + // could be 'force'
              '&scope=' + 'read,profile:read_all,activity:read'"
        >Authorize App</v-btn>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import axios from "axios";
import { setInterval, clearInterval } from "timers";

export default {
  props: {
    // activities: {
    //   type: Array,
    //   required: true,
    //   default: () => []
    // },
    start: {
      type: String,
      required: false
    },
    end: {
      type: String,
      required: false
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
      date: null,
      enddate: null,
      menu: false,
      menu2: false,
    };
  },
  methods: {
    getAllActivities: async function() {
      const start = new Date(this.$store.state.start);
      const end = this.$store.state.end
        ? new Date(this.$store.state.end)
        : new Date();
      let page = 1;
      let acts = [];
      let activities = "";
      do {
        // let strava = await fetch(
        //   "https://www.strava.com/api/v3/athletes/" +
        //     this.athlete.id +
        //     "/activities?access_token=" +
        //     this.auth.access_token +
        //     "&per_page=50&page=" +
        //     page
        // );
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
          this.$store.commit("addActivities", acts);
          this.$emit("update:activities", acts);
          return;
        }
        page++;
      } while (activities != "");
      this.$store.commit("addActivities", acts);
      this.$emit("update:activities", acts);
      return;
    },
    getAuth: function() {
      var data = {
        client_id: process.env.VUE_APP_STRAVA_CLIENTID,
        redirect_uri: "localhost:8080",
        response_type: "code",
        approval_prompt: "auto",
        scope: "read,profile:read_all,activity:read"
      };
      axios.get("https://www.strava.com/oauth/authorize", data);
    },
    checkCookie() {
      if (this.$cookies.isKey("auth")) {
        let now = new Date();
        if (this.$cookies.get("auth").expires_at > now.getTime() / 1000) {
          this.auth = this.$cookies.get("auth");
          return;
        }
      }
    },
    refreshToken() {
      const vm = this;
      if (this.auth) {
        this.refresh = setInterval(() => {
          let now = new Date();
          if (vm.auth.expires_at < now.getTime() / 1000 + 3600) {
            vm.getTokens();
          }
        }, 3600);
      }
    },
    getTokens: async function() {
      let data;
      if (this.$cookies.isKey("auth")) {
        let now = new Date();
        this.auth = this.$cookies.get("auth");
        this.athlete = this.$cookies.get("athlete");
        // console.log("inside cookie check");
        if (this.auth.expires_at > now.getTime() / 1000 + 3600) return;
        data = {
          client_id: process.env.VUE_APP_STRAVA_CLIENTID,
          client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
          refresh_token: this.auth.refresh_token,
          grant_type: "refresh_token"
        };
      }
      if (window.location.search) {
        const params = new window.URLSearchParams(window.location.search);
        window.history.replaceState({}, document.title, "/"); // removes query string from URL
        if (params.has("error")) {
          // console.error("You didn't give us the right permissions");
          return;
        }
        const code = params.get("code");
        if (params.has("scope")) {
          this.stravaScope = params.get("scope").split(",");
        }
        data = {
          client_id: process.env.VUE_APP_STRAVA_CLIENTID,
          client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code"
        };
      }
      // console.log("check data before send", data);
      if (!data) return;
      let res = await axios.post("https://www.strava.com/oauth/token", data);
      let { athlete, ...auth } = res.data;
      this.auth = auth;
      if (!this.athlete && !athlete) {
        // send request to get athlete object
        const res2 = await axios.get("https://www.strava.com/api/v3/athlete", {
          headers: {
            Authorization: "Bearer " + this.auth.access_token //the token is a variable which holds the token
          }
        });
        athlete = res2.data;
      }
      this.athlete = athlete;
      this.$cookies.set("auth", auth, "30d").set("athlete", athlete, "30d");
      if (this.refresh == null) {
        this.refreshToken();
      }

      // console.log("Strava refresh token response: ", res.data);
      // console.log("From cookie: ", this.$cookies.get("auth"));
    }
  },
  mounted() {
    this.getTokens();
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
