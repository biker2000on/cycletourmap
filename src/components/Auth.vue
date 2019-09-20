<template>
  <div>
    <amplify-authenticator class="mx-auto text-center"></amplify-authenticator>
  </div>
</template>

<script>

export default {
  name: 'auth',
  methods: {
    handleSignin(val) {
      console.log(val)
      if (val == 'signedIn') {
        this.$router.push({name: 'profile'})
      }
    },
  }
}
</script>

<style>
</style>