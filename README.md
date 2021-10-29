tangible
=======================================================

Library for tangible input controllers to phetsims

By PhET Interactive Simulations
https://phet.colorado.edu/

## Documentation

This library is set up to use "beholder-detection", which runs on "mechamarkers". This is a technology of ArUco fiducial
markers + computer vision. We use this to control simulations. Information about the library can be found
at https://www.npmjs.com/package/beholder-detection. Note that you will need to at least understand the documentation
about "Individual Marker" to accomplish most goals and logic. This is under active prototyping, so please expect any
sort of API to change. Comments at this stage are very welcome.

### Understand the technology

You will need:

1. A webcam (if you have an IR camera, it will detect markers the best)
2. Markers. This library requires the use of the "Original ArUco" dictionary of markers. You can find these, print them
   out, or use them from your smartphone over in https://chev.me/arucogen/. Make sure to use the Original ArUco! 100mm
   marker size is fine

Load [demo.html](./demo.html) and play around with what it takes to detect and interact with markers. The demo will
print to the console any markers that are detected, note the position of the corners/center, their `present` flag, and
the rotation as all potential values that could be useful.

### Getting started in sims

1. Add the beholder library as a preload, and tangible as a phetLib under "phet" in package.json:

```
    "phetLibs": [
      "tangible"
    ],
    "preload": [
      "../sherpa/lib/beholder-detection-1.1.12.js"
    ],
```

2. Run `grunt update`.
3. [MarkerInput.js](./js/MarkerInput.js) is the main class for marker input in sims. It needs to be steped, and should
   most likely be created in the screen view. See RAPMarkerInput.ts as an example.
4. Determine what markers you want to use.
5. Determine what model/view Properties you will want to control with marker input.
6. Wire these up together in the `step` function of your MarkerInput subtype.

This is a work in progress. Please let @zepumph know if you run into any trouble, or want a review/consultation. Good
luck and have fun!

### Shortcomings

* In general the underlying computer vision technology is not good at detecting movement within the marker input. This
  is additionally worsened if your webcam is of less quality, and has a lot of motion blur.
* MarkerInput uses a hard coded set of options that it passes to the library. As part of this, there is a min and max
  size of marker that it will try to detect. If this doesn't work for your case, we can change this to support options.

## License

See the [license](LICENSE)