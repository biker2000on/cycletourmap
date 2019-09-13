<template>
  <amplify-connect
    :query="ListAuths"
  >
    <template slot-scope="{loading, data, errors}">
      <v-btn
        v-if="!data.listAuths.items.length"
        :href="'https://www.strava.com/oauth/authorize?client_id=28538' +
    '&redirect_uri=' + redirect_uri +
    '&response_type=' + 'code' +
    '&approval_prompt=' + 'auto' + // could be 'force'
    '&scope=' + 'read,profile:read_all,activity:read'"
      >Authorize Strava</v-btn>
    </template>
  </amplify-connect>
</template>

<script>
import axios from "axios";
import { listAuths } from '../graphql/queries'
import { createAuth, updateAuth } from '../graphql/mutations'

export default {
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
    createAuth: async function() {
      const input = {
        access_token: this.auth.access_token,
        expires_at: this.auth.expires_at,
        refresh_token: this.auth.refresh_token,
        token_type: this.auth.token_type,
        strava_scope: this.stravaScope,
      }
      const newAuth = await this.$Amplify.API.graphql(this.$Amplify.graphqlOperation(createAuth, {input}))
    },
    updateAuth: async function() {
      const input = {
        access_token: this.auth.access_token,
        expires_at: this.auth.expires_at,
        refresh_token: this.auth.refresh_token,
        token_type: this.auth.token_type,
        strava_scope: this.stravaScope,
      }
      const updatedAuth = await this.$Amplify.API.graphql(this.$Amplify.graphqlOperation(updateAuth, {input}))
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
      // if (this.$cookies.isKey("auth")) {
      //   let now = new Date();
      //   this.auth = this.$cookies.get("auth");
      //   this.athlete = this.$cookies.get("athlete");
      //   // console.log("inside cookie check");
      //   if (this.auth.expires_at > now.getTime() / 1000 + 3600) return;
      //   data = {
      //     client_id: process.env.VUE_APP_STRAVA_CLIENTID,
      //     client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
      //     refresh_token: this.auth.refresh_token,
      //     grant_type: "refresh_token"
      //   };
      // }
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
      this.createAuth()
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
      // this.$cookies.set("auth", auth, "30d").set("athlete", athlete, "30d");
      if (this.refresh == null) {
        this.refreshToken();
      }

      // console.log("Strava refresh token response: ", res.data);
      // console.log("From cookie: ", this.$cookies.get("auth"));
    }
  },
  computed: {
    ListAuths() {
      return this.$Amplify.graphqlOperation(listAuths)
    }
  },
  mounted() {
    this.getTokens();
  }
};
</script>

<style>
</style>