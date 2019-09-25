<template>
  <div>
    <v-tooltip bottom v-if="$route.name != 'map' && $route.params.mapId != 'new'">
      <template v-slot:activator="{ on }">
        <v-btn icon :to="{name: 'map'}" v-on="on">
          <v-icon>map</v-icon>
        </v-btn>
      </template>
      <span>Map</span>
    </v-tooltip>
    <v-tooltip bottom v-if="$route.name == 'map' && signedIn">
      <template v-slot:activator="{ on }">
        <v-btn icon :to="{name: 'edit'}" v-on="on">
          <v-icon>edit</v-icon>
        </v-btn>
      </template>
      <span>Edit</span>
    </v-tooltip>
    <!-- <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn icon :to="{name: 'rides'}" v-on="on">
          <v-icon>table_chart</v-icon>
        </v-btn>
      </template>
      <span>Rides Table</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn icon :to="{name: 'summary'}" v-on="on">
          <v-icon>notes</v-icon>
        </v-btn>
      </template>
      <span>Summary Stats</span>
    </v-tooltip> -->
  </div>
</template>

<script>
export default {
  props: {
    signedIn: {
      type: Boolean,
      default: false,
    }
  }
};
</script>

<style>
</style>