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
        titleCancel: "Exit fullscreen mode", // change the title of the button when fullscreen is on, default Exit Full Screen
        content: null, // change the content of the button, can be HTML, default null
        forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
        forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
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
    if (this.options) {
    }
    L.DomEvent.on(this.mapObject, this.$listeners);
    if (this.$parent._isMounted) {
      this.deferredMountedTo(this.$parent.mapObject);
    }
  },
  beforeDestroy() {
    this.removeLayer();
  },
  methods: {
    deferredMountedTo(parent) {
      const vm = this;
      this.mapObject.addTo(parent);
      parent.on("enterFullscreen", function() {
        vm.$emit('enter-fullscreen')
      });

      parent.on("exitFullscreen", function() {
        vm.$emit('exit-fullscreen')
      });
    },
    // setAttribution(val, old) {
    //   this.attributionControl.removeAttribution(old);
    //   this.attributionControl.addAttribution(val);
    // },
    // setToken(val) {
    //   this.options.token = val;
    // },
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
