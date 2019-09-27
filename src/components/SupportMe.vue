<template>
  <v-card>
    <v-card-title class="headline">Support Me</v-card-title>
    <v-divider></v-divider>
    <v-card-text class="mt-4">
      <p>
        This is a free app and will always remain free. It is developed by me alone.
        Please consider helping to support future development efforts with a small donation if you like the app.
      </p>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="success"
        href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RJU8Z3WTUDNJJ&source=url"
        target="_blank"
      >Donate</v-btn>
      <v-btn color="primary" @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {};
</script>

<style>
</style>