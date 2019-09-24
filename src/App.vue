<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app id="nav-drawer" v-if="signedIn">
      <router-view name="drawer"></router-view>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="signedIn">
        <v-icon>menu</v-icon>
      </v-app-bar-nav-icon>
      <img src="/bikeLogo.svg" alt="Cycle Tourmap" height="45" class="mr-2">
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
      <router-view name="header" :signedIn="signedIn"></router-view>
      <v-btn :to="{name: 'auth'}" v-if="!signedIn" color="mediumseagreen" >Sign In</v-btn>
      <v-btn v-if="signedIn" color="mediumseagreen" >
        <amplify-sign-out class="amplify-sign-out"></amplify-sign-out>
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container fluid fill-height :class="isHome" >
        <v-layout align-center justify-center>
        <router-view :style="{ width: '100%' }" class="text-center" ></router-view>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2019</span>
      <v-spacer></v-spacer>
      <img src="/strava/api_logo_pwrdBy_strava_horiz_white.svg" height="30" >
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
      drawer: null,
      user: null,
      hydrated: false,
    };
  },
  methods: {
    getUser: async function() {
      try {
        let user = await Auth.currentAuthenticatedUser()
        console.log("User Info: ", user);
        this.$store.commit('setSignedIn', true)
        this.user = user;
      } catch (error) {
        this.$store.commit('setSignedIn', false)
      }
    }
  },
  computed: {
    isHome() {
      if (!this.signedIn) {
        return 'home'
      } else {
        return ''
      }
    },
    signedIn() {
      return this.$store.state.signedIn
    },
  },
  async beforeCreate() {
    AmplifyEventBus.$on("authState", async (info) => {
      if (info === "signedIn") {
        let user = await Auth.currentAuthenticatedUser()
        this.$apollo.provider.defaultClient.resetStore() // clears cache and refetches queries
        this.$store.commit('setSignedIn', true)
        this.user = user
        this.$router.push({
          name: "profile",
        });
      }
      if (info === "signedOut") {
        this.$router.push("/");
        this.user = null
        this.$store.commit('setSignedIn', false)
        this.$apollo.provider.defaultClient.resetStore() // clears cache and refetches queries
      }
    });

  },
  async mounted() {
    this.getUser()
    await this.$apollo.provider.defaultClient.hydrated()
    this.hydrated = true
  },
};
</script>

<style>
:root {
  --amazonOrange: mediumseagreen;
}

.container {
  padding: 0 !important;
}
.amplify-sign-out button {
  min-width: 100%;
  font-size: inherit;
  /* color: var(--amazonOrange); */
  background-color: inherit;
  padding: 0;
}
#nav-drawer {
  z-index: 10000;
}

.home {
  background-image: url(/tour.jpg);
  background-position: center center;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.3);
  background-blend-mode: saturation;
  width: 100%;
}
</style>
