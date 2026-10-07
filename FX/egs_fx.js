/**
 * ============================================================================
 * EGS FX - ADVANCED WEBGL VISUAL EFFECTS & CUSTOM CURSOR ENGINE
 * @version 1.0.0
 * @author Zero Dependencies ES6 Module
 * ============================================================================
 */
export class egs_fx {
    constructor(containerId, effectType = 'liquid-metal', options = {}) {
        this.container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;

        if (!this.container) {
            console.warn(`[egs_fx]: Không tìm thấy container hợp lệ.`);
            return;
        }

        this.effectType = effectType;
        this.options = {
            speed: 1.0,
            intensity: 1.0,
            color: '#00ffcc',
            mouseInteractive: true,
            customCursor: true,
            ...options
        };

        this.mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
        this.startTime = performance.now();
        this.animId = null;

        // Bound event handlers để dễ dàng removeEventListener sau này
        this._onMouseMove = this.handleMouseMove.bind(this);
        this._onWindowMouseMove = this.handleWindowMouseMove.bind(this);
        this._onMouseOver = this.handleMouseOver.bind(this);
        this._onMouseOut = this.handleMouseOut.bind(this);
        this._onRenderCursor = this.renderCursor.bind(this);

        this.init();
        if (this.options.customCursor) {
            this.initCustomCursor();
        }
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
        this.container.appendChild(this.canvas);

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('[egs_fx]: WebGL không được hỗ trợ trên trình duyệt này.');
            return;
        }

        this.resize();
        this.initBuffers();
        this.updateShaders(this.effectType);
        this.initEvents();

        this.animate = this.animate.bind(this);
        this.animId = requestAnimationFrame(this.animate);
    }

    resize() {
        if (!this.container || !this.canvas) return;
        const displayWidth = this.container.clientWidth;
        const displayHeight = this.container.clientHeight;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        }
    }

    initBuffers() {
        const gl = this.gl;
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        const positions = new Float32Array([
            -1, -1,  1, -1, -1,  1,
            -1,  1,  1, -1,  1,  1,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    }

    updateShaders(type) {
        const gl = this.gl;
        const vsSource = `
            attribute vec2 a_position;
            varying vec2 vUv;
            void main() {
                vUv = (a_position + 1.0) * 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fsSource = this.getFragmentShaderCode(type);
        const vs = this.compileShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

        if (!vs || !fs) return;

        if (this.program) gl.deleteProgram(this.program);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('[egs_fx] Lỗi link Shader:', gl.getProgramInfoLog(this.program));
            return;
        }

        this.uTimeLocation = gl.getUniformLocation(this.program, 'uTime');
        this.uResolutionLocation = gl.getUniformLocation(this.program, 'uResolution');
        this.uMouseLocation = gl.getUniformLocation(this.program, 'uMouse');
        this.uSpeedLocation = gl.getUniformLocation(this.program, 'uSpeed');
        this.uIntensityLocation = gl.getUniformLocation(this.program, 'uIntensity');
        this.uBaseColorLocation = gl.getUniformLocation(this.program, 'uBaseColor');

        this.rgbColor = this.hexToRgb(this.options.color);
    }

    compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('[egs_fx] Lỗi biên dịch Shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    getFragmentShaderCode(type) {
        const commonHeader = `
            precision mediump float;
            uniform float uTime;
            uniform vec2 uResolution;
            uniform vec2 uMouse;
            uniform float uSpeed;
            uniform float uIntensity;
            uniform vec3 uBaseColor;
            varying vec2 vUv;

            float random (in vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            float noise (in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
        `;

        switch(type) {
            case 'liquid-metal':
                return commonHeader + `
                    void main() {
                        vec2 st = gl_FragCoord.xy / uResolution.xy;
                        vec2 p = st * 4.0 - vec2(2.0);
                        p += sin(p.yx * 2.0 + uTime * uSpeed * 0.5) * 0.5;
                        float len = length(p - (uMouse * 2.0 - 1.0) * 0.5);
                        float pattern = sin(len * 5.0 - uTime * uSpeed) / len;
                        vec3 color = mix(uBaseColor, vec3(1.0), pattern * 0.5 + 0.5);
                        gl_FragColor = vec4(color * uIntensity, 0.9);
                    }
                `;
            case 'glass-caustics':
                return commonHeader + `
                    void main() {
                        vec2 st = gl_FragCoord.xy / uResolution.xy;
                        float dist = distance(st, uMouse);
                        float caustic = pow(0.05 / dist, 1.2) * (sin(dist * 20.0 - uTime * uSpeed * 2.0) * 0.5 + 0.5);
                        vec3 color = uBaseColor * caustic * uIntensity;
                        gl_FragColor = vec4(color, caustic);
                    }
                `;
            case 'liquid':
                return commonHeader + `
                    void main() {
                        vec2 st = gl_FragCoord.xy / uResolution.xy;
                        vec2 p = st * 3.0 - vec2(uTime * 0.2 * uSpeed);
                        float len = length(p - uMouse * 2.0);
                        float wave = sin(len * 6.0 + uTime * uSpeed);
                        vec3 color = uBaseColor * (wave * 0.5 + 0.5) * uIntensity;
                        gl_FragColor = vec4(color, abs(wave) * 0.8);
                    }
                `;
            case 'smoke':
                return commonHeader + `
                    void main() {
                        vec2 st = vUv * 4.0;
                        st.y -= uTime * 0.3 * uSpeed;
                        float n = noise(st + noise(st + uTime * 0.1));
                        vec3 color = mix(vec3(0.0), uBaseColor, n * uIntensity);
                        gl_FragColor = vec4(color, n * 0.6);
                    }
                `;
            case 'fire':
                return commonHeader + `
                    void main() {
                        vec2 st = vUv;
                        st.y += uTime * 0.8 * uSpeed;
                        float n = noise(st * 5.0);
                        vec3 flameColor = mix(uBaseColor, vec3(1.0, 0.5, 0.0), n);
                        gl_FragColor = vec4(flameColor, n * uIntensity * (1.0 - vUv.y));
                    }
                `;
            case 'hologram':
                return commonHeader + `
                    void main() {
                        vec2 st = vUv;
                        float scanline = sin(st.y * 100.0 + uTime * 5.0 * uSpeed) * 0.1 + 0.9;
                        float glitch = step(0.98, random(vec2(uTime * 0.5))) * 0.2;
                        vec3 color = uBaseColor * scanline * (uIntensity + glitch);
                        gl_FragColor = vec4(color, 0.7);
                    }
                `;
            case 'sparks':
                return commonHeader + `
                    void main() {
                        vec2 st = gl_FragCoord.xy / uResolution.xy;
                        float t = uTime * uSpeed * 2.0;
                        float spark = 0.0;
                        for(float i = 1.0; i < 4.0; i++) {
                            vec2 pos = vec2(sin(t * i * 0.5) * 0.5 + 0.5, fract(t * 0.2 * i));
                            float d = length(st - pos);
                            spark += (0.02 / (d * d)) * (1.0 - pos.y);
                        }
                        vec3 color = uBaseColor * spark * uIntensity;
                        gl_FragColor = vec4(color, spark * 0.8);
                    }
                `;
            default:
                return commonHeader + `
                    void main() {
                        vec2 st = gl_FragCoord.xy / uResolution.xy;
                        float d = length(st - uMouse);
                        float glow = 0.05 / d * uIntensity;
                        gl_FragColor = vec4(uBaseColor * glow, glow);
                    }
                `;
        }
    }

    initCustomCursor() {
        if (document.getElementById('egs-custom-cursor')) return;

        this.cursorEl = document.createElement('div');
        this.cursorEl.id = 'egs-custom-cursor';
        this.cursorEl.style.cssText = `
            position: fixed; top: 0; left: 0; width: 32px; height: 32px;
            border: 2px solid rgba(255, 255, 255, 0.8); border-radius: 50%;
            pointer-events: none; transform: translate(-50%, -50%);
            transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease;
            z-index: 99999; mix-blend-mode: difference;
        `;
        document.body.appendChild(this.cursorEl);

        this.cx = window.innerWidth / 2;
        this.cy = window.innerHeight / 2;
        this.mx = this.cx;
        this.my = this.cy;

        window.addEventListener('mousemove', this._onWindowMouseMove);
        document.addEventListener('mouseover', this._onMouseOver);
        document.addEventListener('mouseout', this._onMouseOut);
        
        this.cursorAnimId = requestAnimationFrame(this._onRenderCursor);
    }

    handleWindowMouseMove(e) {
        this.mx = e.clientX;
        this.my = e.clientY;
    }

    renderCursor() {
        if (!this.cursorEl) return;
        this.cx += (this.mx - this.cx) * 0.2;
        this.cy += (this.my - this.cy) * 0.2;
        this.cursorEl.style.left = `${this.cx}px`;
        this.cursorEl.style.top = `${this.cy}px`;
        this.cursorAnimId = requestAnimationFrame(this._onRenderCursor);
    }

    handleMouseOver(e) {
        if (e.target.matches('a, button, [data-hover], input, select')) {
            this.cursorEl.style.width = '64px';
            this.cursorEl.style.height = '64px';
            this.cursorEl.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }
    }

    handleMouseOut(e) {
        if (e.target.matches('a, button, [data-hover], input, select')) {
            this.cursorEl.style.width = '32px';
            this.cursorEl.style.height = '32px';
            this.cursorEl.style.backgroundColor = 'transparent';
        }
    }

    initEvents() {
        if (!this.options.mouseInteractive || !this.canvas) return;
        this.canvas.addEventListener('mousemove', this._onMouseMove);
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.targetX = (e.clientX - rect.left) / rect.width;
        this.mouse.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
    }

    animate(currentTime) {
        this.animId = requestAnimationFrame(this.animate);
        this.resize();

        const gl = this.gl;
        if (!gl || !this.program) return;

        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        const elapsedTime = (currentTime - this.startTime) * 0.001;

        gl.useProgram(this.program);

        gl.uniform1f(this.uTimeLocation, elapsedTime);
        gl.uniform2f(this.uResolutionLocation, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.uMouseLocation, this.mouse.x, this.mouse.y);
        gl.uniform1f(this.uSpeedLocation, this.options.speed);
        gl.uniform1f(this.uIntensityLocation, this.options.intensity);
        gl.uniform3f(this.uBaseColorLocation, this.rgbColor.r, this.rgbColor.g, this.rgbColor.b);

        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    hexToRgb(hex) {
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        let num = parseInt(c, 16);
        return {
            r: ((num >> 16) & 255) / 255,
            g: ((num >> 8) & 255) / 255,
            b: (num & 255) / 255
        };
    }

    // Public Runtime API tối giản
    setEffect(type) {
        this.effectType = type;
        this.updateShaders(type);
    }

    setColor(hex) {
        this.options.color = hex;
        this.rgbColor = this.hexToRgb(hex);
    }

    setSpeed(val) {
        this.options.speed = val;
    }

    setIntensity(val) {
        this.options.intensity = val;
    }

    /**
     * Phương thức dọn dẹp tài nguyên (Memory Leak Prevention cho SPA/React/Vue/Next.js)
     */
    destroy() {
        // 1. Dừng Animation Frames
        if (this.animId) cancelAnimationFrame(this.animId);
        if (this.cursorAnimId) cancelAnimationFrame(this.cursorAnimId);

        // 2. Gỡ bỏ Event Listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this._onMouseMove);
        }
        window.removeEventListener('mousemove', this._onWindowMouseMove);
        document.removeEventListener('mouseover', this._onMouseOver);
        document.removeEventListener('mouseout', this._onMouseOut);

        // 3. Xóa Custom Cursor DOM Element
        if (this.cursorEl && this.cursorEl.parentNode) {
            this.cursorEl.parentNode.removeChild(this.cursorEl);
            this.cursorEl = null;
        }

        // 4. Giải phóng WebGL Context & Resources
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
            if (this.positionBuffer) {
                this.gl.deleteBuffer(this.positionBuffer);
            }
            // Kích hoạtlose context extension nếu có sẵn
            const ext = this.gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
        }

        // 5. Xóa Canvas khỏi Container
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        this.container = null;
        this.canvas = null;
        this.gl = null;
    }
}