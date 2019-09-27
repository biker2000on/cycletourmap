<template>
  <div>
    <amplify-authenticator class="mx-auto text-center" :authConfig="authConfig" ></amplify-authenticator>
  </div>
</template>

<script>

export default {
  name: 'auth',
  data() {
    return {
      authConfig: {
        signUpConfig: {
          hiddenDefaults: ['phone_number']
        }
      }
    }
  },
  methods: {
    handleSignin(val) {
      // console.log(val)
      if (val == 'signedIn') {
        this.$router.push({name: 'profile'})
      }
    },
  }
}
</script>

<style>
</style>