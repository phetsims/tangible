tangible
=======================================================

Library for tangible input controllers to phetsims

By PhET Interactive Simulations
https://phet.colorado.edu/

## Documentation

This library is set up make available different computer vision, bluetooth, and plugin technologies for use as control
to
PhET Simulations.

## MediaPipe Hands

See https://google.github.io/mediapipe/solutions/hands#javascript-solution-api.

[MediaPipe.ts](./js/mediaPipe/MediaPipe.ts) encapsulates all the needed logic to use MediaPipe. After calling
`MediaPipe.initialize()`, in a step function or listener you can monitor hand changes by looking at
`MediaPipe.resultsProperty`. See `RAPMediaPipe` as an example usage.

## License

See the [license](LICENSE)