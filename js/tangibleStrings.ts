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
    'titleProperty': TReadOnlyProperty<string>;
  };
  'cameraInputHands': string;
  'cameraInputHandsProperty': TReadOnlyProperty<string>;
  'inputDevice': string;
  'inputDeviceProperty': TReadOnlyProperty<string>;
  'cameraInputRequiresInternet': string;
  'cameraInputRequiresInternetProperty': TReadOnlyProperty<string>;
  'noMediaDevices': string;
  'noMediaDevicesProperty': TReadOnlyProperty<string>;
  'noMediaDevice': string;
  'noMediaDeviceProperty': TReadOnlyProperty<string>;
  'errorLoadingCameraInputHands': string;
  'errorLoadingCameraInputHandsProperty': TReadOnlyProperty<string>;
  'cameraInputHandsHelpText': string;
  'cameraInputHandsHelpTextProperty': TReadOnlyProperty<string>;
};

const tangibleStrings = getStringModule( 'TANGIBLE' ) as StringsType;

tangible.register( 'tangibleStrings', tangibleStrings );

export default tangibleStrings;
