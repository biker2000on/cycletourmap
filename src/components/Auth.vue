<template>
  <div class="auth">
    <amplify-authenticator ></amplify-authenticator>
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
.auth {
  margin: auto auto;
  width: 460px;
}
</style>