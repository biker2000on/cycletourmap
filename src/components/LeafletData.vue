<template>
  <div>
    <leaflet v-if="$route.params.mapId == 'new'" :activities="$store.state.activities" />
    <leaflet v-else-if="getTour" :activities="getTour.activities.items" />
    <leaflet v-else-if="getTourPublic" :activities="getTourPublic.activities.items" />
    <v-layout v-else-if="$apollo.loading" justify-center align-center fill-height>
      <v-progress-circular color="primary" indeterminate />
    </v-layout>
    <div v-else-if="error">{{ error }}</div>
  </div>
</template>

<script>
import Leaflet from "./Leaflet";
import GET_TOUR_ACTIVITIES from "../gql/getTourActivities.gql";

export default {
  components: {
    Leaflet
  },
  data() {
    return {
      error: null,
      nextToken: null
    };
  },
  methods: {
    loadMore: function() {
      if (this.getTour) {
        this.$apollo.queries.getTour.fetchMore({
          variables: {
            id: this.$route.params.mapId,
            nextToken: this.getTour.activities.nextToken // need to update
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (
              !fetchMoreResult ||
              isNullOrUndefined(fetchMoreResult.getTour.activities.items)
            ) {
              // const newActivities = fetchMoreResult.getTour.activities.items
              // console.log('fetchmore didn"t return')
              return prev;
            }
            // console.log("prev, fetchmoreresult", prev.getTour, fetchMoreResult.getTour)
            // console.log('tokens',prev.getTour.activities.nextToken, fetchMoreResult.getTour.activities.nextToken)
            this.nextToken = fetchMoreResult.getTour.activities.nextToken;
            const { activities, ...rest } = prev.getTour;
            // const returnVal = Object.assign({}, prev, {
            //   getTour: {
            //     __typename: 'Tour',
            //     id: prev.getTour.id,
            //     isPublic: prev.getTour.isPublic,
            //     activities: {
            //       __typename: 'ModelActivityConnection',
            //       items: [...prev.getTour.activities.items, ...fetchMoreResult.getTour.activities.items],
            //       nextToken: fetchMoreResult.getTour.activities.nextToken
            //     }
            //   }
            // })
            const returnVal = {
              getTour: {
                ...rest,
                activities: {
                  __typename: "ModelActivityConnection",
                  items: [
                    ...prev.getTour.activities.items,
                    ...fetchMoreResult.getTour.activities.items
                  ],
                  nextToken: fetchMoreResult.getTour.activities.nextToken
                }
              }
            };
            // console.log('returnVal ', returnVal)
            return returnVal;
          }
        });
      } else {
        this.$apollo.queries.getTourPublic.fetchMore({
          variables: {
            id: this.$route.params.mapId,
            nextToken: this.getTourPublic.activities.nextToken // need to update
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            // console.log('fetchmore', fetchMoreResult, prev)
            if (
              !fetchMoreResult ||
              isNullOrUndefined(fetchMoreResult.getTour.activities.items)
            ) {
              // const newActivities = fetchMoreResult.getTour.activities.items
              // console.log('fetchmore didn"t return')
              return prev;
            }
            // console.log("prev, fetchmoreresult", prev.getTour, fetchMoreResult.getTour)
            // console.log('tokens',prev.getTour.activities.nextToken, fetchMoreResult.getTour.activities.nextToken)
            this.nextToken = fetchMoreResult.getTour.activities.nextToken;
            // const returnVal = Object.assign({}, prev, {
            //   getTour: {
            //     __typename: 'Tour',
            //     id: prev.getTour.id,
            //     isPublic: prev.getTour.isPublic,
            //     activities: {
            //       __typename: 'ModelActivityConnection',
            //       items: [...prev.getTour.activities.items, ...fetchMoreResult.getTour.activities.items],
            //       nextToken: fetchMoreResult.getTour.activities.nextToken
            //     }
            //   }
            // })
            const { activities, ...rest } = prev.getTour;
            const returnVal = {
              getTour: {
                ...rest,
                activities: {
                  __typename: "ModelActivityConnection",
                  items: [
                    ...prev.getTour.activities.items,
                    ...fetchMoreResult.getTour.activities.items
                  ],
                  nextToken: fetchMoreResult.getTour.activities.nextToken
                }
              }
            };
            // console.log('returnVal ', returnVal)
            return returnVal;
          }
        });
      }
    }
  },
  computed: {
    signedIn() {
      return this.$store.state.signedIn;
    }
  },
  watch: {
    getTour: async function() {
      if (!(this.getTour === null || this.getTour === undefined)) {
        if (!(this.getTour.activities.nextToken === null || this.getTour.activities.nextToken === undefined)) {
          await this.loadMore();
          return;
        }
      }
      return;
    },
    getTourPublic: async function() {
      if (!(this.getTourPublic === null || this.getTourPublic === undefined)) {
        if (!(this.getTourPublic.activities.nextToken === null || this.getTourPublic.activities.nextToken === undefined)) {
          await this.loadMore();
          return;
        }
      }
      return;
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
        return this.$route.params.mapId === "new" || this.signedIn == false;
      },
      error(error) {
        this.error = error;
      }
    },
    getTourPublic: {
      query: GET_TOUR_ACTIVITIES,
      client: "apikey",
      variables() {
        return {
          id: this.$route.params.mapId
        };
      },
      update: data => data.getTour,
      skip() {
        return this.$route.params.mapId === "new" || this.signedIn == true;
      },
      error(error) {
        this.error = error;
      }
    }
  }
};
</script>

<style>
</style>