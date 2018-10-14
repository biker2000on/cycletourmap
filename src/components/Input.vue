<template>
    <div>
        <input v-model="textytext" placeholder="Empty">
        <h3>My entry: {{textytext}}</h3>
        <p>{{ test }}</p>
        <!-- <p>{{ textytext }}</p> -->
    </div>
</template>

<script>
export default {
    data() {
        return {
            textytext: ""
        }
    },
    computed: {
        test() {
            return this.$store.state.start
        }
    }
}
</script>

<style scoped>
h3 {
    font-size: 3em;
    color: cadetblue
}
</style>
