// Oscar Saharoy 2021

const v3      = (x,y,z) => new THREE.Vector3(x, y, z);
const v3zero  = ()      => new THREE.Vector3();
const v3add   = (a,b)   => v3zero().addVectors(a, b);
const v3scale = (a,b)   => v3zero().addScaledVector(a, b);
const v3sub   = (a,b)   => v3zero().subVectors(a, b);
const v3dist  = (a,b)   => a.clone().distanceTo(b);
const v3mod   = a       => a.length();
const v3is0   = a       => Math.abs(a.x * a.y * a.z) < 1e-4;
