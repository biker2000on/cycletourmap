<template>
  <div>
    <leaflet v-if="$route.params.mapId == 'new'" :activities="$store.state.activities" />
    <leaflet v-else-if="getTour" :activities="getTour.activities.items" />
    <leaflet v-else-if="getTourPublic" :activities="getTourPublic.activities.items" />
    <v-progress-circular v-else-if="$apollo.loading" indeterminate />
    <div v-else-if="error">{{ error }}</div>
  </div>
</template>

<script>
import Leaflet from "./Leaflet";
import { isNull, isNullOrUndefined } from "util";
import GET_TOUR_ACTIVITIES from "../gql/getTourActivities.gql";

export default {
  components: {
    Leaflet
  },
  data() {
    return {
      error: null,
      nextToken: null,
    }
  },
  methods: {
    loadMore: function() {
      // console.log("inside loadMore.");
      this.$apollo.queries.getTour.fetchMore({
        variables: {
          id: this.$route.params.mapId,
          nextToken: this.getTour.activities.nextToken, // need to update
        },
        updateQuery: ( prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || isNullOrUndefined(fetchMoreResult.getTour.activities.items)) {
            const newActivities = fetchMoreResult.getTour.activities.items
            // console.log('fetchmore didn"t return')
            return prev
          }
          // console.log("prev, fetchmoreresult", prev.getTour, fetchMoreResult.getTour)
          // console.log('tokens',prev.getTour.activities.nextToken, fetchMoreResult.getTour.activities.nextToken)
          this.nextToken = fetchMoreResult.getTour.activities.nextToken
          const returnVal = Object.assign({}, prev, {
            getTour: {
              __typename: 'Tour',
              id: prev.getTour.id,
              activities: {
                __typename: 'ModelActivityConnection',
                items: [...prev.getTour.activities.items, ...fetchMoreResult.getTour.activities.items],
                nextToken: fetchMoreResult.getTour.activities.nextToken
              }
            }
          })
          // console.log('returnVal ', returnVal)
          return returnVal
        }
      })
    }
  },
  computed: {
    signedIn() {
      return this.$store.state.signedIn
    },
  },
  watch: {
    getTour: async function() {
      if (!isNull(this.getTour.activities.nextToken)) {
        await this.loadMore()
        return
      }
      return
    }
  },
  apollo: {
    getTour: {
      query: GET_TOUR_ACTIVITIES,
      // client: 'cognito',
      variables() {
        return {
          id: this.$route.params.mapId
        };
      },
      skip() {
        return this.$route.params.mapId === 'new' || this.signedIn == false
      },
      error(error) {
        this.error = error
      },
    },
    getTourPublic: {
      query: GET_TOUR_ACTIVITIES,
      client: 'apikey',
      variables() {
        return {
          id: this.$route.params.mapId
        };
      },
      update: data => data.getTour,
      // skip() {
      //   return ( this.$route.params.mapId === 'new' || this.signedIn == true )
      // },
      error(error) {
        this.error = error
      },
    }
  }
};
</script>

<style>
</style>