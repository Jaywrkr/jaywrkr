THREE.EffectComposer = function(e, t) {
	
		if (this.renderer = e, void 0 === t) {
			var r = e.getPixelRatio(),
				i = Math.floor(e.context.canvas.width / r) || 1,
				n = Math.floor(e.context.canvas.height / r) || 1,
				a = {
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter,
					format: THREE.RGBFormat,
					stencilBuffer: !1
				};
			t = new THREE.WebGLRenderTarget(i, n, a)
		}
		this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.passes = [], void 0 === THREE.CopyShader && console.error("THREE.EffectComposer relies on THREE.CopyShader"), this.copyPass = new THREE.ShaderPass(THREE.CopyShader)
	}, THREE.EffectComposer.prototype = {
		swapBuffers: function() {
			var e = this.readBuffer;
			this.readBuffer = this.writeBuffer, this.writeBuffer = e
		},
		addPass: function(e) {
			this.passes.push(e)
		},
		insertPass: function(e, t) {
			this.passes.splice(t, 0, e)
		},
		render: function(e) {
			this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
			var t, r, i = !1,
				n = this.passes.length;
			for (r = 0; r < n; r++)
				if (t = this.passes[r], t.enabled) {
					if (t.render(this.renderer, this.writeBuffer, this.readBuffer, e, i), t.needsSwap) {
						if (i) {
							var a = this.renderer.context;
							a.stencilFunc(a.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), a.stencilFunc(a.EQUAL, 1, 4294967295)
						}
						this.swapBuffers()
					}
					t instanceof THREE.MaskPass ? i = !0 : t instanceof THREE.ClearMaskPass && (i = !1)
				}
		},
		reset: function(e) {
			if (void 0 === e) {
				e = this.renderTarget1.clone();
				var t = this.renderer.getPixelRatio();
				e.width = Math.floor(this.renderer.context.canvas.width / t), e.height = Math.floor(this.renderer.context.canvas.height / t)
			}
			this.renderTarget1.dispose(), this.renderTarget1 = e, this.renderTarget2.dispose(), this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2
		},
		setSize: function(e, t) {
			this.renderTarget1.setSize(e, t), this.renderTarget2.setSize(e, t)
		}
	}, THREE.MaskPass = function(e, t) {
		this.scene = e, this.camera = t, this.enabled = !0, this.clear = !0, this.needsSwap = !1, this.inverse = !1
		
	}, THREE.MaskPass.prototype = {
		render: function(e, t, r, i) {
			var n = e.context;
			n.colorMask(!1, !1, !1, !1), n.depthMask(!1);
			var a, s;
			this.inverse ? (a = 0, s = 1) : (a = 1, s = 0), n.enable(n.STENCIL_TEST), n.stencilOp(n.REPLACE, n.REPLACE, n.REPLACE), n.stencilFunc(n.ALWAYS, a, 4294967295), n.clearStencil(s), e.render(this.scene, this.camera, r, this.clear), e.render(this.scene, this.camera, t, this.clear), n.colorMask(!0, !0, !0, !0), n.depthMask(!0), n.stencilFunc(n.EQUAL, 1, 4294967295), n.stencilOp(n.KEEP, n.KEEP, n.KEEP)
		}
	}, THREE.ClearMaskPass = function() {
		this.enabled = !0
	}, THREE.ClearMaskPass.prototype = {
		render: function(e, t, r, i) {
			var n = e.context;
			n.disable(n.STENCIL_TEST)
		}
	}, THREE.RenderPass = function(e, t, r, i, n) {
		this.scene = e, this.camera = t, this.overrideMaterial = r, this.clearColor = i, this.clearAlpha = void 0 !== n ? n : 1, this.oldClearColor = new THREE.Color, this.oldClearAlpha = 1, this.enabled = !0, this.clear = !0, this.needsSwap = !1
	}, THREE.RenderPass.prototype = {
		render: function(e, t, r, i) {
			this.scene.overrideMaterial = this.overrideMaterial, this.clearColor && (this.oldClearColor.copy(e.getClearColor()), this.oldClearAlpha = e.getClearAlpha(), e.setClearColor(this.clearColor, this.clearAlpha)), e.render(this.scene, this.camera, r, this.clear), this.clearColor && e.setClearColor(this.oldClearColor, this.oldClearAlpha), this.scene.overrideMaterial = null
		}
	}, THREE.ShaderPass = function(e, t) {
		this.textureID = void 0 !== t ? t : "tDiffuse", this.uniforms = THREE.UniformsUtils.clone(e.uniforms), this.material = new THREE.ShaderMaterial({
			defines: e.defines || {},
			uniforms: this.uniforms,
			vertexShader: e.vertexShader,
			fragmentShader: e.fragmentShader
		}), this.renderToScreen = !1, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.scene = new THREE.Scene, this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null), this.scene.add(this.quad)
	}, THREE.ShaderPass.prototype = {
		render: function(e, t, r, i) {
			this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = r), this.quad.material = this.material, this.renderToScreen ? e.render(this.scene, this.camera) : e.render(this.scene, this.camera, t, this.clear)
		}
	}, THREE.CopyShader = {
		uniforms: {
			tDiffuse: {
				type: "t",
				value: null
			},
			opacity: {
				type: "f",
				value: 1
			}
		},
		vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
		fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")
	}, THREE.DotScreenShader = {
		uniforms: {
			tDiffuse: {
				type: "t",
				value: null
			},
			tSize: {
				type: "v2",
				value: new THREE.Vector2(256, 256)
			},
			center: {
				type: "v2",
				value: new THREE.Vector2(.5, .5)
			},
			angle: {
				type: "f",
				value: 1.57
			},
			scale: {
				type: "f",
				value: 1
			}
		},
		vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
		fragmentShader: ["uniform vec2 center;", "uniform float angle;", "uniform float scale;", "uniform vec2 tSize;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "float pattern() {", "float s = sin( angle ), c = cos( angle );", "vec2 tex = vUv * tSize - center;", "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;", "return ( sin( point.x ) * sin( point.y ) ) * 4.0;", "}", "void main() {", "vec4 color = texture2D( tDiffuse, vUv );", "float average = ( color.r + color.g + color.b ) / 3.0;", "gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );", "}"].join("\n")
	}, THREE.RGBShiftShader = {
		uniforms: {
			tDiffuse: {
				type: "t",
				value: null
			},
			amount: {
				type: "f",
				value: .005
			},
			angle: {
				type: "f",
				value: 0
			}
		},
		vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
		fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float amount;", "uniform float angle;", "varying vec2 vUv;", "void main() {", "vec2 offset = amount * vec2( cos(angle), sin(angle));", "vec4 cr = texture2D(tDiffuse, vUv + offset);", "vec4 cga = texture2D(tDiffuse, vUv);", "vec4 cb = texture2D(tDiffuse, vUv - offset);", "gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);", "}"].join("\n")
	},
	function() {
		function e(e, t) {
			return Math.floor(Math.random() * (t - e + 1) + e)
		}

		function t() {
			requestAnimationFrame(t);
			for (var e = 0; e < y; e++) {
				var r = s[e] / 256 * 2.5 + .01;
				c ? (TweenLite.to(w[e].scale, .1, {
					x: r,
					y: r,
					z: r
				}), TweenLite.to(w[e].rotation, .1, {
					z: e % 2 == 0 ? "+= 0.1" : "-= 0.1"
				}), TweenLite.to(m.uniforms.amount, 1, {
					value: .005
				})) : (TweenLite.to(w[e].scale, .1, {
					z: r
				}), TweenLite.to(m.uniforms.amount, 1, {
					value: d / window.innerWidth
				}))
			}
			p.rotation.z += .01, n.getByteFrequencyData(s), f.render(l, h), v.render()
		}
		var r, i, n, a, s, o, d = 0,
			c = !1;
			var t3 = document.createElement("a");
			var t2 = document.createElement("a");
		! function() {
			r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/underthemoon-feat-nathannicholson&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					
					
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
					var t4 = document.createElement("a");
					t4.className = "info", t4.innerHTML = "Ver en Google Chrome. Juega dando doble click y cambia de canciones con los números", document.body.appendChild(t4);
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
		}();
		var l, h, f, u, v, E, m, p = new THREE.Object3D,
			w = [],
			T = new THREE.TetrahedronGeometry(115, 0),
			g = new THREE.MeshPhongMaterial({
				color: 0xffffff
			}),
			R = [],
			y = 100;
		! function() {
			l = new THREE.Scene, h = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, .1, 1e3), h.position.z = 250, l.add(h), f = new THREE.WebGLRenderer({
				alpha: !0
			}), f.setClearColor(16777215, 0), f.setSize(window.innerWidth, window.innerHeight), u = new THREE.DirectionalLight(16777215, 1), u.position.set(1, 1, 1), l.add(u), u = new THREE.DirectionalLight(16777215, 1), u.position.set(-1, -1, 1), l.add(u);
			for (var e = 0; e < y; e++) w[e] = new THREE.Mesh(T, g), w[e].position.y = 10, R[e] = new THREE.Object3D, R[e].add(w[e]), R[e].rotation.z = e * (360 / y) * Math.PI / 180, p.add(R[e]);
			l.add(p), v = new THREE.EffectComposer(f), v.addPass(new THREE.RenderPass(l, h)), E = new THREE.ShaderPass(THREE.DotScreenShader), E.uniforms.scale.value = 5, v.addPass(E), m = new THREE.ShaderPass(THREE.RGBShiftShader), m.uniforms.amount.value = .005, m.renderToScreen = !0, v.addPass(m), f.render(l, h), document.body.appendChild(f.domElement)
		}(), window.addEventListener("dblclick", function() {
			if (c) {
				for (var t = 0; t < y; t++) TweenLite.to(w[t].scale, 1, {
					x: 1,
					y: 1,
					z: 1
				}), TweenLite.to(w[t].rotation, 1, {
					x: 0,
					y: 0,
					z: 0
				}), TweenLite.to(w[t].position, 1, {
					x: 0,
					y: 10,
					z: 0
				});
				E.uniforms.scale.value = 5, g.wireframe = !1, c = !1
			} else {
				for (var r = 0; r < y; r++) TweenLite.to(w[r].rotation, 1, {
					x: e(0, Math.PI),
					y: e(0, Math.PI),
					z: e(0, Math.PI)
				}), TweenLite.to(w[r].position, 1, {
					x: "+= " + e(-1e3, 1e3),
					y: "+= " + e(-1e3, 1e3),
					z: "+= " + e(-500, -250)
				});
				E.uniforms.scale.value = 0, g.wireframe = !0, c = !0
			}
		}), t(), window.addEventListener("resize", function() {
			h.aspect = window.innerWidth / window.innerHeight, h.updateProjectionMatrix(), f.setSize(window.innerWidth, window.innerHeight)
		}), window.addEventListener("mousewheel", function(e) {
			var t = Math.round(100 * r.volume) / 100;
			e.wheelDelta < 0 && t - .05 >= 0 ? t = Math.abs(t - .05) : e.wheelDelta > 0 && t + .05 <= 1 && (t = Math.abs(t + .05)), r.volume = t
		}), window.addEventListener("mousemove", function(e) {
			d = e.clientX - window.innerWidth / 2
		}), window.addEventListener("keydown", function(e) {
			 const keyName = e.key;
  			 
  			 
  			 if (keyName === '0') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/underthemoon-feat-nathannicholson&", !0), o.onreadystatechange = function() {
				
				
					
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					
					
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
					
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 } else if (keyName === '2') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/staythenight&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 } else if (keyName === '3') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/cream&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 } else if (keyName === '1') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/no-eyes-radio-edit-feat-jaw-1&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 } else if (keyName === '4') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/thedrums-latmunremix&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 }  else if (keyName === '5') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/dear-life-2&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 }   else if (keyName === '6') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/heartbeat-1&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 }   else if (keyName === '7') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/theonlything-tubebergerremix&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 } else if (keyName === '8') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/in-the-beginning-ft-nathan-nicholson&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 }  else if (keyName === '9') {
  			 	r.pause()
  			 	r = new Audio, r.crossOrigin = "anonymous", i = new(window.AudioContext || window.webkitAudioContext), a = i.createMediaElementSource(r), a.connect(i.destination), n = i.createAnalyser(), n.smoothingTimeConstant = .1, n.fftSize = 2048, a.connect(n), o = new XMLHttpRequest, o.open("GET", "//api.soundcloud.com/resolve.json?url=https://soundcloud.com/claptone/gregory-porter-liquid-spirit-claptone-remix-preview&", !0), o.onreadystatechange = function() {
				
				
				if (4 === o.readyState && 200 === o.status) {
					var e = JSON.parse(o.responseText);
					r.src = e.stream_url + "?", r.play(), r.addEventListener("ended", function() {
						r.play()
					});
					
					
					t2.className = "texto", t2.setAttribute("href", e.permalink_url), t2.innerHTML = "JAYWRKR", document.body.appendChild(t2);
					t3.className = "soundcloud", t3.setAttribute("href", e.permalink_url), t3.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-image">' + e.user.username + " - " + e.title, document.body.appendChild(t3);
				
					
				}
			}, o.send(), n.connect(i.destination), s = new Uint8Array(n.frequencyBinCount)
  			 	r.load()
  			 	r.play()
  			 	
  			 }
		})
		
		
		
	}();
