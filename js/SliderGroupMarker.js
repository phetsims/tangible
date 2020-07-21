// Copyright 2020, University of Colorado Boulder

/**
 * A class for a slider mechamarkers input group set up to control an AXON/Property
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

// modules
import merge from '../../phet-core/js/merge.js';
import tangible from './tangible.js';

class SliderGroupMarker {

  /**
   *
   * @param {string} inputGroup
   * @param {string} inputName
   * @param {Property.<number>} property
   * @param {Object} [options]
   */
  constructor( inputGroup, inputName, property, options ) {
    options = merge( {

      // {Range} By default use the range from the Property
      range: property.range
    }, options );

    assert && assert( options.range, 'options.range needs to be provided, or Property.range supplied.' );

    // private
    this.inputGroup = inputGroup;
    this.inputName = inputName;
    this.property = property;
    this.range = options.range;
  }

  /**
   * Set the value based on the range of the property
   * @param {number} inputValue - output from mechamarkers, between 0 and 1
   * @private
   */
  setProperty( inputValue ) {
    this.property.value = inputValue * this.property.range.getLength() + this.property.range.min;
  }

  /**
   * Update the state of the slider, setting the Property value if applicable
   * @public
   */
  update() {
    assert && assert( window.hasOwnProperty( 'Mechamarkers' ), 'Mechamarkers should exist as a global' );
    const group = window.Mechamarkers.getGroup( this.inputGroup );
    if ( group && group.anchor.present ) {
      const value = group.getInput( this.inputName ).val;
      this.setProperty( value );
    }
  }
}

tangible.register( 'SliderGroupMarker', SliderGroupMarker );
export default SliderGroupMarker;
