#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_level;
uniform vec3 u_colors[5];

out vec4 outColor;

#define PI 3.14159265

float _sin(float x) {
  return sin(2.0f * PI * x);
}

float _cos(float x) {
  return cos(2.0f * PI * x);
}

void main() {
  vec2 uv = (2.0f * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  float time = u_time / 10.0f;

  vec3 color = vec3(0.0f);

  const float colors = 5.0f;

  for(float index = 0.0f; index < colors; index++) {
    float percent = index / colors;
    float radius = 0.75f + _sin(3.0f * time + percent) * 0.25f;
    vec2 xy = vec2(_cos(time + percent), _sin(time + percent));
    float dist = length(xy - uv) / radius;
    float strength = 1.0f / (1.0f + pow(dist, 4.0f));
    color += strength * u_colors[int(index)] / colors;
  }

  outColor = vec4(color, 1.0f);
}
