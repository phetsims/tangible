// Copyright 2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import tangible from './tangible.js';

type StringsType = {
  'tangible': {
    'title': string;
    'titleStringProperty': TReadOnlyProperty<string>;
  };
  'cameraInputHands': string;
  'cameraInputHandsStringProperty': TReadOnlyProperty<string>;
  'inputDevice': string;
  'inputDeviceStringProperty': TReadOnlyProperty<string>;
  'cameraInputRequiresInternet': string;
  'cameraInputRequiresInternetStringProperty': TReadOnlyProperty<string>;
  'noMediaDevices': string;
  'noMediaDevicesStringProperty': TReadOnlyProperty<string>;
  'noMediaDevice': string;
  'noMediaDeviceStringProperty': TReadOnlyProperty<string>;
  'errorLoadingCameraInputHands': string;
  'errorLoadingCameraInputHandsStringProperty': TReadOnlyProperty<string>;
  'cameraInputHandsHelpText': string;
  'cameraInputHandsHelpTextStringProperty': TReadOnlyProperty<string>;
};

const tangibleStrings = getStringModule( 'TANGIBLE' ) as StringsType;

tangible.register( 'tangibleStrings', tangibleStrings );

export default tangibleStrings;
