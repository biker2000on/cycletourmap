<template>
<div>

  <v-progress-circular v-if="$apollo.loading" indeterminate ></v-progress-circular>
  <!-- <div v-else-if="getTour"> -->
    <strava v-if="isEdit" :tourData="getTour ? { getTour } : {}" :authProp="listAuths.items" />
    <view-nav v-else-if="getTour" :tourData="getTour" />
    <view-nav v-else-if="getTourPublic" :tourData="getTourPublic" />
  <!-- </div> -->
  <!-- <div v-else-if="error"></div> -->
</div>
  <!-- <ApolloQuery 
    :query="query"
    :variables="{ id: $route.params.mapId }">
    <template slot-scope="{ result: { loading, data, error }}" >
    </template>
  </ApolloQuery> -->
</template>

<script>
import Strava from './Strava'
import ViewNav from './ViewNav'
import GET_TOUR_AUTH from '../gql/getTourAuth.gql'
import LIST_AUTHS from '../gql/listAuths.gql'

export default {
  components: {
    Strava, ViewNav
  },
  computed: {
    query() {
      if (this.$route.params.mapId == 'new') {
        return LIST_AUTHS
      } else {
        return GET_TOUR_AUTH
      }
    },
    isEdit() {
      return this.$route.name == 'edit'
    }
  },
  apollo: {
    listAuths: {
      query: LIST_AUTHS,
      skip() {
        if (this.$store.state.signedIn == false) return true
        return false
      }
    },
    getTour: {
      query: GET_TOUR_AUTH,
      variables() {
        return { id: this.$route.params.mapId }
      }, 
      skip() {
        if (this.$route.params.mapId == 'new') return true
        if (this.$store.state.signedIn == false) return true
        return false
      }
    },
    getTourPublic: {
      query: GET_TOUR_AUTH,
      client: 'apikey',
      update: data => data.getTour,
      variables() {
        return { id: this.$route.params.mapId }
      }, 
      skip() {
        if (this.$store.state.signedIn == true) return true
        return false
      }
    }
  }
}
</script>

<style>

</style>