#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

const float levels = 4.0f;
const float scale = 0.7071f * 3.0f;
const float angle = 360.0f / 8.0f;
const float zoom = 3.0f;
const float speed = 0.1f;

vec2 rotate(vec2 xy, float degrees) {
  float c = cos(radians(degrees));
  float s = sin(radians(degrees));
  mat2 rot = mat2(c, -s, s, c);
  return rot * xy;
}

float doublesmooth(float edge0, float edge1, float edge2, float edge3, float x) {
  if(x >= edge1 && x <= edge2)
    return 1.0f;
  if(x >= edge0 && x <= edge1)
    return smoothstep(edge0, edge1, x);
  if(x >= edge2 && x <= edge3)
    return smoothstep(edge3, edge2, x);
  return 0.0f;
}

void main() {
  vec2 xy = (2.0f * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  xy /= zoom;
  float time = u_time * speed;
  float fromCenter = length(xy);
  outColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);
  float thickness = 0.002f;
  float smoothing = 0.001f;
  for(float level = 0.0f; level < levels; level++) {
    float depth = level / levels;
    xy = fract(xy * scale) - 0.5f;
    xy = rotate(xy, angle);
    thickness *= scale;
    smoothing *= scale;
    float dist = max(abs(xy.x), abs(xy.y));
    dist = mod(dist - time + depth, 1.0f);
    float bright = doublesmooth(0.5f - thickness - smoothing, 0.5f - thickness, 0.5f + thickness, 0.5f + thickness + smoothing, dist);
    outColor += vec4(bright);
  }
}