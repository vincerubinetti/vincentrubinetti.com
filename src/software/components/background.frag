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

const float _levels = 12.0f;
const float _thickness = 2.0f;
const float _gap = 100.0f;
const float _dist = 500.0f;
const float _dash = 1.0f / 64.0f;
const float _length = 2000.0f * sqrt(2.0f);
const float _delay = 0.1f;
const float _speed = 0.1f;
const float _stagger = -0.5f;
const float _strokePoint = 0.0f;
const float _fadePoint = 0.75f;

const float _diagGap = _gap * sqrt(2.0f);
const float _double = 2.0f * _thickness;

void main() {
  // center coordinates
  vec2 xy = gl_FragCoord.xy - u_resolution.xy * 0.5f;

  // time
  float time = u_time * _speed + _delay;

  // skip pixels not near diagonal line (for performance)
  float diag1 = xy.x + xy.y;
  float diag2 = xy.x - xy.y;
  if(!(mod(diag1, _diagGap) < _double || mod(-diag1, _diagGap) < _double || mod(diag2, _diagGap) < _double || mod(-diag2, _diagGap) < _double)) {
    return;
  }

  // angle of line
  float angle = radians(45.0f);
  // distance of line from center
  float dist = _dist;

  // each level of lines
  for(float level = 0.0f; level < _levels; level++) {
    // percent through levels
    float percent = level / _levels;
    for(float line = 0.0f; line < 4.0f; line++) {
      // start vector of line
      vec2 start = vec2(cos(angle) * dist, sin(angle) * dist);
      // direction vector of line
      vec2 direction = dir(angle - radians(90.0f));
      // back up to center line
      start -= direction * (_length / 2.0f);
      // how far along in animation are we, from 0 to 1
      float phase = time + _stagger * percent;
      phase = max(phase, 0.0f);
      phase = mod(phase, 1.0f);

      // animate length
      float animLength = _length * smoothstep(_strokePoint, _fadePoint, phase);
      // animate fade/alpha
      float animFade = smoothstep(1.0f, _fadePoint, phase);

      // compute distances
      float toLine = distToLine(start, direction, xy);
      float alongLine = distAlongLine(start, direction, xy) / animLength;
      float dashDist = distAlongLine(start, direction, xy) / _length;

      // draw conditions
      bool inThickness = toLine < _thickness;
      bool inLength = alongLine > 0.0f && alongLine < 1.0f;
      bool inDash = true;
      if(mod(level, 4.0f) == 2.0f)
        inDash = mod(dashDist, _dash) < _dash / 2.0f;
      else if(mod(level, 4.0f) == 1.0f || mod(level, 4.0f) == 3.0f)
        inDash = mod(dashDist, _dash) < _dash / 16.0f;

      // draw line segment
      if(inThickness && inLength && inDash) {
        outColor += vec4(animFade);
        break;
      }

      // rotate line
      angle += radians(90.0f);
    }

    // expand lines
    dist += _gap;
  }
}