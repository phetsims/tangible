// Copyright 2022, University of Colorado Boulder

/**
 * Adds the boilerplate needed for MediaPipe "hands" implementation to run in PhET Sims. See https://github.com/phetsims/ratio-and-proportion/issues/431
 * See https://google.github.io/mediapipe/solutions/hands.html
 *
 *
 * TODO: lock in URLs like     `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands_solution_wasm_bin.wasm`
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
import tangible from '../tangible.js';
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import optionize from '../../../phet-core/js/optionize.js';
import MediaPipeQueryParameters from './MediaPipeQueryParameters.js';
import draggableResizableHTMLElement from './draggableResizableHTMLElement.js';

if ( MediaPipeQueryParameters.showVideo ) {
  assert && assert( MediaPipeQueryParameters.mediaPipe, '?showVideo is expected to accompany ?mediaPipe and its features' );
}

export type HandPoint = {
  x: number;
  y: number;
  z: number;
  visibility?: boolean;
};

let initialized = false;

type MediaPipeInitializeOptions = {

  // Maximum number of hands to detect. Default to 2. See https://google.github.io/mediapipe/solutions/hands#max_num_hands
  maxNumHands?: number;

  // Complexity of the hand landmark model: 0 or 1. Landmark accuracy as well as inference latency generally go up with
  // the model complexity. Default to 1. See https://google.github.io/mediapipe/solutions/hands#model_complexity
  modelComplexity?: number;

  // Minimum confidence value ([0.0, 1.0]) from the hand detection model for the detection to be considered successful.
  // Default to 0.5. See https://google.github.io/mediapipe/solutions/hands#min_detection_confidence
  minDetectionConfidence?: number;

  // Minimum confidence value ([0.0, 1.0]) from the landmark-tracking model for the hand landmarks to be considered
  // tracked successfully, or otherwise hand detection will be invoked automatically on the next input image. Setting
  // it to a higher value can increase robustness of the solution, at the expense of a higher latency. Ignored if
  // static_image_mode is true, where hand detection simply runs on every image. Default to 0.5. https://google.github.io/mediapipe/solutions/hands#min_tracking_confidence
  minTrackingConfidence?: number;
}

export type MediaPipeResults = {
  image: HTMLCanvasElement;

  // Array of length 21 for each , see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
  multiHandLandmarks: Array<[ HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint ]>;
}

class MediaPipe {

  // the most recent results from MediaPipe
  static results: MediaPipeResults;

  /**
   * Initialize mediaPipe by loading all needed scripts, and initializing hand tracking.
   * Stores results of tracking to MediaPipe.results.
   */
  static initialize( providedOptions?: MediaPipeInitializeOptions ): void {
    assert && assert( !initialized );
    assert && assert( document.body, 'a document body is needed to attache imported scripts' );

    const options = optionize<MediaPipeInitializeOptions>()( {
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.2,
      minTrackingConfidence: 0.2
    }, providedOptions );

    const videoElement = document.createElement( 'video' );
    document.body.appendChild( videoElement );

    let canvasElement: HTMLCanvasElement | null = null;
    let canvasContext: CanvasRenderingContext2D | null = null;

    if ( MediaPipeQueryParameters.showVideo ) {
      canvasElement = document.createElement( 'canvas' );
      canvasElement.style.width = '100%';
      canvasElement.style.height = '100%';
      canvasContext = canvasElement.getContext( '2d' );

      const element = draggableResizableHTMLElement( canvasElement );

      document.body.appendChild( element );
    }

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
          const mediaPipeDependencies = window.mediaPipeDependencies;
          assert && assert( mediaPipeDependencies, 'mediaPipeDependencies expected to load mediaPipe' );

          // @ts-ignore
          const hands = new window.Hands( {
            locateFile: ( file: string ) => {
              assert && assert( mediaPipeDependencies.hasOwnProperty( file ), `file not in mediaPipeDependencies: ${file}` );
              return mediaPipeDependencies[ file ];
            }
          } );
          hands.setOptions( options );
          hands.onResults( ( results: MediaPipeResults ) => {
            !unlocked && unlock();
            unlocked = true;
            MediaPipe.results = results;

            // Update the image if displaying the canvas video over the phetsim.
            if ( MediaPipeQueryParameters.showVideo ) {
              MediaPipe.drawToCanvas( canvasElement!, canvasContext!, results.image );
            }
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


  /**
   * Update the canvas to the current image
   */
  static drawToCanvas( canvasElement: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D, image: HTMLCanvasElement ): void {
    assert && assert( canvasContext, 'must have a canvasContext' );
    canvasContext.save();
    canvasContext.clearRect( 0, 0, canvasElement.width, canvasElement.height );
    canvasContext.drawImage( image, 0, 0, canvasElement.width, canvasElement.height );
    canvasContext.restore();
  }
}

tangible.register( 'MediaPipe', MediaPipe );
export default MediaPipe;
