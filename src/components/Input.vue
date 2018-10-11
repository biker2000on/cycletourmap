<template>
    <div>
        <input v-model="textytext" placeholder="Empty">
        <h3>My entry:</h3>
        <p>{{ textytext }}</p>
    </div>
</template>

<script>
export default {
    data() {
        return {}
    }
}
</script>

<style scoped>
h3 {
    font-size: 3em;
    color: cadetblue
}
</style>
