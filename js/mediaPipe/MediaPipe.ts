// Copyright 2022, University of Colorado Boulder

/**
 * Adds the boilerplate needed for MediaPipe "hands" implementation to run in PhET Sims. See https://github.com/phetsims/ratio-and-proportion/issues/431
 * See https://google.github.io/mediapipe/solutions/hands.html
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
import tangible from '../tangible.js';

let initialized = false;

export type HandPoint = {
  x: number;
  y: number;
  z: number;
  visibility?: boolean;
};

export type MediaPipeResults = {

  // Array of length 21, see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
  multiHandLandmarks: Array<[ HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint ]>
}

class MediaPipe {

  // the most recent results from MediaPipe
  static results: MediaPipeResults;

  constructor() {

    if ( !initialized ) {
      MediaPipe.initialize();
    }
  }

  static initialize() {
    assert && assert( !initialized );

    const videoElement = document.getElementsByClassName( 'input_video' )[ 0 ];

    assert && assert( videoElement );

    // @ts-ignore
    const hands = new window.Hands( {
      locateFile: ( file: string ) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    } );
    hands.setOptions( {
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.2,
      minTrackingConfidence: 0.2
    } );
    hands.onResults( ( results: MediaPipeResults ) => {
      MediaPipe.results = results;
    } );

    // @ts-ignore
    const camera = new window.Camera( videoElement, {
      onFrame: async () => {
        await hands.send( { image: videoElement } );
      },
      width: 1280,
      height: 720
    } );
    camera.start();

    initialized = true;
  }
}

tangible.register( 'MediaPipe', MediaPipe );
export default MediaPipe;
