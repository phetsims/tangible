// Copyright 2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import platform from '../../../phet-core/js/platform.js';
import tangible from '../tangible.js';

const MediaPipeQueryParameters = QueryStringMachine.getAll( {

  // The general query parameter to activate MediaPipe as a feature for phetsims.
  cameraInput: {
    type: 'string',
    defaultValue: 'none',
    validValues: [ 'hands', 'none' ]
  },

  // Show a draggable/resizable video on top of the sim while using MediaPipe
  showVideo: {
    type: 'flag'
  },

  // How often to parse a cameraInput during an animation frame. 1 means every frame, 2 every other.
  cameraFrameResolution: {
    type: 'number',

    // To help improve performance, compute hands from webcam less often on iOS.
    defaultValue: platform.mobileSafari ? 3 : 1
  },

  // How much to scale the camera image, determining the number of pixels for MediaPipe to process.
  cameraImageResolutionFactor: {
    type: 'number',

    // To help improve performance, make the image capture smaller.
    defaultValue: platform.mobileSafari ? 0.2 : 0.5
  }
} );

tangible.register( 'MediaPipeQueryParameters', MediaPipeQueryParameters );

export default MediaPipeQueryParameters;