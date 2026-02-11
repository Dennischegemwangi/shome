// scripts.js - COMPLETELY REWRITTEN with proper DOM handling

// ===== IMPORTS =====
// Meme Editor
import { 
    initMemeEditor, 
    loadTemplateGallery,
    saveMemeToCloud,
    resetMemeCanvas
} from './modules/memeEditor.js';

// Video Editor
import {
    initVideoEditor,
    saveEditedVideo
} from './modules/videoEditor.js';

// Text Styling
import {
    initTextStyling
} from './modules/textStyling.js';

// Sticker Library
import {
    initStickerLibrary
} from './modules/stickerLibrary.js';

// GIF Creator
import {
    initGifCreator,
    saveGif
} from './modules/gifCreator.js';

// Cloud Storage
import {
    initCloudStorage,
    loadCloudMemes
} from './modules/cloudStorage.js';

// Social Sharing
import {
    initSocialSharing
} from './modules/socialSharing.js';

// Feed Manager
import {
    initFeedManager,
    loadMoreMemes,
    refreshFeed
} from './modules/feedManager.js';

// Tab Manager
import {
    initTabManager,
    switchTab
} from './modules/tabManager.js';

// Search Manager
import {
    initSearchManager,
    performSearch
} from './modules/searchManager.js';

// Notification Manager
import {
    initNotificationManager,
    showNotification
} from './modules/notificationManager.js';

// Utils
import {
    debounce,
    showToast,
    showLoading,
    hideLoading,
    generateUniqueId
} from './modules/utils.js';

// ===== GLOBAL STATE =====
const AppState = {
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
        used: 0.5,
        total: 5,
        memes: []
    },
    recentMemes: [],
    isOnline: true
};

// ===== DOM CACHE (Will be initialized later) =====
let DOM = {};

// ===== INITIALIZATION FUNCTIONS =====

// Initialize DOM cache AFTER DOM is ready
function initDOMCache() {
    console.log('Initializing DOM cache...');
    
    DOM = {
        // Header elements
        searchBtn: document.getElementById('searchBtn'),
        notificationBtn: document.getElementById('notificationBtn'),
        searchInput: document.getElementById('searchInput'),
        searchBar: document.querySelector('.search-bar'),
        notificationPanel: document.getElementById('notificationPanel'),
        
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
        
        // Create button
        createNavBtn: document.getElementById('createNavBtn'),
        
        // Quick create options
        quickUpload: document.getElementById('quickUpload'),
        quickTemplate: document.getElementById('quickTemplate'),
        quickWebcam: document.getElementById('quickWebcam'),
        quickVideo: document.getElementById('quickVideo'),
        quickGif: document.getElementById('quickGif'),
        quickBlank: document.getElementById('quickBlank'),
        
        // Share
        shareCaption: document.getElementById('shareCaption'),
        
        // Toast container
        toastContainer: document.getElementById('toastContainer')
    };
    
    console.log('DOM cache initialized:', {
        searchBtn: !!DOM.searchBtn,
        notificationBtn: !!DOM.notificationBtn,
        createNavBtn: !!DOM.createNavBtn
    });
}

// Initialize all modules with proper error handling
async function initAllModules() {
    const modules = [
        { name: 'Tab Manager', init: () => initTabManager(DOM.tabContents, DOM.navItems) },
        { name: 'Meme Editor', init: () => initMemeEditor(DOM.memeCanvas) },
        { name: 'Feed Manager', init: () => initFeedManager() },
        { name: 'Search Manager', init: () => initSearchManager() },
        { name: 'Notification Manager', init: () => initNotificationManager() },
        { name: 'Text Styling', init: () => initTextStyling() },
        { name: 'Sticker Library', init: () => initStickerLibrary() },
        { name: 'Video Editor', init: () => initVideoEditor() },
        { name: 'GIF Creator', init: () => initGifCreator() },
        { name: 'Cloud Storage', init: () => initCloudStorage() },
        { name: 'Social Sharing', init: () => initSocialSharing() }
    ];
    
    for (const module of modules) {
        try {
            await module.init();
            console.log(`✅ ${module.name} initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize ${module.name}:`, error);
            // Continue with other modules instead of stopping
        }
    }
}

// Set up event listeners with PROPER error handling
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Validate critical DOM elements
    if (!DOM.searchBtn || !DOM.notificationBtn || !DOM.createNavBtn) {
        console.error('Critical DOM elements missing!', {
            searchBtn: !!DOM.searchBtn,
            notificationBtn: !!DOM.notificationBtn,
            createNavBtn: !!DOM.createNavBtn
        });
        return;
    }
    
    // 1. Navigation tabs
    if (DOM.navItems && DOM.navItems.length > 0) {
        DOM.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                console.log('Switching to tab:', tab);
                switchTab(tab);
            });
        });
    }
    
    // 2. Create button (center floating button)
    DOM.createNavBtn.addEventListener('click', () => {
        console.log('Create button clicked');
        if (DOM.memeEditorModal) {
            DOM.memeEditorModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
    
    // 3. Search button - WITH PROPER CLICK HANDLING
    DOM.searchBtn.addEventListener('click', function(e) {
        console.log('🔍 Search button clicked!', e);
        e.preventDefault();
        e.stopPropagation();
        
        if (DOM.searchBar) {
            const isActive = DOM.searchBar.classList.contains('active');
            DOM.searchBar.classList.toggle('active');
            console.log('Search bar toggled. Active:', !isActive);
            
            if (!isActive && DOM.searchInput) {
                setTimeout(() => {
                    DOM.searchInput.focus();
                    console.log('Search input focused');
                }, 50);
            }
        }
    });
    
    // 4. Notification button
    DOM.notificationBtn.addEventListener('click', function(e) {
        console.log('🔔 Notification button clicked!', e);
        e.preventDefault();
        e.stopPropagation();
        
        if (DOM.notificationPanel) {
            const isActive = DOM.notificationPanel.classList.contains('active');
            DOM.notificationPanel.classList.toggle('active');
            console.log('Notification panel toggled. Active:', !isActive);
        }
    });
    
    // 5. Search input
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', debounce((e) => {
            console.log('Search input changed:', e.target.value);
            if (typeof performSearch === 'function') {
                performSearch(e.target.value);
            }
        }, 300));
    }
    
    // 6. Quick create options
    const quickOptions = [
        { id: 'quickUpload', action: () => document.getElementById('uploadImageBtn')?.click() },
        { id: 'quickTemplate', action: () => DOM.templateModal?.classList.add('active') },
        { id: 'quickWebcam', action: () => DOM.webcamModal?.classList.add('active') },
        { id: 'quickVideo', action: () => DOM.videoEditorModal?.classList.add('active') },
        { id: 'quickGif', action: () => DOM.gifModal?.classList.add('active') },
        { id: 'quickBlank', action: () => {
            resetMemeCanvas();
            DOM.memeEditorModal?.classList.add('active');
        }}
    ];
    
    quickOptions.forEach(option => {
        const element = document.getElementById(option.id);
        if (element) {
            element.addEventListener('click', option.action);
        }
    });
    
    // 7. Modal close buttons
    document.querySelectorAll('.close-editor, .close-template, .close-sticker, .close-gif, .close-cloud, .close-share, .close-webcam').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // 8. Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // 9. Online/offline detection
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    console.log('✅ Event listeners setup complete');
}

// ===== HELPER FUNCTIONS =====

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

function handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        resetMemeCanvas();
        if (DOM.memeEditorModal) {
            DOM.memeEditorModal.classList.add('active');
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveMemeToCloud();
    }
    
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (DOM.searchInput) {
            DOM.searchInput.focus();
        }
    }
}

function handleOnlineStatus() {
    AppState.isOnline = navigator.onLine;
    showToast(
        AppState.isOnline ? 'You are back online!' : 'You are offline. Some features may not work.',
        AppState.isOnline ? 'success' : 'warning'
    );
}

// Load initial data
async function loadInitialData() {
    showLoading();
    
    try {
        await Promise.all([
            loadMoreMemes(),
            loadTemplateGallery(),
            loadCloudMemes()
        ]);
        
        updateProfileStats();
        updateCloudStats();
        loadRecentMemes();
        updateNotificationBadge();
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('Failed to load data', 'error');
    } finally {
        hideLoading();
    }
}

function updateProfileStats() {
    const user = AppState.currentUser;
    
    document.querySelectorAll('.stat-value').forEach((el, index) => {
        switch(index) {
            case 0: el.textContent = user.memeCount; break;
            case 1: el.textContent = '12.5K'; break;
            case 2: el.textContent = user.followers; break;
            case 3: el.textContent = user.following; break;
        }
    });
}

function updateCloudStats() {
    const cloud = AppState.cloudStorage;
    
    const usedStorage = document.getElementById('usedStorage');
    const memeCount = document.getElementById('memeCount');
    
    if (usedStorage) usedStorage.textContent = `${cloud.used.toFixed(1)} GB`;
    if (memeCount) memeCount.textContent = cloud.memes.length;
}

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

function updateNotificationBadge() {
    const unreadCount = AppState.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function initWebSocket() {
    // Simulate real-time notifications
    setInterval(() => {
        if (Math.random() > 0.7 && AppState.isOnline) {
            const notifications = [
                'Your meme got 50 upvotes! 🎉',
                'New follower: @meme_king started following you',
                'Trending alert: Your meme is trending in #funny',
                'Reminder: Save your meme to cloud before editing'
            ];
            
            const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
            showNotification('System', randomNotification, 'info');
        }
    }, 30000);
}

// ===== MAIN APP INITIALIZATION =====
async function initApp() {
    console.log('🚀 Initializing Shome Meme App...');
    
    try {
        // 1. Initialize DOM cache FIRST
        initDOMCache();
        
        // 2. Initialize all modules
        await initAllModules();
        
        // 3. Set up event listeners
        setupEventListeners();
        
        // 4. Load initial data
        await loadInitialData();
        
        // 5. Initialize WebSocket
        initWebSocket();
        
        console.log('✅ App initialized successfully');
        showToast('Welcome to Shome Meme App!', 'success');
        
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        showToast('Failed to initialize app', 'error');
    }
}

// ===== START THE APP =====
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM fully loaded, starting app...');
        initApp();
    });
} else {
    console.log('DOM already loaded, starting app...');
    initApp();
}

// ===== DEBUG EXPORTS =====
window.App = {
    state: AppState,
    DOM: DOM,
    initApp: initApp,
    setupEventListeners: setupEventListeners
};

console.log('scripts.js loaded successfully');