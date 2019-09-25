<template>
  <ApolloQuery :query="require('../gql/listAuthsAthletes.gql')" ref="auth" @result="getTokens()">
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
        ><img src="/strava/btn_strava_connectwith_orange.svg" height="48" ></a>
      </div>
      <div v-else>{{ error }}</div>
    </template>
  </ApolloQuery>
</template>

<script>
import axios from "axios";
import uuidv4 from 'uuid/v4'
import CREATE_AUTH from '../gql/createAuth.gql'
import UPDATE_AUTH from '../gql/updateAuth.gql'
import LIST_AUTHS from '../gql/listAuths.gql'

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
        id: uuidv4(),
        access_token: this.auth.access_token,
        expires_at: this.auth.expires_at,
        refresh_token: this.auth.refresh_token,
        token_type: this.auth.token_type,
        strava_scope: this.stravaScope
      };
      this.$apollo.mutate({
        mutation: CREATE_AUTH,
        variables: { input },
        // update: (store, { data: { createAuth }}) => {
        //   const data = store.readQuery({ query: LIST_AUTHS })
        //   data.listAuths.items.push(createAuth)
        //   store.writeQuery({ query: LIST_AUTHS, data })
        // },
        // optimisticResponse: {
        //   __typename: 'Mutation',
        //   createAuth: {
        //     __typename: 'Auth',
        //     ...input
        //   }
        // }
      })
      this.$store.commit('setHasStravaAuth', true)
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
        update: (store, { data: { updateAuth }}) => {
          const data = store.readQuery({ query: LIST_AUTHS })
          let updatedIndex = data.listAuths.items.findIndex(c => c.id == updateAuth.id )
          data.listAuths.items[updatedIndex] = updateAuth
          store.writeQuery({ query: LIST_AUTHS, data })
        },
        optimisticResponse: {
          __typename: 'Mutation',
          createAuth: {
            __typename: 'Auth',
            ...input
          }
        }
      })
      this.$store.commit('setHasStravaAuth', true)
    },
    getTokens: async function() {
      let data;
      // Check here and set for refresh of access token
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
      if (!data) {
        this.$store.commit('setHasStravaAuth',true)
        return
      }
      let res = await axios.post("https://www.strava.com/oauth/token", data);
      let { athlete, ...auth } = res.data;
      this.auth = auth;

      this.$refs.auth.result.data.listAuths.items.length ? this.updateAuth() : this.createAuth()
      
      if (!this.athlete && !athlete) {
        // send request to get athlete object
        const res2 = await axios.get("https://www.strava.com/api/v3/athlete", {
          headers: {
            Authorization: "Bearer " + this.auth.access_token
          }
        });
        athlete = res2.data;
      }
      this.athlete = athlete;
    }
  },
};
</script>

<style>
</style>