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
import tangible from './tangible.js';
import timer from '../../axon/js/timer.js';

// This flag keeps Mechamarkers from being implemented more than once.
let mechamarkersInitialized = false;

class MarkerInput {

  constructor() {

    // @protected (read-only) {Mechamarkers} - instead of using the global, this allows to keep encapsulation better.
    this.Mechamarkers = window.Mechamarkers;

    // the Mechamarkers library only needs to be initialized once. If another instance has already done this, then don't
    // do it again.
    if ( !mechamarkersInitialized ) {

      timer.addListener( () => {

        // Mechamarkers stuff
        this.Mechamarkers.update( Date.now() );
      } );

      const canvas = document.createElement( 'canvas' );
      const ctx = canvas.getContext( '2d' );
      document.body.appendChild( canvas );
      this.Mechamarkers.init( canvas, ctx );

      mechamarkersInitialized = true;
    }
  }
}

tangible.register( 'MarkerInput', MarkerInput );
export default MarkerInput;
