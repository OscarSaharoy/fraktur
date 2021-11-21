// Oscar Saharoy 2021


const c_mul  = ( z1, z2 ) => v3( z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x, 0 );
const c_sqr  = ( z )      => v3( z.x * z.x - z.y * z.y, 2.0 * z.x * z.y, 0 );
const c_mod2 = ( z )      => z.x*z.x + z.y*z.y;

// get the svg and path
const orbitSvg  = document.querySelector( "svg"    );
const orbitPath = document.querySelector( "#orbit" );


function updateOrbit( c ) {

	let orbit = [ `M${c.x} ${-c.y}` ];

	const iterations = 300;
	const R2         = 10000;

	let z   = c.clone();
	let der = v3( 1, 0, 0 );

	for( let i = 0; i < iterations; ++i ) {

		der = c_mul( der.multiplyScalar(2), z);
		z   = c_sqr( z ).add( c );

		orbit.push( `L${z.x} ${-z.y}` );

		if( c_mod2(z) > R2 || c_mod2(der) < 1e-8 )
			break;
 	}

 	const orbitString = orbit.join(" ");
	orbitPath.setAttribute('d', orbitString );
}


function updateOrbitViewBox() {

	const minX   = toEqnSpace( v3(-uniforms.iResolution.value.x/2, uniforms.iResolution.value.y/2, 0) ).x;
	const minY   = -toEqnSpace( v3(-uniforms.iResolution.value.x/2, uniforms.iResolution.value.y/2, 0) ).y;
	const width  = uniforms.iResolution.value.x * uniforms.zoom.value / uniforms.iResolution.value.x;
	const height = uniforms.iResolution.value.y * uniforms.zoom.value / uniforms.iResolution.value.x;

	const viewBoxString = `${minX} ${minY} ${width} ${height}`;

	orbitSvg.setAttribute( "viewBox", viewBoxString );
	orbitPath.style.strokeWidth = width * 2e-3;
}
