<template>
  <ApolloQuery 
    :query="query"
    :variables="{ id: $route.params.mapId }">
    <template slot-scope="{ result: { loading, data, error }}" >
      <v-progress-circular v-if="loading" indeterminate ></v-progress-circular>
      <div v-else-if="data">
        <strava v-if="isEdit" :tourData="data" />
        <view-nav v-else-if="data.getTour" :tourData="data.getTour" />
      </div>
      <div v-else-if="error"></div>
    </template>
  </ApolloQuery>
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
  }
}
</script>

<style>

</style>