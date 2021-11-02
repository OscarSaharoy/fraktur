
const canvas   = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas: canvas, preserveDrawingBuffer: true });
renderer.autoClearColor = false;

const camera = new THREE.OrthographicCamera(
    -1, // left
     1, // right
     1, // top
    -1, // bottom
    -1, // near,
     1, // far
);

const scene = new THREE.Scene();
const plane = new THREE.PlaneGeometry(2, 2);
let offset  = { x: 0, y: 0 };
const dpr   = window.devicePixelRatio;

const uniforms = {
    iTime:       { value: 0 },
    iResolution: { value: new THREE.Vector2() },
    offset:      { value: new THREE.Vector2() },
    zoom:        { value: 1 },
    moved:       { value: true },
};

const material = new THREE.ShaderMaterial({
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    transparent: true,
    precision: "highp",
});

scene.add(new THREE.Mesh(plane, material));

function resizeRendererToDisplaySize( renderer ) {

    const width = canvas.clientWidth   * dpr;
    const height = canvas.clientHeight * dpr;

    const needResize = canvas.width !== width || canvas.height !== height;
    
    if( needResize ) {

        renderer.setSize( width, height, false );
        uniforms.iResolution.value.set( canvas.width, canvas.height );
    }
}


function render( time ) {

    time *= 0.001;  // convert to seconds

    panAndZoom();
    resizeRendererToDisplaySize(renderer);

    renderer.render(scene, camera);

    uniforms.iTime.value = time;
    uniforms.moved.value = false;

    requestAnimationFrame(render);
}


function download() {

    const link = document.createElement("a");
    
    link.href = renderer.domElement.toDataURL( "image/jpeg", 0.92 );
    link.download = "image.jpg";
    link.click();
}

document.addEventListener( "keydown", e => e.key == "d" ? download() : 0 );


requestAnimationFrame(render);
