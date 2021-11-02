// Oscar Saharoy 2021


const fragmentShader = `

// ====================================================================================


uniform float iTime;
uniform vec2 iResolution;
uniform vec2 offset;
uniform float zoom;
uniform bool moved;

float noise3D(vec3 p) {

    return fract(sin(dot(p ,vec3(12.9898,78.233,128.852))) * 43758.5453)*2.0-1.0;
}

vec2 c_mul( vec2 z1, vec2 z2 ) {

	return vec2( z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x ); 
}

vec2 c_div( vec2 z1, vec2 z2 ) {

	return vec2( z1.x * z2.x + z1.y * z2.y, z1.y * z2.x - z1.x * z2.y ) / ( z2.x*z2.x + z2.y*z2.y ); 
}

vec2 c_sqr( vec2 z ) {

	return vec2( z.x * z.x - z.y * z.y, 2.0 * z.x * z.y ); 
}


float V( vec2 z, int n ) {

	return log( length(z) ) / pow( 2.0, float(n) );
}

float x( vec2 z, int n, float K ) {

	return log( V(z, n) ) / K;
}

vec3 g( float x ) {

	// if( x == 1.0 ) return vec3(1);

	// return vec3( cos(6.28*x) );

	float ca = 1.0                         * 1.0 / log(2.0);
	float cb = 1.0 / (3.0*pow(2.0,   0.5)) * 1.0 / log(2.0);
	float cc = 1.0 / (7.0*pow(3.0, 0.125)) * 1.0 / log(2.0);

	float r = ( 1.0 - cos( ca*x ) ) / 2.0;
	float g = ( 1.0 - cos( cb*x ) ) / 2.0;
	float b = ( 1.0 - cos( cc*x ) ) / 2.0;

	return vec3( r, g, b );
}


float stripeFunc( vec2 z ) {

	vec3 norm = normalize( z.xyy );
	return 0.2 + 0.8 * length(cross(norm, vec3(1.0,0.0,0.0))); //sin( atan( norm.y, norm.x ) );
}


float mandelbrot( vec2 c ) {

	const int iterations = 300;
	const float R = 10000.0;

	vec2 z = c;
	vec2 der = vec2(1.0, 0.0);
	float angle = stripeFunc(z);
	float lastAngle = angle;

	for( int i=0; i<iterations; ++i ) {

		der = c_mul(der*2.0, z);
		z   = c_sqr(z) + c;

		lastAngle = angle;
		float n = float(i+1);
		angle = ( angle * n + stripeFunc(z) ) / (n+1.0) ;

		if( length(z) > R )
			break;

		if( length(der) < 1e-5 )
      		return 1.0;
 	}

 	if( length(z) < R )
 		return 1.0;

 	// return 0.0;

 	vec2 u = normalize( c_div( z, der ) );
    float light = dot( u, vec2(1,1) ) * 0.2 + 0.6;

    float frac = 1.0 + log2( log(R) / log(length(z)) );
    float smoothedAngle = angle * frac + lastAngle * (1.0 - frac);
    // return smoothedAngle;

	return (light + smoothedAngle) / 2.0;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    // Normalized pixel coordinates (from 0 to 1)
    float aspect = iResolution.x / iResolution.y;
    vec2 uv = ( fragCoord / iResolution.x - vec2( 0.5, 0.5 / aspect ) ) * zoom + offset;
    
    vec3 colour = vec3( mandelbrot(uv) );
    fragColor = vec4( colour, moved ? 1.0 : 0.05 );
}

void main() {

	vec2 jitter = vec2(noise3D(vec3(iTime)), noise3D(vec3(iTime, 2.0, 2.0)) ) * 0.4;
    mainImage( gl_FragColor, gl_FragCoord.xy + jitter );
}




// ====================================================================================

`;
