<template>
  <v-list>
    <!-- <v-list-group
      prepend-icon="settings"
    >
      <template v-slot:activator>
        <v-list-item-title>Settings</v-list-item-title>
      </template>
      <v-list-item @click="">
        <v-list-item-title>Remove Strava Auth</v-list-item-title>
        <v-list-item-action>
          <v-icon>delete</v-icon>
        </v-list-item-action>
      </v-list-item>
      <v-list-item @click="">
        <v-list-item-title>Delete Account</v-list-item-title>
        <v-list-item-action>
          <v-icon>delete</v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list-group> -->
    <v-list-item href="mailto:justin@crawfordcreations.org?subject=Tourmap Feedback&body=Message" target="_blank">
      <v-list-item-icon>
        <v-icon>feedback</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
      <v-list-item-title>Feedback</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item href="mailto:justin@crawfordcreations.org?subject=Tourmap Contact&body=Message" target="_blank">
      <v-list-item-icon>
        <v-icon>contact_support</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
      <v-list-item-title>Contact Me</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item 
      href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RJU8Z3WTUDNJJ&source=url" 
      target="_blank"
      three-line>
      <v-list-item-icon>
        <v-icon>attach_money</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
      <v-list-item-title>Help Support Me</v-list-item-title>
      <v-list-item-subtitle>This is a free app. Please help support development with a small donation.</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item @click="dialog = true">
      <v-list-item-icon>
        <v-icon>visibility</v-icon>
      </v-list-item-icon>
      <v-list-item-title>Privacy Policy</v-list-item-title>
    </v-list-item>
    <v-dialog v-model="dialog" max-width="500">
      <privacy-policy @close="dialog = false"/>
    </v-dialog>
  </v-list>
</template>

<script>
import PrivacyPolicy from './PrivacyPolicy'

export default {
  components: {
    PrivacyPolicy,
  },
  data() {
    return {
      dialog: false,
    }
  }
}
</script>

<style>

</style>