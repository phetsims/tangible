// Copyright 2022-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import tangible from './tangible.js';

type StringsType = {
  'tangible': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'cameraInputHandsStringProperty': LocalizedStringProperty;
  'inputDeviceStringProperty': LocalizedStringProperty;
  'cameraInputRequiresInternetStringProperty': LocalizedStringProperty;
  'noMediaDevicesStringProperty': LocalizedStringProperty;
  'noMediaDeviceStringProperty': LocalizedStringProperty;
  'errorLoadingCameraInputHandsStringProperty': LocalizedStringProperty;
  'cameraInputHandsHelpTextStringProperty': LocalizedStringProperty;
  'cameraInputFlipXStringProperty': LocalizedStringProperty;
  'cameraInputFlipXHeadingStringProperty': LocalizedStringProperty;
  'cameraInputFlipYStringProperty': LocalizedStringProperty;
  'cameraInputFlipYHeadingStringProperty': LocalizedStringProperty;
  'troubleshootingCameraInputHandsStringProperty': LocalizedStringProperty;
  'troubleshootingParagraphStringProperty': LocalizedStringProperty;
  'a11y': {
    'cameraInputFlipXCheckedStringProperty': LocalizedStringProperty;
    'cameraInputFlipXUncheckedStringProperty': LocalizedStringProperty;
    'cameraInputFlipYCheckedStringProperty': LocalizedStringProperty;
    'cameraInputFlipYUncheckedStringProperty': LocalizedStringProperty;
    'inputDeviceNameResponsePatternStringProperty': LocalizedStringProperty;
  }
};

const TangibleStrings = getStringModule( 'TANGIBLE' ) as StringsType;

tangible.register( 'TangibleStrings', TangibleStrings );

export default TangibleStrings;
