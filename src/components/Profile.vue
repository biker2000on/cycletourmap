<template>
  <amplify-connect :query="tours">
    <template slot-scope="{loading, data, errors}">
      <v-progress-circular v-if="loading" indeterminate />
      <div v-else-if="errors.length > 0"></div>
      <div v-else-if="data">
        <h2>Hello {{ user ? user.username : '' }}</h2>
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
          class="elevation-1"
        >
          <template v-slot:top>
            <v-btn color="success" :to="{ name: 'edit', params: { mapId: 'new' }}" >
              <v-icon>add</v-icon>New Tour
            </v-btn>
          </template>
          <template v-slot:item.action="{ item }">
            <td class="justify-center layout px-0">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon class="mx-0" :to="{ name: 'map', params: { mapId: item.id }}" @click="test(item)" >
                    <v-icon color="blue">visibility</v-icon>
                  </v-btn>
                </template>
                <span>View</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon class="mx-0" :to="{ name: 'edit', params: { mapId: item.id }}" @click>
                    <v-icon color="teal">edit</v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon class="mx-0" @click="alert('should we delete ' + item.name)">
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
  </amplify-connect>
</template>

<script>
import { listTours } from "../graphql/queries";
import { Auth } from "aws-amplify";

export default {
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
        { text: "Actions", value: "action", align: "center" }
      ],
      user: null
    };
  },
  methods: {
    test(e) {
      window.console.log(e)
    },
  },
  computed: {
    tours() {
      return this.$Amplify.graphqlOperation(listTours);
    }
  },
  beforeCreate() {
    Auth.currentUserInfo().then(user => (this.user = user));
  }
};
</script>

<style>
</style>