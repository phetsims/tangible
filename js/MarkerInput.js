// Copyright 2020, University of Colorado Boulder

/**
 * This file is to prototype mechamarkers as an input controller to a phetsim, see https://github.com/phetsims/a11y-research/issues/153
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

// modules
import tangible from './tangible.js';
import timer from '../../axon/js/timer.js';

class MarkerInput {

  constructor() {

    // @protected (read-only) {Mechamarkers} - instead of using the global, this allows to keep encapsulation better.
    this.Mechamarkers = window.Mechamarkers;
  }

  /**
   * Must be called to begin Mechamarkers input. This function wires up to listen to when Mechamarkers updates
   * @public
   *
   * @param {function(Mechamarkers)} updateFunction
   */
  beginInput( updateFunction ) {

    timer.addListener( () => {

      // Mechamarkers stuff
      this.Mechamarkers.update( Date.now() );

      updateFunction( this.Mechamarkers );
    } );

    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );
    document.body.appendChild( canvas );
    this.Mechamarkers.init( canvas, ctx );
  }
}

tangible.register( 'MarkerInput', MarkerInput );
export default MarkerInput;
