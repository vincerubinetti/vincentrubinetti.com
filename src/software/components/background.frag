#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

// angle to direction vector
vec2 dir(float direction) {
  return vec2(cos(direction), sin(direction));
}

// perpendicular distance from point to line
float distToLine(vec2 start, vec2 direction, vec2 point) {
  return length(cross(vec3(direction, 0.0f), vec3(point - start, 0.0f))) / length(direction);
}

// distance along line from line start to point's projection on line
float distAlongLine(vec2 start, vec2 direction, vec2 point) {
  return dot(point - start, normalize(direction));
}

// simple random float from -1 to 1
float randFloat(vec2 seed) {
  return -1.0f + 2.0f * fract(sin(dot(seed, vec2(12.9898f, 78.233f))) * 43758.5453f);
}

// random vec2
vec2 rand(vec2 seed) {
  return vec2(randFloat(seed), randFloat(seed + 1.0f));
}

const float _thickness = 2.0f;
const float _length = 5000.0f;
const float _levels = 50.0f;
const float _gap = 100.0f;
const float _jitter = 10.0f;

const float _diagGap = _gap * sqrt(2.0f);

void main() {
  // center coordinates
  vec2 xy = gl_FragCoord.xy - u_resolution.xy * 0.5f;

  // skip pixels not near diagonal line (for performance)
  float diag1 = xy.x + xy.y;
  float diag2 = xy.x - xy.y;
  if(!(mod(diag1, _diagGap) < _jitter || mod(-diag1, _diagGap) < _jitter || mod(diag2, _diagGap) < _jitter || mod(-diag2, _diagGap) < _jitter)) {
    return;
  }

  // angle of line
  float angle = radians(45.0f);
  // distance of line from center
  float dist = 400.0f;

  // each level of lines
  for(float level = 1.0f; level <= _levels; level++) {
    // start vector of line
    vec2 start = vec2(cos(angle) * dist, sin(angle) * dist);
    // direction vector of line
    vec2 direction = dir(angle - radians(90.0f));
    // back up to center line
    start -= direction * (_length / 2.0f);
    // how far along in animation are we, from 0 to 1
    float phase = mod(0.5f - 0.5f * level / _levels + 0.1f * u_time, 1.0f);
    // animate length
    float animLength = _length * smoothstep(0.5f, 0.8f, phase);
    // animate jitter
    float animJitter = _jitter * smoothstep(0.8f, 0.5f, phase);
    // animate fade/alpha
    float animFade = smoothstep(1.0f, 0.8f, phase);
    // offset coord by jitter
    vec2 point = xy + rand(xy) * animJitter;

    // compute distances
    float toLine = distToLine(start, direction, point);
    float alongLine = distAlongLine(start, direction, point) / animLength;

    // draw line segment
    if(toLine < _thickness && alongLine > 0.0f && alongLine < 1.0f)
      outColor += vec4(animFade);

    // increment line
    angle += radians(90.0f);
    if(mod(level, 4.0f) == 0.0f)
      dist += _gap;
  }
}