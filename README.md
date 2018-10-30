# Vue-Test

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```
## Mapbox Component
`vue-mapbox` is the npm package used.

* https://soal.github.io/vue-mapbox/#/
* https://www.mapbox.com/api-documentation
* https://www.mapbox.com/help/how-access-tokens-work/


Must define a height and width for the mapbox display or it will not show up. Also, the default `position: absolute` did not work, so changed to `position: relative` and it works fine now. 

If you take out `text-align: center` from the default CSS from `vue-cli` then the map centers just fine. Seems to be a problem with Webpack. Solution suggested [here](https://github.com/phegman/vue-mapbox-gl/issues/11).

## A different Mapbox Component

`vue-mapbox` is having alignment issues, so going to try `mapbox-gl-vue`.

* https://www.npmjs.com/package/mapbox-gl-vue

## Strava Integration

I am using Strava to pull activity data. [This is a good resource](https://codepen.io/alyda/pen/zGERzL?editors=0010) for the Strava API and how to use it with JS. 

### Other Resources

* [Strava API Reference](https://developers.strava.com/docs/reference/)

## Todos

* Add popups with summary stats of each ride.
* Add link to blog posts from rides
* Add lines to map and select whethere they come up with popups or all displayed.
* pull correct rides from Strava