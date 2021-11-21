// Oscar Saharoy 2021


// get mean and spread of a list of pointer positions
const getMeanPointer   = arr => arr.reduce( (acc, val) => v3add( acc, v3scale(val, 1/arr.length ) ), v3zero() );
const getPointerSpread = (positions, mean) => positions.reduce( (acc, val) => acc + v3dist( val, mean ), 0 );


// vars to track panning and zooming
let activePointers     = [];
let pointerPositions   = {};
let meanPointer        = v3zero();
let lastMeanPointer    = v3zero();
let stationaryClick    = false;
let pointerSpread      = 0;
let lastPointerSpread  = 0;
let skip1Frame         = false;
let shouldRedraw       = false;


function getPointerPos( event ) {

    // gets the position of the pointer from the event, centered on the canvas center
    const bbox = canvas.getBoundingClientRect();
    return new THREE.Vector3( event.clientX - bbox.left - bbox.width/2, - event.clientY + bbox.top + bbox.height/2, 0 ).multiplyScalar( dpr );
}


function toEqnSpace( p ) {

    return p.multiplyScalar( uniforms.zoom.value / uniforms.iResolution.value.x ).add( uniforms.offset.value );
}


function setPointerMeanAndSpread() {

    // get all the pointer vectors
    const pointers = Object.values( pointerPositions );

    // use functions to find mean and spread and end to end vector (normalised)
    meanPointer   = getMeanPointer( pointers );
    pointerSpread = getPointerSpread( pointers, meanPointer );
}


function pointerdown( event ) {

    // panning the view so prevent default and defocus everything
    event.preventDefault();

    // if its the first pointer down, initiate a statinary click
    if( !activePointers.length ) stationaryClick = true;

    // add the pointer to pointerPositions and activePointers
    pointerPositions[event.pointerId] = getPointerPos(event);
    activePointers.push( event.pointerId );

    // set the mean pointer position so that we have access to the new meanPointer straight away
    setPointerMeanAndSpread();

    // we added a new pointer so skip a frame to prevent
    // a step change in pan position
    skip1Frame = true;
}

function pointermove( event ) {

    // if this pointer isn't an active pointer (pointerdown occured
    // over a preventDrag element) then do nothing
    if( !activePointers.includes(event.pointerId) ) return;

    // this isn't a stationary click so set it to false
    stationaryClick = false;

    // keep track of the pointer pos
    pointerPositions[event.pointerId] = getPointerPos(event);
}

function pointerup( event ) {

    // remove the pointer from active pointers and pointerPositions
    // (does nothing if it wasnt in them)
    activePointers = activePointers.filter( id => id != event.pointerId );
    delete pointerPositions[event.pointerId];

    // a stationary click happened so call out to orbit.js
    // if( !activePointers.length && stationaryClick ) { updateOrbit( toEqnSpace( getPointerPos(event) ) ) }

    // we lost a pointer so skip a frame to prevent
    // a step change in pan position
    skip1Frame = true;
}

function panAndZoom() {

    // if theres no active pointers do nothing
    if( !activePointers.length ) return;

    // set the mean pointer and spread
    setPointerMeanAndSpread();

    // we have to skip a frame when we change number of pointers to avoid a jump
    if( !skip1Frame && !stationaryClick ) {

        // calculate the movement of the mean pointer to use for panning
        // and the difference in pointer spread to use for zooming
        const meanPointerMove = v3sub( meanPointer, lastMeanPointer );
        const pointerSpreadDifference = lastPointerSpread - pointerSpread;

        // adjust the offset global var by the pan distance
        offset.x -= meanPointerMove.x * uniforms.zoom.value / uniforms.iResolution.value.x;
        offset.y -= meanPointerMove.y * uniforms.zoom.value / uniforms.iResolution.value.x;

        // set the offset uniform and the moved uniform
        uniforms.offset.value.set( offset.x, offset.y );
        uniforms.moved.value = true;
            
        // call the wheel function with a constructed event to zoom with pinch
        wheel( { deltaY: pointerSpreadDifference * 2.4 } );

        // updateOrbitViewBox();
    }

    // update the vars to prepare for the next frame
    lastMeanPointer   = meanPointer;
    lastPointerSpread = pointerSpread;
    skip1Frame        = false;
}

function wheel( event ) {

    event.preventDefault?.();

    // limit zoom amount to avoid zooming through the plane
    const zoomAmount = Math.max( -0.2, event.deltaY / 600 );

    // find the zoom centre which is either the mouse pos or mean pointer pos
    const zoomCentre = event.clientX ? getPointerPos( event ) : meanPointer;

    // adjust the offset to keep the zoom center in the same spot on screen
    offset.x -= zoomCentre.x * zoomAmount * uniforms.zoom.value / uniforms.iResolution.value.x;
    offset.y -= zoomCentre.y * zoomAmount * uniforms.zoom.value / uniforms.iResolution.value.x;

    // update the uniforms
    uniforms.offset.value.set( offset.x, offset.y );
    uniforms.zoom.value *= 1 + zoomAmount;
    uniforms.moved.value = true;
        
    // updateOrbitViewBox();
}

// add event listeners to body
document.body.addEventListener( "pointerdown", pointerdown );
document.body.addEventListener( "pointerup"  , pointerup   );
document.body.addEventListener( "pointermove", pointermove );
document.body.addEventListener( "wheel"      , wheel      , {passive: false} );
