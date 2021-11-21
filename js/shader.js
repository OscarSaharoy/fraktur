// Oscar Saharoy 2021


const fragmentShader = `

// ====================================================================================


uniform float iTime;
uniform vec2 iResolution;
uniform vec2 offset;
uniform float zoom;
uniform bool moved;


vec2 noise2(float p) {

    return fract(sin(cross(vec3(p), vec3(12.9898,78.233,128.852)).xy) * 43758.5453) * 2.0 - 1.0;
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

	return ( log( log( length(z) ) ) - float(n)*log( 2.0 ) ) / K;
}

vec3 hsv2rgb(vec3 c) {

    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 g( float x ) {

	if( x == 1.0 ) return vec3(1);

	float s = 0.5; // + cos( 0.32*x )*0.1;
	float v = 1.0; // + cos( 0.32*x )*0.1;
	float m = 0.85 + cos(0.32*x) * 0.2;

	return hsv2rgb( vec3(0.5, s, v) ) * m;
}


float stripeFunc( vec2 z ) {

	vec3 norm = normalize( z.xyy );
	return length( cross(norm, vec3(1.0, 0.0, 0.0)) );
}


vec3 mandelbrot( vec2 c ) {

	const int iterations = 300;
	const float R = 10000.0;

	vec2 z = c;
	vec2 der = vec2( 1.0, 0.0 );
	float lastAngle;
	float angle = stripeFunc(z);
	int i;

	for( i=0; i<iterations; ++i ) {

		der = c_mul(der*2.0, z);
		// z   = c_sqr(z) + vec2(-0.80,-0.17); // julia
		z   = c_sqr(z) + c;

		lastAngle = angle;
		angle = stripeFunc(z) * 0.05 + angle * 0.95;

		if( length(z) > R )
			break;

		if( length(der) < 1e-5 )
      		return vec3(1.0);
 	}

 	if( length(z) < R )
 		return vec3(1.0);


    float frac = 1.0 + log2( log(R) / log(length(z)) );
    float streaks = angle * frac + lastAngle * (1.0 - frac);

    // return vec3(streaks);

 	vec2 u = normalize( c_div( z, der ) );
    float lambert = dot( u, vec2(0.71,0.71) ) * 0.25 + 0.75;

    // return vec3(lambert);

    float oscillations = sin( x(z, i, 1.0) * 0.32 ) * 0.2 + 0.95;

    float scaledLight = lambert * streaks * oscillations;
    scaledLight = scaledLight + 0.9*scaledLight*scaledLight;
    
    vec3 colour = hsv2rgb( vec3(0.5, 0.5, 1.0) );

	return colour * scaledLight;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    // Normalized pixel coordinates (from 0 to 1)
    float aspect = iResolution.x / iResolution.y;
    vec2 uv = ( fragCoord / iResolution.x - vec2( 0.5, 0.5 / aspect ) ) * zoom + offset;
    
    vec3 colour = mandelbrot(uv);
    fragColor = vec4( colour, moved ? 1.0 : 0.05 );
}


void main() {

	vec2 jitter = noise2(iTime) * 0.4;
    mainImage( gl_FragColor, gl_FragCoord.xy + jitter );
}




// ====================================================================================

`;
