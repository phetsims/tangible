// Copyright 2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

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
  }
} );

tangible.register( 'MediaPipeQueryParameters', MediaPipeQueryParameters );

export default MediaPipeQueryParameters;