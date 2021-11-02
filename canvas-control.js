// Oscar Saharoy 2021


const v3zero  = () => new THREE.Vector3();
const v3add   = (a,b) => v3zero().addVectors(a, b);
const v3scale = (a,b) => v3zero().addScaledVector(a, b);
const v3sub   = (a,b) => v3zero().subVectors(a, b);
const v3dist  = (a,b) => a.clone().distanceTo(b);


// get mean and spread of a list of pointer positions
const getMeanPointer   = arr => arr.reduce( (acc, val) => v3add( acc, v3scale(val, 1/arr.length ) ), v3zero() );
const getPointerSpread = (positions, mean) => positions.reduce( (acc, val) => acc + v3dist( val, mean ), 0 );


// vars to track panning and zooming
let activePointers     = [];
let pointerPositions   = {};
let meanPointer        = v3zero();
let lastMeanPointer    = v3zero();
let pointerSpread      = 0;
let lastPointerSpread  = 0;
let skip1Frame         = false;
let shouldRedraw       = false;


function getPointerPos( event ) {

    // gets the position of the pointer from the event, centered on the canvas center
    const bbox = canvas.getBoundingClientRect();
    return new THREE.Vector3( event.clientX - bbox.left - bbox.width/2, event.clientY - bbox.top - bbox.height/2, 0 ).multiplyScalar( dpr );
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

    // keep track of the pointer pos
    pointerPositions[event.pointerId] = getPointerPos(event);
}

function pointerup( event ) {

    // remove the pointer from active pointers and pointerPositions
    // (does nothing if it wasnt in them)
    activePointers = activePointers.filter( id => id != event.pointerId );
    delete pointerPositions[event.pointerId];

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
    if( !skip1Frame ) {

        // calculate the movement of the mean pointer to use for panning
        const meanPointerMove = v3sub( meanPointer, lastMeanPointer );

        // adjust the offset global var by the pan distance
        offset.x -= meanPointerMove.x / uniforms.iResolution.value.x * uniforms.zoom.value;
        offset.y += meanPointerMove.y / uniforms.iResolution.value.x * uniforms.zoom.value;

        // set the offset uniform and the moved uniform
        uniforms.offset.value.set( offset.x, offset.y );
        uniforms.moved.value = true;
            
        // call the wheel function with a constructed event to zoom with pinch
        wheel( { deltaY: (lastPointerSpread - pointerSpread) * 2.4 } );
    }

    // update the vars to prepare for the next frame
    lastMeanPointer    = meanPointer;
    lastPointerSpread  = pointerSpread;
    skip1Frame         = false;
}

function wheel( event ) {

    event.preventDefault?.();

    // limit zoom amount to avoid zooming through the plane
    const zoomAmount = Math.max( -0.2, event.deltaY / 600 );

    // find the zoom centre which is either the mouse pos or mean pointer pos
    const zoomCentre = event.clientX ? getPointerPos( event ) : meanPointer;

    // adjust the offset to keep the zoom center in the same spot on screen
    offset.x -= zoomCentre.x * zoomAmount * uniforms.zoom.value/uniforms.iResolution.value.x;
    offset.y += zoomCentre.y * zoomAmount * uniforms.zoom.value/uniforms.iResolution.value.x;

    // update the uniforms
    uniforms.offset.value.set( offset.x, offset.y );
    uniforms.zoom.value *= 1 + zoomAmount;
    uniforms.moved.value = true;
}

// add event listeners to body
document.body.addEventListener( "pointerdown",  pointerdown );
document.body.addEventListener( "pointerup",    pointerup   );
document.body.addEventListener( "pointerleave", pointerup   );
document.body.addEventListener( "pointermove",  pointermove );
document.body.addEventListener( "wheel",        wheel      , {passive: false} );
