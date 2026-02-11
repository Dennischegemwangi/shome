// phase2.js - Enhanced Features for Shome Meme App

class EnhancedMemeEditor {
    constructor() {
        this.currentMode = 'image';
        this.textElements = [];
        this.stickers = [];
        this.videoDuration = 0;
        this.audioContext = null;
        this.cloudSaves = [];
        this.stickerLibrary = {
            emoji: ['😂', '😭', '🤣', '😍', '🥰', '😎', '🤔', '👀', '🔥', '💀', '✨', '🎉'],
            reactions: ['👍', '👎', '❤️', '🎯', '👏', '🙏', '😢', '😡', '🤮', '🤯'],
            memes: ['🤡', '👑', '💎', '🚀', '💯', '⭐', '🎭', '📈', '🎪', '🏆'],
            custom: []
        };
        
        this.init();
    }
    
    init() {
        this.setupEditorModes();
        this.setupVideoEditor();
        this.setupGIFCreator();
        this.setupAdvancedText();
        this.setupStickerLibrary();
        this.setupAudioControls();
        this.setupCloudStorage();
        this.setupSocialSharing();
        this.setupEventListeners();
    }
    
    setupEditorModes() {
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update active tab
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        
        // Show/hide editor sections
        document.querySelectorAll('.editor-section').forEach(section => {
            section.classList.toggle('active', section.id === `${mode}Editor`);
        });
        
        // Show/hide control sections
        const controlSections = {
            image: ['textControls', 'stickerControls', 'mediaControls', 'shareControls'],
            video: ['mediaControls', 'shareControls'],
            gif: ['shareControls']
        };
        
        document.querySelectorAll('.control-section').forEach(section => {
            const sectionId = section.id.replace('Controls', '');
            const shouldShow = controlSections[mode]?.includes(section.id) || false;
            section.style.display = shouldShow ? 'block' : 'none';
        });
    }
    
    // ===== VIDEO SUPPORT =====
    setupVideoEditor() {
        const videoPlayer = document.getElementById('videoPlayer');
        const trimStart = document.querySelector('.trim-handle.start');
        const trimEnd = document.querySelector('.trim-handle.end');
        const trimArea = document.querySelector('.trim-area');
        const currentTimeEl = document.getElementById('currentTime');
        const durationTimeEl = document.getElementById('durationTime');
        
        // Video upload
        document.getElementById('uploadVideoBtn')?.addEventListener('click', () => {
            document.getElementById('videoUpload')?.click();
        });
        
        document.getElementById('videoUpload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                videoPlayer.src = url;
                
                videoPlayer.onloadedmetadata = () => {
                    this.videoDuration = videoPlayer.duration;
                    durationTimeEl.textContent = this.formatTime(this.videoDuration);
                    
                    // Reset trim handles
                    trimStart.style.left = '0%';
                    trimEnd.style.right = '0%';
                    trimArea.style.left = '0%';
                    trimArea.style.width = '100%';
                };
            }
        });
        
        // Trim controls
        let isDragging = false;
        let dragHandle = null;
        
        const updateTrimArea = () => {
            const startPercent = parseFloat(trimStart.style.left || '0');
            const endPercent = 100 - parseFloat(trimEnd.style.right || '0');
            trimArea.style.left = `${startPercent}%`;
            trimArea.style.width = `${endPercent - startPercent}%`;
            
            // Update video time
            const currentTime = (startPercent / 100) * this.videoDuration;
            videoPlayer.currentTime = currentTime;
        };
        
        const startDrag = (handle) => {
            isDragging = true;
            dragHandle = handle;
        };
        
        const stopDrag = () => {
            isDragging = false;
            dragHandle = null;
        };
        
        const drag = (e) => {
            if (!isDragging || !dragHandle) return;
            
            const timeline = document.querySelector('.timeline-track');
            const rect = timeline.getBoundingClientRect();
            let x = e.clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percent = (x / rect.width) * 100;
            
            if (dragHandle === trimStart) {
                const endPercent = 100 - parseFloat(trimEnd.style.right || '0');
                if (percent < endPercent) {
                    trimStart.style.left = `${percent}%`;
                }
            } else {
                const startPercent = parseFloat(trimStart.style.left || '0');
                if (100 - percent > startPercent) {
                    trimEnd.style.right = `${100 - percent}%`;
                }
            }
            
            updateTrimArea();
        };
        
        trimStart.addEventListener('mousedown', () => startDrag(trimStart));
        trimEnd.addEventListener('mousedown', () => startDrag(trimEnd));
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        // Speed control
        document.getElementById('videoSpeed')?.addEventListener('change', (e) => {
            videoPlayer.playbackRate = parseFloat(e.target.value);
        });
        
        // Update current time
        videoPlayer.addEventListener('timeupdate', () => {
            currentTimeEl.textContent = this.formatTime(videoPlayer.currentTime);
        });
        
        // Apply trim
        document.getElementById('trimVideoBtn')?.addEventListener('click', () => {
            const startPercent = parseFloat(trimStart.style.left || '0');
            const startTime = (startPercent / 100) * this.videoDuration;
            const endPercent = 100 - parseFloat(trimEnd.style.right || '0');
            const endTime = (endPercent / 100) * this.videoDuration;
            
            alert(`Trim applied: ${this.formatTime(startTime)} - ${this.formatTime(endTime)}`);
            // In a real app, you would use a video processing library here
        });
    }
    
    // ===== GIF CREATION =====
    setupGIFCreator() {
        let gifFrames = [];
        
        // Upload GIF source
        document.getElementById('uploadGIFSourceBtn')?.addEventListener('click', () => {
            document.getElementById('gifSourceUpload')?.click();
        });
        
        document.getElementById('gifSourceUpload')?.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            gifFrames = [];
            
            // Process video for GIF
            const videoFile = files.find(f => f.type.startsWith('video/'));
            if (videoFile) {
                await this.extractVideoFrames(videoFile);
            } else {
                // Process images
                files.forEach((file, index) => {
                    if (file.type.startsWith('image/') && index < 12) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            gifFrames.push(event.target.result);
                            this.updateGIFPreview();
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
        
        // GIF settings controls
        const durationSlider = document.getElementById('gifDurationSlider');
        const fpsSlider = document.getElementById('gifFPS');
        
        if (durationSlider) {
            durationSlider.addEventListener('input', (e) => {
                document.getElementById('gifDurationValue').textContent = `${e.target.value}s`;
            });
        }
        
        if (fpsSlider) {
            fpsSlider.addEventListener('input', (e) => {
                document.getElementById('gifFPSValue').textContent = `${e.target.value}fps`;
            });
        }
        
        // Generate GIF
        document.getElementById('generateGIFBtn')?.addEventListener('click', () => {
            if (gifFrames.length === 0) {
                alert('Please upload video/images first!');
                return;
            }
            
            this.generateGIF(gifFrames);
        });
    }
    
    async extractVideoFrames(videoFile) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const frameCount = 12;
                const interval = video.duration / frameCount;
                
                for (let i = 0; i < frameCount; i++) {
                    video.currentTime = i * interval;
                    
                    video.onseeked = () => {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        this.gifFrames.push(canvas.toDataURL());
                        
                        if (this.gifFrames.length === frameCount) {
                            this.updateGIFPreview();
                            resolve();
                        }
                    };
                }
            };
        });
    }
    
    updateGIFPreview() {
        const gifFramesContainer = document.getElementById('gifFrames');
        if (!gifFramesContainer) return;
        
        gifFramesContainer.innerHTML = '';
        
        this.gifFrames.slice(0, 12).forEach((frame, index) => {
            const frameElement = document.createElement('div');
            frameElement.className = 'gif-frame';
            frameElement.innerHTML = `<img src="${frame}" alt="Frame ${index + 1}">`;
            gifFramesContainer.appendChild(frameElement);
        });
        
        // Update info
        document.getElementById('gifFrameCount').textContent = `${this.gifFrames.length} frames`;
        
        const fps = parseInt(document.getElementById('gifFPS')?.value || 10);
        const duration = this.gifFrames.length / fps;
        document.getElementById('gifDuration').textContent = `${duration.toFixed(1)}s`;
    }
    
    generateGIF(frames) {
        // This is a simplified version
        // In a real app, you would use gif.js or similar library
        const link = document.createElement('a');
        link.download = 'shome-meme.gif';
        link.href = 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif'; // Placeholder
        link.click();
        
        alert('GIF generated and downloaded!');
    }
    
    // ===== ADVANCED TEXT STYLING =====
    setupAdvancedText() {
        // Text position buttons
        document.querySelectorAll('.position-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyTextPosition(e.target.dataset.position);
            });
        });
        
        // Text effects
        document.getElementById('outlineWidth')?.addEventListener('input', (e) => {
            this.applyTextEffect('outline', e.target.value);
        });
        
        document.getElementById('outlineColor')?.addEventListener('input', (e) => {
            this.applyTextEffect('outlineColor', e.target.value);
        });
        
        document.getElementById('shadowBlur')?.addEventListener('input', (e) => {
            this.applyTextEffect('shadow', e.target.value);
        });
        
        document.getElementById('shadowColor')?.addEventListener('input', (e) => {
            this.applyTextEffect('shadowColor', e.target.value);
        });
        
        document.getElementById('applyGradientBtn')?.addEventListener('click', () => {
            const start = document.getElementById('gradientStart')?.value || '#FF0000';
            const end = document.getElementById('gradientEnd')?.value || '#0000FF';
            this.applyTextEffect('gradient', { start, end });
        });
        
        // Font style buttons
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                this.applyTextStyle(e.target.dataset.style);
            });
        });
        
        // Add text button
        document.getElementById('addTextBtn')?.addEventListener('click', () => {
            this.addTextElement();
        });
    }
    
    applyTextPosition(position) {
        // Apply text position to canvas
        console.log('Applying text position:', position);
    }
    
    applyTextEffect(effect, value) {
        // Apply text effect to canvas
        console.log('Applying text effect:', effect, value);
    }
    
    applyTextStyle(style) {
        // Apply font style to canvas
        console.log('Applying text style:', style);
    }
    
    addTextElement() {
        const text = document.getElementById('memeText')?.value || 'Your Text Here';
        this.textElements.push({
            text,
            x: 100,
            y: 100,
            fontSize: 48,
            color: '#ffffff',
            fontFamily: 'Impact'
        });
        
        this.redrawCanvas();
    }
    
    redrawCanvas() {
        // Redraw canvas with all elements
        const canvas = document.getElementById('memeCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw image if exists
        // Draw text elements
        this.textElements.forEach(textEl => {
            ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
            ctx.fillStyle = textEl.color;
            ctx.fillText(textEl.text, textEl.x, textEl.y);
        });
        
        // Draw stickers
        this.stickers.forEach(sticker => {
            // Draw sticker
        });
    }
    
    // ===== STICKER LIBRARY =====
    setupStickerLibrary() {
        this.loadStickers('emoji');
        
        // Category switcher
        document.querySelectorAll('.sticker-category').forEach(category => {
            category.addEventListener('click', (e) => {
                document.querySelectorAll('.sticker-category').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.loadStickers(e.target.dataset.category);
            });
        });
        
        // Add sticker button
        document.getElementById('addStickerBtn')?.addEventListener('click', () => {
            const stickers = this.stickerLibrary.emoji;
            const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
            this.addSticker(randomSticker);
        });
        
        // Custom sticker upload
        document.getElementById('uploadStickerBtn')?.addEventListener('click', () => {
            document.getElementById('stickerUpload')?.click();
        });
        
        document.getElementById('stickerUpload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.stickerLibrary.custom.push(event.target.result);
                    this.loadStickers('custom');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    loadStickers(category) {
        const stickerGrid = document.getElementById('stickerGrid');
        if (!stickerGrid) return;
        
        stickerGrid.innerHTML = '';
        
        this.stickerLibrary[category].forEach((sticker, index) => {
            const stickerItem = document.createElement('div');
            stickerItem.className = 'sticker-item';
            stickerItem.dataset.index = index;
            
            if (typeof sticker === 'string') {
                stickerItem.textContent = sticker;
            } else {
                const img = document.createElement('img');
                img.src = sticker;
                img.alt = 'Sticker';
                stickerItem.appendChild(img);
            }
            
            stickerItem.addEventListener('click', () => {
                this.addSticker(sticker);
            });
            
            stickerGrid.appendChild(stickerItem);
        });
    }
    
    addSticker(sticker) {
        this.stickers.push({
            type: typeof sticker === 'string' ? 'emoji' : 'image',
            content: sticker,
            x: Math.random() * 300,
            y: Math.random() * 300,
            scale: 1
        });
        
        this.redrawCanvas();
    }
    
    // ===== AUDIO CONTROLS =====
    setupAudioControls() {
        let audioPlayer = null;
        
        document.getElementById('uploadAudioBtn')?.addEventListener('click', () => {
            document.getElementById('audioUpload')?.click();
        });
        
        document.getElementById('audioUpload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                if (!audioPlayer) {
                    audioPlayer = new Audio();
                }
                audioPlayer.src = url;
                
                audioPlayer.onloadedmetadata = () => {
                    const duration = audioPlayer.duration;
                    document.querySelector('.audio-duration').textContent = this.formatTime(duration);
                };
            }
        });
        
        document.getElementById('playAudio')?.addEventListener('click', () => {
            if (audioPlayer) {
                if (audioPlayer.paused) {
                    audioPlayer.play();
                } else {
                    audioPlayer.pause();
                }
            }
        });
        
        document.getElementById('audioVolume')?.addEventListener('input', (e) => {
            if (audioPlayer) {
                audioPlayer.volume = e.target.value / 100;
            }
        });
    }
    
    // ===== CLOUD STORAGE =====
    setupCloudStorage() {
        this.loadCloudSaves();
        
        // Save to cloud
        document.getElementById('saveToCloudBtn')?.addEventListener('click', () => {
            this.saveToCloud();
        });
        
        // Load from cloud
        document.getElementById('loadFromCloudBtn')?.addEventListener('click', () => {
            this.openCloudModal();
        });
        
        // Close cloud modal
        document.getElementById('closeCloud')?.addEventListener('click', () => {
            document.getElementById('cloudModal').classList.remove('active');
        });
    }
    
    saveToCloud() {
        const canvas = document.getElementById('memeCanvas');
        if (!canvas) {
            alert('Please create something first!');
            return;
        }