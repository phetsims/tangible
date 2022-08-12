// Copyright 2022, University of Colorado Boulder

/**
 * Options to control how MediaPipe can be used in the sim.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringProperty from '../../../axon/js/StringProperty.js';


class MediaPipeOptions {
  public selectedDeviceProperty = new StringProperty( '' );
  public availableDevices: MediaDeviceInfo[] = [];

  public constructor() {
    ( async () => { // eslint-disable-line @typescript-eslint/no-floating-promises
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();

      for ( let i = 0; i < mediaDevices.length; i++ ) {
        const mediaDevice = mediaDevices[ i ];
        if ( mediaDevice.kind === 'videoinput' ) {
          this.availableDevices.push( mediaDevice );
        }
      }
      if ( this.availableDevices.length > 0 ) {
        this.selectedDeviceProperty.value = this.availableDevices[ 0 ].deviceId;
      }
    } )();
  }
}

export default MediaPipeOptions;