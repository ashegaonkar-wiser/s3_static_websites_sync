function getNavigatorProps() {
    if (!navigator) return {
        hasNavigator: !!navigator,
    };

    return {
        hasNavigator: !!navigator,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        appVersion: navigator.appVersion,
        oscpu: navigator.oscpu,
        vendor: navigator.vendor,

        // Hardware properties
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,

        // Navigator properties
        webdriver: navigator.webdriver,
        languages: navigator.languages,
        plugins: Array.from(navigator.plugins || []).map(p => p.name),
        mimeTypes: Array.from(navigator.mimeTypes || []).map(m => m.type),
        doNotTrack: navigator.doNotTrack,
        cookieEnabled: navigator.cookieEnabled,

        // Advanced APIs
        mediaDevices: !!navigator.mediaDevices,
        bluetooth: !!navigator.bluetooth,
        credentials: !!navigator.credentials,
        geolocation: !!navigator.geolocation,
        permissions: !!navigator.permissions,

        // UserAgentData (if available)
        userAgentData: navigator.userAgentData ? {
            brands: navigator.userAgentData.brands,
            mobile: navigator.userAgentData.mobile,
            platform: navigator.userAgentData.platform
        } : null,
    };
}

function getChromeProps() {
    const ch = window.chrome;
    return {
        hasChrome: !!ch,
        app: {
            hasApp: !!ch.app,
            isInstalled: !!ch.app ? ch.app.isInstalled : null,
            InstallState: !!ch.app ? ch.app.InstallState : null,
            RunningState: !!ch.app ? ch.app.RunningState : null
        },
    };
}

function getHistoryProps() {
    return {
        hasHistory: !!history,
        length: history.length,
        scrollRestoration: history.scrollRestoration,
    };
}

function getPrototypeProps() {
    return {
        'String.prototype.match': (function () {
            try {
                return String.prototype.match.toString();
            } catch (e) {
                return "Error: " + e.message;
            }
        })(),
        'Function.prototype.toString': (function () {
            try {
                return Function.prototype.toString.toString();
            } catch (e) {
                return "Error: " + e.message;
            }
        })()
    };
}

function getScreenProps() {
    return {
        hasScreen: !!screen,
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
    };
}

function getDocumentProps() {
    return {
        hasDocument: !!document,
        documentElement: {
            width: !!document.documentElement ? document.documentElement.clientWidth : null,
            height: !!document.documentElement ? document.documentElement.clientHeight : null,
        },
        cookie: document.cookie,
    };
}

function getWindowProps() {
    return {
        hasWindow: !!window,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        screenX: window.screenX,
        screenY: window.screenY,
        screenLeft: window.screenLeft,
        screenTop: window.screenTop,
        devicePixelRatio: window.devicePixelRatio,
    }
}

function getWebGLProps() {
    try {
        // Create a hidden canvas for WebGL testing
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        
        // Try to get WebGL context
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            document.body.removeChild(canvas);
            return {
                webgl_available: false,
                error: 'WebGL not supported'
            };
        }
        
        const results = {
            webgl_available: true,
            
            // Basic WebGL info
            version: gl.getParameter(gl.VERSION),
            shading_language_version: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            
            // WebGL limits and capabilities
            max_texture_size: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            max_vertex_attribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            max_vertex_uniform_vectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            max_fragment_uniform_vectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            max_varying_vectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
            max_renderbuffer_size: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
            max_viewport_dims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            
            // Additional WebGL parameters that are commonly fingerprinted
            aliased_line_width_range: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
            aliased_point_size_range: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
            max_cube_map_texture_size: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
            max_combined_texture_image_units: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            max_texture_image_units: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
            max_vertex_texture_image_units: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            
            // Depth and stencil bits
            depth_bits: gl.getParameter(gl.DEPTH_BITS),
            stencil_bits: gl.getParameter(gl.STENCIL_BITS),
            red_bits: gl.getParameter(gl.RED_BITS),
            green_bits: gl.getParameter(gl.GREEN_BITS),
            blue_bits: gl.getParameter(gl.BLUE_BITS),
            alpha_bits: gl.getParameter(gl.ALPHA_BITS),
            
            // Subpixel bits
            subpixel_bits: gl.getParameter(gl.SUBPIXEL_BITS),
            
            // Extensions
            supported_extensions: gl.getSupportedExtensions(),
            
            // WebGL2 specific properties (if available)
            webgl2_available: false
        };
        
        // Try to get WebGL2 context for additional properties
        const gl2 = canvas.getContext('webgl2');
        if (gl2) {
            results.webgl2_available = true;
            results.webgl2_version = gl2.getParameter(gl2.VERSION);
            results.webgl2_shading_language_version = gl2.getParameter(gl2.SHADING_LANGUAGE_VERSION);
            
            // WebGL2 specific limits
            try {
                results.max_3d_texture_size = gl2.getParameter(gl2.MAX_3D_TEXTURE_SIZE);
                results.max_array_texture_layers = gl2.getParameter(gl2.MAX_ARRAY_TEXTURE_LAYERS);
                results.max_color_attachments = gl2.getParameter(gl2.MAX_COLOR_ATTACHMENTS);
                results.max_draw_buffers = gl2.getParameter(gl2.MAX_DRAW_BUFFERS);
                results.max_element_index = gl2.getParameter(gl2.MAX_ELEMENT_INDEX);
                results.max_elements_indices = gl2.getParameter(gl2.MAX_ELEMENTS_INDICES);
                results.max_elements_vertices = gl2.getParameter(gl2.MAX_ELEMENTS_VERTICES);
                results.max_fragment_input_components = gl2.getParameter(gl2.MAX_FRAGMENT_INPUT_COMPONENTS);
                results.max_fragment_uniform_blocks = gl2.getParameter(gl2.MAX_FRAGMENT_UNIFORM_BLOCKS);
                results.max_fragment_uniform_components = gl2.getParameter(gl2.MAX_FRAGMENT_UNIFORM_COMPONENTS);
                results.max_samples = gl2.getParameter(gl2.MAX_SAMPLES);
                results.max_texture_lod_bias = gl2.getParameter(gl2.MAX_TEXTURE_LOD_BIAS);
                results.max_transform_feedback_interleaved_components = gl2.getParameter(gl2.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
                results.max_transform_feedback_separate_attribs = gl2.getParameter(gl2.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
                results.max_transform_feedback_separate_components = gl2.getParameter(gl2.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS);
                results.max_uniform_block_size = gl2.getParameter(gl2.MAX_UNIFORM_BLOCK_SIZE);
                results.max_uniform_buffer_bindings = gl2.getParameter(gl2.MAX_UNIFORM_BUFFER_BINDINGS);
                results.max_varying_components = gl2.getParameter(gl2.MAX_VARYING_COMPONENTS);
                results.max_vertex_output_components = gl2.getParameter(gl2.MAX_VERTEX_OUTPUT_COMPONENTS);
                results.max_vertex_uniform_blocks = gl2.getParameter(gl2.MAX_VERTEX_UNIFORM_BLOCKS);
                results.max_vertex_uniform_components = gl2.getParameter(gl2.MAX_VERTEX_UNIFORM_COMPONENTS);
                results.min_program_texel_offset = gl2.getParameter(gl2.MIN_PROGRAM_TEXEL_OFFSET);
                results.max_program_texel_offset = gl2.getParameter(gl2.MAX_PROGRAM_TEXEL_OFFSET);
            } catch (e) {
                results.webgl2_error = e.message;
            }
        }
        
        // Convert typed arrays to regular arrays for JSON serialization
        if (results.aliased_line_width_range && results.aliased_line_width_range.length) {
            results.aliased_line_width_range = Array.from(results.aliased_line_width_range);
        }
        if (results.aliased_point_size_range && results.aliased_point_size_range.length) {
            results.aliased_point_size_range = Array.from(results.aliased_point_size_range);
        }
        if (results.max_viewport_dims && results.max_viewport_dims.length) {
            results.max_viewport_dims = Array.from(results.max_viewport_dims);
        }
        
        // Simple WebGL rendering test to trigger buffer operations
        try {
            // Create a simple triangle to test buffer operations
            const vertexShaderSource = `
                attribute vec2 a_position;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `;
            
            const fragmentShaderSource = `
                precision mediump float;
                void main() {
                    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                }
            `;
            
            // Create shaders
            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.compileShader(vertexShader);
            
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentShaderSource);
            gl.compileShader(fragmentShader);
            
            // Create program
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);
            
            // Create buffer with triangle vertices (this will trigger bufferData)
            const vertices = new Float32Array([
                0.0,  0.5,
               -0.5, -0.5,
                0.5, -0.5
            ]);
            
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            
            // Set up attribute
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            
            // Clear and draw
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            
            results.rendering_test = 'success';
            
        } catch (renderError) {
            results.rendering_test = 'failed';
            results.rendering_error = renderError.message;
        }
        
        // Clean up
        document.body.removeChild(canvas);
        
        return results;
        
    } catch (error) {
        return {
            webgl_available: false,
            error: error.message,
            stack: error.stack
        };
    }
}

function getFontProps() {
    try {
        const results = {};
        
        // Test fonts that are commonly used for fingerprinting
        const testFonts = [
            'Arial',
            'Times New Roman', 
            'Courier New',
            'Helvetica',
            'Georgia',
            'Verdana',
            'Comic Sans MS',
            'Impact',
            'Trebuchet MS',
            'Arial Black'
        ];
        
        // Create a test element with known text
        const testText = 'mmmmmmmmmmlli';
        const testSize = '72px';
        
        // Base measurements using default fonts
        const baseElement = document.createElement('div');
        baseElement.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            font-size: ${testSize};
            font-family: monospace;
            white-space: nowrap;
            visibility: hidden;
        `;
        baseElement.textContent = testText;
        document.body.appendChild(baseElement);
        
        const baseWidth = baseElement.offsetWidth;
        const baseHeight = baseElement.offsetHeight;
        
        results.base_dimensions = {
            width: baseWidth,
            height: baseHeight
        };
        
        // Test each font for availability by measuring dimensions
        results.font_measurements = {};
        results.available_fonts = [];
        
        testFonts.forEach(font => {
            const element = document.createElement('div');
            element.style.cssText = `
                position: absolute;
                left: -9999px;
                top: -9999px;
                font-size: ${testSize};
                font-family: "${font}", monospace;
                white-space: nowrap;
                visibility: hidden;
            `;
            element.textContent = testText;
            document.body.appendChild(element);
            
            const width = element.offsetWidth;
            const height = element.offsetHeight;
            
            results.font_measurements[font] = {
                width: width,
                height: height,
                width_diff: width - baseWidth,
                height_diff: height - baseHeight
            };
            
            // If dimensions differ from base, font is likely available
            if (width !== baseWidth || height !== baseHeight) {
                results.available_fonts.push(font);
            }
            
            document.body.removeChild(element);
        });
        
        // Clean up base element
        document.body.removeChild(baseElement);
        
        // Test multiple different elements to detect noise (improved masking uses element-specific noise)
        const measurements = [];
        const testElements = [];
        
        // Create many test elements to increase chance of detecting subtle noise (15% probability)
        for (let i = 0; i < 50; i++) {
            const div = document.createElement('div');
            div.className = `test-element-${i}`;
            div.id = `noise-test-${i}`;
            div.style.cssText = 'position: absolute; left: -9999px; width: 200px; height: 50px; font-size: 16px; font-family: Arial; padding: 10px; border: 1px solid black;';
            div.textContent = `Test element ${i} with some text content for measurement`;
            document.body.appendChild(div);
            testElements.push(div);
            
            measurements.push({
                width: div.offsetWidth,
                height: div.offsetHeight
            });
        }
        
        // Also test the same element multiple times to check consistency
        const consistencyElement = testElements[0];
        const consistencyMeasurements = [];
        for (let i = 0; i < 3; i++) {
            consistencyMeasurements.push({
                width: consistencyElement.offsetWidth,
                height: consistencyElement.offsetHeight
            });
        }
        
        results.font_measurements = {
            measurements: measurements,
            consistency_measurements: consistencyMeasurements
        };
        
        // Clean up test elements
        testElements.forEach(element => document.body.removeChild(element));
        
        return results;
        
    } catch (error) {
        return {
            error: error.message,
            stack: error.stack
        };
    }
}

function getAllProps() {
    return {
        navigator: getNavigatorProps(),
        chrome: getChromeProps(),
        history: getHistoryProps(),
        prototypes: getPrototypeProps(),
        screen: getScreenProps(),
        document: getDocumentProps(),
        window: getWindowProps(),
        webgl: getWebGLProps(),
        fonts: getFontProps(),
    };
}

const initBrowserProps = async (container_id) => {
    const props = getAllProps();
    const container = document.getElementById(container_id);
    if (container) {
        container.innerHTML = '';
        container.textContent = JSON.stringify(props, null, 2);
    }
}

window.addEventListener("DOMContentLoaded", () =>
    initBrowserProps("browser-container")
);