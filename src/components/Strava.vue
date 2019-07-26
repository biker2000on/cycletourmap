<template>
  <div id="strava">
    <h3>Strava Info Test</h3>
    <v-btn @click="getStrava">Fetch Strava</v-btn>
    <v-btn @click="getAllActivities">Fetch All Activities</v-btn>
    <a
      :href="'https://www.strava.com/oauth/authorize?client_id=28538' +
              '&redirect_uri=' + redirect_uri +
              '&response_type=' + 'code' +
              '&approval_prompt=' + 'auto' + // could be 'force'
              '&scope=' + 'read,profile:read_all,activity:read'"
    >Authorize App</a>
    <div>
      <label for="data.start">Start Date:  </label>
      <input type="date" value="start" @input="$emit('update:start',$event.target.value)" />
      <label for="data.end">End Date:  </label>
      <input type="date" value="end" @input="$emit('update:end',$event.target.value)" />
    </div>
    <div>
      <br />
      We returned {{ this.activities.length }} activities.
      <br />
    </div>
    <v-img v-if="athlete" :src="athlete.profile" :alt="athlete.firstname + ' ' + athlete.lastname" :style="{borderRadius: 50 + '%'}" />
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import { URLSearchParams } from 'url';

export default {
  props: {
    activities: {
      type: Array,
      required: true,
      default: () => []
    },
    start: {
      type: String,
      required: false,
    },
    end: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      athlete: null,
      strava: "",
      auth_code: '',
      stravaScope: '',
      access_token: "",
      refresh_token: "", // only used to get new access_tokens
      redirect_uri: "http://localhost:8080",
      client_id: process.env.VUE_APP_STRAVA_CLIENTID,
      client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
      expires_at: null,
    };
  },
  methods: {
    getStrava: function() {
      axios
        .get(
          "https://www.strava.com/api/v3/athletes/7594?access_token=641c02aede2bd589ccf83096c9ea706c2fd3a1ec"
        )
        .then(response => {
          self.strava = response.data;
          this.$store.commit("setAthlete", response.data);
          // console.log(response.data)
        })
        .catch(err => {
          console.log(err);
        });
    },
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
          this.access_token +
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
    getTokens: async function() {
      const params = new window.URLSearchParams(window.location.search)
      if (params.has('error')) {
        console.error("You didn't give us the right permissions")
      }
      this.auth_code = params.get('code')
      this.stravaScope = params.get('scope').split(',')
      const data = {
        client_id: process.env.VUE_APP_STRAVA_CLIENTID,
        client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
        code: this.auth_code,
        grant_type: 'authorization_code'
      }
      let res = await axios.post('https://www.strava.com/oauth/token', data)
      this.refresh_token = res.data.refresh_token
      this.access_token = res.data.access_token
      this.athlete = res.data.athlete
      this.expires_at = res.data.expires_at
      console.log("Strava refresh token response: ", res)
    },
  },
  mounted() {
    this.getTokens()
  }
};
</script>

<style scoped>
#strava {
  text-align: center;
  padding: 5px !important;
}
</style>
