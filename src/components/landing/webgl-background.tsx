"use client";

import { useEffect, useRef, useCallback } from "react";

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.14159265359
#define TAU 6.28318530718

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

float circuit(vec2 p, float t) {
  vec2 grid = fract(p);
  float lineH = smoothstep(0.96, 0.99, grid.x) + smoothstep(0.01, 0.04, grid.x);
  float lineV = smoothstep(0.96, 0.99, grid.y) + smoothstep(0.01, 0.04, grid.y);
  
  // Animated data pulses on lines
  float pulse1 = smoothstep(0.05, 0.0, abs(fract(p.x * 1.0 + t * 3.0) - 0.5));
  float pulse2 = smoothstep(0.05, 0.0, abs(fract(p.y * 1.0 - t * 2.5) - 0.5));
  
  // Circuit nodes at intersections
  float nodes = 0.0;
  for (float i = -2.0; i <= 2.0; i += 1.0) {
    for (float j = -2.0; j <= 2.0; j += 1.0) {
      vec2 nodePos = floor(p) + vec2(i, j) + 0.5;
      float d = length(p - nodePos);
      float h = hash(nodePos);
      if (h > 0.7) {
        float blink = sin(t * 4.0 + h * 10.0) * 0.5 + 0.5;
        nodes += smoothstep(0.15, 0.0, d) * blink * 0.8;
      }
    }
  }
  
  return (lineH + lineV) * 0.3 + nodes + pulse1 * lineH * 0.5 + pulse2 * lineV * 0.5;
}

float silicon(vec2 p, float t) {
  float n1 = fbm(p * 1.5 + t * 0.1);
  float n2 = fbm(p * 3.0 - t * 0.15);
  float pattern = n1 * 0.6 + n2 * 0.4;
  
  // Etched circuit traces
  float trace1 = smoothstep(0.35, 0.4, abs(sin(p.x * 2.0 + pattern * 3.0)));
  float trace2 = smoothstep(0.35, 0.4, abs(cos(p.y * 1.5 + pattern * 2.0)));
  
  return pattern * 0.5 + trace1 * 0.2 + trace2 * 0.2;
}

vec3 glowLine(vec2 uv, vec2 start, vec2 end, float width, vec3 color, float t) {
  vec2 lineDir = end - start;
  vec2 lineNorm = normalize(vec2(-lineDir.y, lineDir.x));
  float lineLen = length(lineDir);
  vec2 toStart = uv - start;
  float proj = clamp(dot(toStart, lineDir) / (lineLen * lineLen), 0.0, 1.0);
  vec2 closest = start + lineDir * proj;
  float dist = length(uv - closest);
  
  // Traveling light packet
  float packetPos = fract(t * 1.5);
  vec2 packet = start + lineDir * packetPos;
  float packetDist = length(uv - packet);
  float packetGlow = exp(-packetDist * packetDist * 80.0) * 2.0;
  
  float lineGlow = smoothstep(width, 0.0, dist) * 0.8;
  return color * (lineGlow + packetGlow);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;
  
  float t = u_time * 0.4;
  
  // Camera dive effect - zooming into the silicon
  float zoom = 1.0 + t * 0.3;
  vec2 diveP = p * zoom + vec2(t * 0.2, t * 0.15);
  
  // Base abyss
  vec3 col = vec3(0.02, 0.02, 0.02);
  
  // Silicon wafer substrate
  float wafer = silicon(diveP, t);
  col += vec3(0.05, 0.08, 0.10) * wafer * 0.4;
  
  // Circuit grid layer
  float circ = circuit(diveP * 3.0, t);
  col += vec3(0.0, 0.8, 1.0) * circ * 0.35; // cyan circuits
  col += vec3(0.15, 1.0, 0.08) * circ * wafer * 0.2; // neon green on wafer
  
  // High-speed data highways
  vec3 highway = vec3(0.0);
  for (float i = 0.0; i < 8.0; i++) {
    float h = hash(vec2(i, 0.0));
    vec2 start = vec2(h * 4.0 - 2.0, -2.0 + h);
    vec2 end = vec2(h * 3.0 - 1.5, 2.0);
    float speed = 1.0 + h * 2.0;
    vec3 lineColor = h > 0.5 ? vec3(0.0, 0.9, 1.0) : vec3(0.22, 1.0, 0.08);
    highway += glowLine(p, start, end, 0.003 + h * 0.002, lineColor, t * speed + h * 10.0);
  }
  col += highway * 0.6;
  
  // Neon light trails (data streams)
  for (float i = 0.0; i < 5.0; i++) {
    float h = hash(vec2(i + 10.0, 0.0));
    float y = h * 2.0 - 1.0;
    float stream = smoothstep(0.08, 0.0, abs(p.y - y - sin(p.x * 3.0 + t * 2.0 + h * 10.0) * 0.3));
    float travel = smoothstep(0.15, 0.0, abs(fract(p.x * 0.5 - t * (1.0 + h) + h) - 0.5));
    vec3 streamCol = mix(vec3(0.0, 0.9, 1.0), vec3(0.22, 1.0, 0.08), h);
    col += streamCol * stream * travel * 0.8;
  }
  
  // Floating particles
  for (float i = 0.0; i < 20.0; i++) {
    float h1 = hash(vec2(i, 1.0));
    float h2 = hash(vec2(i, 2.0));
    vec2 particlePos = vec2(
      h1 * 3.0 - 1.5 + sin(t * 0.5 + h2 * 10.0) * 0.5,
      h2 * 2.0 - 1.0 + cos(t * 0.3 + h1 * 10.0) * 0.3
    );
    float d = length(p - particlePos);
    float size = 0.003 + hash(vec2(i, 3.0)) * 0.005;
    float brightness = sin(t * 3.0 + h1 * 20.0) * 0.5 + 0.5;
    vec3 pCol = h1 > 0.5 ? vec3(0.0, 0.9, 1.0) : vec3(0.22, 1.0, 0.08);
    col += pCol * smoothstep(size, 0.0, d) * brightness * 1.5;
  }
  
  // Mouse interaction glow
  vec2 mouseUV = u_mouse / u_resolution;
  vec2 mouseP = (mouseUV - 0.5) * aspect;
  float mouseDist = length(p - mouseP);
  col += vec3(0.0, 0.9, 1.0) * exp(-mouseDist * mouseDist * 20.0) * 0.3;
  
  // Vignette
  float vig = 1.0 - length(uv - 0.5) * 1.2;
  vig = smoothstep(0.0, 1.0, vig);
  col *= vig * 0.7 + 0.3;
  
  // Subtle scanlines
  float scanline = sin(uv.y * 800.0) * 0.02 + 1.0;
  col *= scanline;
  
  // Color grading - boost contrast
  col = pow(col, vec3(0.9));
  col = col / (1.0 + col * 0.3);
  
  gl_FragColor = vec4(col, 1.0);
}
`;

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const can = canvas;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    const g = gl;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      can.width = window.innerWidth * dpr;
      can.height = window.innerHeight * dpr;
      g.viewport(0, 0, can.width, can.height);
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    const startTime = performance.now();
    function render() {
      const time = (performance.now() - startTime) / 1000;
      g.uniform1f(timeLoc, time);
      g.uniform2f(resLoc, can.width, can.height);
      g.uniform2f(mouseLoc, mouseRef.current.x * Math.min(window.devicePixelRatio, 2), mouseRef.current.y * Math.min(window.devicePixelRatio, 2));
      g.drawArrays(g.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      g.deleteProgram(program);
      g.deleteShader(vs);
      g.deleteShader(fs);
      g.deleteBuffer(posBuffer);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}
