#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
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

void main() {
  // coord normalized -1 to 1
  vec2 uv = (2.0f * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // starting color
  vec3 color = vec3(0.0f);

  // for each color
  for(float index = 0.0f; index < colors; index++) {
    float percent = index / colors;
    float bright = 0.1f;
    float amp = 0.25f;
    float freq = 1.0f;
    float phase = percent + u_time / 10.0f + u_play / 20.0f;
    float y = uv.y + amp * _cos(-phase + freq * uv.x);
    if(y > 0.0f) {
      float power = 0.25f;
      bright = 1.0f - pow(y, power);
    } else {
      float power = 2.0f;
      bright = pow(-y, power) / 10.0f;
    }
    color += bright * u_colors[int(index)];
  }

  outColor = vec4(color, 1.0f);
}
