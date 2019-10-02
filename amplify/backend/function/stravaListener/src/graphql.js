/* eslint-disable no-case-declarations */
const axios = require("axios");
const queries = require("./queries");
const { athleteKeys, activityKeys } = require("./keys");
const { client } = require('./client')

const handleInput = async body => {
  let athleteInfo;
  // console.log("inside handleInput", body);
  try {
    athleteInfo = await client(queries.getAthleteAll, { strava_id: body.owner_id })
    console.log("result from API query", athleteInfo.data.getAthleteByStravaId.items[0].tours);
  } catch (error) {
    console.warn("couldn't retrieve athleteInfo", error);
  }

  try {
    if (
      new Date(
        athleteInfo.data.getAthleteByStravaId.items[0].auth.expires_at * 1000 -
          1800 * 1000
      ) < new Date()
    ) {
      console.log('before refresh')
      const auth = await refreshAuth(athleteInfo.data.getAthleteByStravaId.items[0]);
      console.log('after refresh')
      athleteInfo.data.getAthleteByStravaId.items[0].auth = auth;
    }
    athleteInfo.data.getAthleteByStravaId.items.map(async c => {
      switch (body.object_type) {
        case "activity":
          await handleActivity(body, c);
          break;
        case "athlete":
          await handleAthlete(body, c);
          break;
        default:
          break;
      }
    });
  } catch (error) {
    console.warn("Errors in acquiring data from Strava and pushing to DB", error);
  }
};

const handleActivity = async (body, athleteInfo) => {
  switch (body.aspect_type) {
    case "delete":
      const activities = await client((queries.getActivityByStravaId),{ strava_id: body.object_id });
      activities.data.listActivitiesByStravaId.items.map(async c => {
        await client((queries.deleteActivity), {
          input: { id: c.id }
        });
      });
      return;
    case "create":
      try {
        let activity = await getActivity(
          body.object_id,
          athleteInfo.auth.access_token
        );
        let start = new Date(activity.start_date_local);
        athleteInfo.tours.items.map(async c => {
          const tourStart = new Date(c.start_date);
          const tourEnd = new Date(c.end_date);
          if (start >= tourStart && start <= tourEnd) {
            let input = {
              ...activity,
              activityTourId: c.id,
              owner: athleteInfo.owner
            };
            const act = await client((queries.createActivity), { input });
            console.log(act.data.createActivity.tour)
          }
        });
      } catch (error) {
        console.warn("error creating new activities", error);
      }
      return;
    case "update":
      try {
        let activity = await getActivity(
          body.object_id,
          athleteInfo.auth.access_token
        );
        let dbActivities = await client((queries.getActivityByStravaId), { strava_id: body.object_id });
        dbActivities.data.listActivitiesByStravaId.items.map(async c => {
          let input = {
            ...activity,
            id: c.id,
          };
          await client((queries.updateActivity), { input });
        });
      } catch (error) {
        console.warn("error updating activity/s", error);
      }
      return;
    default:
      return;
  }
};

const getActivity = async (id, access_token) => {
  try {
    const activity = await axios.get(
      "https://www.strava.com/api/v3/activities/" + id,
      {
        headers: {
          Authorization: "Bearer " + access_token
        }
      }
    );
    const preppedActivity = {
      ...pick(activity.data, activityKeys),
      activity_type: "STRAVA",
      strava_id: activity.data.id,
      summary_polyline: activity.data.map.summary_polyline
    };
    return preppedActivity;
  } catch (error) {
    console.warn("Error fetching strava Activity detail", error);
  }
};

const handleAthlete = async (body, athleteInfo) => {
  switch (body.aspect_type) {
    case "update":
      const athlete = await getAthlete(athleteInfo.auth);
      let input = {
        ...athlete,
        id: athleteInfo.id,
        // owner: athleteInfo.owner
      };
      await client((queries.updateAthlete), { input });
      return;
    case "delete":
      await client((queries.deleteAthlete), { input: { id: body.object_id }});
      return;
    default:
      return;
  }
};

const getAthlete = async auth => {
  try {
    const athlete = await axios.get("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: "Bearer " + auth.access_token
      }
    });
    const preppedAthlete = {
      ...pick(athlete.data, athleteKeys),
      strava_id: athlete.data.id
    };
    return preppedAthlete;
  } catch (error) {
    console.warn("Error fetching strava Athlete detail", error);
  }
};

const refreshAuth = async athleteInfo => {
  const data = {
    client_id: "28538", //process.env.STRAVA_CLIENTID,
    client_secret: "97c7dc5efcafb04becb6bbaedd0d9ba1e84efec9", // process.env.STRAVA_CLIENT_SECRET,
    refresh_token: athleteInfo.auth.refresh_token,
    grant_type: "refresh_token"
  };
  let res = await axios.post("https://www.strava.com/oauth/token", data);
  let { athlete, expires_in, ...auth } = res.data;
  auth["id"] = athleteInfo.auth.id;
  // auth["owner"] = athleteInfo.owner;
  await client((queries.updateAuth), { input: auth });
  return auth;
};

const pick = (obj, keys) =>
  Object.keys(obj)
    .filter(i => keys.includes(i))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});

module.exports = {
  handleInput
};
