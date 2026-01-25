<template>
  <v-container class="pa-8" style="max-width: 800px">
    <div class="text-left">
      <h2 class="text-h4 mb-3">Getting Started</h2>

      <h3 class="text-h6 mt-4">1. Create an account</h3>
      <p>Step one to creating your new tourmap is to create your account for Cycle Tourmap.</p>

      <h3 class="text-h6 mt-4">2. Authenticate with Strava</h3>
      <p>Next you need to click the below button after logging in to link your new Cycle Tourmap account with Strava. Not completing this step or removing the requested permissions of this step will result in not being able to create tourmaps.</p>
      <div class="my-4">
        <img src="/strava/btn_strava_connectwith_orange.svg" height="48" alt="Connect with Strava" />
      </div>

      <h3 class="text-h6 mt-4">3. Create your new tour!</h3>
      <p>After you click <v-btn color="success" size="small"><v-icon start>mdi-plus</v-icon>New Tour</v-btn>, you will be able to create your new tour. All fields are required except for description. Once you have filled in the fields you click "Fetch All Activities" to gather all of your activities from Strava. Once it has retrieved the activities from Strava you can Save and view your new tourmap.</p>
      <ul class="mb-4">
        <li>Click New Tour</li>
        <li>Fill in all required fields: Name, Start Date, and End Date</li>
        <li>If you want the map to be shareable / embeddable, make sure it is Public</li>
        <li>Click Fetch All Activities</li>
        <li>Save your new tourmap</li>
      </ul>

      <h2 class="text-h4 mt-8 mb-3">FAQ</h2>

      <h3 class="text-h6 mt-4">Do we save your Strava Rides?</h3>
      <p>Yes. Cycle Tourmap stores your Strava rides in our database, but we honor your Strava data and delete them from our database as soon as you delete them or store as private on Strava. Also, we only store the rides that are within the time range of your created tours.</p>

      <h3 class="text-h6 mt-4">Do our new rides get added to the map?</h3>
      <p>Yes, new rides are added to existing maps a few seconds after they are posted to Strava as long as they are within the date ranges of your existing maps.</p>

      <h3 class="text-h6 mt-4">Can we filter / select the rides for our map manually?</h3>
      <p>Not at this time. I hope to add this feature in the next major release of the app.</p>

      <h3 class="text-h6 mt-4">Is it really free?</h3>
      <p>Yes. Cycle Tourmap is free. This is a tool that I really wanted to have for my personal tour across Asia and Europe, but was not available, so I made it. Please share it with your friends. There will never be paid access to this app's features. If you really enjoy using it and would like to donate to the app's development <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RJU8Z3WTUDNJJ&source=url" target="_blank">click here.</a></p>

      <h3 class="text-h6 mt-4">Who made this?</h3>
      <p>My name is Justin Crawford and I have been a cyclist for a long time. I love going out riding and exploring the countryside around where I lived in the US and in China. During 2019, my wife and I rode across Asia and Europe and that trip was the inspiration for this app. I am an engineer and web developer that just doesn't know when to stop.</p>

      <h3 class="text-h6 mt-4">How do we contact you?</h3>
      <p>Please reach out to me at justin@crawfordcreations.org to leave feedback or if you have any questions about Cycle Tourmap and what you can expect in the future. If you have further questions, I am sure others do too. Let me know and I will add more to this FAQ. Thanks and enjoy Cycle Tourmap!</p>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'GettingStarted'
}
</script>
