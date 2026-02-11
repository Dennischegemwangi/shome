// scripts.js - Main entry point for Shome Meme App
// scripts.js - Updated import section
// CORRECTED scripts.js imports

// Meme Editor - Use correct export names


// Add to imports in scripts.js
import {
    initVideoShorts,
    switchToShortsTab,
    loadMoreShorts,
    getShortsState,
    videoShortsAPI
} from './modules/videoShorts.js';

import { 
    initMemeEditor, 
    loadTemplateGallery,
    saveMemeToCloud,
    resetMemeCanvas,
    getCurrentMemeData,
    addText,  // Correct export name
    addStickerToCanvas,
   // saveToCloud ,
    applyFilter  // Correct export name
} from './modules/memeEditor.js';

// Video Editor
import {
    initVideoEditor,
    trimVideo,
    adjustVideoSpeed,
    addTextToVideo,
    applyVideoEffect,
    saveEditedVideo  // Correct export name
} from './modules/videoEditor.js';

// Text Styling
import {
    initTextStyling,
    setTextFont,
    setTextColor,
    setTextSize,
    toggleTextEffect,
    adjustTextSize
} from './modules/textStyling.js';

// Sticker Library
import {
    initStickerLibrary,
    loadStickersByCategory,
    addCustomSticker,
    getStickerById,
    searchStickers
} from './modules/stickerLibrary.js';

// GIF Creator
import {
    initGifCreator,
    createGifFromVideo,
    createGifFromImages,
    recordGifFromWebcam,
    previewGif,
    stopGifPreview,
    saveGif
} from './modules/gifCreator.js';

// Cloud Storage
import {
    initCloudStorage,
    syncWithCloud,
    uploadToCloud,
    getCloudStats,
    loadCloudMemes,
    getCloudMemes,
    
    searchCloudMemes
} from './modules/cloudStorage.js';

// Social Sharing
import {
    initSocialSharing,
    shareToPlatform,
    generateShareLink,
    copyToClipboard,
    getEmbedCode,
    openShareModal
} from './modules/socialSharing.js';

// Feed Manager
import {
    initFeedManager,
    loadMoreMemes,
    refreshFeed,
    likeMeme,
    commentOnMeme,
    //showLoading,
    shareMeme
} from './modules/feedManager.js';

// Tab Manager
import {
    initTabManager,
    switchTab,
    getCurrentTab
} from './modules/tabManager.js';

// Search Manager
import {
    initSearchManager,
    performSearch,
    clearSearchHistory
} from './modules/searchManager.js';

// Notification Manager
import {
    initNotificationManager,
    showNotification,
    markAllAsRead,
    clearAllNotifications
} from './modules/notificationManager.js';

// Utils
import {
    debounce,
    throttle,
    formatFileSize,
    generateUniqueId,
    formatTime,
    showToast,
    showLoading,
    hideLoading,
    validateFile,
    compressImage
} from './modules/utils.js';

// Global state
const AppState = {
  
    // Add to AppState in scripts.j
    // ... existing properties ...
    videoShorts: {
        active: false,
        currentIndex: -1,
        totalShorts: 0
    },

    currentUser: {
        id: 'user_' + generateUniqueId(),
        username: 'john_doe',
        name: 'John Doe',
        avatar: 'J',
        followers: 1250,
        following: 456,
        memeCount: 247
    },
    currentMeme: null,
    notifications: [],
    searchHistory: [],
    cloudStorage: {
        used: 0.5, // GB
        total: 5,  // GB
        memes: []
    },
    recentMemes: [],
    socket: null,
    isOnline: true
};

// DOM Elements cache
const DOM = {
    // Modals
    memeEditorModal: document.getElementById('memeEditorModal'),
    templateModal: document.getElementById('templateModal'),
    stickerModal: document.getElementById('stickerModal'),
    videoEditorModal: document.getElementById('videoEditorModal'),
    webcamModal: document.getElementById('webcamModal'),
    gifModal: document.getElementById('gifModal'),
    shareModal: document.getElementById('shareModal'),
    cloudModal: document.getElementById('cloudModal'),
    
    // Canvas
    memeCanvas: document.getElementById('memeCanvas'),
    
    // Tabs
    tabContents: document.querySelectorAll('.tab-content'),
    navItems: document.querySelectorAll('.nav-item'),
    
    // Buttons
    createNavBtn: document.getElementById('createNavBtn'),
    searchBtn: document.getElementById('searchBtn'),
    notificationBtn: document.getElementById('notificationBtn'),
    
    // Forms
    searchInput: document.getElementById('searchInput'),
    shareCaption: document.getElementById('shareCaption')
};

// Initialize the application
async function initApp() {
    console.log('🚀 Initializing Shome Meme App...');
    
    // Initialize all modules
    await initAllModules();
    // Install click logger to help debug missing handlers
    setupClickLogger();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    await loadInitialData();
    
    // Connect to WebSocket for real-time features
    initWebSocket();
    
    setupHeaderScrollBehavior();
    
    console.log('✅ App initialized successfully');
    showToast('Welcome to Shome Meme App!', 'success');
}

// Click logger (capture phase) - logs clicked element info and stack trace
function setupClickLogger() {
    if (window.__shome_click_logger_installed) return;
    window.__shome_click_logger_installed = true;

    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, [role="button"], a, .action-btn, .tool-btn, .nav-item, .quick-option');
        if (!target) return;

        const info = {
            id: target.id || null,
            tag: target.tagName,
            classes: target.className || null,
            dataset: { ...target.dataset },
            text: (target.innerText || '').trim().slice(0, 120)
        };

        console.log('%c[CLICK LOGGER] element clicked:', 'background:#004466;color:#fff;padding:3px;border-radius:3px;', info);
        console.trace();
    }, true); // capture phase to catch before other handlers

    console.log('🔔 Click logger active (capture phase)');
}

// Initialize all modules
async function initAllModules() {
    try {
        await Promise.all([
            initTabManager(DOM.tabContents, DOM.navItems),
            initMemeEditor(DOM.memeCanvas),
            initFeedManager(),
            initSearchManager(),
            initNotificationManager(),
            initTextStyling(),
            initStickerLibrary(),
            initVideoEditor(),
            initGifCreator(),
            initCloudStorage(),
            initSocialSharing()
        ]);
    } catch (error) {
        console.error('Failed to initialize modules:', error);
        showToast('Failed to initialize app modules', 'error');
    }
}

// Set up event listeners
function setupEventListeners() {
  fixIconClickIssues();
    // Navigation
    DOM.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Create button
    DOM.createNavBtn.addEventListener('click', () => {
        DOM.memeEditorModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Search
  /*  DOM.searchBtn.addEventListener('click', () => {
        document.querySelector('.search-bar').classList.toggle('active');
        if (document.querySelector('.search-bar').classList.contains('active')) {
            DOM.searchInput.focus();
        }
    });
    
    DOM.searchInput.addEventListener('input', debounce((e) => {
        performSearch(e.target.value);
    }, 300));*/
    
    // Notifications
    /*DOM.notificationBtn.addEventListener('click', () => {
        document.getElementById('notificationPanel').classList.toggle('active');
    });*/
    
    // Quick create options
    document.querySelectorAll('.quick-option').forEach(option => {
        option.addEventListener('click', handleQuickCreate);
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-editor, .close-template, .close-sticker, .close-gif, .close-cloud, .close-share, .close-webcam').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Online/offline detection
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Pull to refresh
   // setupPullToRefresh();
    
    // Add logo click handler
const logo = document.getElementById('logo');
if (logo) {
    logo.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Only refresh if we're on feed tab
        if (window.App?.state?.currentTab === 'feed' || getCurrentTab() === 'feed') {
            console.log('Logo clicked - refreshing feed...');
            showToast('Refreshing feed...', 'info');
            
            // Call refreshFeed from feedManager
            if (typeof refreshFeed === 'function') {
                await refreshFeed();
            }
        } else {
            // If not on feed, switch to feed
            switchTab('feed');
        }
    });
}
    
    function fixIconClickIssues() {
    // Make all icons in buttons pass through clicks
    document.querySelectorAll('.header-btn i, .nav-item i').forEach(icon => {
        icon.style.pointerEvents = 'none';
    });
    
    // Ensure buttons have proper cursor
    document.querySelectorAll('button').forEach(btn => {
        btn.style.cursor = 'pointer';
    });
}

    // Edit profile button: switch to profile tab and allow quick inline edit
    const editProfileBtn = document.getElementById('editProfile');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            // Switch to profile tab
            switchTab('profile');

            // Focus editable fields if present
            const nameEl = document.querySelector('#profile .profile-info h2');
            const usernameEl = document.querySelector('#profile .profile-info p');

            // Simple inline edit prompts as a minimal editor
            const newName = prompt('Edit display name', nameEl ? nameEl.textContent : '');
            if (newName !== null && nameEl) nameEl.textContent = newName;

            const newUser = prompt('Edit username', usernameEl ? usernameEl.textContent : '');
            if (newUser !== null && usernameEl) usernameEl.textContent = newUser;
        });
    }
}

// scroll behavior
function setupHeaderScrollBehavior() {
    const header = document.getElementById('appHeader');
    const feedContainer = document.getElementById('memeFeed');
    let lastScrollTop = 0;
    const SCROLL_THRESHOLD = 50;
    
    if (!header || !feedContainer) return;
    
    feedContainer.addEventListener('scroll', () => {
        const scrollTop = feedContainer.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > SCROLL_THRESHOLD) {
            // Scrolling DOWN - hide header
            header.classList.add('hidden');
        } else if (scrollTop < lastScrollTop) {
            // Scrolling UP - show header
            header.classList.remove('hidden');
        }
        
        // Add/remove shadow when scrolled
        if (scrollTop > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Also handle window scroll for other tabs
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > SCROLL_THRESHOLD) {
            header.classList.add('hidden');
        } else if (scrollTop < lastScrollTop) {
            header.classList.remove('hidden');
        }
        
        if (scrollTop > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}





// Call it

// Handle quick create options
function handleQuickCreate(e) {
    const optionId = e.currentTarget.id;
    
    switch(optionId) {
        case 'quickUpload':
            document.getElementById('uploadImageBtn').click();
            break;
        case 'quickTemplate':
            DOM.templateModal.classList.add('active');
            loadTemplateGallery();
            break;
        case 'quickWebcam':
            DOM.webcamModal.classList.add('active');
            startWebcam();
            break;
        case 'quickVideo':
            DOM.videoEditorModal.classList.add('active');
            break;
        case 'quickGif':
            DOM.gifModal.classList.add('active');
            break;
        case 'quickBlank':
            resetMemeCanvas();
            DOM.memeEditorModal.classList.add('active');
            break;
    }
}

// Close all modals
function closeAllModals() {
    // Close any element that follows the Modal naming convention or uses the "modal" class
    document.querySelectorAll('*').forEach(el => {
        try {
            const idMatches = !!(el.id && el.id.endsWith('Modal'));
            const classList = Array.from(el.classList || []);
            const classMatches = classList.includes('modal') || classList.some(c => c.endsWith('-modal'));

            if (idMatches || classMatches) {
                el.classList.remove('active');
            }
        } catch (err) {
            // ignore
        }
    });
    document.body.style.overflow = 'auto';
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + N: New meme
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        resetMemeCanvas();
        DOM.memeEditorModal.classList.add('active');
    }
    
    // Ctrl/Cmd + S: Save meme
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveMemeToCloud();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // /: Focus search
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        DOM.searchInput.focus();
    }
}

// Handle online/offline status
function handleOnlineStatus() {
    AppState.isOnline = navigator.onLine;
    showToast(
        AppState.isOnline ? 'You are back online!' : 'You are offline. Some features may not work.',
        AppState.isOnline ? 'success' : 'warning'
    );
}

// Set up pull to refresh
/*function setupPullToRefresh() {
    const feedContainer = document.getElementById('memeFeed');
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    
    feedContainer.addEventListener('touchstart', (e) => {
        if (feedContainer.scrollTop === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    });
    
    feedContainer.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0) {
            e.preventDefault();
            const pullToRefresh = document.getElementById('pullToRefresh');
            pullToRefresh.style.transform = `translateY(${Math.min(pullDistance, 60)}px)`;
            pullToRefresh.classList.toggle('active', pullDistance > 50);
        }
    });
    
    feedContainer.addEventListener('touchend', () => {
        if (isPulling) {
            const pullToRefresh = document.getElementById('pullToRefresh');
            if (pullToRefresh.classList.contains('active')) {
                refreshFeed();
            }
            pullToRefresh.style.transform = 'translateY(0)';
            pullToRefresh.classList.remove('active');
            isPulling = false;
        }
    });
}*/

// Load initial data
async function loadInitialData() {
    showLoading();
    
    try {
        await Promise.all([
            loadMoreMemes(), // Load initial feed
            loadTemplateGallery(),
            loadStickersByCategory('all'),
            loadCloudMemes(),
            updateNotificationBadge()
        ]);
        
        updateProfileStats();
        updateCloudStats();
        loadRecentMemes();
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('Failed to load data', 'error');
    } finally {
        hideLoading();
    }
}

// Update profile stats
function updateProfileStats() {
    const user = AppState.currentUser;
    
    // Update profile stats in DOM
    document.querySelectorAll('.stat-value').forEach((el, index) => {
        switch(index) {
            case 0: el.textContent = user.memeCount; break;
            case 1: el.textContent = '12.5K'; break; // Upvotes (mock)
            case 2: el.textContent = user.followers; break;
            case 3: el.textContent = user.following; break;
        }
    });
}

// Update cloud stats
function updateCloudStats() {
    const cloud = AppState.cloudStorage;
    
    document.getElementById('usedStorage').textContent = 
        `${cloud.used.toFixed(1)} GB`;
    document.getElementById('memeCount').textContent = 
        cloud.memes.length;
}

// Load recent memes
function loadRecentMemes() {
    const recentGrid = document.getElementById('recentMemes');
    if (!recentGrid) return;
    
    // Mock recent memes
    const recentMemes = [
        { id: 1, src: 'https://picsum.photos/seed/meme1/300/300' },
        { id: 2, src: 'https://picsum.photos/seed/meme2/300/300' },
        { id: 3, src: 'https://picsum.photos/seed/meme3/300/300' },
        { id: 4, src: 'https://picsum.photos/seed/meme4/300/300' },
        { id: 5, src: 'https://picsum.photos/seed/meme5/300/300' },
        { id: 6, src: 'https://picsum.photos/seed/meme6/300/300' }
    ];
    
    recentGrid.innerHTML = recentMemes.map(meme => `
        <div class="recent-meme" data-id="${meme.id}">
            <img src="${meme.src}" alt="Recent meme ${meme.id}" loading="lazy">
        </div>
    `).join('');
}

// Update notification badge
function updateNotificationBadge() {
    const unreadCount = AppState.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Initialize WebSocket connection
function initWebSocket() {
    if (AppState.socket) return;
    
    try {
        // For demo purposes, we'll simulate WebSocket behavior
        // In production, connect to your WebSocket server
        // AppState.socket = io('https://your-server.com');
        
        // Simulate real-time notifications
        setInterval(() => {
            if (Math.random() > 0.7 && AppState.isOnline) {
                const notifications = [
                    'Your meme got 50 upvotes! 🎉',
                    'New follower: @meme_king started following you',
                    'Trending alert: Your meme is trending in #funny',
                    'Reminder: Save your meme to cloud before editing',
                    'New template available: Check out the latest meme format'
                ];
                
                const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
                showNotification('System', randomNotification, 'info');
            }
        }, 30000); // Every 30 seconds
    } catch (error) {
        console.warn('WebSocket connection failed:', error);
    }
}

// Start webcam for recording
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: true
        });
        
        const preview = document.getElementById('webcamPreview');
        preview.srcObject = stream;
        
        // Store stream for cleanup
        window.webcamStream = stream;
    } catch (error) {
        console.error('Error accessing webcam:', error);
        showToast('Could not access webcam. Please check permissions.', 'error');
    }
}

// Stop webcam
function stopWebcam() {
    if (window.webcamStream) {
        window.webcamStream.getTracks().forEach(track => track.stop());
        window.webcamStream = null;
    }
}

// Export for debugging
window.App = {
    state: AppState,
    modules: {
        memeEditor: { initMemeEditor, saveMemeToCloud },
        feedManager: { initFeedManager, loadMoreMemes },
        tabManager: { initTabManager, switchTab }
    },
    utils: { showToast, debounce, formatFileSize }
};

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

