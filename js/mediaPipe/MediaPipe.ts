// Copyright 2022, University of Colorado Boulder

/**
 * Adds the boilerplate needed for MediaPipe "hands" implementation to run in PhET Sims. See https://github.com/phetsims/ratio-and-proportion/issues/431
 * See https://google.github.io/mediapipe/solutions/hands.html
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
import tangible from '../tangible.js';
import asyncLoader from '../../../phet-core/js/asyncLoader.js';
import optionize from '../../../phet-core/js/optionize.js';
import MediaPipeQueryParameters from './MediaPipeQueryParameters.js';

const CAPTURE = { capture: true };

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
  multiHandLandmarks: Array<[ HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint, HandPoint ]>
}

class MediaPipe {

  // the most recent results from MediaPipe
  static results: MediaPipeResults;

  /**
   * Initialize mediaPipe by loading all needed scripts, and initializing hand tracking.
   * Stores results of tracking to MediaPipe.results.
   */
  static initialize( providedOptions?: MediaPipeInitializeOptions ) {
    assert && assert( !initialized );
    assert && assert( document.body, 'a document body is needed to attache imported scripts' );

    const options = optionize<MediaPipeInitializeOptions>( {
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

      const element = MediaPipe.initializeResizableVideo( canvasElement );

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
          const hands = new window.Hands( {
            locateFile: ( file: string ) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
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

  /**
   * Wire up a draggable/resizable div for the canvas element to live in. Returns that container
   * This code was adapted from https://evangelistagrace.github.io/tutorials/draggable-and-resizable-div.html
   */
  static initializeResizableVideo( canvas: HTMLElement ): HTMLElement {
    const item = document.createElement( 'div' );
    item.classList.add( 'item' );
    item.style.zIndex = '100000';
    item.style.bottom = '0'; // initially put it on the bottom
    const content = document.createElement( 'div' );
    content.classList.add( 'content' );
    content.appendChild( canvas );
    item.appendChild( content );

    const createResizer = ( className: string ) => {
      const div = document.createElement( 'div' );
      div.classList.add( 'resizer' );
      div.classList.add( className );
      return div;
    };
    const resizers = [
      createResizer( 'top-left' ),
      createResizer( 'top-right' ),
      createResizer( 'bottom-left' ),
      createResizer( 'bottom-right' )
    ];
    resizers.forEach( resizer => item.appendChild( resizer ) );

    const style = document.createElement( 'style' );
    style.setAttribute( 'id', 'new-animations' );
    style.setAttribute( 'type', 'text/css' );
    document.head.appendChild( style );
    style.innerHTML = `
.item {
    width: 640px;
    height: 350px;
    position: fixed;
    background-color: lightsalmon;
    padding: 4px;
    box-sizing: border-box;
    cursor: move;
  }
.item .content {
    height: 100%;
  }
.item .content h3 {
    text-align: center;
    font-family: Merriweather, serif;
  }

.resizer {
    position: absolute;
    width: 10px;
    height: 10px;
    background: black;
    z-index: 2;
  }
.resizer.top-left {
    top: -1px;
    left: -1px;
    cursor: nw-resize;
  }
.resizer.top-right {
    top: -1px;
    right: -1px;
    cursor: ne-resize;
  }
.resizer.bottom-left {
    bottom: -1px;
    left: -1px;
    cursor: sw-resize;
  }
.resizer.bottom-right {
    bottom: -1px;
    right: -1px;
    cursor: se-resize;
  }
  `;

    const minWidth = 100;
    const minHeight = 100;
    const maxWidth = 900;
    const maxHeight = 900;

    let isResizing = false;


    // Resizers must be first so that the capture in the "item" listener doesn't suck up the event for the resizer
    resizers.forEach( ( resizer: Node ) => {
      resizer.addEventListener( 'pointerdown', ( ( e: PointerEvent ) => {
        console.log( 'did it' );
        e.preventDefault();
        e.cancelBubble = true;

        console.log( 'down resizer' );
        const prevX = e.clientX;
        const prevY = e.clientY;
        const currentResizer = e.target;
        const rect = item.getBoundingClientRect();
        const prevLeft = rect.left;
        const prevTop = rect.top;
        let newWidth;
        let newHeight;

        isResizing = true;

        const pointermove = ( e: PointerEvent ) => {
          console.log( 'move' );
          e.preventDefault();

          e.cancelBubble = true;

          console.log( 'pointer move on resize' );
          const newX = prevX - e.clientX; //negative to the right, positive to the left
          const newY = prevY - e.clientY; //negative to the bottom, positive to the top
          if ( ( currentResizer as Element ).classList.contains( 'bottom-right' ) ) {
            newWidth = rect.width - newX;
            newHeight = rect.height - newY;
            if ( newWidth > minWidth && newWidth < maxWidth ) {
              item.style.width = newWidth + 'px';
            }
            if ( newHeight > minHeight && newHeight < maxHeight ) {
              item.style.height = newHeight + 'px';
            }

          }
          else if ( ( currentResizer as Element ).classList.contains( 'bottom-left' ) ) {
            newWidth = rect.width + newX;
            newHeight = rect.height - newY;

            if ( newWidth > minWidth && newWidth < maxWidth ) {
              item.style.left = prevLeft - newX + 'px';
              item.style.width = newWidth + 'px';
            }
            if ( newHeight > minHeight && newHeight < maxHeight ) {
              item.style.height = newHeight + 'px';
            }
          }
          else if ( ( currentResizer as Element ).classList.contains( 'top-right' ) ) {
            newWidth = rect.width - newX;
            newHeight = rect.height + newY;

            if ( newWidth > minWidth && newWidth < maxWidth ) {
              item.style.width = newWidth + 'px';
            }
            if ( newHeight > minHeight && newHeight < maxHeight ) {
              item.style.top = prevTop - newY + 'px';
              item.style.height = newHeight + 'px';
            }

          }
          else if ( ( currentResizer as Element ).classList.contains( 'top-left' ) ) {
            newWidth = rect.width + newX;
            newHeight = rect.height + newY;

            if ( newWidth > minWidth && newWidth < maxWidth ) {
              item.style.left = prevLeft - newX + 'px';
              item.style.width = newWidth + 'px';
            }
            if ( newHeight > minHeight && newHeight < maxHeight ) {
              item.style.top = prevTop - newY + 'px';
              item.style.height = newHeight + 'px';
            }
          }
        };

        const pointerup = ( e: PointerEvent ) => {
          e.preventDefault();
          e.cancelBubble = true;
          console.log( 'release' );

          isResizing = false;
          window.removeEventListener( 'pointermove', pointermove, CAPTURE );
          window.removeEventListener( 'pointerup', pointerup, CAPTURE );
        };

        window.addEventListener( 'pointermove', pointermove, CAPTURE );
        window.addEventListener( 'pointerup', pointerup, CAPTURE );
      } ) as any, CAPTURE );
    } );


    item.addEventListener( 'pointerdown', ( e: PointerEvent ) => {
      if ( !( e.target && ( e.target as Element ).classList.contains( 'resizer' ) ) ) {
        e.preventDefault();
        e.cancelBubble = true;
      }

      //get the initial mouse coordinates and the position coordinates of the element
      const prevX = e.clientX;
      const prevY = e.clientY;
      const rect = content.getBoundingClientRect();
      const prevLeft = rect.left;
      const prevTop = rect.top;

      const pointermove = ( e: PointerEvent ) => {

        if ( isResizing ) {
          return;
        }
        e.preventDefault();
        e.cancelBubble = true;

        //get horizontal and vertical distance of the mouse move
        const newX = prevX - e.clientX; //negative to the right, positive to the left
        const newY = prevY - e.clientY; //negative to the bottom, positive to the top

        //set coordinates of the element to move it to its new position
        item.style.left = prevLeft - newX + 'px';
        item.style.top = prevTop - newY + 'px';
      };

      const pointerup = ( e: PointerEvent ) => {
        e.preventDefault();
        e.cancelBubble = true;

        window.removeEventListener( 'pointermove', pointermove, CAPTURE );
        window.removeEventListener( 'pointerup', pointerup, CAPTURE );
      };
      window.addEventListener( 'pointermove', pointermove, CAPTURE );
      window.addEventListener( 'pointerup', pointerup, CAPTURE );
    }, CAPTURE );

    return item;
  }
}

tangible.register( 'MediaPipe', MediaPipe );
export default MediaPipe;
