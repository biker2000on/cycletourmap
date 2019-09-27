<template>
  <v-list>
    <v-list-item
      href="mailto:justin@crawfordcreations.org?subject=Tourmap Feedback&body=Message"
      target="_blank"
    >
      <v-list-item-icon>
        <v-icon>feedback</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Feedback</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item
      href="mailto:justin@crawfordcreations.org?subject=Tourmap Contact&body=Message"
      target="_blank"
    >
      <v-list-item-icon>
        <v-icon>contact_support</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Contact Me</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item @click="dialog3 = true" three-line>
      <v-list-item-icon>
        <v-icon>attach_money</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Help Support Me</v-list-item-title>
        <v-list-item-subtitle>This is a free app. Please help support development with a small donation.</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item @click="dialog2 = true">
      <v-list-item-icon>
        <v-icon>assignment</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Future Features</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item @click="dialog = true">
      <v-list-item-icon>
        <v-icon>visibility</v-icon>
      </v-list-item-icon>
      <v-list-item-title>Privacy Policy</v-list-item-title>
    </v-list-item>
    <v-dialog v-model="dialog" max-width="500">
      <privacy-policy @close="dialog = false" />
    </v-dialog>
    <v-dialog v-model="dialog2" max-width="500">
      <future-features @close="dialog2 = false" />
    </v-dialog>
    <v-dialog v-model="dialog3" max-width="500">
      <support-me @close="dialog3 = false" />
    </v-dialog>
  </v-list>
</template>

<script>
import PrivacyPolicy from "./PrivacyPolicy";
import FutureFeatures from './FutureFeatures'
import SupportMe from './SupportMe'

export default {
  components: {
    PrivacyPolicy,
    FutureFeatures,
    SupportMe
  },
  data() {
    return {
      dialog: false,
      dialog2: false,
      dialog3: false,
    };
  }
};
</script>

<style>
</style>