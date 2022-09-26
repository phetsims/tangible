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
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'cameraInputHands': string;
  'cameraInputHandsStringProperty': LinkableProperty<string>;
  'inputDevice': string;
  'inputDeviceStringProperty': LinkableProperty<string>;
  'cameraInputRequiresInternet': string;
  'cameraInputRequiresInternetStringProperty': LinkableProperty<string>;
  'noMediaDevices': string;
  'noMediaDevicesStringProperty': LinkableProperty<string>;
  'noMediaDevice': string;
  'noMediaDeviceStringProperty': LinkableProperty<string>;
  'errorLoadingCameraInputHands': string;
  'errorLoadingCameraInputHandsStringProperty': LinkableProperty<string>;
  'cameraInputHandsHelpText': string;
  'cameraInputHandsHelpTextStringProperty': LinkableProperty<string>;
};

const TangibleStrings = getStringModule( 'TANGIBLE' ) as StringsType;

tangible.register( 'TangibleStrings', TangibleStrings );

export default TangibleStrings;
