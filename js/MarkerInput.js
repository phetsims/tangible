// Copyright 2020, University of Colorado Boulder

/**
 * This file is to prototype mechamarkers as an input controller to a phetsim, see https://github.com/phetsims/a11y-research/issues/153
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

// modules
import tangible from './tangible.js';
import timer from '../../axon/js/timer.js';

class MarkerInput {

  /**
   * @param {function(Mechamarkers)} updateFunction
   */
  static init( updateFunction ) {

    function update() {

      // Mechamarkers stuff
      window.Mechamarkers.update( Date.now() );

      updateFunction( window.Mechamarkers );

    }

    timer.addListener( update );

    const canvas = document.createElement( 'canvas' );
    const ctx = canvas.getContext( '2d' );
    document.body.appendChild( canvas );
    window.Mechamarkers.init( canvas, ctx );
  }
}

tangible.register( 'MarkerInput', MarkerInput );
export default MarkerInput;
