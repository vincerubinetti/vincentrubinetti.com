#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

void main() {
  outColor = vec4(0.0f);
}