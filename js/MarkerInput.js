// Copyright 2020, University of Colorado Boulder

/**
 * This file is to prototype mechamarkers as an input controller to a phetsim, see https://github.com/phetsims/a11y-research/issues/153
 *
 * It specifies the Mechamarkers global as a member to reduce global name space access.
 *
 * For usage, most of the time this should be subtyped and then stepped with logic in step that monitors the state of
 * the marker control via the Mechamarkers global.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

// modules
import stepTimer from '../../axon/js/stepTimer.js';
import Features from '../../scenery/js/util/Features.js';
import '../../sherpa/lib/mechamarkers-21f16221e414ec2dca68bbfbb866369eea7abd70.js';
import tangible from './tangible.js';

// This flag keeps Mechamarkers from being implemented more than once.
let mechamarkersInitialized = false;

class MarkerInput {

  constructor() {

    // @protected (read-only) {Mechamarkers} - instead of using the global, this allows to keep encapsulation better.
    this.Mechamarkers = window.Mechamarkers;

    // the Mechamarkers library only needs to be initialized once. If another instance has already done this, then don't
    // do it again.
    if ( !mechamarkersInitialized ) {

      stepTimer.addListener( () => {

        // Mechamarkers stuff
        this.Mechamarkers.update( Date.now() );
      } );

      const canvas = document.createElement( 'canvas' );

      // push it off screen and disable user input so that it cannot be selected on Safari, see
      // https://github.com/phetsims/ratio-and-proportion/issues/39
      canvas.style.position = 'absolute';
      canvas.style.left = '-10000px';
      canvas.style.right = '-10000px';
      canvas.style[ Features.userSelect ] = 'none';

      const ctx = canvas.getContext( '2d' );
      document.body.appendChild( canvas );
      this.Mechamarkers.init( canvas, ctx );

      mechamarkersInitialized = true;
    }
  }
}

tangible.register( 'MarkerInput', MarkerInput );
export default MarkerInput;
