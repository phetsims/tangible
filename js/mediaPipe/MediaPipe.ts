// Copyright 2022, University of Colorado Boulder

/**
 * Adds the boilerplate needed for MediaPipe "hands" implementation to run in PhET Sims. See https://github.com/phetsims/ratio-and-proportion/issues/431
 * See https://google.github.io/mediapipe/solutions/hands.html
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
import tangible from '../tangible.js';
import asyncLoader from '../../../phet-core/js/asyncLoader.js';

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

  /**
   * @private (MediaPipe)
   * Initialize mediaPipe by loading all needed scripts, and initializing hand tracking.
   * Stores results of tracking to MediaPipe.results.
   */
  static initialize() {
    assert && assert( !initialized );
    assert && assert( document.body, 'a document body is needed to attache imported scripts' );

    const videoElement = document.createElement( 'video' );
    document.body.appendChild( videoElement );

    const mediaPipeResourcesToLoad = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
    ];

    const unlock = asyncLoader.createLock( mediaPipeResourcesToLoad );

    let loaded = 0;

    mediaPipeResourcesToLoad.forEach( src => {
      const script = document.createElement( 'script' );
      script.setAttribute( 'crossorigin', 'anonymous' );
      script.src = src;
      document.body.appendChild( script );
      script.addEventListener( 'load', () => {
        loaded++;
        if ( loaded === mediaPipeResourcesToLoad.length ) {
          let unlocked = false;

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
            !unlocked && unlock();
            unlocked = true;
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
      } );
    } );
  }
}

MediaPipe.initialize();

tangible.register( 'MediaPipe', MediaPipe );
export default MediaPipe;
