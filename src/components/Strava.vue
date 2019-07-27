<template>
  <div id="strava">
    <h3>Strava Info Test</h3>
    <v-btn @click="getAllActivities">Fetch All Activities</v-btn>
    <a
      :href="'https://www.strava.com/oauth/authorize?client_id=28538' +
              '&redirect_uri=' + redirect_uri +
              '&response_type=' + 'code' +
              '&approval_prompt=' + 'auto' + // could be 'force'
              '&scope=' + 'read,profile:read_all,activity:read'"
    >Authorize App</a>
    <div>
      <label for="data.start">Start Date:</label>
      <input type="date" value="start" @input="$emit('update:start',$event.target.value)" />
      <label for="data.end">End Date:</label>
      <input type="date" value="end" @input="$emit('update:end',$event.target.value)" />
    </div>
    <div>
      <br />
      We returned {{ this.activities.length }} activities.
      <br />
    </div>
    <v-img
      v-if="athlete"
      :src="athlete.profile"
      :alt="athlete.firstname + ' ' + athlete.lastname"
      :style="{borderRadius: 50 + '%'}"
    />
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import { URLSearchParams } from "url";
import { setInterval, clearInterval } from 'timers';

export default {
  props: {
    activities: {
      type: Array,
      required: true,
      default: () => []
    },
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
      auth: null
    };
  },
  methods: {
    getAllActivities: async function() {
      const start = new Date(this.start);
      let page = 1;
      let acts = [];
      let activities = "";
      do {
        let strava = await fetch(
          "https://www.strava.com/api/v3/athletes/" +
            this.athlete.id +
            "/activities?access_token=" +
            this.auth.access_token +
            "&per_page=50&page=" +
            page
        );
        activities = await strava.json();
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
          return rideStart >= start;
        });
        acts = acts.concat(activities);
        if (dates) {
          this.$emit("update:activities", acts);
          return;
        }
        page++;
      } while (activities != "");
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
      const vm = this
      if (this.auth) {
        this.refresh = setInterval(() => {
          let now = new Date()
          if (vm.auth.expires_at < now.getTime() / 1000 + 3600) {
            vm.getTokens()
          }
        }, 3600)
      }
    },
    getTokens: async function() {
      if (this.$cookies.isKey("auth")) {
        let now = new Date();
        this.auth = this.$cookies.get("auth");
        this.athlete = this.$cookies.get('athlete')
        if (this.auth.expires_at > now.getTime() / 1000 + 3600) return
        const data = {
          client_id: process.env.VUE_APP_STRAVA_CLIENTID,
          client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
          refresh_token: this.auth.refresh_token,
          grant_type: "refresh_token"
        }
      }
      if (window.location.search) {
        const params = new window.URLSearchParams(window.location.search);
        if (params.has("error")) {
          console.error("You didn't give us the right permissions");
          return;
        }
        const code = params.get("code");
        if (params.has("scope")) {
          this.stravaScope = params.get("scope").split(",");
        }
        const data = {
          client_id: process.env.VUE_APP_STRAVA_CLIENTID,
          client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code"
        };
      }
      let res = await axios.post("https://www.strava.com/oauth/token", data);
      let { athlete, ...auth } = res.data;
      this.athlete = athlete;
      this.auth = auth;
      this.$cookies.set("auth", auth, "30d")
        .set('athlete',athlete, '30d')
      if (this.refresh == null) {
        this.refreshToken()
      }

      // console.log("Strava refresh token response: ", res.data);
      // console.log("From cookie: ", this.$cookies.get("auth"));
    }
  },
  mounted() {
    this.getTokens();
  },
  destroyed() {
    clearInterval(this.refresh)
  }
};
</script>

<style scoped>
#strava {
  text-align: center;
  padding: 5px;
}
</style>
