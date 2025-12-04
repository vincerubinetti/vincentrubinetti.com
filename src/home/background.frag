#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_mouse_x;
uniform float u_mouse_y;
uniform float u_level;
uniform float u_play;
uniform vec3 u_colors[5];

// number of colors
const float colors = 5.0f;

out vec4 outColor;

#define PI 3.14159265

// sine 0 to 1
float _sin(float x) {
  return sin(2.0f * PI * x);
}

// cosine 0 to 1
float _cos(float x) {
  return cos(2.0f * PI * x);
}

// rotate point around x axis
vec3 rotateX(vec3 p, float a) {
  return vec3(p.x, p.y * _cos(a) - p.z * _sin(a), p.z * _cos(a) + p.y * _sin(a));
}

// rotate point around y axis
vec3 rotateY(vec3 p, float a) {
  return vec3(p.x * _cos(a) - p.z * _sin(a), p.y, p.z * _cos(a) + p.x * _sin(a));
}

// rotate 3d point around z axis
vec3 rotateZ(vec3 p, float a) {
  return vec3(p.x * _cos(a) - p.y * _sin(a), p.y * _cos(a) + p.x * _sin(a), p.z);
}

vec2 outOfBounds = vec2(-1.0f, -1.0f);

// project 3d point to 2d
vec2 project(vec3 p, float d) {
  return p.z > 0.0f ? vec2(p.x * d / p.z, p.y * d / p.z) : outOfBounds;
}

// generate wave pattern
float wave(vec2 xy, float width, float soft, float amp, float freq, float phase) {
  // wave pattern
  float wave_a = _sin(phase + 0.6f * freq * xy.x);
  float wave_b = _sin(phase + 0.1f * freq * xy.x);
  // wav coord
  float y = xy.y + amp * (wave_a + wave_b) / 2.0f;
  // thickness above/below center
  float top = width * _sin(phase + 0.25f * (xy.x));
  float bottom = width * _sin(phase + 0.5f + 0.25f * (xy.x));
  top = clamp(top, 0.001f, 1.0f);
  bottom = clamp(bottom, 0.001f, 1.0f);
  // brightness
  float bright = y > 0.0f ? 1.0f - y / top : 1.0f + y / bottom;
  bright = clamp(bright, 0.0f, 1.0f);
  bright = pow(bright, clamp(soft, 0.0001f, 99.0f));
  return bright;
}

void main() {
  // coord normalized -1 to 1
  vec2 uv = (2.0f * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // rotate "camera"
  vec3 xyz = vec3(uv, 0.5f);
  xyz = rotateZ(xyz, -0.075f);
  // xyz = rotateX(xyz, -u_mouse_y / 32.0f);
  // xyz = rotateY(xyz, u_mouse_x / 32.0f);

  // background lights
  vec3 lights = vec3(0.0f);
  for(float index = 0.0f; index < colors; index++) {
    // percent through colors
    float percent = index / colors;
    // center
    float x = _cos(u_time / 10.0f + percent);
    float y = _sin(u_time / 10.0f + percent);
    vec2 xy = vec2(x, y);
    // soft light
    float radius = 0.75f;
    float dist = length(xy - uv) / radius;
    float bright = 1.0f / (1.0f + pow(dist, 4.0f));
    // composite
    lights += bright * u_colors[int(index)];
  }

  // waves
  vec3 waves = vec3(0.0f);
  for(float index = 0.0f; index < colors; index++) {
    // percent through colors
    float percent = index / colors;
    // coord
    float z = 0.1f + 0.1f * percent;
    vec2 xy = project(xyz, z);
    // wave parameters
    float width = 0.1f;
    float soft = (1.0f - u_level) * 10.0f;
    float amp = 0.05f;
    float freq = 2.0f + 1.0f * percent;
    float phase = 0.1f * u_play - percent;
    float bright = 0.25f * wave(xy, width, soft, amp, freq, phase);
    // composite
    waves += bright * u_colors[int(index)];
  }

  outColor = vec4(lights + waves, 1.0f);
}
