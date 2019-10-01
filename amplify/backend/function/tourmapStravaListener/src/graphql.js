/* eslint-disable no-case-declarations */
const { API, graphqlOperation } = require("aws-amplify");
const Amplify = require("aws-amplify");
const axios = require("axios");
const queries = require("./queries");
const pick = require("lodash.pick");
const { athleteKeys, activityKeys } = require("./keys");

Amplify.default.configure({
  aws_appsync_graphqlEndpoint: process.env.API_TOURMAP_GRAPHQLAPIENDPOINTOUTPUT,
  aws_appsync_region: process.env.REGION,
  aws_appsync_authenticationType: "AWS_IAM"
});

const handleInput = async body => {
  let athleteInfo;
  try {
    athleteInfo = await API.graphql(graphqlOperation(queries.getAthleteAll), {
      strava_id: body.owner_id
    });
    console.log("result from API query", athleteInfo);
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
      const auth = await refreshAuth(
        athleteInfo.data.getAthleteByStravaId.items[0]
      );
      athleteInfo.data.getAthleteByStravaId.items[0].auth = auth;
    }
    athleteInfo.data.getAthleteByStravaId.items.map(async c => {
      switch (body.object_type) {
        case "activity":
          await handleActivity(body, c);
          return;
        case "athlete":
          await handleAthlete(body, c);
          return;
        default:
          return;
      }
    });
    return;
  } catch (error) {
    console.warn('Errors in acquiring data from Strava and pushing to DB', error)
  }
};

const handleActivity = async (body, athleteInfo) => {
  switch (body.aspect_type) {
    case "delete":
      const activities = API.graphql(
        graphqlOperation(queries.getActivityByStravaId),
        { strava_id: body.object_id }
      );
      activities.data.listActivitiesByStravaId.items.map(c => {
        API.graphql(graphqlOperation(queries.deleteActivity), {
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
        athleteInfo.tour.items.map(c => {
          const tourStart = new Date(c.start_date);
          const tourEnd = new Date(c.end_date);
          if (start >= tourStart && start <= tourEnd) {
            let input = {
              ...activity,
              activityTourId: c.id,
              owner: athleteInfo.owner
            };
            API.graphql(graphqlOperation(queries.createActivity), { input });
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
        let dbActivities = await API.graphql(
          graphqlOperation(queries.getActivityByStravaId),
          { strava_id: body.object_id }
        );
        dbActivities.data.listActivitiesByStravaId.items.map(c => {
          let input = {
            ...activity,
            id: c.id,
            owner: athleteInfo.owner
          };
          API.graphql(graphqlOperation(queries.updateActivity), { input });
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
    const activity = await axios.post(
      "https://www.strava.com/api/v3/activities/" + id,
      {
        headers: {
          Authorization: "Bearer " + access_token
        }
      }
    );
    const preppedActivity = {
      ...pick(activity, activityKeys),
      activity_type: "STRAVA",
      strava_id: activity.id,
      summary_polyline: activity.map.summary_polyline
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
        owner: athleteInfo.owner
      };
      API.graphql(graphqlOperation(queries.updateAthlete), { input });
      return;
    case "delete":
      API.graphql(graphqlOperation(queries.deleteAthlete), {
        input: { id: body.object_id }
      });
      return;
    default:
      return;
  }
};

const getAthlete = async auth => {
  try {
    const athlete = await axios.post("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: "Bearer " + auth.access_token
      }
    });
    const preppedAthlete = {
      ...pick(athlete, athleteKeys),
      strava_id: athlete.id
    };
    return preppedAthlete;
  } catch (error) {
    console.warn("Error fetching strava Athlete detail", error);
  }
};

const refreshAuth = async athleteInfo => {
  const data = {
    client_id: process.env.STRAVA_CLIENTID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    refresh_token: athleteInfo.auth.refresh_token,
    grant_type: "refresh_token"
  };
  let res = await axios.post("https://www.strava.com/oauth/token", data);
  let { athlete, expires_in, ...auth } = res.data;
  auth["id"] = athleteInfo.auth.id;
  auth["owner"] = athleteInfo.owner;
  API.graphql(graphqlOperation(queries.updateAuth), { input: auth });
  return auth;
};

module.exports = {
  handleInput
};
