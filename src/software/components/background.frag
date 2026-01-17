#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

const float _levels = 7.0f;
const float _thickness = 2.0f;
const float _dist = 600.0f;
const float _gap = 100.0f;
const float _dash = 20.0f;
const float _delay = -0.25f;
const float _speed = 0.1f;
const float _stagger = 0.01f;
const float _strokePoint = 0.0f;
const float _fadePoint = 0.5f;
const float _endPoint = 0.75f;

const float _length = 2.0f * (_dist + (_levels) * _gap);
const float _diagDist = _dist * sqrt(2.0f);
const float _diagGap = _gap * sqrt(2.0f);

// sin in degrees
float _sin(float deg) {
  return sin(radians(deg));
}

// cos in degrees
float _cos(float deg) {
  return cos(radians(deg));
}

// perpendicular distance from point to line
float distToLine(vec2 start, vec2 direction, vec2 point) {
  return length(cross(vec3(direction, 0.0f), vec3(point - start, 0.0f))) / length(direction);
}

// distance along line from line start to point's projection on line
float distAlongLine(vec2 start, vec2 direction, vec2 point) {
  return dot(point - start, normalize(direction));
}

void main() {
  // center coordinates
  vec2 xy = gl_FragCoord.xy - u_resolution.xy * 0.5f;
  // squish y axis
  xy.y *= 2.0f;

  // time
  float time = u_time * _speed + _delay;

  // skip pixels in center area
  if(abs(xy.x) + abs(xy.y) < _diagDist - _thickness)
    return;
  // skip pixels not near diagonal line
  float diag1 = xy.x + xy.y;
  float diag2 = xy.x - xy.y;
  if(!(mod(diag1, _diagGap) < _thickness || mod(-diag1, _diagGap) < _thickness || mod(diag2, _diagGap) < _thickness || mod(-diag2, _diagGap) < _thickness))
    return;

  // angle of line
  float angle = 45.0f;
  // distance of line from center
  float dist = _dist;

  // how much to offset each line animation
  float stagger = 0.0f;

  // each level of lines
  for(float level = 0.0f; level < _levels; level++) {
    for(float line = 0.0f; line < 4.0f; line++) {
      // start vector of line
      vec2 start = vec2(_cos(angle) * dist, _sin(angle) * dist);
      // direction vector of line
      vec2 direction = vec2(_cos(angle - 90.0f), _sin(angle - 90.0f));
      // back up to center line
      start -= direction * (_length / 2.0f);

      // compute distances
      float toLine = distToLine(start, direction, xy);
      float alongLine = distAlongLine(start, direction, xy);

      // inc stagger
      stagger += _stagger;
      // how far along in animation are we, from 0 to 1
      float phase = time + stagger;
      phase = max(phase, 0.0f);
      phase = mod(phase, 1.0f);

      // animate length
      float animLength = _length * smoothstep(_strokePoint, _fadePoint, phase);
      // animate fade alpha
      float animFade = smoothstep(_endPoint, _fadePoint, phase);

      // draw conditions
      bool inThickness = toLine < _thickness / 2.0f;
      bool inLength = alongLine > 0.0f && alongLine < animLength;
      bool inDash = mod(level, 2.0f) == 0.0f ? true : mod(alongLine, _dash) / _dash < 0.25f;

      // draw line segment
      if(inThickness && inLength && inDash)
        outColor += animFade;

      // rotate line
      angle += 90.0f;
    }

    // expand lines
    dist += _gap;
  }
}