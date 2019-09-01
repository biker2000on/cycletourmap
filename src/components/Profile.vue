<template>
  <amplify-connect :query="tours">
    <template slot-scope="{loading, data, errors}">
      <v-progress-circular v-if="loading" indeterminate />
      <div v-else-if="errors.length > 0"></div>
      <div v-else-if="data">
        <!-- <v-img
          v-if="athlete"
          :src="athlete.profile"
          :alt="athlete.firstname + ' ' + athlete.lastname"
          :style="{borderRadius: 50 + '%'}"
        /> -->
        <v-data-table
          :headers="headers"
          :items="data.items"
          :items-per-page="8"
          class="elevation-1"
        ></v-data-table>
      </div>
    </template>
  </amplify-connect>
</template>

<script>
import { listTours } from '../graphql/queries'
import { Auth } from "aws-amplify";

export default {
  data() {
    return {
      headers: [
        {
          text: 'Name',
          value: 'name',  
        },
        { text: 'Start', value: 'start_date' },
        { text: 'End', value: 'end_date' },
        { text: 'Description', value: 'description' },
      ],
      user: null,
    }
  },
  computed: {
    tours() {
      return this.$Amplify.graphqlOperation(listTours)
    },
  },
  beforeCreate() {
    Auth.currentUserInfo()
      .then(user => this.user = user)
  }
}
</script>

<style>

</style>