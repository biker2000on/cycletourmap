<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app class="navigation">
      <router-view name="drawer"></router-view>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-icon>menu</v-icon>
      </v-app-bar-nav-icon>
      <v-toolbar-title>Cycle Tourmap</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon :to="{name: 'profile'}" v-on="on">
            <v-icon>home</v-icon>
          </v-btn>
        </template>
        <span>Home</span>
      </v-tooltip>
      <router-view name="header" ></router-view>
      <v-btn :to="{name: 'auth'}" v-if="!signedIn">Sign In</v-btn>
      <v-btn v-if="signedIn">
        <amplify-sign-out class="amplify-sign-out"></amplify-sign-out>
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
        <router-view></router-view>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2019</span>
    </v-footer>
  </v-app>
</template>


<script>
import store from "./store/index";
import Strava from "./components/Strava";
import { AmplifyEventBus } from "aws-amplify-vue";
import { Auth } from "aws-amplify";

export default {
  name: "app",
  store,
  components: {
    Strava // Leaflet, Summary, Rides,
  },
  data() {
    return {
      markersOn: true,
      polylinesOn: true,
      isMetric: false,
      drawer: null,
      signedIn: false,
      user: null
    };
  },
  beforeCreate() {
    AmplifyEventBus.$on("authState", info => {
      if (info === "signedIn") {
        this.signedIn = true;
        this.$router.push({
          name: "profile",
          params: { username: user.username }
        });
      }
      if (info === "signedOut") {
        this.$router.push("/auth");
        this.signedIn = false;
      }
    });

    Auth.currentAuthenticatedUser()
      .then(user => {
        console.log("User Info: ", user);
        this.signedIn = true;
        this.user = user;
      })
      .catch(() => (this.signedIn = false));
  }
};
</script>

<style>
.container {
  padding: 0 !important;
}
.amplify-sign-out button {
  min-width: 100%;
  font-size: inherit;
  color: inherit;
  background-color: inherit;
  padding: 0;
}
.navigation {
  z-index: 9999;
}
</style>
