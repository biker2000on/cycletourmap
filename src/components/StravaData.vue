<template>
  <div>
    <v-progress-circular v-if="$apollo.loading" indeterminate></v-progress-circular>
    <strava
      v-if="isEdit && listAthletes"
      :tourData="getTour ? { getTour } : {}"
      :athlete="listAthletes ? listAthletes.items[0] : {}"
    />
    <view-nav v-else-if="getTour" :tourData="getTour" />
    <view-nav v-else-if="getTourPublic" :tourData="getTourPublic" />
  </div>
</template>

<script>
import Strava from "./Strava";
import ViewNav from "./ViewNav";
import GET_TOUR_AUTH from "../gql/getTourAuth.gql";
import LIST_AUTHS from "../gql/listAuths.gql";
import LIST_ATHLETE_AUTH from '../gql/listAthleteAuth.gql'

export default {
  components: {
    Strava,
    ViewNav
  },
  computed: {
    isEdit() {
      return this.$route.name == "edit";
    }
  },
  apollo: {
    listAthletes: {
      query: LIST_ATHLETE_AUTH,
      skip() {
        if (this.$store.state.signedIn == false) return true;
        return false;
      }
    },
    getTour: {
      query: GET_TOUR_AUTH,
      variables() {
        return { id: this.$route.params.mapId };
      },
      skip() {
        if (this.$route.params.mapId == "new") return true;
        if (this.$store.state.signedIn == false) return true;
        return false;
      }
    },
    getTourPublic: {
      query: GET_TOUR_AUTH,
      client: "apikey",
      update: data => data.getTour,
      variables() {
        return { id: this.$route.params.mapId };
      },
      skip() {
        if (this.$store.state.signedIn == true) return true;
        return false;
      }
    }
  }
};
</script>

<style>
</style>