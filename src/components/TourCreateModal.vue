<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500" persistent>
    <v-card>
      <v-card-title class="text-h5">
        Create New Tour
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
          {{ error }}
        </v-alert>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="name"
            label="Tour Name"
            :rules="[v => !!v || 'Tour name is required']"
            required
            class="mb-2"
          ></v-text-field>

          <v-row>
            <v-col cols="6">
              <v-menu
                v-model="startMenu"
                :close-on-content-click="false"
                transition="scale-transition"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="startDate"
                    label="Start Date"
                    prepend-icon="mdi-calendar"
                    v-bind="props"
                    readonly
                    :rules="[v => !!v || 'Start date is required']"
                    required
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="startDateObj"
                  @update:model-value="onStartDateSelect"
                  hide-header
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu
                v-model="endMenu"
                :close-on-content-click="false"
                transition="scale-transition"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="endDate"
                    label="End Date"
                    prepend-icon="mdi-calendar"
                    v-bind="props"
                    readonly
                    :rules="[v => !!v || 'End date is required']"
                    required
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="endDateObj"
                  @update:model-value="onEndDateSelect"
                  hide-header
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>

          <v-textarea
            v-model="description"
            label="Description"
            rows="3"
            class="mb-2"
          ></v-textarea>

          <v-switch
            v-model="isPublic"
            label="Make this tour public"
            color="primary"
            hide-details
          ></v-switch>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!valid"
          @click="create"
        >
          Create Tour
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { toursApi } from '../api/client'

export default {
  name: 'TourCreateModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'created'],
  data() {
    return {
      valid: false,
      loading: false,
      error: null,
      name: '',
      description: '',
      startDate: null,
      endDate: null,
      startDateObj: null,
      endDateObj: null,
      startMenu: false,
      endMenu: false,
      isPublic: false,
    }
  },
  computed: {
    token() {
      return this.$store.state.token
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return null
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    onStartDateSelect(date) {
      this.startDate = this.formatDate(date)
      this.startMenu = false
    },
    onEndDateSelect(date) {
      this.endDate = this.formatDate(date)
      this.endMenu = false
    },
    cancel() {
      this.reset()
      this.$emit('update:modelValue', false)
    },
    reset() {
      this.name = ''
      this.description = ''
      this.startDate = null
      this.endDate = null
      this.startDateObj = null
      this.endDateObj = null
      this.isPublic = false
      this.loading = false
      this.error = null
    },
    async create() {
      if (!this.valid) return

      this.loading = true
      try {
        const tourData = {
          name: this.name,
          description: this.description,
          startDate: this.startDate,
          endDate: this.endDate,
          isPublic: this.isPublic,
        }

        const newTour = await toursApi.create(tourData, this.token)

        this.$emit('created', {
          tour: newTour,
          startDate: this.startDate,
          endDate: this.endDate,
        })
        this.$emit('update:modelValue', false)
        this.reset()
      } catch (err) {
        console.error('Failed to create tour:', err)
        this.error = err.message || 'Failed to create tour. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
