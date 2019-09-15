<template>
  <amplify-connect :query="getTour" >
    <template slot-scope="{loading, data, errors}" >
      <v-progress-circular v-if="loading" indeterminate ></v-progress-circular>
      <div v-else-if="data">
        <strava v-if="isEdit" :tourData="data" />
        <view-nav v-else :tourData="data.getTour" />
      </div>
      <div v-else-if="errors.length"></div>
    </template>
  </amplify-connect>
</template>

<script>
import Strava from './Strava'
import ViewNav from './ViewNav'

const GetTour = `query GetTourActivities ($id: ID!) {
  __typename
  getTour(id: $id) {
    activities (limit: 10) {
      items {
        id
        elapsed_time
        moving_time
        name
        start_date_local
        summary_polyline
        type
        strava_id
      }
      nextToken
    }
    description
    end_date
    id
    isPublic
    name
    start_date
  }
  listAuths {
    items {
      id
      token_type
      strava_scope
      refresh_token
      expires_at
      access_token
    }
  }
}
`

const GetAuth = `query getAuth {
  listAuths {
    items {
      id
      token_type
      strava_scope
      refresh_token
      expires_at
      access_token
    }
  }
}
`

export default {
  components: {
    Strava, ViewNav
  },
  computed: {
    getTour() {
      if (this.$route.params.mapId == 'new') {
        return this.$Amplify.graphqlOperation(GetAuth)
      }
      return this.$Amplify.graphqlOperation(GetTour, {id: this.$route.params.mapId})
    },
    isEdit() {
      return this.$route.name == 'edit'
    }
  }
}
</script>

<style>

</style>