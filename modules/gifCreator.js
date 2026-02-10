// modules/gifCreator.js
//import { showToast, generateUniqueId, formatTime } from './utils.js';
// modules/gifCreator.js - CORRECTED IMPORTS
import { 
    showToast, 
    generateUniqueId, 
    formatTime,
   // showLoading,
   // hideLoading 
} from './utils.js';

let gif = null;
let gifRecorder = null;
let recordedFrames = [];
let isRecordingGif = false;
let recordingStartTime = 0;
let recordingInterval = null;
let currentGifSource = null;

// Initialize GIF creator
export function initGifCreator() {
    console.log('✅ GIF creator initialized');
    
    // Check if GIF.js is available
    if (typeof GIF === 'undefined') {
        console.warn('GIF.js not loaded. GIF creation will be limited.');
        showToast('GIF creation requires GIF.js library', 'warning');
    }
    
    // Set up GIF creator UI
    setupGifCreatorUI();
    
    // Set up GIF preview
    setupGifPreview();
}

// Set up GIF creator UI
function setupGifCreatorUI() {
    const gifModal = document.getElementById('gifModal');
    const closeGifBtn = document.getElementById('closeGif');
    const cancelGifBtn = document.getElementById('cancelGif');
    const saveGifBtn = document.getElementById('saveGif');
    const useGifInMemeBtn = document.getElementById('useGifInMeme');
    const previewGifBtn = document.getElementById('previewGif');
    const stopPreviewBtn = document.getElementById('stopPreview');
    
    if (!gifModal) return;
    
    // Close button
    if (closeGifBtn) {
        closeGifBtn.addEventListener('click', closeGifCreator);
    }
    
    // Cancel button
    if (cancelGifBtn) {
        cancelGifBtn.addEventListener('click', closeGifCreator);
    }
    
    // Save button
    if (saveGifBtn) {
        saveGifBtn.addEventListener('click', saveGif);
    }
    
    // Use in meme button
    if (useGifInMemeBtn) {
        useGifInMemeBtn.addEventListener('click', useGifInMeme);
    }
    
    // Preview button
    if (previewGifBtn) {
        previewGifBtn.addEventListener('click', previewGif);
    }
    
    // Stop preview button
    if (stopPreviewBtn) {
        stopPreviewBtn.addEventListener('click', stopGifPreview);
    }
    
    // Source selection
    setupSourceSelection();
    
    // Settings controls
    setupGifSettings();
    
    // Open from meme editor
    const createGifBtn = document.getElementById('createGifBtn');
    const recordGifBtn = document.getElementById('recordGifBtn');
    
    if (createGifBtn) {
        createGifBtn.addEventListener('click', () => {
            gifModal.classList.add('active');
            resetGifCreator();
        });
    }
    
    if (recordGifBtn) {
        recordGifBtn.addEventListener('click', () => {
            gifModal.classList.add('active');
            switchToSource('webcam');
        });
    }
}

// Set up source selection
function setupSourceSelection() {
    const sourceBtns = document.querySelectorAll('.source-btn');
    const sourceUpload = document.getElementById('gifSourceUpload');
    
    if (!sourceBtns.length || !sourceUpload) return;
    
    sourceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const source = btn.getAttribute('data-source');
            switchToSource(source);
            
            // Update UI
            sourceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    sourceUpload.addEventListener('change', handleSourceUpload);
}

// Switch to source
function switchToSource(source) {
    currentGifSource = source;
    
    // Hide all source-specific UI
    document.querySelectorAll('.source-specific').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show relevant UI
    switch(source) {
        case 'upload':
            // Show upload instructions
            showUploadInstructions();
            break;
        case 'webcam':
            // Initialize webcam
            initGifWebcam();
            break;
        case 'images':
            // Show image upload
            showImageUpload();
            break;
    }
    
    // Update settings based on source
    updateSettingsForSource(source);
}

// Handle source upload
async function handleSourceUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    showLoading('Processing files...');
    
    try {
        const sourceType = currentGifSource === 'images' ? 'images' : 'video';
        
        if (sourceType === 'video') {
            // Process video file
            const videoFile = files[0];
            await createGifFromVideoFile(videoFile);
        } else {
            // Process image files
            await createGifFromImageFiles(files);
        }
    } catch (error) {
        console.error('Error processing source:', error);
        showToast('Failed to process files', 'error');
    } finally {
        hideLoading();
        e.target.value = '';
    }
}

// Show upload instructions
function showUploadInstructions() {
    const gifPreview = document.getElementById('gifPreview');
    if (!gifPreview) return;
    
    gifPreview.innerHTML = `
        <div class="upload-instructions">
            <i class="fas fa-cloud-upload-alt"></i>
            <h4>Upload Video or Images</h4>
            <p>Drag & drop or click to upload</p>
            <small>Supports MP4, WebM, JPEG, PNG</small>
        </div>
    `;
    
    // Make preview clickable
    gifPreview.style.cursor = 'pointer';
    gifPreview.onclick = () => {
        document.getElementById('gifSourceUpload').click();
    };
    
    // Add drag & drop
    gifPreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        gifPreview.classList.add('dragover');
    });
    
    gifPreview.addEventListener('dragleave', () => {
        gifPreview.classList.remove('dragover');
    });
    
    gifPreview.addEventListener('drop', (e) => {
        e.preventDefault();
        gifPreview.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;
        
        // Process dropped files
        handleDroppedFiles(files);
    });
}

// Handle dropped files
async function handleDroppedFiles(files) {
    showLoading('Processing dropped files...');
    
    try {
        // Check file types
        const videoFiles = files.filter(f => f.type.startsWith('video/'));
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        
        if (videoFiles.length > 0) {
            // Use first video file
            await createGifFromVideoFile(videoFiles[0]);
        } else if (imageFiles.length > 0) {
            // Use image files
            await createGifFromImageFiles(imageFiles);
        } else {
            throw new Error('No supported files found');
        }
    } catch (error) {
        console.error('Error with dropped files:', error);
        showToast('Unsupported file type', 'error');
    } finally {
        hideLoading();
    }
}

// Initialize GIF webcam
async function initGifWebcam() {
    const gifPreview = document.getElementById('gifPreview');
    if (!gifPreview) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });
        
        gifPreview.innerHTML = `
            <video id="gifWebcamPreview" autoplay muted playsinline></video>
            <div class="webcam-controls">
                <button id="startGifRecording" class="record-btn">
                    <i class="fas fa-circle"></i> Record GIF
                </button>
                <button id="stopGifRecording" class="record-btn stop" disabled>
                    <i class="fas fa-square"></i> Stop
                </button>
            </div>
        `;
        
        const video = document.getElementById('gifWebcamPreview');
        video.srcObject = stream;
        
        // Set up recording buttons
        const startBtn = document.getElementById('startGifRecording');
        const stopBtn = document.getElementById('stopGifRecording');
        
        if (startBtn) {
            startBtn.addEventListener('click', startGifRecording);
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', stopGifRecording);
        }
        
        // Store stream for cleanup
        window.gifWebcamStream = stream;
        
    } catch (error) {
        console.error('Error accessing webcam:', error);
        gifPreview.innerHTML = `
            <div class="webcam-error">
                <i class="fas fa-video-slash"></i>
                <h4>Camera Access Required</h4>
                <p>Please allow camera access to record GIFs</p>
            </div>
        `;
    }
}

// Show image upload
function showImageUpload() {
    const gifPreview = document.getElementById('gifPreview');
    if (!gifPreview) return;
    
    gifPreview.innerHTML = `
        <div class="image-upload-instructions">
            <i class="fas fa-images"></i>
            <h4>Upload Multiple Images</h4>
            <p>Select 2-10 images to create a GIF</p>
            <button id="selectImagesBtn" class="action-btn">
                <i class="fas fa-folder-open"></i> Select Images
            </button>
        </div>
        <div id="imagePreviews" class="image-previews"></div>
    `;
    
    const selectBtn = document.getElementById('selectImagesBtn');
    if (selectBtn) {
        selectBtn.addEventListener('click', () => {
            document.getElementById('gifSourceUpload').click();
        });
    }
}

// Set up GIF settings
function setupGifSettings() {
    const durationSlider = document.getElementById('gifDuration');
    const durationValue = document.getElementById('durationValue');
    const frameRateSlider = document.getElementById('gifFrameRate');
    const frameRateValue = document.getElementById('frameRateValue');
    const qualitySlider = document.getElementById('gifQuality');
    const qualityValue = document.getElementById('qualityValue');
    const loopCheckbox = document.getElementById('gifLoop');
    
    if (durationSlider && durationValue) {
        durationSlider.addEventListener('input', () => {
            durationValue.textContent = `${durationSlider.value} seconds`;
        });
    }
    
    if (frameRateSlider && frameRateValue) {
        frameRateSlider.addEventListener('input', () => {
            frameRateValue.textContent = `${frameRateSlider.value} fps`;
        });
    }
    
    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = `${qualitySlider.value}/10`;
        });
    }
    
    if (loopCheckbox) {
        loopCheckbox.checked = true; // Default to loop
    }
}

// Update settings for source
function updateSettingsForSource(source) {
    const durationSlider = document.getElementById('gifDuration');
    
    if (!durationSlider) return;
    
    switch(source) {
        case 'webcam':
            // Shorter duration for webcam recording
            durationSlider.max = 15;
            if (parseInt(durationSlider.value) > 15) {
                durationSlider.value = 5;
            }
            break;
        case 'images':
            // Duration depends on number of images
            durationSlider.max = 30;
            break;
        case 'upload':
        default:
            durationSlider.max = 30;
    }
    
    // Update display
    const durationValue = document.getElementById('durationValue');
    if (durationValue) {
        durationValue.textContent = `${durationSlider.value} seconds`;
    }
}

// Set up GIF preview
function setupGifPreview() {
    const gifPreview = document.getElementById('gifPreview');
    if (!gifPreview) return;
    
    // Initial instructions
    showUploadInstructions();
}

// Create GIF from video
export async function createGifFromVideo(videoUrl, options = {}) {
    showLoading('Creating GIF from video...');
    
    try {
        // For demo, we'll simulate GIF creation
        // In production, use GIF.js or similar library
        
        const duration = options.duration || 5;
        const frameRate = options.frameRate || 10;
        const quality = options.quality || 7;
        
        // Simulate processing
        await simulateGifProcessing(duration * 1000);
        
        // Create mock GIF (in real app, this would be actual GIF creation)
        const mockGifUrl = 'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif';
        
        // Display preview
        displayGifPreview(mockGifUrl);
        
        // Store GIF data
        gif = {
            url: mockGifUrl,
            duration: duration,
            frameRate: frameRate,
            quality: quality,
            width: 480,
            height: 270,
            frames: duration * frameRate
        };
        
        showToast('GIF created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating GIF:', error);
        showToast('Failed to create GIF', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Create GIF from video file
async function createGifFromVideoFile(videoFile) {
    const videoUrl = URL.createObjectURL(videoFile);
    
    const options = {
        duration: parseInt(document.getElementById('gifDuration').value),
        frameRate: parseInt(document.getElementById('gifFrameRate').value),
        quality: parseInt(document.getElementById('gifQuality').value),
        loop: document.getElementById('gifLoop').checked
    };
    
    await createGifFromVideo(videoUrl, options);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(videoUrl), 1000);
}

// Create GIF from images
export async function createGifFromImages(imageUrls, options = {}) {
    showLoading('Creating GIF from images...');
    
    try {
        // For demo, simulate processing
        await simulateGifProcessing(3000);
        
        // Create mock GIF
        const mockGifUrl = 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif';
        
        // Display preview
        displayGifPreview(mockGifUrl);
        
        // Store GIF data
        gif = {
            url: mockGifUrl,
            duration: options.duration || 3,
            frameRate: options.frameRate || 10,
            quality: options.quality || 7,
            width: 400,
            height: 400,
            frames: imageUrls.length
        };
        
        showToast('GIF created from images!', 'success');
        
    } catch (error) {
        console.error('Error creating GIF from images:', error);
        showToast('Failed to create GIF', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Create GIF from image files
async function createGifFromImageFiles(imageFiles) {
    // Display image previews
    const previewsContainer = document.getElementById('imagePreviews');
    if (previewsContainer) {
        previewsContainer.innerHTML = imageFiles.map((file, i) => {
            const url = URL.createObjectURL(file);
            return `
                <div class="image-preview">
                    <img src="${url}" alt="Frame ${i + 1}" loading="lazy">
                    <span>${i + 1}</span>
                </div>
            `;
        }).join('');
        
        // Update duration based on number of images
        const durationSlider = document.getElementById('gifDuration');
        if (durationSlider) {
            const duration = Math.max(1, Math.min(imageFiles.length / 3, 10));
            durationSlider.value = Math.round(duration);
            
            const durationValue = document.getElementById('durationValue');
            if (durationValue) {
                durationValue.textContent = `${durationSlider.value} seconds`;
            }
        }
    }
    
    // Convert files to URLs
    const imageUrls = imageFiles.map(file => URL.createObjectURL(file));
    
    const options = {
        duration: parseInt(document.getElementById('gifDuration').value),
        frameRate: parseInt(document.getElementById('gifFrameRate').value),
        quality: parseInt(document.getElementById('gifQuality').value),
        loop: document.getElementById('gifLoop').checked
    };
    
    await createGifFromImages(imageUrls, options);
    
    // Clean up URLs
    imageUrls.forEach(url => setTimeout(() => URL.revokeObjectURL(url), 1000));
}

// Record GIF from webcam
export async function recordGifFromWebcam(options = {}) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Webcam not supported', 'error');
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // Wait for video to be ready
        await new Promise(resolve => {
            video.onloadedmetadata = resolve;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        
        recordedFrames = [];
        const duration = options.duration || 5;
        const frameRate = options.frameRate || 10;
        const totalFrames = duration * frameRate;
        const frameInterval = 1000 / frameRate;
        
        showLoading('Recording GIF...');
        
        // Start recording frames
        for (let i = 0; i < totalFrames; i++) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            recordedFrames.push(canvas.toDataURL('image/jpeg', 0.8));
            
            // Update progress
            updateGifProgress((i + 1) / totalFrames * 100);
            
            await new Promise(resolve => setTimeout(resolve, frameInterval));
        }
        
        // Stop webcam
        stream.getTracks().forEach(track => track.stop());
        
        // Create GIF from frames
        await createGifFromRecordedFrames(recordedFrames, options);
        
    } catch (error) {
        console.error('Error recording GIF:', error);
        showToast('Failed to record GIF', 'error');
    } finally {
        hideLoading();
    }
}

// Create GIF from recorded frames
async function createGifFromRecordedFrames(frames, options) {
    showLoading('Processing recorded frames...');
    
    try {
        // For demo, simulate GIF creation
        await simulateGifProcessing(2000);
        
        // Create mock GIF
        const mockGifUrl = 'https://media.giphy.com/media/26tknCqiJrBQG6DrC/giphy.gif';
        
        // Display preview
        displayGifPreview(mockGifUrl);
        
        // Store GIF data
        gif = {
            url: mockGifUrl,
            frames: frames,
            duration: options.duration || 5,
            frameRate: options.frameRate || 10,
            quality: options.quality || 7,
            width: 480,
            height: 360,
            recorded: true
        };
        
        showToast('GIF recorded successfully!', 'success');
        
    } catch (error) {
        console.error('Error processing frames:', error);
        showToast('Failed to process GIF', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Start GIF recording
function startGifRecording() {
    if (isRecordingGif) return;
    
    const duration = parseInt(document.getElementById('gifDuration').value);
    const frameRate = parseInt(document.getElementById('gifFrameRate').value);
    
    isRecordingGif = true;
    recordingStartTime = Date.now();
    
    // Update UI
    const startBtn = document.getElementById('startGifRecording');
    const stopBtn = document.getElementById('stopGifRecording');
    
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    
    // Start recording timer
    startGifRecordingTimer();
    
    // Start capturing frames
    startFrameCapture(duration, frameRate);
    
    showToast('GIF recording started', 'info');
}

// Stop GIF recording
function stopGifRecording() {
    if (!isRecordingGif) return;
    
    isRecordingGif = false;
    
    // Update UI
    const startBtn = document.getElementById('startGifRecording');
    const stopBtn = document.getElementById('stopGifRecording');
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    
    // Stop timer
    stopGifRecordingTimer();
    
    // Process recorded frames
    processRecordedFrames();
    
    showToast('GIF recording stopped', 'info');
}

// Start frame capture
function startFrameCapture(duration, frameRate) {
    const video = document.getElementById('gifWebcamPreview');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!video || !context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    recordedFrames = [];
    const totalFrames = duration * frameRate;
    let capturedFrames = 0;
    
    recordingInterval = setInterval(() => {
        if (capturedFrames >= totalFrames) {
            stopGifRecording();
            return;
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        recordedFrames.push(canvas.toDataURL('image/jpeg', 0.8));
        capturedFrames++;
        
        // Update progress
        updateGifProgress((capturedFrames / totalFrames) * 100);
        
    }, 1000 / frameRate);
}

// Process recorded frames
async function processRecordedFrames() {
    if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
    }
    
    if (recordedFrames.length === 0) {
        showToast('No frames recorded', 'error');
        return;
    }
    
    const options = {
        duration: parseInt(document.getElementById('gifDuration').value),
        frameRate: parseInt(document.getElementById('gifFrameRate').value),
        quality: parseInt(document.getElementById('gifQuality').value),
        loop: document.getElementById('gifLoop').checked
    };
    
    await createGifFromRecordedFrames(recordedFrames, options);
}

// Start GIF recording timer
function startGifRecordingTimer() {
    const recordingTime = document.getElementById('recordingTime');
    if (!recordingTime) return;
    
    recordingTime.textContent = '00:00';
}

// Stop GIF recording timer
function stopGifRecordingTimer() {
    // Timer cleanup if needed
}

// Update GIF progress
function updateGifProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('gifProgressText');
    
    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(percent)}%`;
    }
}

// Display GIF preview
function displayGifPreview(gifUrl) {
    const gifPreview = document.getElementById('gifPreview');
    if (!gifPreview) return;
    
    gifPreview.innerHTML = `
        <img src="${gifUrl}" alt="GIF Preview" class="gif-preview-image">
        <div class="gif-info">
            <span>${gif?.duration || 5}s • ${gif?.frameRate || 10}fps</span>
        </div>
    `;
    
    // Auto-play the GIF
    const img = gifPreview.querySelector('img');
    if (img) {
        img.onload = () => {
            // Force GIF to play
            const newUrl = gifUrl + (gifUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
            img.src = newUrl;
        };
    }
}

// Preview GIF
export function previewGif() {
    if (!gif) {
        showToast('No GIF to preview', 'warning');
        return;
    }
    
    const gifPreview = document.getElementById('gifPreview');
    if (!gifPreview) return;
    
    // Ensure GIF is playing
    const img = gifPreview.querySelector('img');
    if (img) {
        const newUrl = gif.url + (gif.url.includes('?') ? '&' : '?') + 't=' + Date.now();
        img.src = newUrl;
    }
    
    showToast('GIF preview playing', 'info');
}

// Stop GIF preview
export function stopGifPreview() {
    const gifPreview = document.getElementById('gifPreview');
    if (!gifPreview) return;
    
    const img = gifPreview.querySelector('img');
    if (img) {
        // Stop GIF by replacing with static image
        // This is a hack - in reality, you'd need to control GIF playback
        img.src = gif.url.split('?')[0];
    }
    
    showToast('GIF preview stopped', 'info');
}

// Save GIF to file
export async function saveGif() {
    if (!gif) {
        showToast('No GIF to save', 'error');
        return;
    }
    
    showLoading('Saving GIF...');
    
    try {
        // In a real app, you would use the actual GIF blob
        // For demo, we'll fetch the mock GIF
        const response = await fetch(gif.url);
        const blob = await response.blob();
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shome_gif_${Date.now()}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('GIF saved successfully!', 'success');
        
        // Close creator
        closeGifCreator();
        
    } catch (error) {
        console.error('Error saving GIF:', error);
        showToast('Failed to save GIF', 'error');
    } finally {
        hideLoading();
    }
}

// Use GIF in meme
function useGifInMeme() {
    if (!gif) {
        showToast('No GIF to use', 'error');
        return;
    }
    
    // Dispatch event for memeEditor to handle
    const event = new CustomEvent('useGifInMeme', {
        detail: {
            gifUrl: gif.url,
            gifData: gif
        }
    });
    document.dispatchEvent(event);
    
    showToast('GIF ready for meme creation', 'success');
    
    // Close GIF creator
    closeGifCreator();
    
    // Open meme editor
    document.getElementById('memeEditorModal').classList.add('active');
}

// Close GIF creator
function closeGifCreator() {
    // Stop any recording
    if (isRecordingGif) {
        stopGifRecording();
    }
    
    // Stop webcam
    if (window.gifWebcamStream) {
        window.gifWebcamStream.getTracks().forEach(track => track.stop());
        window.gifWebcamStream = null;
    }
    
    // Close modal
    document.getElementById('gifModal').classList.remove('active');
    
    // Reset
    resetGifCreator();
}

// Reset GIF creator
function resetGifCreator() {
    gif = null;
    recordedFrames = [];
    isRecordingGif = false;
    
    // Reset progress
    updateGifProgress(0);
    
    // Reset preview
    showUploadInstructions();
}

// Simulate GIF processing
function simulateGifProcessing(ms) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('gifProgressText');
            
            if (progressFill && progressText) {
                const currentWidth = parseFloat(progressFill.style.width) || 0;
                if (currentWidth < 100) {
                    const newWidth = Math.min(100, currentWidth + 10);
                    progressFill.style.width = `${newWidth}%`;
                    progressText.textContent = `${Math.round(newWidth)}%`;
                }
            }
        }, ms / 10);
        
        setTimeout(() => {
            clearInterval(interval);
            resolve();
        }, ms);
    });
}

// Show loading
function showLoading(message = 'Loading...') {
    const progressText = document.getElementById('gifProgressText');
    if (progressText) {
        progressText.textContent = message;
    }
}

// Hide loading
function hideLoading() {
    // Reset progress
    updateGifProgress(0);
}

// GIF creator styles
const gifCreatorStyles = `
    .gif-preview {
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        border-radius: var(--border-radius);
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .gif-preview-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    
    .upload-instructions,
    .webcam-error,
    .image-upload-instructions {
        text-align: center;
        padding: var(--spacing-xl);
        color: white;
    }
    
    .upload-instructions i,
    .webcam-error i,
    .image-upload-instructions i {
        font-size: 48px;
        margin-bottom: var(--spacing-md);
        opacity: 0.8;
    }
    
    .upload-instructions h4,
    .webcam-error h4,
    .image-upload-instructions h4 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 18px;
    }
    
    .upload-instructions p,
    .webcam-error p,
    .image-upload-instructions p {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 14px;
        opacity: 0.9;
    }
    
    .upload-instructions small {
        font-size: 12px;
        opacity: 0.7;
    }
    
    .gif-preview.dragover {
        background: linear-gradient(45deg, #764ba2 0%, #667eea 100%);
        border: 3px dashed white;
    }
    
    #gifWebcamPreview {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--border-radius);
    }
    
    .webcam-controls {
        position: absolute;
        bottom: var(--spacing-lg);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: var(--spacing-md);
    }
    
    .record-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        background: white;
        color: #333;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 500;
        transition: all 0.2s;
    }
    
    .record-btn:hover {
        transform: scale(1.05);
    }
    
    .record-btn.stop {
        background: #ff4444;
        color: white;
    }
    
    .image-previews {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
        max-height: 200px;
        overflow-y: auto;
    }
    
    .image-preview {
        width: 60px;
        height: 60px;
        position: relative;
        border-radius: var(--border-radius-sm);
        overflow: hidden;
    }
    
    .image-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .image-preview span {
        position: absolute;
        top: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 3px;
    }
    
    .gif-info {
        position: absolute;
        bottom: var(--spacing-sm);
        left: var(--spacing-sm);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
    }
    
    .gif-progress {
        width: 100%;
        margin-top: var(--spacing-lg);
    }
    
    .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--spacing-xs);
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        width: 0%;
        transition: width 0.3s ease;
        border-radius: 4px;
    }
    
    #gifProgressText {
        display: block;
        text-align: center;
        color: white;
        font-size: 14px;
        font-weight: 500;
    }
    
    .source-options {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
        margin-bottom: var(--spacing-md);
    }
    
    .source-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(0, 0, 0, 0.1);
        border: 2px solid transparent;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        transition: all 0.2s;
        color: var(--text-color);
    }
    
    .source-btn:hover {
        background: rgba(0, 0, 0, 0.15);
    }
    
    .source-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .gif-settings {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }
    
    .setting {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }
    
    .setting label {
        font-size: 14px;
        color: var(--text-color);
        min-width: 100px;
    }
    
    .setting input[type="range"] {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: rgba(0, 0, 0, 0.1);
        outline: none;
        -webkit-appearance: none;
    }
    
    .setting input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
    }
    
    .setting span {
        font-size: 14px;
        color: var(--text-light);
        min-width: 60px;
    }
    
    .setting input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: var(--primary-color);
    }
    
    .preview-options {
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .preview-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        transition: background-color 0.2s;
    }
    
    .preview-btn:hover {
        background: #3d8b40;
    }
    
    @media (prefers-color-scheme: dark) {
        .source-btn {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .source-btn:hover {
            background: rgba(255, 255, 255, 0.15);
        }
        
        .setting input[type="range"] {
            background: rgba(255, 255, 255, 0.1);
        }
    }
`;

// Add styles to document
const gifStyleSheet = document.createElement('style');
gifStyleSheet.textContent = gifCreatorStyles;
document.head.appendChild(gifStyleSheet);
// Export all public functions
/*export {
    initGifCreator,
    createGifFromVideo,
    createGifFromImages,
    recordGifFromWebcam,
    previewGif,
    stopGifPreview,
   // saveGif
};*/