// Copyright 2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import tangible from './tangible.js';

type StringsType = {
  'tangible': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'cameraInputHandsStringProperty': LinkableProperty<string>;
  'inputDeviceStringProperty': LinkableProperty<string>;
  'cameraInputRequiresInternetStringProperty': LinkableProperty<string>;
  'noMediaDevicesStringProperty': LinkableProperty<string>;
  'noMediaDeviceStringProperty': LinkableProperty<string>;
  'errorLoadingCameraInputHandsStringProperty': LinkableProperty<string>;
  'cameraInputHandsHelpTextStringProperty': LinkableProperty<string>;
  'cameraInputFlipXStringProperty': LinkableProperty<string>;
  'cameraInputFlipXHeadingStringProperty': LinkableProperty<string>;
  'cameraInputFlipYStringProperty': LinkableProperty<string>;
  'cameraInputFlipYHeadingStringProperty': LinkableProperty<string>;
  'troubleshootingCameraInputHandsStringProperty': LinkableProperty<string>;
  'troubleshootingParagraphStringProperty': LinkableProperty<string>;
  'a11y': {
    'cameraInputFlipXCheckedStringProperty': LinkableProperty<string>;
    'cameraInputFlipXUncheckedStringProperty': LinkableProperty<string>;
    'cameraInputFlipYCheckedStringProperty': LinkableProperty<string>;
    'cameraInputFlipYUncheckedStringProperty': LinkableProperty<string>;
  }
};

const TangibleStrings = getStringModule( 'TANGIBLE' ) as StringsType;

tangible.register( 'TangibleStrings', TangibleStrings );

export default TangibleStrings;
