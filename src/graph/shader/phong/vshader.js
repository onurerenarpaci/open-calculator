const shaderSource = `

attribute vec4 vPosition;
attribute vec3 vNormal; // output values that will be interpolated per-fragment 

varying vec3 fN;
varying vec3 fV;
varying vec3 fL;

uniform mat4 ModelView;
uniform mat4 Transformation;
uniform vec4 LightPosition;
uniform mat4 Projection;

void main() {
    vec3 pos = (ModelView * Transformation * vPosition).xyz;
    
    fN = (transpose(inverse(ModelView * Transformation)) * vec4(vNormal, 0.0)).xyz;
    
    fV = -pos;
    
    fL = (ModelView*LightPosition).xyz;
    
    if((ModelView*LightPosition).w != 0.0)
        fL = (ModelView*LightPosition).xyz - pos;
    
    gl_Position = Projection * ModelView * Transformation * vPosition;
}
`;

export default shaderSource;