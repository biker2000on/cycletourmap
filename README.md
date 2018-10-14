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

## Todos

* Add popups with summary stats of each ride.
* Add link to blog posts from rides
* Add lines to map and select whethere they come up with popups or all displayed.
* pull correct rides from Strava