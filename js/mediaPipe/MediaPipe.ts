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
import optionize from '../../../phet-core/js/optionize.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import ObjectLiteralIO from '../../../tandem/js/types/ObjectLiteralIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import Property from '../../../axon/js/Property.js';
import MediaPipeQueryParameters from './MediaPipeQueryParameters.js';
import draggableResizableHTMLElement from './draggableResizableHTMLElement.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';

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
};

// 21 points, in order, cooresponding to hand landmark positions, see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
export type HandLandmarks = [ HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint ];

type HandednessData = {
  displayName?: string;
  index: number;
  label: string;
  score: number;
};
export type MediaPipeResults = {
  image: HTMLCanvasElement;

  // One for each hand detected
  multiHandLandmarks: HandLandmarks[];
  multiHandedness: HandednessData[];
};

const MediaPipeResultsIO = new IOType( 'MediaPipeResultsIO', {
  isValidValue: () => true,
  toStateObject: ( mediaPipeResults: MediaPipeResults ) => {
    return {
      multiHandLandmarks: mediaPipeResults.multiHandLandmarks,
      multiHandedness: mediaPipeResults.multiHandedness
    };
  },
  stateSchema: {
    multiHandLandmarks: ArrayIO( ArrayIO( ObjectLiteralIO ) ),
    multiHandedness: ArrayIO( ObjectLiteralIO )
  }
} );

class MediaPipe {

  // the most recent results from MediaPipe
  public static resultsProperty = new Property<MediaPipeResults | null>( null, {
    phetioType: Property.PropertyIO( NullableIO( MediaPipeResultsIO ) ),
    tandem: Tandem.GLOBAL_VIEW.createTandem( 'mediaPipe' ).createTandem( 'resultsProperty' ),
    phetioDocumentation: 'A Property that holds the raw data coming from MediaPipe. Set to null if there are no hands detected.'
  } );

  /**
   * Initialize mediaPipe by loading all needed scripts, and initializing hand tracking.
   * Stores results of tracking to MediaPipe.results.
   */
  public static initialize( providedOptions?: MediaPipeInitializeOptions ): void {
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

      MediaPipe.resultsProperty.value = results.multiHandLandmarks.length > 0 ? results : null;

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

  /**
   * Update the canvas to the current image
   */
  private static drawToCanvas( canvasElement: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D, image: HTMLCanvasElement ): void {
    assert && assert( canvasContext, 'must have a canvasContext' );
    canvasContext.save();
    canvasContext.clearRect( 0, 0, canvasElement.width, canvasElement.height );
    canvasContext.drawImage( image, 0, 0, canvasElement.width, canvasElement.height );
    canvasContext.restore();
  }
}

tangible.register( 'MediaPipe', MediaPipe );
export default MediaPipe;
