#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_level;
uniform vec3 u_color_1;
uniform vec3 u_color_2;
uniform vec3 u_color_3;

#define PI 3.14159265

float _sin(float x) {
  return sin(2.0 * PI * x);
}

float _cos(float x) {
  return cos(2.0 * PI * x);
}

void main() {
  vec2 xy = (2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  float t = u_time / 10.0;

  vec3 color = vec3(0.0);

  vec2 a_xy = vec2(_cos(t), _sin(t));
  t += 0.33;
  vec2 b_xy = vec2(_cos(t), _sin(t));
  t += 0.33;
  vec2 c_xy = vec2(_cos(t), _sin(t));

  float r = 1.0;
  float a_strength = clamp(r - length(xy - a_xy), 0.0, 1.0);
  color += a_strength * u_color_1;
  float b_strength = clamp(r - length(xy - b_xy), 0.0, 1.0);
  color += b_strength * u_color_2;
  float c_strength = clamp(r - length(xy - c_xy), 0.0, 1.0);
  color += c_strength * u_color_3;

  gl_FragColor = vec4(color, 1.0);
}
