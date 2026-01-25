<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <v-icon size="200" color="grey">mdi-hand-back-right</v-icon>
        <p class="text-h5 my-4">You seem to have routed to a non-existent page.</p>
        <v-btn color="primary" size="x-large" to="/" elevation="8">Go Home</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
