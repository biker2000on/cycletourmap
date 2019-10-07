<template>
  <div class="pa-8" :style="{maxWidth: 800}">
    <div class="text-left">
      <h2 class="display-1 mb-3">Getting Started</h2>
    <h2 class="title">1. Create an account</h2>
    <p>Step one to creating your new tourmap is to create your account for Cycle Tourmap.</p>
    <h2 class="title">2. Authenticate with Strava</h2>
    <p>Next you need to click the below button after logging in to link your new Cycle Tourmap account with Strava. Not completing this step or removing the requested permissions of this step will result in not being able to create tourmaps.</p>
    <div>
      <img src="/strava/btn_strava_connectwith_orange.svg" height="48" />
    </div>
    <h2 class="title">3. Create your new tour!</h2>
    <p>After you click <v-btn color="success" small><v-icon>add</v-icon>New Tour</v-btn>, you will be able to create your new tour. All fields are required except for description. Once you have filled in the fields you click "Fetch All Activities" to gather all of your activities from Strava. Once it has retreived the activities from Strava you can Save and view your new tourmap.</p>
    <ul>
      <li>Click New Tour</li>
      <li>Fill in all required fields: Name, Start Date, and End Date</li>
      <li>If you want the map to be shareable / embedable, make sure it is Public</li>
      <li>Click Fetch All Activities</li>
      <li>Save your new tourmap</li>
    </ul>
    <h2 class="display-1 mt-7 mb-3">FAQ</h2>
    <h2 class="title">Do we save your Strava Rides?</h2>
    <p>Yes. Cycle Tourmap stores your Strava rides in our database, but we honor your Strava data and delete them from our database as soon as you delete them or store as private on Strava. Also, we only store the rides that are within the time range of your created tours.</p>
    <h2 class="title">Do our new rides get added to the map?</h2>
    <p>Yes, new rides are added to existing maps a few seconds after they are posted to Strava as long as they are within the date ranges of your existing maps.</p>
    <h2 class="title">Can we filter / select the rides for our map manually?</h2>
    <p>Not at this time. I hope to add this feature in the next major release of the app. </p>
    <h2 class="title">Is it really free?</h2>
    <p>Yes. Cycle Tourmap is free. This is a tool that I really wanted to have for my personal tour across Asia and Europe, but was not available, so I made it. Please share it with your friends. There will never be paid access to this app's features. If you really enjoy using it and would like to donate to the app's development <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RJU8Z3WTUDNJJ&source=url" target="_blank">click here.</a></p>
    <h2 class="title">Who made this?</h2>
    <p>My name is Justin Crawford and I have been a cyclist for a long time. I love going out riding and exploring the countryside around where I lived in the US and in China. During 2019, my wife and I rode across Asia and Europe and that trip was the inspiration for this app. I am an engineer and web developer that just doesn't know when to stop.</p>
    <h2 class="title">How do we contact you?</h2>
    <p>Please reach out to me at justin@crawfordcreations.org to leave feedback or if you have any questions about Cycle Tourmap and what you can expect in the future. If you have further questions, I am sure others do to. Let me know and I will add more to this FAQ. Thanks and enjoy Cycle Tourmap!</p>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>