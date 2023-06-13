const shaderSource = `

 attribute vec4 a_position;
        uniform mat4 u_model;
        uniform mat4 u_view;
        uniform vec4 u_color;
        void main() {
          // gl_Position is a special variable a vertex shader
          // is responsible for setting
          gl_Position = u_view*u_model*a_position;
        }
`;

export default shaderSource;