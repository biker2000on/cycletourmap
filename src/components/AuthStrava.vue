<template>
  <ApolloQuery :query="require('../gql/listAuthsAthletes.gql')" ref="auth" @result="getTokens($event)">
    <template slot-scope="{ result: { loading, data, error }}">
      <div v-if="loading">Loading...</div>
      <div v-else-if="data">
        <a
          v-if="!data.listAuths.items.length"
          :href="'https://www.strava.com/oauth/authorize?client_id=28538' +
          '&redirect_uri=' + redirect_uri +
          '&response_type=' + 'code' +
          '&approval_prompt=' + 'auto' + // could be 'force'
          '&scope=' + 'read,profile:read_all,activity:read'"
        >
          <img src="/strava/btn_strava_connectwith_orange.svg" height="48" />
        </a>
      </div>
      <div v-else>{{ error }}</div>
    </template>
  </ApolloQuery>
</template>

<script>
import axios from "axios";
import uuidv4 from "uuid/v4";
import CREATE_AUTH from "../gql/createAuth.gql";
import UPDATE_AUTH from "../gql/updateAuth.gql";
import LIST_AUTHS from "../gql/listAuths.gql";
import LIST_ATHLETES from "../gql/listAthletes.gql";
import CREATE_ATHLETE from "../gql/createAthlete.gql";
import UPDATE_ATHLETE from "../gql/updateAthlete.gql";
import { isNull } from "util";
import pick from "lodash.pick";
import { athleteKeys } from "../utilities/athleteKeys";

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
      newAuthId: null
    };
  },
  methods: {
    createAuth: async function() {
      this.newAuthId = uuidv4();
      const input = {
        id: this.newAuthId,
        access_token: this.auth.access_token,
        expires_at: this.auth.expires_at,
        refresh_token: this.auth.refresh_token,
        token_type: this.auth.token_type,
        strava_scope: this.stravaScope
      };
      this.$apollo.mutate({
        mutation: CREATE_AUTH,
        variables: { input }
      });
      this.$store.commit("setHasStravaAuth", true);
    },
    updateAuth: async function() {
      const input = {
        id: this.$refs.auth.result.data.listAuths.items[0].id,
        access_token: this.auth.access_token,
        expires_at: this.auth.expires_at,
        refresh_token: this.auth.refresh_token,
        token_type: this.auth.token_type,
        strava_scope: this.stravaScope
      };
      this.$apollo.mutate({
        mutation: UPDATE_AUTH,
        variables: { input },
        update: (store, { data: { updateAuth } }) => {
          const data = store.readQuery({ query: LIST_AUTHS });
          let updatedIndex = data.listAuths.items.findIndex(
            c => c.id == updateAuth.id
          );
          data.listAuths.items[updatedIndex] = updateAuth;
          store.writeQuery({ query: LIST_AUTHS, data });
        },
        optimisticResponse: {
          __typename: "Mutation",
          updateAuth: {
            __typename: "Auth",
            ...input
          }
        }
      });
      this.$store.commit("setHasStravaAuth", true);
    },
    createAthlete(athlete) {
      const input = {
        ...athlete,
        id: uuidv4()
      };
      this.$apollo.mutate({
        mutation: CREATE_ATHLETE,
        variables: { input }
      });
    },
    updateAthlete(athlete) {
      const input = {
        ...athlete,
        id: this.$refs.auth.result.data.listAthletes.items[0].id,
      };
      this.$apollo.mutate({
        mutation: UPDATE_ATHLETE,
        variables: { input },
        update: (store, { data: { updateAthlete } }) => {
          const data = store.readQuery({ query: LIST_ATHLETES });
          let updatedIndex = data.listAthletes.items.findIndex(
            c => c.id == updateAthlete.id
          );
          data.listAthletes.items[updatedIndex] = updateAthlete;
          store.writeQuery({ query: LIST_ATHLETES, data });
        }
      });
    },
    getAthlete: async function() {
      try {
        const res2 = await axios.get("https://www.strava.com/api/v3/athlete", {
          headers: {
            Authorization: "Bearer " + this.auth.access_token
          }
        });
        this.athlete = res2.data;
        const pickedAthleteProps = pick(this.athlete, athleteKeys);
        pickedAthleteProps['strava_id'] = pickedAthleteProps.id
        pickedAthleteProps['athleteAuthId'] = this.newAuthId
          ? this.newAuthId
          : this.auth.id
          ? this.auth.id
          : null
        console.log('picked athlete', pickedAthleteProps)
        if (this.$refs.auth.result.data.listAthletes.items.length) {
          this.updateAthlete(pickedAthleteProps);
        } else {
          this.createAthlete(pickedAthleteProps);
        }
      } catch (error) {
        console.warn("not able to retrieve athlete data", error);
      }
    },
    refreshAuth: async function() {
      const data = {
        client_id: process.env.VUE_APP_STRAVA_CLIENTID,
        client_secret: process.env.VUE_APP_STRAVA_CLIENT_SECRET,
        refresh_token: this.auth.refresh_token,
        grant_type: "refresh_token"
      };
      let res = await axios.post("https://www.strava.com/oauth/token", data);
      let { athlete, expires_in, ...auth } = res.data;
      auth["id"] = this.auth.id;
      this.$apollo.mutate({
        mutation: UPDATE_AUTH,
        variables: { input: auth },
        update: (store, { data: { updateAuth } }) => {
          const data = store.readQuery({ query: LIST_AUTHS });
          data.listAuths.items = [updateAuth];
          store.writeQuery({ query: LIST_AUTHS, data });
        },
        optimisticResponse: {
          __typename: "Mutation",
          updateAuth: {
            __typename: "Auth",
            ...auth
          }
        }
      });
      // console.log('successful submission of new auth', auths)
      this.auth = auth;
      return auth;
    },
    getTokens: async function(result) {
      let data;
      const results = result.data;
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
      if (!data) {
        this.$store.commit("setHasStravaAuth", true);
        this.auth = results.listAuths.items.length
          ? results.listAuths.items[0]
          : null;
        if (
          !isNull(this.auth) &&
          new Date(this.auth.expires_at * 1000 - 1800 * 1000) < new Date()
        )
          await this.refreshAuth();
        this.athlete = results.listAthletes.items.length
          ? results.listAthletes.items[0]
          : null;
        if (isNull(this.athlete)) this.getAthlete();
        return;
      }
      let res = await axios.post("https://www.strava.com/oauth/token", data);
      let { athlete, ...auth } = res.data;
      this.auth = auth;
      results.listAuths.items.length ? this.updateAuth() : this.createAuth();
      this.athlete = athlete;
      this.getAthlete();
    }
  }
};
</script>
