<template>
  <ApolloQuery :query="require('../gql/listTours.gql')" >
      <template slot-scope="{ result: { loading, error, data } }">
      <v-progress-circular v-if="loading" indeterminate />
      <div v-else-if="error" class="error">We had an error</div>
      <div v-else-if="data">
        <h2 class="text-center ma-6">Hello {{ user ? user.username : '' }}</h2>
        <!-- <v-img
          v-if="athlete"
          :src="athlete.profile"
          :alt="athlete.firstname + ' ' + athlete.lastname"
          :style="{borderRadius: 50 + '%'}"
        />-->
        <v-data-table
          :headers="headers"
          :items="data.listTours.items"
          :items-per-page="10"
          class="elevation-1 mx-md-6"
        >
          <template v-slot:top>
            <div class="flex-row d-flex justify-space-around" >
            <v-btn color="success" :to="{ name: 'edit', params: { mapId: 'new' }}" class="ma-2">
              <v-icon>add</v-icon>New Tour
            </v-btn>
            <auth-strava class="d-inline"/>
            </div>
          </template>
          <template v-slot:item.isPublic="{ item }">
            <v-icon>{{ item.isPublic ? 'visibility' : 'visibility_off' }}</v-icon>
          </template>
          <template v-slot:item.action="{ item }">
            <td class="justify-center layout px-0">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon class="mx-0" :to="{ name: 'map', params: { mapId: item.id }}" >
                    <v-icon color="blue">visibility</v-icon>
                  </v-btn>
                </template>
                <span>View</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon class="mx-0" :to="{ name: 'edit', params: { mapId: item.id }}" >
                    <v-icon color="teal">edit</v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon class="mx-0" @click="deleteTourApollo(item)" >
                    <v-icon color="pink">delete</v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </td>
          </template>
        </v-data-table>
      </div>
    </template>
  </ApolloQuery>
</template>

<script>
import { Auth } from "aws-amplify";
import { deleteTour } from '../graphql/mutations';
import AuthStrava from './AuthStrava'
import LIST_TOURS from '../gql/listTours.gql'
import DELETE_TOUR from '../gql/deleteTour.gql'

export default {
  components: {
    AuthStrava,
  },
  data() {
    return {
      headers: [
        {
          text: "Name",
          value: "name"
        },
        { text: "Start", value: "start_date" },
        { text: "End", value: "end_date" },
        { text: "Description", value: "description" },
        { text: "Public", value: "isPublic" },
        { text: "Actions", value: "action", align: "center" }
      ],
      user: null
    };
  },
  methods: {
    deletetour: async function(item) {
      if (confirm('are you sure you want to delete this Tour?')) {
        console.log(item)
        const deleted = await this.$Amplify.API.graphql(this.$Amplify.graphqlOperation(deleteTour, {input: {id: item.id }}))
        console.log('deleted Tour', deleted)
      }
    },
    deleteTourApollo: function(tour) {
      this.$apollo.mutate({
        mutation: DELETE_TOUR,
        variables: {input: {id: tour.id}},
        update: (store, { data: { deleteTour } }) => {
          const data = store.readQuery({ query: LIST_TOURS })
          data.listTours.items = data.listTours.items.filter(t => t.id !== deleteTour.id)
          store.writeQuery({ query: LIST_TOURS, data })
        },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteTour: {
            __typename: 'Tour',
            id: tour.id,
          }
        },
      })
    },
  },
  beforeCreate() {
    Auth.currentUserInfo().then(user => {
      this.user = user
      this.$store.commit('setUser', user)
    });
  }
};
</script>

<style>
</style>