// Copyright 2020, University of Colorado Boulder

/**
 * This file is to prototype mechamarkers as an input controller to a phetsim, see https://github.com/phetsims/a11y-research/issues/153
 *
 * It specifies the Mechamarkers global as a member to reduce global name space access.
 *
 * For usage, most of the time this should be subtyped and then stepped with logic in step that monitors the state of
 * the marker control via the Mechamarkers global.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

// modules
import stepTimer from '../../axon/js/stepTimer.js';
import tangible from './tangible.js';

// This flag keeps Mechamarkers from being implemented more than once.
let mechamarkersInitialized = false;

const beholderInitParameters = {
  camera_params: {
    videoSize: 1, // The video size values map to the following [320 x 240, 640 x 480, 1280 x 720, 1920 x 1080]
    rearCamera: false, // Boolean value for defaulting to the rear facing camera. Only works on mobile
    torch: false // Boolean value for if torch/flashlight is on. Only works for rear facing mobile cameras. Can only be set from init
  },
  detection_params: {
    minMarkerDistance: 10,
    minMarkerPerimeter: 0.1, // This was nice for @zepumph with basic testing
    maxMarkerPerimeter: 0.8,
    sizeAfterPerspectiveRemoval: 49
  },
  feed_params: {
    contrast: 100,
    brightness: 0,
    grayscale: 100, // @zepumph: wouldn't this help detect?

    // Note: When true, many aruco original markers are not detected well!x
    flip: false
  },
  overlay_params: {
    present: false, // Determines if the Beholder overlay will display or be invisible entirely via display: none
    hide: true // Determines if the overlay should be hidden on the left of the screen or visible
  }
};

class MarkerInput {

  constructor() {

    // @protected (read-only) {Beholder} - instead of using the global, this allows to keep encapsulation better.
    this.Beholder = window[ 'beholder-detection' ];
    assert && assert( this.Beholder, 'Beholder global is needed to run tangible input.' );

    // the Mechamarkers library only needs to be initialized once. If another instance has already done this, then don't
    // do it again.
    if ( !mechamarkersInitialized ) {

      stepTimer.addListener( () => {

        // Mechamarkers stuff
        this.Beholder.update( Date.now() );
      } );

      const div = document.createElement( 'div' );
      document.body.appendChild( div );

      this.Beholder.init( div, beholderInitParameters );

      mechamarkersInitialized = true;
    }
  }
}

tangible.register( 'MarkerInput', MarkerInput );
export default MarkerInput;
