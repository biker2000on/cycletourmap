<template></template>

<script>
import L from "leaflet";
import "leaflet.fullscreen";
export default {
  name: "LFullscreen",
  props: {
    options: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      defaultOptions: {
        position: "topleft", // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
        title: null, //"Show me the fullscreen !", // change the title of the button, default Full Screen
        titleCancel: "Exit Full Screen", // change the title of the button when fullscreen is on, default Exit Full Screen
        content: null, // change the content of the button, can be HTML, default null
        forceSeparateButton: false, // force seperate button to detach from zoom buttons, default false
        forcePseudoFullscreen: false, // force use of pseudo full screen even if full screen API is available, default false
        fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
      }
    };
  },
  watch: {
    options() {
      this.updateLayer();
    }
  },
  mounted() {
    this.mapObject = L.control.fullscreen({
      ...this.defaultOptions,
      ...this.options
    });
    L.DomEvent.on(this.mapObject, this.$listeners);
    if (this.$parent._isMounted) {
      this.deferredMountedTo(this.$parent.mapObject);
    }
    this.$on('keyup.esc', function() {
      const map = this.$parent.mapObject
      if (map.isFullscreen()) {
        map.toggleFullscreen()
      }
    })
  },
  beforeDestroy() {
    this.removeLayer();
    this.$off('keyup.esc')
  },
  methods: {
    deferredMountedTo(parent) {
      const vm = this;
      this.mapObject.addTo(parent);
      parent.on("enterFullscreen", function() {
        vm.$emit('enter-fullscreen')
        vm.$on('keyup.esc', function() {
          parent.toggleFullscreen()
        })
      });

      parent.on("exitFullscreen", function() {
        vm.$emit('exit-fullscreen')
        vm.$off('keyup.esc')
      });
    },
    removeLayer() {
      this.$parent.mapObject.removeLayer(this.mapObject);
    },
    updateLayer() {
      this.removeLayer();
      this.mapObject = L.control.fullscreen({
        ...this.defaultOptions,
        ...this.options
      });
      this.deferredMountedTo(this.$parent.mapObject);
    }
  }
};
</script>

<style lang="scss">
@import "../../node_modules/leaflet.fullscreen/Control.FullScreen.css";
</style>
