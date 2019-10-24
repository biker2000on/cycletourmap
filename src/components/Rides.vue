<template>
  <div>
    <v-data-table
      :items="tableData2"
      :headers="columns"
      :items-per-page="10"
      light
      class="elevation-2 mx-md-6 mt-2"
    >
      <template v-slot:item.action="{ item }">
        <td class="justify-center layout px-0">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <!-- <v-btn icon class="mx-0" @click="deleteTourApollo(item)" > -->
              <v-btn icon class="mx-0" @click.stop="openDialog(item)">
                <v-icon color="pink">delete</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline text-wrap">Delete Activity?</v-card-title>
        <v-card-text>Are you sure you want to delete {{ activeItem ? activeItem.name : '' }} from your tourmap? It will only delete it from this tourmap not from Strava.</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="dialog = false">Cancel</v-btn>
          <v-btn text color="error" @click="deleteActivityApollo(activeItem)">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import DELETE_ACTIVITY from "../gql/deleteActivity.gql";
import GET_TOUR_ACTIVITIES from "../gql/getTourActivities.gql";

export default {
  props: {
    activities: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialog: false,
      activeItem: null
    };
  },
  methods: {
    openDialog(item) {
      this.dialog = true;
      this.activeItem = item;
    },
    deleteActivityApollo(item) {
      console.log(item);
      this.$apollo.mutate({
        mutation: DELETE_ACTIVITY,
        variables: { input: { id: item.id } },
        update: async (store, { data: { deleteActivity } }) => {
          console.log("inside update", deleteActivity);
          const mapId = this.$route.params.mapId
          console.log('mapId', mapId)
          try {
            const data = await store.readQuery({
              query: GET_TOUR_ACTIVITIES,
              variables: { id: mapId }
            });
            console.log(data);
            let newData = {...data}
            newData.getTour.activities.items = newData.getTour.activities.items.filter(
              t => t.id !== deleteActivity.id
            );
            console.log("updated Data", newData);
            store.writeQuery({
              query: GET_TOUR_ACTIVITIES,
              data: {getTour: {}},
              variables: { id: mapId },
            })
            store.writeQuery({
              query: GET_TOUR_ACTIVITIES,
              data: newData,
              variables: { id: mapId },
            });
            console.log('read query', store.readQuery({query: GET_TOUR_ACTIVITIES, variables: { id: mapId }}))
          } catch (error) {
            console.warn('error', error)
          }
        },
        optimisticResponse: {
          __typename: "Mutation",
          deleteActivity: {
            __typename: "Activity",
            id: item.id
          }
        }
      });
      this.dialog = false;
    }
  },
  computed: {
    isEdit() {
      return this.$route.name.includes("edit");
    },
    isMetric() {
      return this.$store.state.isMetric;
    },
    tableData2() {
      return this.activities.map(c => {
        return {
          id: c.id,
          date: c.start_date_local.slice(0, 10),
          time: c.start_date_local.slice(11, 16),
          name: c.name,
          distance: this.isMetric
            ? (c.distance / 1000).toFixed(2)
            : (c.distance / 0.0254 / 12 / 5280).toFixed(2),
          moving_time: (c.moving_time / 3600).toFixed(2),
          elapsed_time: (c.elapsed_time / 3600).toFixed(2),
          total_elevation_gain: this.isMetric
            ? c.total_elevation_gain
            : (c.total_elevation_gain / 0.0254 / 12).toFixed(),
          average_speed: this.isMetric
            ? (c.average_speed * 3.6).toFixed(1)
            : (c.average_speed * 2.23694).toFixed(1)
        };
      });
    },
    columns() {
      let cols = [
        {
          text: "Date",
          value: "date"
        },
        {
          text: "Start Time",
          value: "time"
        },
        {
          text: "Name",
          value: "name"
        },
        {
          text: this.isMetric ? "Distance (km)" : "Distance (mi)",
          value: "distance"
        },
        {
          text: "Moving Time (hrs)",
          value: "moving_time"
        },
        {
          text: "Elapsed Time (hrs)",
          value: "elapsed_time"
        },
        {
          text: this.isMetric ? "Climbed (m)" : "Climbed (ft)",
          value: "total_elevation_gain"
        },
        {
          text: this.isMetric ? "Avg Spd (kph)" : "Avg Spd (mph)",
          value: "average_speed"
        }
      ];
      if (this.isEdit) {
        cols.push({
          text: "Actions",
          value: "action"
        });
      }
      return cols;
    }
  }
};
</script>


