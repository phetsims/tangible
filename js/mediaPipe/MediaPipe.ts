// Copyright 2022-2023, University of Colorado Boulder

/**
 * Adds the boilerplate needed for MediaPipe "hands" implementation to run in PhET Sims. See https://github.com/phetsims/ratio-and-proportion/issues/431
 * See https://google.github.io/mediapipe/solutions/hands.html
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
import tangible from '../tangible.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import OopsDialog from '../../../scenery-phet/js/OopsDialog.js';
import ObjectLiteralIO from '../../../tandem/js/types/ObjectLiteralIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import Property from '../../../axon/js/Property.js';
import MediaPipeQueryParameters from './MediaPipeQueryParameters.js';
import draggableResizableHTMLElement from './draggableResizableHTMLElement.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import { HBox, Node, RichText, Text, TextOptions, VBox, VoicingRichText, VoicingRichTextOptions, VoicingText, VoicingTextOptions } from '../../../scenery/js/imports.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import animationFrameTimer from '../../../axon/js/animationFrameTimer.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import TangibleStrings from '../TangibleStrings.js';
import PreferencesDialog from '../../../joist/js/preferences/PreferencesDialog.js';
import JoistStrings from '../../../joist/js/JoistStrings.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import Dimension2 from '../../../dot/js/Dimension2.js';

if ( MediaPipeQueryParameters.showVideo ) {
  assert && assert( MediaPipeQueryParameters.cameraInput === 'hands', '?showVideo is expected to accompany ?cameraInput=hands and its features' );
}

type HandsType = {
  setOptions( options: MediaPipeInitializeOptions ): void;
  onResults( callback: ( results: MediaPipeResults ) => void ): void;
  send( object: { image: HTMLVideoElement } ): Promise<void>;
};

// Allow accessing these off window. See https://stackoverflow.com/questions/12709074/how-do-you-explicitly-set-a-new-property-on-window-in-typescript
declare global {
  interface Window { // eslint-disable-line @typescript-eslint/consistent-type-definitions
    mediaPipeDependencies: Record<string, string>;
    Hands: { new( options: IntentionalAny ): HandsType };
  }
}

const CAMERA_IMAGE_RESOLUTION_FACTOR = MediaPipeQueryParameters.cameraImageResolutionFactor;

export type HandPoint = {
  x: number;
  y: number;
  z: number;
  visibility?: boolean;
};

let initialized = false;

type MediaPipeInitializeOptions = {

  // default to false, where we download mediaPipe dependencies from online. If true, use local dependencies to load the library.
  fromLocalDependency?: boolean;

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

// 21 points, in order, corresponding to hand landmark positions, see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
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

// Failure to send camera input to hands indicates that the Hands library was unable to load correctly (most likely
// due to a lack of internet connection). Keep track of this so that we don't resend failures on every frame.
let failedOnFrame = false;

// Keep our own track of if we have started playing the video (which is the metric that matters for sending data to the
// hands model).
let videoPlaying = false;

class MediaPipe {

  // device id from the browser often will be and empty string (`''`), so make sure the default value is a unique string
  // so that the initial Property notifications happen.
  public static readonly selectedDeviceProperty = new StringProperty( 'DEFAULT_VALUE' );
  public static readonly availableDevices: MediaDeviceInfo[] = [];

  // Flip across the x axis, flipping y values
  public static readonly xAxisFlippedProperty = new BooleanProperty( false );

  // Flip across the y axis, flipping x values
  public static readonly yAxisFlippedProperty = new BooleanProperty( false );

  public static readonly videoStreamDimension2 = new Dimension2( 1280, 720 );

  // the most recent results from MediaPipe
  public static readonly resultsProperty = new Property<MediaPipeResults | null>( null, {
    phetioValueType: NullableIO( MediaPipeResultsIO ),
    tandem: Tandem.GLOBAL_VIEW.createTandem( 'mediaPipe' ).createTandem( 'resultsProperty' ),
    phetioDocumentation: 'A Property that holds the raw data coming from MediaPipe. Set to null if there are no hands detected.'
  } );

  /**
   * Initialize mediaPipe by loading all needed scripts, and initializing hand tracking.
   * Store results of tracking to MediaPipe.results.
   */
  public static initialize( providedOptions?: MediaPipeInitializeOptions ): void {
    assert && assert( !initialized );
    assert && assert( document.body, 'a document body is needed to attache imported scripts' );
    initialized = true;

    const options = optionize<MediaPipeInitializeOptions>()( {
      fromLocalDependency: false,
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.2,
      minTrackingConfidence: 0.2
    }, providedOptions );

    ( async () => { // eslint-disable-line @typescript-eslint/no-floating-promises

      // Populate the available video devices that MediaPipe can use, then select one to initiate the MediaPipe stream
      if ( navigator.mediaDevices ) {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        for ( let i = 0; i < mediaDevices.length; i++ ) {
          const mediaDevice = mediaDevices[ i ];
          if ( mediaDevice.kind === 'videoinput' ) {
            MediaPipe.availableDevices.push( mediaDevice );
          }
        }
      }
      if ( MediaPipe.availableDevices.length > 0 ) {
        MediaPipe.selectedDeviceProperty.value = MediaPipe.availableDevices[ 0 ].deviceId;
      }
    } )();

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

    assert && options.fromLocalDependency && assert( window.mediaPipeDependencies, 'mediaPipeDependencies expected to load mediaPipe' );

    const hands = new window.Hands( {
      locateFile: ( file: string ) => {
        if ( options.fromLocalDependency ) {

          assert && assert( window.mediaPipeDependencies.hasOwnProperty( file ), `file not in mediaPipeDependencies: ${file}` );
          return window.mediaPipeDependencies[ file ];
        }
        else {

          // use a cdn
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
        }
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

    // @ts-expect-error - nonstandard global on window.navigator
    if ( window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia ) {

      // Don't send the same video time twice
      let currentTime = -1;

      // Don't send while already sending data to hands
      let handsSending = false;

      let animationFrameCounter = 0;

      animationFrameTimer.addListener( async () => {

        animationFrameCounter = ++animationFrameCounter % 100000000;

        if ( animationFrameCounter % MediaPipeQueryParameters.cameraFrameResolution !== 0 ) {
          return;
        }

        // We need to be careful here. Hands does not want to be sent "bad" data. This includes:
        // * Currently waiting for hands.send to resolve
        // * There isn't a videoElement that is playing
        // * There isn't a videoElement with a stream attached to it (thus no image data)
        // * Duplicating the "send" call on the same frame would be redundant
        if ( !handsSending && videoPlaying && videoElement.srcObject &&
             videoElement.currentTime !== currentTime && !failedOnFrame ) {
          currentTime = videoElement.currentTime;

          videoElement.width = videoElement.videoWidth * CAMERA_IMAGE_RESOLUTION_FACTOR;
          videoElement.height = videoElement.videoHeight * CAMERA_IMAGE_RESOLUTION_FACTOR;

          try {
            handsSending = true;
            await hands.send( { image: videoElement } );
            handsSending = false;
          }
          catch( e ) {
            console.error( 'Internet trouble:', e );
            MediaPipe.showOopsDialog( TangibleStrings.cameraInputRequiresInternetStringProperty );
            failedOnFrame = true;
          }
        }
      } );

      MediaPipe.selectedDeviceProperty.lazyLink( deviceID => {
        if ( videoElement.srcObject ) {
          MediaPipe.stopStream( videoElement );
        }
        MediaPipe.startStream( videoElement, deviceID );
      } );
    }

    else {
      console.error( 'no navigator.mediaDevices detected' );
      MediaPipe.showOopsDialog( TangibleStrings.noMediaDevicesStringProperty );
    }
  }

  private static stopStream( videoElement: HTMLVideoElement ): void {
    if ( videoElement.srcObject instanceof MediaStream ) {
      const tracks = videoElement.srcObject.getTracks();

      for ( let i = 0; i < tracks.length; i++ ) {
        tracks[ i ].stop();
      }
    }
    videoElement.srcObject = null;
    videoPlaying = false;
  }

  private static startStream( videoElement: HTMLVideoElement, deviceID: string ): void {
    const constraints = {
      video: {
        facingMode: 'user',
        width: MediaPipe.videoStreamDimension2.width,
        height: MediaPipe.videoStreamDimension2.height,
        deviceId: ( deviceID && deviceID !== '' ) ? { exact: deviceID } : undefined
      }
    };

    // Load the current desired device

    navigator.mediaDevices.getUserMedia( constraints ).then( stream => {
      videoElement.srcObject = stream;
      videoElement.onloadedmetadata = async () => {
        await videoElement.play();

        // Keep our own data here, because I couldn't find this data on the videoElement itself.
        videoPlaying = true;
      };
    } ).catch( e => {
      console.error( e );
      MediaPipe.showOopsDialog( TangibleStrings.noMediaDeviceStringProperty );
    } );
  }

  // Display a dialog indicating that the MediaPipe feature is not going to work because it requires internet access.
  private static showOopsDialog( message: TReadOnlyProperty<string> ): void {

    // Waiting for next step ensures we will have a sim to append to the Dialog to.
    stepTimer.runOnNextTick( () => {
      const offlineDialog = new OopsDialog( message, {
        closeButtonListener: () => {
          offlineDialog.hide();
          offlineDialog.dispose();
        },
        title: new Text( TangibleStrings.errorLoadingCameraInputHandsStringProperty, {
          font: new PhetFont( 28 )
        } )
      } );
      offlineDialog.show();
    } );
  }

  /**
   * Update the canvas to the current image
   */
  private static drawToCanvas( canvasElement: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D, image: HTMLCanvasElement ): void {
    assert && assert( canvasContext, 'must have a canvasContext' );
    canvasContext.save();
    canvasContext.translate( canvasElement.width, 0 );
    canvasContext.scale( -1, 1 ); // flip camera for viewing to the user.
    canvasContext.clearRect( 0, 0, canvasElement.width, canvasElement.height );
    canvasContext.drawImage( image, 0, 0, canvasElement.width, canvasElement.height );
    canvasContext.restore();
  }

  public static getMediaPipeOptionsNode(): Node {

    const deviceComboBoxItems = MediaPipe.availableDevices.map( ( device, i ) => {
      const label = device.label || `Camera ${i + 1}`;
      return {
        value: device.deviceId,
        createNode: ( tandem: Tandem ) => new Text( label ),
        a11yName: label
      };
    } );

    // A content Node here allows us to have a list box parent for the ComboBox.
    const content = new Node();

    // If there aren't mediaDevices available, be graceful
    const deviceSelectorNode = MediaPipe.availableDevices.length > 0 ? new ComboBox( MediaPipe.selectedDeviceProperty, deviceComboBoxItems, content, {
      accessibleName: TangibleStrings.inputDeviceStringProperty,
      tandem: Tandem.OPT_OUT
    } ) : new Node();

    const vbox = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new Text( TangibleStrings.cameraInputHandsStringProperty, combineOptions<TextOptions>( {
          tagName: 'h3',
          accessibleName: TangibleStrings.cameraInputHandsStringProperty
        }, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ) ),
        new VoicingText( TangibleStrings.cameraInputHandsHelpTextStringProperty, combineOptions<VoicingTextOptions>( {
          readingBlockNameResponse: StringUtils.fillIn( JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty, {
            label: TangibleStrings.cameraInputHandsStringProperty,
            description: TangibleStrings.cameraInputHandsHelpTextStringProperty
          } )
        }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ) ),
        new HBox( {
          spacing: 10,
          children: [
            new Text( TangibleStrings.inputDeviceStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ),
            deviceSelectorNode
          ]
        } ),
        new VBox( {
          spacing: 5,
          align: 'left',
          layoutOptions: { topMargin: 10 },
          children: [
            new VoicingText( TangibleStrings.troubleshootingCameraInputHandsStringProperty, combineOptions<TextOptions>( {
              tagName: 'h3',
              accessibleName: TangibleStrings.troubleshootingCameraInputHandsStringProperty
            }, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ) ),
            new VoicingRichText( TangibleStrings.troubleshootingParagraphStringProperty, combineOptions<VoicingRichTextOptions>( {
              lineWrap: PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS.maxWidth
            }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ) ),
            new VoicingText( TangibleStrings.cameraInputFlipYHeadingStringProperty, combineOptions<VoicingTextOptions>( {
              layoutOptions: { topMargin: 15 }
            }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ) ),
            new Checkbox( MediaPipe.yAxisFlippedProperty,
              new RichText( TangibleStrings.cameraInputFlipYStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ), {
                voicingNameResponse: TangibleStrings.cameraInputFlipYStringProperty,
                voiceNameResponseOnSelection: false,
                accessibleName: TangibleStrings.cameraInputFlipYStringProperty,
                checkedContextResponse: TangibleStrings.a11y.cameraInputFlipYCheckedStringProperty,
                uncheckedContextResponse: TangibleStrings.a11y.cameraInputFlipYUncheckedStringProperty,
                tandem: Tandem.OPT_OUT
              } ),
            new VoicingText( TangibleStrings.cameraInputFlipXHeadingStringProperty, combineOptions<VoicingTextOptions>( {
              layoutOptions: { topMargin: 10 }
            }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ) ),
            new Checkbox( MediaPipe.xAxisFlippedProperty,
              new RichText( TangibleStrings.cameraInputFlipXStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ), {
                voicingNameResponse: TangibleStrings.cameraInputFlipXStringProperty,
                voiceNameResponseOnSelection: false,
                accessibleName: TangibleStrings.cameraInputFlipXStringProperty,
                checkedContextResponse: TangibleStrings.a11y.cameraInputFlipXCheckedStringProperty,
                uncheckedContextResponse: TangibleStrings.a11y.cameraInputFlipXUncheckedStringProperty,
                tandem: Tandem.OPT_OUT
              } )
          ]
        } )
      ]
    } );

    content.addChild( vbox );
    return content;
  }

}

tangible.register( 'MediaPipe', MediaPipe );
export default MediaPipe;
