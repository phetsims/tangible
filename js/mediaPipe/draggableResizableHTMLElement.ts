// Copyright 2022, University of Colorado Boulder

/**
 * Wire up a draggable/resizable div for the canvas element to live in. Returns that container
 * This code was adapted from https://evangelistagrace.github.io/tutorials/draggable-and-resizable-div.html
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import tangible from '../tangible.js';

const CAPTURE = { capture: true };

const draggableResizableElement = ( htmlElement: HTMLElement ): HTMLElement => {
  const item = document.createElement( 'div' );
  item.classList.add( 'item' );
  item.style.zIndex = '100000';
  item.style.bottom = '0'; // initially put it on the bottom
  const content = document.createElement( 'div' );
  content.classList.add( 'content' );
  content.appendChild( htmlElement );
  item.appendChild( content );

  const createResizer = ( className: string ) => {
    const div = document.createElement( 'div' );
    div.classList.add( 'resizer' );
    div.classList.add( className );
    return div;
  };
  const resizers = [
    createResizer( 'top-left' ),
    createResizer( 'top-right' ),
    createResizer( 'bottom-left' ),
    createResizer( 'bottom-right' )
  ];
  resizers.forEach( resizer => item.appendChild( resizer ) );

  const style = document.createElement( 'style' );
  style.setAttribute( 'id', 'new-animations' );
  style.setAttribute( 'type', 'text/css' );
  document.head.appendChild( style );
  style.innerHTML = `
.item {
    width: 640px;
    height: 350px;
    position: fixed;
    background-color: lightsalmon;
    padding: 4px;
    box-sizing: border-box;
    cursor: move;
  }
.item .content {
    height: 100%;
  }
.item .content h3 {
    text-align: center;
    font-family: Merriweather, serif;
  }

.resizer {
    position: absolute;
    width: 10px;
    height: 10px;
    background: black;
    z-index: 2;
  }
.resizer.top-left {
    top: -1px;
    left: -1px;
    cursor: nw-resize;
  }
.resizer.top-right {
    top: -1px;
    right: -1px;
    cursor: ne-resize;
  }
.resizer.bottom-left {
    bottom: -1px;
    left: -1px;
    cursor: sw-resize;
  }
.resizer.bottom-right {
    bottom: -1px;
    right: -1px;
    cursor: se-resize;
  }
  `;

  const minWidth = 100;
  const minHeight = 100;
  const maxWidth = 900;
  const maxHeight = 900;

  let isResizing = false;


  // Resizers must be first so that the capture in the "item" listener doesn't suck up the event for the resizer
  resizers.forEach( ( resizer: Node ) => {
    resizer.addEventListener( 'pointerdown', ( ( e: PointerEvent ) => {
      e.preventDefault();
      e.cancelBubble = true;

      const prevX = e.clientX;
      const prevY = e.clientY;
      const currentResizer = e.target;
      const rect = item.getBoundingClientRect();
      const prevLeft = rect.left;
      const prevTop = rect.top;
      let newWidth;
      let newHeight;

      isResizing = true;

      const pointermove = ( e: PointerEvent ) => {
        e.preventDefault();

        e.cancelBubble = true;
        const newX = prevX - e.clientX; //negative to the right, positive to the left
        const newY = prevY - e.clientY; //negative to the bottom, positive to the top
        if ( ( currentResizer as Element ).classList.contains( 'bottom-right' ) ) {
          newWidth = rect.width - newX;
          newHeight = rect.height - newY;
          if ( newWidth > minWidth && newWidth < maxWidth ) {
            item.style.width = newWidth + 'px';
          }
          if ( newHeight > minHeight && newHeight < maxHeight ) {
            item.style.height = newHeight + 'px';
          }

        }
        else if ( ( currentResizer as Element ).classList.contains( 'bottom-left' ) ) {
          newWidth = rect.width + newX;
          newHeight = rect.height - newY;

          if ( newWidth > minWidth && newWidth < maxWidth ) {
            item.style.left = prevLeft - newX + 'px';
            item.style.width = newWidth + 'px';
          }
          if ( newHeight > minHeight && newHeight < maxHeight ) {
            item.style.height = newHeight + 'px';
          }
        }
        else if ( ( currentResizer as Element ).classList.contains( 'top-right' ) ) {
          newWidth = rect.width - newX;
          newHeight = rect.height + newY;

          if ( newWidth > minWidth && newWidth < maxWidth ) {
            item.style.width = newWidth + 'px';
          }
          if ( newHeight > minHeight && newHeight < maxHeight ) {
            item.style.top = prevTop - newY + 'px';
            item.style.height = newHeight + 'px';
          }

        }
        else if ( ( currentResizer as Element ).classList.contains( 'top-left' ) ) {
          newWidth = rect.width + newX;
          newHeight = rect.height + newY;

          if ( newWidth > minWidth && newWidth < maxWidth ) {
            item.style.left = prevLeft - newX + 'px';
            item.style.width = newWidth + 'px';
          }
          if ( newHeight > minHeight && newHeight < maxHeight ) {
            item.style.top = prevTop - newY + 'px';
            item.style.height = newHeight + 'px';
          }
        }
      };

      const pointerup = ( e: PointerEvent ) => {
        e.preventDefault();
        e.cancelBubble = true;

        isResizing = false;
        window.removeEventListener( 'pointermove', pointermove, CAPTURE );
        window.removeEventListener( 'pointerup', pointerup, CAPTURE );
      };

      window.addEventListener( 'pointermove', pointermove, CAPTURE );
      window.addEventListener( 'pointerup', pointerup, CAPTURE );
    } ) as EventListener, CAPTURE );
  } );


  item.addEventListener( 'pointerdown', ( e: PointerEvent ) => {
    if ( !( e.target && ( e.target as Element ).classList.contains( 'resizer' ) ) ) {
      e.preventDefault();
      e.cancelBubble = true;
    }

    //get the initial mouse coordinates and the position coordinates of the element
    const prevX = e.clientX;
    const prevY = e.clientY;
    const rect = content.getBoundingClientRect();
    const prevLeft = rect.left;
    const prevTop = rect.top;

    const pointermove = ( e: PointerEvent ) => {

      if ( isResizing ) {
        return;
      }
      e.preventDefault();
      e.cancelBubble = true;

      //get horizontal and vertical distance of the mouse move
      const newX = prevX - e.clientX; //negative to the right, positive to the left
      const newY = prevY - e.clientY; //negative to the bottom, positive to the top

      //set coordinates of the element to move it to its new position
      item.style.left = prevLeft - newX + 'px';
      item.style.top = prevTop - newY + 'px';
    };

    const pointerup = ( e: PointerEvent ) => {
      e.preventDefault();
      e.cancelBubble = true;

      window.removeEventListener( 'pointermove', pointermove, CAPTURE );
      window.removeEventListener( 'pointerup', pointerup, CAPTURE );
    };
    window.addEventListener( 'pointermove', pointermove, CAPTURE );
    window.addEventListener( 'pointerup', pointerup, CAPTURE );
  }, CAPTURE );

  return item;
};


tangible.register( 'draggableResizableElement', draggableResizableElement );
export default draggableResizableElement;
