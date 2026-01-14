#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

const float levels = 4.0f;
const float scale = 2.0f;
const float zoom = 3.0f;
const float speed = 0.1f;

// rotate 2d vec
vec2 rotate(vec2 xy, float degrees) {
  float c = cos(radians(degrees));
  float s = sin(radians(degrees));
  mat2 rot = mat2(c, -s, s, c);
  return rot * xy;
}

// double-sided smoothstep: __a⟋b‾‾c⟍d__
float doublesmooth(float a, float b, float c, float d, float x) {
  if(x >= b && x <= c)
    return 1.0f;
  if(x >= a && x <= b)
    return smoothstep(a, b, x);
  if(x >= c && x <= d)
    return smoothstep(d, c, x);
  return 0.0f;
}

void main() {
  // coord normalized -1 to 1
  vec2 xy = (2.0f * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  float time = u_time * speed - 0.25f;

  // transform scene
  xy /= zoom;
  xy = rotate(xy, 45.0f);

  // line widths
  float thickness = 0.002f;
  float smoothing = 0.002f;

  // ring from center of scene
  float ring = floor(max(abs(xy.x), abs(xy.y)) * 2.0f);
  time -= ring / levels;

  // fractal levels
  for(float level = 0.0f; level < levels; level++) {
    // only go down to level 1 in ring 1, level 2 in ring 2, etc
    if(level >= ring)
      break;
    // fractalize coords
    xy = fract(xy * scale) - 0.5f;
    // scale down line widths with fractal scale
    thickness *= scale;
    smoothing *= scale;
    // square dist from center
    float dist = max(abs(xy.x), abs(xy.y));
    dist -= time + level / levels;
    dist = mod(dist, 1.0f);
    // line brightness
    float line = doublesmooth(0.5f - thickness - smoothing, 0.5f - thickness, 0.5f + thickness, 0.5f + thickness + smoothing, dist);
    // accumulate brightness
    outColor += vec4(line);
  }
}