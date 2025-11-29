#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.14159265

#define PI 3.14159265

float _sin(float x) {
  return sin(2.0 * PI * x);
}

float _cos(float x) {
  return cos(2.0 * PI * x);
}

vec3 rotateX(vec3 v, float a) {
  return vec3(v.x, v.y * _cos(a) - v.z * _sin(a), v.z * _cos(a) + v.y * _sin(a));
}

vec3 rotateY(vec3 v, float a) {
  return vec3(v.x * _cos(a) - v.z * _sin(a), v.y, v.z * _cos(a) + v.x * _sin(a));
}

vec3 rotateZ(vec3 v, float a) {
  return vec3(v.x * _cos(a) - v.y * _sin(a), v.y * _cos(a) + v.x * _sin(a), v.z);
}

vec2 outOfBounds = vec2(-1.0, -1.0);

vec2 project(vec3 p, float d) {
  return p.z > 0.0 ? vec2(p.x * d / p.z, p.y * d / p.z) : outOfBounds;
}

vec4 wave(vec2 xy, float amp, float freq, float phase) {
  float wave1a = _sin(phase + 0.4 * freq * xy.x);
  float wave1b = _sin(phase + 0.2 * freq * xy.x);
  float y = clamp(xy.y + amp * (wave1a + wave1b) / 2.0, -1.0, 1.0);
  float wave2a = _sin(phase + 0.2 * freq * xy.x);
  float wave2b = _sin(phase + 0.1 * freq * xy.x);
  float thicknessBalance = 0.5 * (wave2a + wave2b) / 2.0;
  thicknessBalance = 0.5 + _sin(0.25 * (u_time + xy.x)) * thicknessBalance;
  float topThickness = 0.5 * pow(1.0 - thicknessBalance, 3.0);
  float bottomThickness = 0.25 * pow(thicknessBalance, 3.0);
  topThickness = clamp(topThickness, 0.01, 1.0);
  bottomThickness = clamp(bottomThickness, 0.01, 1.0);
  float brightness = y > 0.0 ? 1.0 - y / topThickness : 1.0 + y / bottomThickness;
  brightness = clamp(brightness, 0.0, 1.0);
  return vec4(vec3(brightness), 1.0);
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

  float layers = 3.0;
  for(float layer = 0.0; layer < 3.0; layer += 1.0) {
    float percent = layer / layers;
    float z = 1.0;
    vec3 xyz = vec3(uv, z);
    xyz = rotateX(xyz, 0.05 * _sin(u_time / 7.0));
    xyz = rotateY(xyz, 0.05 * _sin(u_time / 11.0));
    xyz = rotateZ(xyz, u_time / 100.0);
    vec2 xy = project(xyz, z);
    float amp = 0.75;
    float freq = 0.5 + percent;
    float phase = u_time * (0.5 + percent) / 10.0;
    vec4 brightness = wave(xy, amp, freq, phase);
    color += brightness;
  }

  gl_FragColor = color / layers / 2.0;
}
