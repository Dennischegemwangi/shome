// modules/videoEditor.js
//import { showToast, generateUniqueId, formatTime } from './utils.js';

// modules/videoEditor.js - CORRECTED IMPORTS
import { 
    showToast, 
    generateUniqueId, 
    formatTime,
    showLoading,
    hideLoading 
} from './utils.js';

let videoElement = null;
let videoStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let recordingStartTime = 0;
let recordingTimer = null;
let currentVideoFile = null;

// Initialize video editor
export function initVideoEditor() {
    console.log('✅ Video editor initialized');
    
    // Set up video editor UI
    setupVideoEditorUI();
    
    // Set up video player
    setupVideoPlayer();
    
    // Set up recording functionality
    setupRecording();
}

// Set up video editor UI
function setupVideoEditorUI() {
    // Video editor modal controls
    const closeVideoEditorBtn = document.getElementById('closeVideoEditor');
    const cancelVideoEditBtn = document.getElementById('cancelVideoEdit');
    const saveVideoBtn = document.getElementById('saveVideo');
    const useInMemeBtn = document.getElementById('useInMeme');
    
    if (closeVideoEditorBtn) {
        closeVideoEditorBtn.addEventListener('click', closeVideoEditor);
    }
    
    if (cancelVideoEditBtn) {
        cancelVideoEditBtn.addEventListener('click', closeVideoEditor);
    }
    
    if (saveVideoBtn) {
        saveVideoBtn.addEventListener('click', saveVideo);
    }
    
    if (useInMemeBtn) {
        useInMemeBtn.addEventListener('click', useVideoInMeme);
    }
    
    // Trim controls
    setupTrimControls();
    
    // Speed controls
    setupSpeedControls();
    
    // Audio controls
    setupAudioControls();
    
    // Text overlay controls
    setupTextOverlayControls();
    
    // Effects controls
    setupEffectsControls();
}

// Set up video player
function setupVideoPlayer() {
    videoElement = document.getElementById('videoPreview');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const videoSeek = document.getElementById('videoSeek');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    const muteBtn = document.getElementById('muteBtn');
    
    if (!videoElement) return;
    
    // Play/Pause button
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    // Seek bar
    if (videoSeek) {
        videoSeek.addEventListener('input', () => {
            if (videoElement.duration) {
                videoElement.currentTime = (videoElement.duration * videoSeek.value) / 100;
            }
        });
    }
    
    // Time updates
    videoElement.addEventListener('timeupdate', () => {
        if (!videoElement.duration) return;
        
        // Update seek bar
        if (videoSeek) {
            videoSeek.value = (videoElement.currentTime / videoElement.duration) * 100;
        }
        
        // Update current time
        if (currentTime) {
            currentTime.textContent = formatVideoTime(videoElement.currentTime);
        }
    });
    
    // Duration update
    videoElement.addEventListener('loadedmetadata', () => {
        if (duration) {
            duration.textContent = formatVideoTime(videoElement.duration);
        }
        
        // Update trim end input
        const trimEndInput = document.getElementById('trimEnd');
        if (trimEndInput) {
            trimEndInput.max = Math.floor(videoElement.duration);
            trimEndInput.value = Math.floor(videoElement.duration);
        }
    });
    
    // Mute button
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }
    
    // Play/Pause on video click
    videoElement.addEventListener('click', togglePlayPause);
}

// Set up trim controls
function setupTrimControls() {
    const trimStartInput = document.getElementById('trimStart');
    const trimEndInput = document.getElementById('trimEnd');
    const trimStartHandle = document.getElementById('trimStartHandle');
    const trimEndHandle = document.getElementById('trimEndHandle');
    
    if (!trimStartInput || !trimEndInput) return;
    
    // Update trim handles when inputs change
    trimStartInput.addEventListener('input', () => {
        updateTrimHandlePosition('start', trimStartInput.value);
        applyTrimToVideo();
    });
    
    trimEndInput.addEventListener('input', () => {
        updateTrimHandlePosition('end', trimEndInput.value);
        applyTrimToVideo();
    });
    
    // Update inputs when handles are dragged
    if (trimStartHandle && trimEndHandle) {
        setupTrimHandleDrag(trimStartHandle, 'start');
        setupTrimHandleDrag(trimEndHandle, 'end');
    }
}

// Set up trim handle dragging
function setupTrimHandleDrag(handle, type) {
    let isDragging = false;
    let startX = 0;
    let startValue = 0;
    
    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startValue = parseFloat(document.getElementById(`trim${type.charAt(0).toUpperCase() + type.slice(1)}`).value);
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const trackWidth = handle.parentElement.offsetWidth;
        const deltaX = e.clientX - startX;
        const deltaValue = (deltaX / trackWidth) * (videoElement?.duration || 10);
        
        const input = document.getElementById(`trim${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (input) {
            let newValue = Math.max(0, Math.min(videoElement?.duration || 10, startValue + deltaValue));
            input.value = newValue.toFixed(1);
            updateTrimHandlePosition(type, newValue);
            applyTrimToVideo();
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Touch support
    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startValue = parseFloat(document.getElementById(`trim${type.charAt(0).toUpperCase() + type.slice(1)}`).value);
        
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const trackWidth = handle.parentElement.offsetWidth;
        const deltaX = e.touches[0].clientX - startX;
        const deltaValue = (deltaX / trackWidth) * (videoElement?.duration || 10);
        
        const input = document.getElementById(`trim${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (input) {
            let newValue = Math.max(0, Math.min(videoElement?.duration || 10, startValue + deltaValue));
            input.value = newValue.toFixed(1);
            updateTrimHandlePosition(type, newValue);
            applyTrimToVideo();
        }
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// Update trim handle position
function updateTrimHandlePosition(type, value) {
    const handle = document.getElementById(`trim${type.charAt(0).toUpperCase() + type.slice(1)}Handle`);
    const track = handle?.parentElement;
    
    if (!handle || !track || !videoElement?.duration) return;
    
    const percentage = (value / videoElement.duration) * 100;
    handle.style.left = `${percentage}%`;
}

// Apply trim to video
function applyTrimToVideo() {
    if (!videoElement) return;
    
    const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
    const trimEnd = parseFloat(document.getElementById('trimEnd').value) || videoElement.duration;
    
    // Update video playback
    if (videoElement.currentTime < trimStart) {
        videoElement.currentTime = trimStart;
    }
    
    // Store trim values for export
    videoElement.dataset.trimStart = trimStart;
    videoElement.dataset.trimEnd = trimEnd;
}

// Set up speed controls
function setupSpeedControls() {
    const speedBtns = document.querySelectorAll('.speed-btn');
    
    speedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const speed = parseFloat(btn.getAttribute('data-speed'));
            adjustVideoSpeed(speed);
            
            // Update UI
            speedBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Adjust video speed
export function adjustVideoSpeed(speed) {
    if (!videoElement) return;
    
    videoElement.playbackRate = speed;
    showToast(`Speed set to ${speed}x`, 'info');
}

// Set up audio controls
function setupAudioControls() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const addMusicBtn = document.getElementById('addMusicBtn');
    const recordAudioBtn = document.getElementById('recordAudioBtn');
    const musicUpload = document.getElementById('musicUpload');
    
    if (volumeSlider && volumeValue) {
        volumeSlider.addEventListener('input', () => {
            const volume = volumeSlider.value / 100;
            if (videoElement) {
                videoElement.volume = volume;
            }
            volumeValue.textContent = `${volumeSlider.value}%`;
        });
    }
    
    if (addMusicBtn && musicUpload) {
        addMusicBtn.addEventListener('click', () => {
            musicUpload.click();
        });
        
        musicUpload.addEventListener('change', handleMusicUpload);
    }
    
    if (recordAudioBtn) {
        recordAudioBtn.addEventListener('click', recordAudio);
    }
}

// Handle music upload
async function handleMusicUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
        showToast('Please upload an audio file', 'error');
        return;
    }
    
    showLoading('Adding music...');
    
    try {
        // In a real app, you would mix the audio with video
        // For demo, we'll just show a success message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast('Music added to video', 'success');
        
        // Store audio file for later processing
        currentVideoFile = {
            ...currentVideoFile,
            audioTrack: file
        };
        
    } catch (error) {
        console.error('Error adding music:', error);
        showToast('Failed to add music', 'error');
    } finally {
        hideLoading();
        e.target.value = '';
    }
}

// Record audio
async function recordAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            // Store recorded audio
            currentVideoFile = {
                ...currentVideoFile,
                recordedAudio: audioBlob
            };
            
            showToast('Voice recording added', 'success');
            stream.getTracks().forEach(track => track.stop());
        };
        
        // Start recording
        mediaRecorder.start();
        showToast('Recording audio... Click again to stop', 'info');
        
        // Toggle recording on second click
        recordAudioBtn.onclick = () => {
            mediaRecorder.stop();
            recordAudioBtn.onclick = recordAudio;
            recordAudioBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Voice';
        };
        
        recordAudioBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        
    } catch (error) {
        console.error('Error recording audio:', error);
        showToast('Could not access microphone', 'error');
    }
}

// Set up text overlay controls
function setupTextOverlayControls() {
    const videoTextInput = document.getElementById('videoText');
    const addVideoTextBtn = document.getElementById('addVideoText');
    const videoFontSelect = document.getElementById('videoFontSelect');
    const videoTextColor = document.getElementById('videoTextColor');
    const videoTextSize = document.getElementById('videoTextSize');
    
    if (!addVideoTextBtn) return;
    
    addVideoTextBtn.addEventListener('click', () => {
        const text = videoTextInput.value.trim();
        if (!text) {
            showToast('Please enter text', 'warning');
            return;
        }
        
        const font = videoFontSelect.value;
        const color = videoTextColor.value;
        const size = videoTextSize.value;
        
        addTextToVideo(text, font, color, size);
        videoTextInput.value = '';
    });
    
    videoTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addVideoTextBtn.click();
        }
    });
}

// Add text to video
export function addTextToVideo(text, font = 'Arial', color = '#ffffff', size = 36) {
    if (!videoElement) return;
    
    // Create text overlay element
    const overlay = document.createElement('div');
    overlay.className = 'video-text-overlay';
    overlay.textContent = text;
    overlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: ${font};
        color: ${color};
        font-size: ${size}px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        pointer-events: none;
        z-index: 10;
        white-space: nowrap;
        background: rgba(0,0,0,0.3);
        padding: 10px 20px;
        border-radius: 5px;
    `;
    
    // Add to video container
    const videoContainer = videoElement.parentElement;
    if (videoContainer) {
        videoContainer.style.position = 'relative';
        videoContainer.appendChild(overlay);
        
        // Store overlay for export
        if (!videoElement.dataset.textOverlays) {
            videoElement.dataset.textOverlays = JSON.stringify([]);
        }
        
        const overlays = JSON.parse(videoElement.dataset.textOverlays);
        overlays.push({ text, font, color, size });
        videoElement.dataset.textOverlays = JSON.stringify(overlays);
        
        showToast('Text added to video', 'success');
    }
}

// Set up effects controls
function setupEffectsControls() {
    const effectBtns = document.querySelectorAll('.effect-btn');
    
    effectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const effect = btn.getAttribute('data-effect');
            applyVideoEffect(effect);
            
            // Update UI
            effectBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Apply video effect
export function applyVideoEffect(effect) {
    if (!videoElement) return;
    
    // Remove existing effects
    videoElement.style.filter = 'none';
    
    switch(effect) {
        case 'blackwhite':
            videoElement.style.filter = 'grayscale(100%)';
            break;
        case 'vintage':
            videoElement.style.filter = 'sepia(100%) brightness(0.9) contrast(1.2)';
            break;
        case 'vibrant':
            videoElement.style.filter = 'saturate(200%) contrast(1.2)';
            break;
        case 'blur':
            videoElement.style.filter = 'blur(2px)';
            break;
        case 'none':
        default:
            videoElement.style.filter = 'none';
    }
    
    // Store effect for export
    videoElement.dataset.effect = effect;
    
    if (effect !== 'none') {
        showToast(`${effect} effect applied`, 'info');
    }
}

// Set up recording functionality
function setupRecording() {
    const startRecordingBtn = document.getElementById('startRecording');
    const stopRecordingBtn = document.getElementById('stopRecording');
    const flipCameraBtn = document.getElementById('flipCamera');
    const takePhotoBtn = document.getElementById('takePhoto');
    const recordingTime = document.getElementById('recordingTime');
    const webcamPreview = document.getElementById('webcamPreview');
    
    if (!startRecordingBtn || !webcamPreview) return;
    
    // Initialize webcam
    initWebcam();
    
    // Start recording
    startRecordingBtn.addEventListener('click', startRecording);
    
    // Stop recording
    stopRecordingBtn.addEventListener('click', stopRecording);
    
    // Flip camera
    if (flipCameraBtn) {
        flipCameraBtn.addEventListener('click', flipCamera);
    }
    
    // Take photo
    if (takePhotoBtn) {
        takePhotoBtn.addEventListener('click', takePhoto);
    }
}

// Initialize webcam
async function initWebcam() {
    try {
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: true
        };
        
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        const webcamPreview = document.getElementById('webcamPreview');
        
        if (webcamPreview) {
            webcamPreview.srcObject = videoStream;
        }
        
        // Enable recording buttons
        const startRecordingBtn = document.getElementById('startRecording');
        if (startRecordingBtn) {
            startRecordingBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error accessing webcam:', error);
        showToast('Could not access webcam. Please check permissions.', 'error');
    }
}

// Start recording
async function startRecording() {
    if (!videoStream || isRecording) return;
    
    try {
        const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
            ? 'video/webm; codecs=vp9'
            : 'video/webm';
        
        mediaRecorder = new MediaRecorder(videoStream, { mimeType });
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            
            // Load recorded video into editor
            loadVideoIntoEditor(url);
            
            // Stop webcam
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                videoStream = null;
            }
            
            // Close webcam modal
            document.getElementById('webcamModal').classList.remove('active');
        };
        
        // Start recording
        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = Date.now();
        
        // Update UI
        const startRecordingBtn = document.getElementById('startRecording');
        const stopRecordingBtn = document.getElementById('stopRecording');
        
        if (startRecordingBtn) startRecordingBtn.disabled = true;
        if (stopRecordingBtn) stopRecordingBtn.disabled = false;
        
        // Start timer
        startRecordingTimer();
        
        showToast('Recording started', 'info');
        
    } catch (error) {
        console.error('Error starting recording:', error);
        showToast('Failed to start recording', 'error');
    }
}

// Stop recording
function stopRecording() {
    if (!mediaRecorder || !isRecording) return;
    
    mediaRecorder.stop();
    isRecording = false;
    
    // Update UI
    const startRecordingBtn = document.getElementById('startRecording');
    const stopRecordingBtn = document.getElementById('stopRecording');
    
    if (startRecordingBtn) startRecordingBtn.disabled = false;
    if (stopRecordingBtn) stopRecordingBtn.disabled = true;
    
    // Stop timer
    stopRecordingTimer();
    
    showToast('Recording stopped', 'info');
}

// Start recording timer
function startRecordingTimer() {
    const recordingTime = document.getElementById('recordingTime');
    if (!recordingTime) return;
    
    recordingTimer = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        recordingTime.textContent = formatVideoTime(elapsed / 1000);
    }, 1000);
}

// Stop recording timer
function stopRecordingTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
}

// Flip camera
async function flipCamera() {
    if (!videoStream) return;
    
    try {
        // Stop current stream tracks
        videoStream.getTracks().forEach(track => track.stop());
        
        // Get current facing mode from settings, not constraints
        const currentTrack = videoStream.getVideoTracks()[0];
        const currentSettings = currentTrack.getSettings();
        const currentFacingMode = currentSettings.facingMode || 'user';
        
        // Toggle facing mode
        let newFacingMode;
        if (currentFacingMode === 'user') {
            newFacingMode = 'environment';
        } else if (currentFacingMode === 'environment') {
            newFacingMode = 'user';
        } else {
            // If facingMode is undefined or something else, default to toggling
            newFacingMode = 'environment'; // Try back camera first
        }
        
        console.log('Switching from', currentFacingMode, 'to', newFacingMode);
        
        // Try to get the new camera
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: { exact: newFacingMode }
            },
            audio: true
        };
        
        let newStream;
        try {
            // First try with exact facing mode
            newStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (exactError) {
            console.log('Exact facing mode failed, trying with ideal:', exactError);
            
            // Fallback: try without exact constraint
            const fallbackConstraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: newFacingMode // Use ideal instead of exact
                },
                audio: true
            };
            
            try {
                newStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            } catch (fallbackError) {
                console.log('Fallback also failed, trying any camera:', fallbackError);
                
                // Last resort: get any available camera
                const anyCameraConstraints = {
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                        // No facingMode specified
                    },
                    audio: true
                };
                
                newStream = await navigator.mediaDevices.getUserMedia(anyCameraConstraints);
            }
        }
        
        // Update video stream
        videoStream = newStream;
        
        const webcamPreview = document.getElementById('webcamPreview');
        if (webcamPreview) {
            webcamPreview.srcObject = videoStream;
        }
        
        // Update button states if needed
        const startRecordingBtn = document.getElementById('startRecording');
        if (startRecordingBtn) {
            startRecordingBtn.disabled = false;
        }
        
        showToast(`Camera switched to ${newFacingMode === 'user' ? 'front' : 'rear'}`, 'success');
        
    } catch (error) {
        console.error('Error flipping camera:', error);
        
        let errorMessage = 'Could not switch camera. ';
        
        if (error.name === 'NotReadableError') {
            errorMessage += 'Camera is busy or not available.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No other camera found on this device.';
        } else if (error.name === 'NotAllowedError') {
            errorMessage += 'Camera permission denied.';
        } else if (error.name === 'OverconstrainedError') {
            errorMessage += 'Requested camera not available.';
        } else {
            errorMessage += error.message || 'Unknown error.';
        }
        
        showToast(errorMessage, 'error');
        
        // Try to reinitialize the original camera
        try {
            await initWebcam();
        } catch (reinitError) {
            console.error('Failed to reinitialize webcam:', reinitError);
        }
    }
}

// Take photo
function takePhoto() {
    if (!videoStream) return;
    
    const webcamPreview = document.getElementById('webcamPreview');
    const canvas = document.getElementById('webcamCanvas');
    const context = canvas.getContext('2d');
    
    if (!webcamPreview || !canvas || !context) return;
    
    // Set canvas dimensions to match video
    canvas.width = webcamPreview.videoWidth;
    canvas.height = webcamPreview.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(webcamPreview, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob
    canvas.toBlob((blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Photo saved!', 'success');
    }, 'image/jpeg', 0.9);
}

// Load video into editor
function loadVideoIntoEditor(videoUrl) {
    if (!videoElement) return;
    
    videoElement.src = videoUrl;
    videoElement.load();
    
    // Show video editor
    document.getElementById('videoEditorModal').classList.add('active');
    
    // Store video file
    fetch(videoUrl)
        .then(res => res.blob())
        .then(blob => {
            currentVideoFile = {
                blob: blob,
                url: videoUrl,
                type: 'video/webm',
                name: `recording_${Date.now()}.webm`
            };
        });
}

// Save edited video
export async function saveVideo() {
    if (!videoElement || !currentVideoFile) {
        showToast('No video to save', 'error');
        return;
    }
    
    showLoading('Processing video...');
    
    try {
        // In a real app, you would:
        // 1. Apply trim
        // 2. Apply speed
        // 3. Add text overlays
        // 4. Apply effects
        // 5. Mix audio
        
        // For demo, we'll just download the original
        const processedBlob = await processVideo();
        
        // Create download link
        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited_video_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Video saved successfully!', 'success');
        
        // Close editor
        closeVideoEditor();
        
    } catch (error) {
        console.error('Error saving video:', error);
        showToast('Failed to save video', 'error');
    } finally {
        hideLoading();
    }
}

// Process video (simulated)
async function processVideo() {
    return new Promise((resolve) => {
        // In a real app, use FFmpeg or similar library
        // For demo, return the original blob
        setTimeout(() => {
            resolve(currentVideoFile.blob);
        }, 2000);
    });
}

// Use video in meme
function useVideoInMeme() {
    if (!currentVideoFile) {
        showToast('No video to use', 'error');
        return;
    }
    
    // Convert video to GIF or use in meme editor
    showToast('Video ready for meme creation', 'success');
    
    // Close video editor
    closeVideoEditor();
    
    // Open meme editor
    document.getElementById('memeEditorModal').classList.add('active');
    
    // You could add functionality to convert video to GIF
    // or use the first frame as an image
}

// Close video editor
function closeVideoEditor() {
    // Stop any playing video
    if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
    }
    
    // Stop webcam if active
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    // Close modal
    document.getElementById('videoEditorModal').classList.remove('active');
    
    // Reset
    currentVideoFile = null;
    recordedChunks = [];
    isRecording = false;
}

// Toggle play/pause
function togglePlayPause() {
    if (!videoElement) return;
    
    if (videoElement.paused) {
        videoElement.play();
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        videoElement.pause();
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Toggle mute
function toggleMute() {
    if (!videoElement) return;
    
    videoElement.muted = !videoElement.muted;
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
        muteBtn.innerHTML = videoElement.muted 
            ? '<i class="fas fa-volume-mute"></i>'
            : '<i class="fas fa-volume-up"></i>';
    }
}

// Format video time (MM:SS)
function formatVideoTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Trim video
export function trimVideo(startTime, endTime) {
    if (!videoElement) return;
    
    // In a real app, you would use FFmpeg or similar
    // For demo, just update the UI
    videoElement.dataset.trimStart = startTime;
    videoElement.dataset.trimEnd = endTime;
    
    showToast(`Video trimmed to ${startTime}-${endTime}s`, 'info');
}

// Video editor styles
const videoEditorStyles = `
    .video-text-overlay {
        animation: fadeIn 0.3s ease;
    }
    
    .recording-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: #ff4444;
        border-radius: 50%;
        margin-right: 8px;
        animation: pulse 1s infinite;
    }
    
    .record-btn {
        transition: all 0.3s ease;
    }
    
    .record-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .trim-handle {
        transition: left 0.2s ease;
    }
    
    .trim-handle:active {
        cursor: grabbing;
    }
    
    .speed-btn.active {
        background: var(--primary-color);
        color: white;
        transform: scale(1.05);
    }
    
    .effect-btn.active {
        background: var(--primary-color);
        color: white;
        transform: scale(1.05);
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;

// Add styles to document
const videoStyleSheet = document.createElement('style');
videoStyleSheet.textContent = videoEditorStyles;
document.head.appendChild(videoStyleSheet);
// Export all public functions
export {
   /*initVideoEditor,
    trimVideo,
    adjustVideoSpeed,
    addTextToVideo,
    applyVideoEffect,*/
   saveVideo as saveEditedVideo
};