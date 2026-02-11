// modules/videoShorts.js - Complete Video Shorts Module

// Configuration
const SHORTS_CONFIG = {
    autoplay: true,
    muted: true,
    loop: true,
    preload: 'metadata',
    intersectionThreshold: 0.7,
    scrollSnap: true,
    maxRetries: 3,
    volume: 0.8,
    playbackRate: 1.0
};

// State
const ShortsState = {
    currentShortIndex: -1,
    videos: [],
    observers: [],
    isPlaying: false,
    isLoading: false,
    retryCount: 0,
    userInteracted: false,
    scrollLock: false,
    lastScrollTime: 0,
    videoQueue: [],
    activeVideo: null
};

// DOM Elements Cache
const ShortsDOM = {
    container: null,
    videos: [],
    controls: null,
    progress: null,
    loadingIndicator: null,
    errorOverlay: null,
    muteButton: null,
    playButton: null,
    volumeSlider: null,
    progressBar: null
};

// Initialize Video Shorts
export async function initVideoShorts() {
    console.log('🎬 Initializing Video Shorts...');
    
    try {
        await setupDOM();
        await loadInitialShorts();
        setupEventListeners();
        setupObservers();
        setupSwipeGestures();
        
        console.log('✅ Video Shorts initialized');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to initialize Video Shorts:', error);
        showShortsError('Failed to load video shorts');
        return { success: false, error };
    }
}

// Setup DOM elements
async function setupDOM() {
    // Create or get shorts container
    let container = document.getElementById('shortsContainer');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'shortsContainer';
        container.className = 'shorts-container';
        
        // Add to current tab content
        const currentTab = document.querySelector('.tab-content.active');
        if (currentTab) {
            currentTab.appendChild(container);
        } else {
            document.querySelector('#feedTab .tab-content').appendChild(container);
        }
    }
    
    ShortsDOM.container = container;
    
    // Create controls
    createControls();
    
    // Create loading indicator
    createLoadingIndicator();
    
    // Create error overlay
    createErrorOverlay();
    
    // Apply styles
    applyStyles();
}

// Create video controls
function createControls() {
    const controls = document.createElement('div');
    controls.className = 'shorts-controls';
    controls.innerHTML = `
        <div class="controls-top">
            <button class="control-btn mute-btn" title="Mute/Unmute">
                <i class="fas ${SHORTS_CONFIG.muted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>
            </button>
            <button class="control-btn settings-btn" title="Settings">
                <i class="fas fa-cog"></i>
            </button>
        </div>
        
        <div class="controls-side">
            <div class="side-btn" data-action="like">
                <i class="fas fa-heart"></i>
                <span class="count">0</span>
            </div>
            <div class="side-btn" data-action="comment">
                <i class="fas fa-comment"></i>
                <span class="count">0</span>
            </div>
            <div class="side-btn" data-action="share">
                <i class="fas fa-share"></i>
            </div>
            <div class="side-btn" data-action="more">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
        
        <div class="controls-bottom">
            <div class="video-info">
                <div class="creator-info">
                    <img src="https://picsum.photos/seed/avatar/40/40" class="creator-avatar" alt="Creator">
                    <div class="creator-details">
                        <span class="creator-name">@creator</span>
                        <span class="video-title">Awesome Short Video</span>
                    </div>
                </div>
                <button class="follow-btn">Follow</button>
            </div>
            
            <div class="playback-controls">
                <button class="play-btn" title="Play/Pause">
                    <i class="fas fa-play"></i>
                </button>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="time-display">
                        <span class="current-time">0:00</span> / <span class="duration">0:00</span>
                    </div>
                </div>
                <button class="fullscreen-btn" title="Fullscreen">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>
    `;
    
    ShortsDOM.container.appendChild(controls);
    ShortsDOM.controls = controls;
    
    // Cache control elements
    ShortsDOM.muteButton = controls.querySelector('.mute-btn');
    ShortsDOM.playButton = controls.querySelector('.play-btn');
    ShortsDOM.progressBar = controls.querySelector('.progress-fill');
    ShortsDOM.progressContainer = controls.querySelector('.progress-container');
}

// Create loading indicator
function createLoadingIndicator() {
    const loading = document.createElement('div');
    loading.className = 'shorts-loading';
    loading.innerHTML = `
        <div class="spinner"></div>
        <p>Loading shorts...</p>
    `;
    ShortsDOM.container.appendChild(loading);
    ShortsDOM.loadingIndicator = loading;
}

// Create error overlay
function createErrorOverlay() {
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'shorts-error-overlay';
    errorOverlay.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Failed to load video</h3>
            <p class="error-message"></p>
            <button class="retry-btn">Retry</button>
            <button class="skip-btn">Skip</button>
        </div>
    `;
    ShortsDOM.container.appendChild(errorOverlay);
    ShortsDOM.errorOverlay = errorOverlay;
}

// Apply styles
function applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .shorts-container {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow-y: scroll;
            scroll-snap-type: y mandatory;
            background: #000;
            -webkit-overflow-scrolling: touch;
        }
        
        .short-video-wrapper {
            position: relative;
            width: 100%;
            height: 100vh;
            scroll-snap-align: start;
            background: #000;
        }
        
        .short-video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #000;
            display: block;
        }
        
        .shorts-controls {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 100;
        }
        
        .controls-top {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            pointer-events: auto;
        }
        
        .controls-side {
            position: absolute;
            right: 20px;
            bottom: 150px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
            pointer-events: auto;
        }
        
        .controls-bottom {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            padding: 20px;
            pointer-events: auto;
        }
        
        .control-btn, .side-btn {
            background: rgba(0,0,0,0.5);
            border: none;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .side-btn {
            flex-direction: column;
            width: 60px;
            height: 60px;
            background: rgba(0,0,0,0.7);
        }
        
        .side-btn .count {
            font-size: 12px;
            margin-top: 4px;
        }
        
        .control-btn:hover, .side-btn:hover {
            background: rgba(255,255,255,0.2);
            transform: scale(1.1);
        }
        
        .video-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            color: white;
        }
        
        .creator-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .creator-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid white;
        }
        
        .creator-details {
            display: flex;
            flex-direction: column;
        }
        
        .creator-name {
            font-weight: bold;
            font-size: 16px;
        }
        
        .video-title {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .follow-btn {
            background: #ff4757;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .follow-btn:hover {
            background: #ff2e43;
        }
        
        .playback-controls {
            display: flex;
            align-items: center;
            gap: 15px;
            color: white;
        }
        
        .progress-container {
            flex: 1;
        }
        
        .progress-bar {
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        
        .progress-fill {
            height: 100%;
            background: #ff4757;
            width: 0%;
            transition: width 0.1s linear;
        }
        
        .time-display {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            opacity: 0.8;
        }
        
        .shorts-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: white;
            z-index: 10;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        .shorts-error-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            display: none;
        }
        
        .error-content {
            text-align: center;
            color: white;
            padding: 30px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            max-width: 300px;
        }
        
        .error-content i {
            font-size: 48px;
            color: #ff4757;
            margin-bottom: 15px;
        }
        
        .retry-btn, .skip-btn {
            margin: 10px;
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .retry-btn {
            background: #ff4757;
            color: white;
        }
        
        .skip-btn {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        
        .retry-btn:hover {
            background: #ff2e43;
        }
        
        .skip-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        /* Hide scrollbar */
        .shorts-container::-webkit-scrollbar {
            display: none;
        }
        
        .shorts-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .controls-side {
                bottom: 120px;
                gap: 15px;
            }
            
            .side-btn {
                width: 50px;
                height: 50px;
            }
            
            .controls-bottom {
                padding: 15px;
            }
        }
        
        @media (max-width: 480px) {
            .controls-top {
                top: 10px;
                right: 10px;
            }
            
            .controls-side {
                right: 10px;
                bottom: 100px;
            }
            
            .side-btn {
                width: 45px;
                height: 45px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Load initial shorts
async function loadInitialShorts() {
    showLoading(true);
    
    try {
        // Mock data - replace with actual API call
        const shortsData = await mockFetchShorts();
        
        ShortsDOM.videos = [];
        ShortsState.videoQueue = shortsData;
        
        // Create video elements
        for (let i = 0; i < Math.min(shortsData.length, 5); i++) { // Load first 5
            await createShortVideo(shortsData[i], i);
        }
        
        // Hide loading indicator
        showLoading(false);
        
        // Play first video if visible
        setTimeout(() => playVisibleShort(), 500);
        
    } catch (error) {
        console.error('Failed to load shorts:', error);
        showShortsError('Network error. Please check your connection.');
        showLoading(false);
    }
}

// Mock fetch function (replace with real API)
async function mockFetchShorts() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                    thumbnail: 'https://picsum.photos/seed/short1/720/1280',
                    title: 'Amazing Joyride',
                    creator: '@adventurer',
                    likes: 12400,
                    comments: 320,
                    shares: 150,
                    duration: 15
                },
                {
                    id: '2',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                    thumbnail: 'https://picsum.photos/seed/short2/720/1280',
                    title: 'Epic Meltdown',
                    creator: '@dramaqueen',
                    likes: 8920,
                    comments: 210,
                    shares: 89,
                    duration: 18
                },
                {
                    id: '3',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    thumbnail: 'https://picsum.photos/seed/short3/720/1280',
                    title: 'Dreamy Elephants',
                    creator: '@wildlife',
                    likes: 15600,
                    comments: 450,
                    shares: 230,
                    duration: 12
                },
                {
                    id: '4',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                    thumbnail: 'https://picsum.photos/seed/short4/720/1280',
                    title: 'Fun Times',
                    creator: '@funlover',
                    likes: 10200,
                    comments: 180,
                    shares: 95,
                    duration: 20
                },
                {
                    id: '5',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                    thumbnail: 'https://picsum.photos/seed/short5/720/1280',
                    title: 'Great Escape',
                    creator: '@escapeartist',
                    likes: 7600,
                    comments: 120,
                    shares: 65,
                    duration: 16
                }
            ]);
        }, 1000);
    });
}

// Create a short video element
async function createShortVideo(data, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'short-video-wrapper';
    wrapper.dataset.id = data.id;
    wrapper.dataset.index = index;
    
    const video = document.createElement('video');
    video.className = 'short-video';
    video.playsInline = true;
    video.preload = 'metadata';
    video.muted = SHORTS_CONFIG.muted;
    video.loop = SHORTS_CONFIG.loop;
    video.poster = data.thumbnail;
    
    const source = document.createElement('source');
    source.src = data.url;
    source.type = 'video/mp4';
    
    video.appendChild(source);
    wrapper.appendChild(video);
    ShortsDOM.container.appendChild(wrapper);
    
    // Store reference
    ShortsDOM.videos[index] = { wrapper, video, data };
    
    // Set up video event listeners
    setupVideoEvents(video, index);
    
    return { wrapper, video, data };
}

// Set up video event listeners
function setupVideoEvents(video, index) {
    // Progress update
    video.addEventListener('timeupdate', () => updateProgress(video, index));
    
    // Play state change
    video.addEventListener('play', () => onVideoPlay(index));
    video.addEventListener('pause', () => onVideoPause(index));
    video.addEventListener('ended', () => onVideoEnded(index));
    
    // Loading states
    video.addEventListener('waiting', () => onVideoWaiting(index));
    video.addEventListener('canplay', () => onVideoCanPlay(index));
    video.addEventListener('canplaythrough', () => onVideoCanPlayThrough(index));
    
    // Error handling
    video.addEventListener('error', (e) => onVideoError(e, index));
    
    // Volume change
    video.addEventListener('volumechange', () => updateVolumeUI(video));
}

// Setup event listeners
function setupEventListeners() {
    // Play/Pause button
    ShortsDOM.playButton?.addEventListener('click', togglePlayPause);
    
    // Mute button
    ShortsDOM.muteButton?.addEventListener('click', toggleMute);
    
    // Fullscreen button
    document.querySelector('.fullscreen-btn')?.addEventListener('click', toggleFullscreen);
    
    // Progress bar click
    ShortsDOM.progressContainer?.addEventListener('click', seekVideo);
    
    // Side buttons (like, comment, share, more)
    document.querySelectorAll('.side-btn').forEach(btn => {
        btn.addEventListener('click', handleSideButtonClick);
    });
    
    // Follow button
    document.querySelector('.follow-btn')?.addEventListener('click', handleFollow);
    
    // Retry button in error overlay
    ShortsDOM.errorOverlay?.querySelector('.retry-btn')?.addEventListener('click', retryCurrentVideo);
    
    // Skip button in error overlay
    ShortsDOM.errorOverlay?.querySelector('.skip-btn')?.addEventListener('click', skipCurrentVideo);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Visibility change (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Page unload
    window.addEventListener('beforeunload', cleanupShorts);
    
    // Network status
    window.addEventListener('online', handleNetworkStatus);
    window.addEventListener('offline', handleNetworkStatus);
}

// Setup Intersection Observer
function setupObservers() {
    // Intersection Observer for autoplay
    const videoObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const index = parseInt(entry.target.closest('.short-video-wrapper').dataset.index);
                
                if (entry.isIntersecting && entry.intersectionRatio > SHORTS_CONFIG.intersectionThreshold) {
                    // Video is mostly visible - play it
                    playShortByIndex(index);
                } else if (index === ShortsState.currentShortIndex) {
                    // Video is not visible but was playing - pause it
                    pauseCurrentShort();
                }
            });
        },
        {
            threshold: [0, 0.3, 0.7, 1.0],
            rootMargin: '0px 0px -10% 0px'
        }
    );
    
    // Observe all video wrappers
    ShortsDOM.videos.forEach(item => {
        if (item.wrapper) {
            videoObserver.observe(item.wrapper);
        }
    });
    
    ShortsState.observers.push(videoObserver);
}

// Setup swipe gestures for mobile
function setupSwipeGestures() {
    let startY = 0;
    let isSwiping = false;
    
    ShortsDOM.container.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isSwiping = true;
    }, { passive: true });
    
    ShortsDOM.container.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        
        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY;
        
        // Only prevent default if we're at top/bottom and trying to overscroll
        const scrollTop = ShortsDOM.container.scrollTop;
        const scrollHeight = ShortsDOM.container.scrollHeight;
        const containerHeight = ShortsDOM.container.clientHeight;
        
        if ((scrollTop <= 0 && diffY < 0) || 
            (scrollTop >= scrollHeight - containerHeight && diffY > 0)) {
            e.preventDefault();
        }
    }, { passive: false });
    
    ShortsDOM.container.addEventListener('touchend', () => {
        isSwiping = false;
    });
}

// Play video by index with safe error handling
async function playShortByIndex(index) {
    if (index === ShortsState.currentShortIndex) return;
    
    // Pause current video
    if (ShortsState.currentShortIndex !== -1) {
        await pauseCurrentShort();
    }
    
    const short = ShortsDOM.videos[index];
    if (!short || !short.video) return;
    
    ShortsState.currentShortIndex = index;
    ShortsState.activeVideo = short.video;
    ShortsState.retryCount = 0;
    
    // Update UI
    updateVideoInfo(short.data);
    updateSideButtons(short.data);
    
    try {
        // Play with safe wrapper
        await safePlayVideo(short.video);
        ShortsState.isPlaying = true;
        updatePlayButtonUI(true);
        
    } catch (error) {
        console.warn('Failed to play video:', error);
        
        if (ShortsState.retryCount < SHORTS_CONFIG.maxRetries) {
            ShortsState.retryCount++;
            setTimeout(() => playShortByIndex(index), 1000);
        } else {
            showShortsError(`Failed to play video: ${error.message}`);
        }
    }
}

// Safe play video with AbortError handling
async function safePlayVideo(video) {
    return new Promise((resolve, reject) => {
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => resolve())
                .catch(error => {
                    // Handle AbortError gracefully (happens during quick scrolling)
                    if (error.name === 'AbortError') {
                        console.log('Playback was interrupted - this is normal during scrolling');
                        resolve(); // Don't reject, just resolve
                    } 
                    // Handle autoplay policy errors
                    else if (error.name === 'NotAllowedError') {
                        console.log('Autoplay not allowed - waiting for user interaction');
                        showPlayButtonOverlay(video);
                        reject(error);
                    }
                    // Handle other errors
                    else {
                        reject(error);
                    }
                });
        } else {
            resolve();
        }
    });
}

// Pause current short
async function pauseCurrentShort() {
    if (ShortsState.currentShortIndex === -1 || !ShortsState.activeVideo) return;
    
    try {
        ShortsState.activeVideo.pause();
        ShortsState.isPlaying = false;
        updatePlayButtonUI(false);
        ShortsState.activeVideo = null;
    } catch (error) {
        console.warn('Error pausing video:', error);
    }
}

// Play visible short
function playVisibleShort() {
    const visibleShorts = ShortsDOM.videos.filter((item, index) => {
        if (!item.wrapper) return false;
        const rect = item.wrapper.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    });
    
    if (visibleShorts.length > 0) {
        const index = parseInt(visibleShorts[0].wrapper.dataset.index);
        playShortByIndex(index);
    }
}

// Toggle play/pause
function togglePlayPause() {
    if (ShortsState.currentShortIndex === -1) return;
    
    const short = ShortsDOM.videos[ShortsState.currentShortIndex];
    if (!short || !short.video) return;
    
    if (short.video.paused) {
        playShortByIndex(ShortsState.currentShortIndex);
    } else {
        short.video.pause();
    }
}

// Toggle mute
function toggleMute() {
    if (ShortsState.currentShortIndex === -1) return;
    
    const short = ShortsDOM.videos[ShortsState.currentShortIndex];
    if (!short || !short.video) return;
    
    short.video.muted = !short.video.muted;
    updateMuteButtonUI(short.video.muted);
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        ShortsDOM.container.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Seek video on progress bar click
function seekVideo(e) {
    if (ShortsState.currentShortIndex === -1) return;
    
    const short = ShortsDOM.videos[ShortsState.currentShortIndex];
    if (!short || !short.video) return;
    
    const progressRect = ShortsDOM.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - progressRect.left;
    const width = progressRect.width;
    const percentage = clickX / width;
    
    short.video.currentTime = percentage * short.video.duration;
}

// Handle side button clicks
function handleSideButtonClick(e) {
    const action = e.currentTarget.dataset.action;
    const short = ShortsDOM.videos[ShortsState.currentShortIndex];
    
    if (!short) return;
    
    switch(action) {
        case 'like':
            handleLike(short);
            break;
        case 'comment':
            handleComment(short);
            break;
        case 'share':
            handleShare(short);
            break;
        case 'more':
            handleMore(short);
            break;
    }
}

// Handle like
function handleLike(short) {
    const likeBtn = document.querySelector('[data-action="like"]');
    const countEl = likeBtn.querySelector('.count');
    let count = parseInt(countEl.textContent) || 0;
    
    if (likeBtn.classList.contains('liked')) {
        count--;
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').className = 'fas fa-heart';
    } else {
        count++;
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').className = 'fas fa-heart';
        likeBtn.style.animation = 'likePulse 0.3s ease';
        setTimeout(() => likeBtn.style.animation = '', 300);
    }
    
    countEl.textContent = count;
}

// Handle comment
function handleComment(short) {
    alert('Comments feature coming soon!');
}

// Handle share
function handleShare(short) {
    if (navigator.share) {
        navigator.share({
            title: short.data.title,
            text: `Check out this short: ${short.data.title}`,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Handle more options
function handleMore(short) {
    // Show more options modal
    console.log('More options for:', short.data);
}

// Handle follow
function handleFollow() {
    const followBtn = document.querySelector('.follow-btn');
    if (followBtn.textContent === 'Follow') {
        followBtn.textContent = 'Following';
        followBtn.style.background = '#1e90ff';
    } else {
        followBtn.textContent = 'Follow';
        followBtn.style.background = '#ff4757';
    }
}

// Update video info
function updateVideoInfo(data) {
    const creatorAvatar = document.querySelector('.creator-avatar');
    const creatorName = document.querySelector('.creator-name');
    const videoTitle = document.querySelector('.video-title');
    
    if (creatorAvatar) creatorAvatar.src = data.thumbnail;
    if (creatorName) creatorName.textContent = data.creator;
    if (videoTitle) videoTitle.textContent = data.title;
}

// Update side buttons
function updateSideButtons(data) {
    const likeCount = document.querySelector('[data-action="like"] .count');
    const commentCount = document.querySelector('[data-action="comment"] .count');
    
    if (likeCount) likeCount.textContent = data.likes.toLocaleString();
    if (commentCount) commentCount.textContent = data.comments.toLocaleString();
}

// Update progress bar
function updateProgress(video, index) {
    if (index !== ShortsState.currentShortIndex) return;
    
    const progress = (video.currentTime / video.duration) * 100;
    if (ShortsDOM.progressBar) {
        ShortsDOM.progressBar.style.width = `${progress}%`;
    }
    
    // Update time display
    const currentTime = formatTime(video.currentTime);
    const duration = formatTime(video.duration);
    
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');
    
    if (currentTimeEl) currentTimeEl.textContent = currentTime;
    if (durationEl) durationEl.textContent = duration;
}

// Format time (MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update play button UI
function updatePlayButtonUI(isPlaying) {
    if (!ShortsDOM.playButton) return;
    
    const icon = ShortsDOM.playButton.querySelector('i');
    if (icon) {
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
}

// Update mute button UI
function updateMuteButtonUI(isMuted) {
    if (!ShortsDOM.muteButton) return;
    
    const icon = ShortsDOM.muteButton.querySelector('i');
    if (icon) {
        icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }
}

// Update volume UI
function updateVolumeUI(video) {
    updateMuteButtonUI(video.muted);
}

// Show play button overlay (for autoplay blocked)
function showPlayButtonOverlay(video) {
    const wrapper = video.parentElement;
    let overlay = wrapper.querySelector('.play-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'play-overlay';
        overlay.innerHTML = '<i class="fas fa-play"></i>';
        overlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.7);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            cursor: pointer;
            z-index: 50;
            backdrop-filter: blur(5px);
        `;
        
        overlay.addEventListener('click', () => {
            video.play();
            overlay.style.display = 'none';
        });
        
        wrapper.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }
}

// Show loading indicator
function showLoading(show) {
    if (ShortsDOM.loadingIndicator) {
        ShortsDOM.loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

// Show error overlay
function showShortsError(message) {
    if (ShortsDOM.errorOverlay) {
        const messageEl = ShortsDOM.errorOverlay.querySelector('.error-message');
        if (messageEl) messageEl.textContent = message;
        ShortsDOM.errorOverlay.style.display = 'flex';
    }
}

// Hide error overlay
function hideShortsError() {
    if (ShortsDOM.errorOverlay) {
        ShortsDOM.errorOverlay.style.display = 'none';
    }
}

// Retry current video
function retryCurrentVideo() {
    hideShortsError();
    if (ShortsState.currentShortIndex !== -1) {
        playShortByIndex(ShortsState.currentShortIndex);
    }
}

// Skip current video
function skipCurrentVideo() {
    hideShortsError();
    if (ShortsState.currentShortIndex < ShortsDOM.videos.length - 1) {
        playShortByIndex(ShortsState.currentShortIndex + 1);
    }
}

// Video event handlers
function onVideoPlay(index) {
    console.log(`Video ${index} started playing`);
}

function onVideoPause(index) {
    console.log(`Video ${index} paused`);
}

function onVideoEnded(index) {
    console.log(`Video ${index} ended`);
    // Auto-play next video if not the last one
    if (index < ShortsDOM.videos.length - 1) {
        setTimeout(() => playShortByIndex(index + 1), 500);
    }
}

function onVideoWaiting(index) {
    console.log(`Video ${index} is buffering`);
}

function onVideoCanPlay(index) {
    console.log(`Video ${index} can play`);
}

function onVideoCanPlayThrough(index) {
    console.log(`Video ${index} can play through`);
}

function onVideoError(e, index) {
    console.error(`Video ${index} error:`, e);
    showShortsError('Video playback error. Please try again.');
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (!ShortsDOM.container || !ShortsDOM.container.contains(e.target)) return;
    
    switch(e.key) {
        case ' ':
        case 'k':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'm':
            e.preventDefault();
            toggleMute();
            break;
        case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'ArrowUp':
            e.preventDefault();
            // Scroll up to previous short
            ShortsDOM.container.scrollBy(0, -window.innerHeight);
            break;
        case 'ArrowDown':
            e.preventDefault();
            // Scroll down to next short
            ShortsDOM.container.scrollBy(0, window.innerHeight);
            break;
        case 'l':
            e.preventDefault();
            // Like current short
            document.querySelector('[data-action="like"]')?.click();
            break;
        case 'c':
            e.preventDefault();
            // Comment on current short
            document.querySelector('[data-action="comment"]')?.click();
            break;
        case 's':
            e.preventDefault();
            // Share current short
            document.querySelector('[data-action="share"]')?.click();
            break;
    }
}

// Handle visibility change (tab switching)
function handleVisibilityChange() {
    if (document.hidden) {
        // Tab is hidden - pause video
        pauseCurrentShort();
    } else {
        // Tab is visible - resume if appropriate
        if (ShortsState.isPlaying && ShortsState.currentShortIndex !== -1) {
            playShortByIndex(ShortsState.currentShortIndex);
        }
    }
}

// Handle network status
function handleNetworkStatus() {
    if (navigator.onLine) {
        console.log('Back online - resuming video playback');
        if (ShortsState.isPlaying && ShortsState.currentShortIndex !== -1) {
            playShortByIndex(ShortsState.currentShortIndex);
        }
    } else {
        console.log('Offline - pausing video playback');
        pauseCurrentShort();
        showShortsError('You are offline. Please check your connection.');
    }
}

// Cleanup on unload
function cleanupShorts() {
    // Pause all videos
    ShortsDOM.videos.forEach(item => {
        if (item.video) {
            item.video.pause();
            item.video.currentTime = 0;
            item.video.src = '';
            item.video.load();
        }
    });
    
    // Disconnect observers
    ShortsState.observers.forEach(observer => observer.disconnect());
    ShortsState.observers = [];
    
    // Clear state
    ShortsState.currentShortIndex = -1;
    ShortsState.videos = [];
    ShortsState.activeVideo = null;
    ShortsState.isPlaying = false;
}

// Load more shorts (infinite scroll)
export async function loadMoreShorts() {
    if (ShortsState.isLoading) return;
    
    ShortsState.isLoading = true;
    showLoading(true);
    
    try {
        // Mock API call - replace with actual
        const newShorts = await mockFetchMoreShorts();
        
        // Create video elements for new shorts
        const startIndex = ShortsDOM.videos.length;
        for (let i = 0; i < newShorts.length; i++) {
            await createShortVideo(newShorts[i], startIndex + i);
        }
        
        // Re-observe new elements
        if (ShortsState.observers[0]) {
            for (let i = startIndex; i < ShortsDOM.videos.length; i++) {
                if (ShortsDOM.videos[i].wrapper) {
                    ShortsState.observers[0].observe(ShortsDOM.videos[i].wrapper);
                }
            }
        }
        
        ShortsState.isLoading = false;
        showLoading(false);
        
    } catch (error) {
        console.error('Failed to load more shorts:', error);
        ShortsState.isLoading = false;
        showLoading(false);
    }
}

// Mock fetch more shorts
async function mockFetchMoreShorts() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '6',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    thumbnail: 'https://picsum.photos/seed/short6/720/1280',
                    title: 'Blazing Fast',
                    creator: '@speedster',
                    likes: 5400,
                    comments: 90,
                    shares: 45,
                    duration: 14
                },
                {
                    id: '7',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                    thumbnail: 'https://picsum.photos/seed/short7/720/1280',
                    title: 'Joyride 2.0',
                    creator: '@adventurer',
                    likes: 9800,
                    comments: 210,
                    shares: 120,
                    duration: 17
                }
            ]);
        }, 1500);
    });
}

// Switch to shorts tab
export function switchToShortsTab() {
    // Pause any other videos on the page
    document.querySelectorAll('video').forEach(video => {
        if (!video.classList.contains('short-video')) {
            video.pause();
        }
    });
    
    // Initialize or resume shorts
    if (ShortsState.currentShortIndex === -1) {
        initVideoShorts();
    } else {
        playShortByIndex(ShortsState.currentShortIndex);
    }
}

// Get current shorts state
export function getShortsState() {
    return {
        ...ShortsState,
        totalVideos: ShortsDOM.videos.length,
        currentVideo: ShortsDOM.videos[ShortsState.currentShortIndex]?.data || null
    };
}

// API Functions
export const videoShortsAPI = {
    init: initVideoShorts,
    loadMore: loadMoreShorts,
    switchToTab: switchToShortsTab,
    getState: getShortsState,
    playShort: playShortByIndex,
    pauseShort: pauseCurrentShort,
    toggleMute,
    toggleFullscreen,
    cleanup: cleanupShorts
};

// Export for use in other modules
export default videoShortsAPI;