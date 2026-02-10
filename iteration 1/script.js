// ===== GLOBAL VARIABLES =====
let feedPage = 0;
const memesPerPage = 3;
const sentinel = document.getElementById('loading-sentinel');
const memeFeed = document.getElementById('memeFeed');
const appHeader = document.getElementById('appHeader');
const pullToRefresh = document.getElementById('pullToRefresh');
let isLoading = false;
let isRefreshing = false;

// Swipe Navigation Variables
const tabSwipeContainer = document.getElementById('tabSwipeContainer');
const tabIndicator = document.getElementById('tabIndicator');
const indicatorDots = document.querySelectorAll('.indicator-dot');
let currentTabIndex = 0;
const tabs = ['feed', 'shorts', 'create', 'profile'];
let startX = 0;
let currentX = 0;
let isSwiping = false;

// Search Variables
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const closeSearch = document.getElementById('closeSearch');
const recentSearches = document.getElementById('recentSearches');
const searchResults = document.getElementById('searchResults');

// Notification Variables
const notificationPanel = document.getElementById('notificationPanel');
const notificationBadge = document.getElementById('notificationBadge');
const notificationsList = document.getElementById('notificationsList');
const notificationEmpty = document.getElementById('notificationEmpty');
const markAllRead = document.getElementById('markAllRead');
const closeNotifications = document.getElementById('closeNotifications');
const notificationTabs = document.querySelectorAll('.notification-tab');

// Meme Editor Variables
const memeEditorModal = document.getElementById('memeEditorModal');
const memeCanvas = document.getElementById('memeCanvas');
const ctx = memeCanvas.getContext('2d');
let currentImage = null;
let currentVideo = null;
let fontSize = 48;
let textColor = 'white';
let fontFamily = 'Impact';
let currentFilter = 'none';
let filterIntensity = 100;
let activeStickers = [];
let activeTexts = [];

// State management
const upvoteStates = new Map();
const videoLikeStates = new Map();
let currentShortIndex = 0;

// Data
const memeData = [{
        type: 'image',
        content: 'https://images.unsplash.com/photo-1611605698335-8b1569810433?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        username: 'MemeMaster_01',
        caption: 'When you finally fix the bug after 5 hours of debugging #programming #techhumor',
        likes: 245,
        comments: 32,
        shares: 12
    },
    {
        type: 'video',
        content: 'https://assets.mixkit.co/videos/preview/mixkit-funny-cat-looking-at-the-camera-4813-large.mp4',
        username: 'CatLover_42',
        caption: 'My cat when I try to take a serious video 😂 #cats #funnypets',
        likes: 512,
        comments: 45,
        shares: 28
    },
    {
        type: 'gif',
        content: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        username: 'GifGod',
        caption: 'When someone explains something simple in a complicated way #gifs #reactions',
        likes: 312,
        comments: 24,
        shares: 18
    }
];

const shortsData = [{
        id: 1,
        user: "ShortKing",
        title: "This is what happens when you try to cook for the first time",
        avatar: "S",
        video: "https://assets.mixkit.co/videos/preview/mixkit-funny-cat-looking-at-the-camera-4813-large.mp4",
        likes: 15420,
        comments: 842,
        shares: 45
    },
    {
        id: 2,
        user: "QuickLaughs",
        title: "When someone says memes aren't a real hobby",
        avatar: "Q",
        video: "https://assets.mixkit.co/videos/preview/mixkit-man-holding-neon-sign-1232-large.mp4",
        likes: 8700,
        comments: 521,
        shares: 32
    }
];

// Meme Templates
const memeTemplates = [{
        id: 1,
        name: "Distracted Boyfriend",
        image: "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Distracted_Boyfriend.jpg/220px-Distracted_Boyfriend.jpg",
        textAreas: [{
                top: 50,
                left: 50,
                placeholder: "Me looking at..."
            },
            {
                top: 50,
                right: 50,
                placeholder: "My current..."
            },
            {
                bottom: 50,
                left: 50,
                placeholder: "My girlfriend..."
            }
        ]
    },
    {
        id: 2,
        name: "Drake Hotline Bling",
        image: "https://upload.wikimedia.org/wikipedia/en/thumb/5/58/DrakeHotlineBling.jpg/220px-DrakeHotlineBling.jpg",
        textAreas: [{
                top: 100,
                left: 'center',
                placeholder: "Disappointed Drake"
            },
            {
                bottom: 100,
                left: 'center',
                placeholder: "Approving Drake"
            }
        ]
    },
    {
        id: 3,
        name: "Two Buttons",
        image: "https://i.kym-cdn.com/photos/images/newsfeed/000/999/667/3e1.jpg",
        textAreas: [{
                top: 50,
                left: '25%',
                placeholder: "Button 1"
            },
            {
                top: 50,
                left: '75%',
                placeholder: "Button 2"
            },
            {
                bottom: 50,
                left: 'center',
                placeholder: "Me"
            }
        ]
    },
    {
        id: 4,
        name: "Change My Mind",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Steven_Crowder_Change_My_Mind_meme.jpg/220px-Steven_Crowder_Change_My_Mind_meme.jpg",
        textAreas: [{
            center: true,
            placeholder: "Change my mind..."
        }]
    }
];

// Sticker Data
const stickers = {
    emojis: ['😂', '😭', '🤣', '😍', '😎', '🤔', '😱', '🥺', '🔥', '💀', '✨', '🎉'],
    reactions: ['👏', '👍', '👎', '❤️', '💩', '🤮', '🤯', '🥳', '😈', '👻', '💯', '⭐'],
    memes: ['🤡', '🧐', '🙄', '😏', '🥴', '🤪', '😬', '🫡', '🥲', '🤓', '😇', '😤']
};

// Notification Data
const notifications = [{
        id: 1,
        type: 'like',
        user: 'MemeFan99',
        avatar: 'M',
        content: 'liked your meme "Monday mornings be like..."',
        time: '2m ago',
        read: false
    },
    {
        id: 2,
        type: 'comment',
        user: 'FunnyGuy42',
        avatar: 'F',
        content: 'commented: "This is too real! 😂" on your meme',
        time: '15m ago',
        read: false
    },
    {
        id: 3,
        type: 'follow',
        user: 'MemeQueen',
        avatar: 'M',
        content: 'started following you',
        time: '1h ago',
        read: false
    },
    {
        id: 4,
        type: 'mention',
        user: 'ViralVibes',
        avatar: 'V',
        content: 'mentioned you in a meme',
        time: '3h ago',
        read: true
    },
    {
        id: 5,
        type: 'like',
        user: 'ShortKing',
        avatar: 'S',
        content: 'liked your video meme',
        time: '5h ago',
        read: true
    }
];

// Recent Searches
let recentSearchesData = JSON.parse(localStorage.getItem('shome_recent_searches') || '[]');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Add skeleton loading cards
    addSkeletonCards();

    // Load initial content
    setTimeout(() => {
        loadMoreMemes();
        setupShortsFeed();
        loadProfileContent('memes');
        loadRecentMemes();
        loadRecentSearches();
        loadNotifications('all');
    }, 600);

    setupEventListeners();
    setupProfileTabs();
    setupMemeEditor();
    setupTemplates();
    setupStickers();

    // Start header hide/show logic
    setupHeaderScroll();

    // Setup pull to refresh
    setupPullToRefresh();

    // Setup swipe navigation
    setupSwipeNavigation();

    // Setup search functionality
    setupSearch();

    // Setup notifications
    setupNotifications();

    // Setup GIF functionality
    setupGIF();

    // Setup video editor
    setupVideoEditor();
});

// ===== SWIPE NAVIGATION =====
function setupSwipeNavigation() {
    // Mouse events for desktop
    tabSwipeContainer.addEventListener('mousedown', startSwipe);
    tabSwipeContainer.addEventListener('mousemove', handleSwipe);
    tabSwipeContainer.addEventListener('mouseup', endSwipe);
    tabSwipeContainer.addEventListener('mouseleave', endSwipe);

    // Touch events for mobile
    tabSwipeContainer.addEventListener('touchstart', startSwipeTouch);
    tabSwipeContainer.addEventListener('touchmove', handleSwipeTouch);
    tabSwipeContainer.addEventListener('touchend', endSwipe);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyNavigation);

    // Tab indicator clicks
    indicatorDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchTabByIndex(index);
        });
    });
}

function startSwipe(e) {
    startX = e.clientX;
    currentX = startX;
    isSwiping = true;
}

function startSwipeTouch(e) {
    startX = e.touches[0].clientX;
    currentX = startX;
    isSwiping = true;
    e.preventDefault();
}

function handleSwipe(e) {
    if (!isSwiping) return;
    currentX = e.clientX;
    updateSwipePosition();
}

function handleSwipeTouch(e) {
    if (!isSwiping) return;
    currentX = e.touches[0].clientX;
    updateSwipePosition();
    e.preventDefault();
}

function updateSwipePosition() {
    const deltaX = currentX - startX;
    const maxDelta = window.innerWidth * 0.3;
    const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaX));
    const percentage = clampedDelta / maxDelta;

    // Calculate transform based on current tab and swipe percentage
    const baseTransform = -currentTabIndex * 100;
    const swipeTransform = (percentage * 100) / 4; // Divide by number of tabs

    tabSwipeContainer.style.transform = `translateX(${baseTransform + swipeTransform}%)`;
    tabSwipeContainer.style.transition = 'none';
}

function endSwipe() {
    if (!isSwiping) return;

    isSwiping = false;
    tabSwipeContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    const deltaX = currentX - startX;
    const threshold = window.innerWidth * 0.1;

    if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && currentTabIndex > 0) {
            // Swipe right - go to previous tab
            switchTabByIndex(currentTabIndex - 1);
        } else if (deltaX < 0 && currentTabIndex < tabs.length - 1) {
            // Swipe left - go to next tab
            switchTabByIndex(currentTabIndex + 1);
        } else {
            // Return to current tab
            switchTabByIndex(currentTabIndex);
        }
    } else {
        // Return to current tab
        switchTabByIndex(currentTabIndex);
    }
}

function handleKeyNavigation(e) {
    if (e.key === 'ArrowLeft' && currentTabIndex > 0) {
        switchTabByIndex(currentTabIndex - 1);
    } else if (e.key === 'ArrowRight' && currentTabIndex < tabs.length - 1) {
        switchTabByIndex(currentTabIndex + 1);
    } else if (e.key === '1' || e.key === '&') {
        switchTabByIndex(0); // Feed
    } else if (e.key === '2' || e.key === 'é') {
        switchTabByIndex(1); // Shorts
    } else if (e.key === '3' || e.key === '"') {
        switchTabByIndex(2); // Create
    } else if (e.key === '4' || e.key === "'") {
        switchTabByIndex(3); // Profile
    }
}

function switchTabByIndex(index) {
    if (index < 0 || index >= tabs.length) return;

    currentTabIndex = index;
    const tabId = tabs[index];

    // Update tab swipe container
    tabSwipeContainer.style.transform = `translateX(-${index * 100}%)`;

    // Update tab indicator
    indicatorDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Update bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });

    // Update tab visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });

    // Handle tab-specific actions
    if (tabId === 'shorts') {
        if (currentShortIndex !== 0) {
            currentShortIndex = 0;
            scrollToShort(currentShortIndex);
        } else {
            setTimeout(playCurrentShort, 100);
        }
    }

    // Update header for create tab (no search/notification)
    if (tabId === 'create') {
        document.querySelector('.header-left').style.opacity = '0.5';
        document.querySelector('.header-right').style.opacity = '0.5';
    } else {
        document.querySelector('.header-left').style.opacity = '1';
        document.querySelector('.header-right').style.opacity = '1';
    }
}

// ===== SEARCH FUNCTIONALITY =====
function setupSearch() {
    // Search button click
    document.getElementById('searchBtn').addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    });

    // Close search
    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.classList.remove('active');
    });

    // Clear search input
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchResults.classList.remove('active');
        searchInput.focus();
    });

    // Search input events
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    // Tag clicks
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.textContent;
            performSearch(tag.textContent);
        });
    });
}

function handleSearch() {
    const query = searchInput.value.trim();
    if (query.length === 0) {
        searchResults.classList.remove('active');
        return;
    }

    if (query.length < 2) return;

    // Show loading state
    searchResults.innerHTML = '<div class="loading-spinner"></div><p>Searching...</p>';
    searchResults.classList.add('active');

    // Simulate search delay
    setTimeout(() => {
        performSearch(query);
    }, 500);
}

function performSearch(query) {
    if (query.trim() === '') return;

    // Add to recent searches
    addToRecentSearches(query);

    // Simulate search results
    const results = [{
            type: 'user',
            name: '@meme_lover',
            avatar: 'M',
            followers: '1.2K'
        },
        {
            type: 'hashtag',
            name: '#funny',
            posts: '24.5K'
        },
        {
            type: 'meme',
            image: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            likes: '456'
        },
        {
            type: 'user',
            name: '@funny_guy',
            avatar: 'F',
            followers: '856'
        },
        {
            type: 'hashtag',
            name: '#dankmemes',
            posts: '12.3K'
        }
    ];

    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try different keywords or check spelling</p>
            </div>
        `;
        return;
    }

    // Add query header
    const header = document.createElement('div');
    header.className = 'results-header';
    header.innerHTML = `<h3>Results for "${query}"</h3>`;
    searchResults.appendChild(header);

    // Add results
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        if (result.type === 'user') {
            resultItem.innerHTML = `
                <div class="result-user">
                    <div class="user-avatar">${result.avatar}</div>
                    <div class="user-info">
                        <h4>${result.name}</h4>
                        <p>${result.followers} followers</p>
                    </div>
                    <button class="follow-btn">Follow</button>
                </div>
            `;
        } else if (result.type === 'hashtag') {
            resultItem.innerHTML = `
                <div class="result-hashtag">
                    <i class="fas fa-hashtag"></i>
                    <div class="hashtag-info">
                        <h4>${result.name}</h4>
                        <p>${result.posts} posts</p>
                    </div>
                </div>
            `;
        } else if (result.type === 'meme') {
            resultItem.innerHTML = `
                <div class="result-meme">
                    <img src="${result.image}" alt="Meme result">
                    <div class="meme-info">
                        <p><i class="fas fa-heart"></i> ${result.likes} likes</p>
                    </div>
                </div>
            `;
        }

        resultItem.addEventListener('click', () => {
            alert(`Opening ${result.type}: ${result.name}`);
        });

        searchResults.appendChild(resultItem);
    });
}

function loadRecentSearches() {
    recentSearches.innerHTML = '';

    if (recentSearchesData.length === 0) {
        recentSearches.innerHTML = '<p class="no-recent">No recent searches</p>';
        return;
    }

    recentSearchesData.slice(0, 5).forEach(search => {
        const searchItem = document.createElement('div');
        searchItem.className = 'recent-search-item';
        searchItem.innerHTML = `
            <div class="search-text">
                <i class="fas fa-history"></i>
                <span>${search}</span>
            </div>
            <i class="fas fa-times remove-search"></i>
        `;

        // Search on click
        searchItem.querySelector('.search-text').addEventListener('click', () => {
            searchInput.value = search;
            performSearch(search);
        });

        // Remove search
        searchItem.querySelector('.remove-search').addEventListener('click', (e) => {
            e.stopPropagation();
            removeRecentSearch(search);
        });

        recentSearches.appendChild(searchItem);
    });
}

function addToRecentSearches(query) {
    query = query.trim().toLowerCase();

    // Remove if already exists
    recentSearchesData = recentSearchesData.filter(s => s !== query);

    // Add to beginning
    recentSearchesData.unshift(query);

    // Keep only last 10 searches
    if (recentSearchesData.length > 10) {
        recentSearchesData = recentSearchesData.slice(0, 10);
    }

    localStorage.setItem('shome_recent_searches', JSON.stringify(recentSearchesData));
    loadRecentSearches();
}

function removeRecentSearch(query) {
    recentSearchesData = recentSearchesData.filter(s => s !== query);
    localStorage.setItem('shome_recent_searches', JSON.stringify(recentSearchesData));
    loadRecentSearches();
}

// ===== NOTIFICATIONS =====
function setupNotifications() {
    // Notification button click
    document.getElementById('notificationBtn').addEventListener('click', () => {
        notificationPanel.classList.add('active');
        updateNotificationBadge();
    });

    // Close notifications
    closeNotifications.addEventListener('click', () => {
        notificationPanel.classList.remove('active');
    });

    // Mark all as read
    markAllRead.addEventListener('click', () => {
        notifications.forEach(notif => notif.read = true);
        updateNotificationBadge();
        loadNotifications('all');
    });

    // Notification tabs
    notificationTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            notificationTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadNotifications(tab.dataset.type);
        });
    });

    // Update badge initially
    updateNotificationBadge();
}

function loadNotifications(type) {
    notificationsList.innerHTML = '';

    let filteredNotifications = notifications;

    if (type !== 'all') {
        filteredNotifications = notifications.filter(notif => notif.type === type);
    }

    if (filteredNotifications.length === 0) {
        notificationEmpty.style.display = 'flex';
        notificationsList.style.display = 'none';
        return;
    }

    notificationEmpty.style.display = 'none';
    notificationsList.style.display = 'block';

    filteredNotifications.forEach(notification => {
        const notifItem = document.createElement('div');
        notifItem.className = `notification-item ${notification.read ? 'read' : 'unread'}`;

        // Get icon based on type
        let icon = 'fa-heart';
        if (notification.type === 'comment') icon = 'fa-comment';
        if (notification.type === 'follow') icon = 'fa-user-plus';
        if (notification.type === 'mention') icon = 'fa-at';

        notifItem.innerHTML = `
            <div class="notification-avatar">${notification.avatar}</div>
            <div class="notification-content">
                <p><strong>${notification.user}</strong> ${notification.content}</p>
                <div class="notification-time">${notification.time}</div>
            </div>
            <i class="fas ${icon} notification-icon"></i>
        `;

        notifItem.addEventListener('click', () => {
            if (!notification.read) {
                notification.read = true;
                notifItem.classList.remove('unread');
                notifItem.classList.add('read');
                updateNotificationBadge();
            }
            alert(`Opening notification from ${notification.user}`);
        });

        notificationsList.appendChild(notifItem);
    });
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        notificationBadge.style.display = 'flex';
    } else {
        notificationBadge.style.display = 'none';
    }
}

// ===== MEME EDITOR FUNCTIONS =====
function setupMemeEditor() {
    // Initialize canvas
    resizeCanvas();
    drawInitialCanvas();

    // Setup event listeners for editor
    setupEditorListeners();

    // Setup editor tabs
    setupEditorTabs();

    // Setup text effects
    setupTextEffects();
}

function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    const containerWidth = container.clientWidth - 40;
    const containerHeight = 400;

    memeCanvas.width = containerWidth;
    memeCanvas.height = containerHeight;
}

function drawInitialCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, memeCanvas.width, memeCanvas.height);

    ctx.fillStyle = '#cccccc';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Upload an image or choose a template', memeCanvas.width / 2, memeCanvas.height / 2);
}

function setupEditorTabs() {
    const editorTabs = document.querySelectorAll('.editor-tab');
    const tabContents = document.querySelectorAll('.controls-container .tab-content');

    editorTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;

            // Update active tab
            editorTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.toggle('active', content.dataset.tab === tabId);
            });
        });
    });
}

function setupTextEffects() {
    const effectBtns = document.querySelectorAll('.effect-btn');

    effectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            effectBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Apply text effect
            applyTextEffect(this.dataset.effect);
        });
    });
}

function applyTextEffect(effect) {
    // This would implement different text effects
    // For now, just redraw with current settings
    redrawCanvas();
}

function drawImageOnCanvas(image) {
    currentImage = image;
    currentVideo = null;
    redrawCanvas();
}

function redrawCanvas() {
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, memeCanvas.width, memeCanvas.height);

    if (currentImage) {
        // Calculate dimensions to fit canvas while maintaining aspect ratio
        const canvasRatio = memeCanvas.width / memeCanvas.height;
        const imageRatio = currentImage.width / currentImage.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imageRatio > canvasRatio) {
            drawWidth = memeCanvas.width;
            drawHeight = memeCanvas.width / imageRatio;
            offsetX = 0;
            offsetY = (memeCanvas.height - drawHeight) / 2;
        } else {
            drawHeight = memeCanvas.height;
            drawWidth = memeCanvas.height * imageRatio;
            offsetX = (memeCanvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        // Apply filter
        ctx.filter = getFilterValue(currentFilter, filterIntensity);

        // Draw image
        ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);

        // Reset filter for text
        ctx.filter = 'none';

        // Draw text
        drawTextOnCanvas();

        // Draw stickers
        drawStickers();
    } else if (currentVideo) {
        // Draw video frame
        // In a real app, you would capture a video frame
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, memeCanvas.width, memeCanvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Video loaded - Preview not available', memeCanvas.width / 2, memeCanvas.height / 2);
    } else {
        drawInitialCanvas();
    }
}

function drawTextOnCanvas() {
    const topText = document.getElementById('topText').value;
    const bottomText = document.getElementById('bottomText').value;
    const customText = document.getElementById('customText').value;

    ctx.fillStyle = textColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Draw top text with outline
    if (topText) {
        ctx.strokeText(topText, memeCanvas.width / 2, 20);
        ctx.fillText(topText, memeCanvas.width / 2, 20);
    }

    // Draw bottom text with outline
    if (bottomText) {
        ctx.textBaseline = 'bottom';
        ctx.strokeText(bottomText, memeCanvas.width / 2, memeCanvas.height - 20);
        ctx.fillText(bottomText, memeCanvas.width / 2, memeCanvas.height - 20);
    }

    // Draw custom text (centered)
    if (customText) {
        ctx.textBaseline = 'middle';
        ctx.strokeText(customText, memeCanvas.width / 2, memeCanvas.height / 2);
        ctx.fillText(customText, memeCanvas.width / 2, memeCanvas.height / 2);
    }
}

function drawStickers() {
    activeStickers.forEach(sticker => {
        ctx.font = '48px Arial';
        ctx.fillText(sticker.emoji, sticker.x, sticker.y);
    });
}

function getFilterValue(filter, intensity = 100) {
    const percent = intensity / 100;

    switch (filter) {
        case 'grayscale':
            return `grayscale(${percent})`;
        case 'sepia':
            return `sepia(${percent})`;
        case 'invert':
            return `invert(${percent})`;
        case 'brightness':
            return `brightness(${0.5 + percent})`;
        case 'contrast':
            return `contrast(${percent * 2})`;
        case 'hue':
            return `hue-rotate(${percent * 360}deg)`;
        case 'saturation':
            return `saturate(${percent * 2})`;
        case 'blur':
            return `blur(${percent * 5}px)`;
        case 'pixelate':
            return 'none'; // Pixelate needs custom implementation
        default:
            return 'none';
    }
}

function setupEditorListeners() {
    // Text input listeners
    const topTextInput = document.getElementById('topText');
    const bottomTextInput = document.getElementById('bottomText');
    const customTextInput = document.getElementById('customText');
    const fontSelect = document.getElementById('fontSelect');
    const colorOptions = document.querySelectorAll('.color-option');
    const sizeBtns = document.querySelectorAll('.size-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterSlider = document.getElementById('filterIntensity');
    const sliderValue = document.querySelector('.slider-value');

    const textInputs = [topTextInput, bottomTextInput, customTextInput];
    textInputs.forEach(input => {
        input.addEventListener('input', redrawCanvas);
    });

    fontSelect.addEventListener('change', function() {
        fontFamily = this.value;
        redrawCanvas();
    });

    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            textColor = this.dataset.color;
            redrawCanvas();
        });
    });

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.size;
            if (action === '+') {
                fontSize = Math.min(72, fontSize + 4);
            } else {
                fontSize = Math.max(24, fontSize - 4);
            }
            document.querySelector('.size-value').textContent = `${fontSize}px`;
            redrawCanvas();
        });
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            redrawCanvas();
        });
    });

    filterSlider.addEventListener('input', function() {
        filterIntensity = this.value;
        sliderValue.textContent = `${filterIntensity}%`;
        redrawCanvas();
    });

    // Upload image button
    document.getElementById('uploadImageBtn').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });

    // Image upload handler
    document.getElementById('imageUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    drawImageOnCanvas(img);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Use template button
    document.getElementById('useTemplateBtn').addEventListener('click', () => {
        memeEditorModal.classList.remove('active');
        templateModal.classList.add('active');
    });

    // Close editor
    document.getElementById('closeEditor').addEventListener('click', () => {
        memeEditorModal.classList.remove('active');
    });

    // Reset meme
    document.getElementById('resetMeme').addEventListener('click', resetMemeEditor);

    // Save meme
    document.getElementById('saveMeme').addEventListener('click', saveMeme);

    // Save to cloud
    document.getElementById('saveToCloud').addEventListener('click', saveToCloud);

    // Share meme
    document.getElementById('shareMeme').addEventListener('click', shareMeme);
}

function resetMemeEditor() {
    currentImage = null;
    currentVideo = null;
    activeStickers = [];

    document.getElementById('topText').value = '';
    document.getElementById('bottomText').value = '';
    document.getElementById('customText').value = '';

    fontSize = 48;
    textColor = 'white';
    fontFamily = 'Impact';
    currentFilter = 'none';
    filterIntensity = 100;

    // Reset UI
    document.querySelector('.size-value').textContent = '48px';
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.color === 'white');
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'none');
    });
    document.querySelectorAll('.effect-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById('filterIntensity').value = 100;
    document.querySelector('.slider-value').textContent = '100%';

    drawInitialCanvas();
}

function saveMeme() {
    if (!currentImage && !currentVideo) {
        alert('Please upload an image/video or choose a template first!');
        return;
    }

    // Create a temporary canvas for download
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    if (currentImage) {
        // Use original image dimensions for better quality
        tempCanvas.width = currentImage.width;
        tempCanvas.height = currentImage.height;

        // Scale text proportionally
        const scaleFactor = tempCanvas.width / memeCanvas.width;
        const scaledFontSize = fontSize * scaleFactor;

        // Draw image with filter
        tempCtx.filter = getFilterValue(currentFilter, filterIntensity);
        tempCtx.drawImage(currentImage, 0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.filter = 'none';

        // Draw text
        drawTextOnTempCanvas(tempCtx, tempCanvas, scaledFontSize);
    }

    // Create download link
    const link = document.createElement('a');
    link.download = 'shome-meme.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();

    // Add to recent memes
    addToRecentMemes(link.href);

    alert('Meme saved successfully!');
}

function drawTextOnTempCanvas(ctx, canvas, fontSize) {
    const topText = document.getElementById('topText').value;
    const bottomText = document.getElementById('bottomText').value;
    const customText = document.getElementById('customText').value;

    ctx.fillStyle = textColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4 * (canvas.width / memeCanvas.width);
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    if (topText) {
        const topY = 20 * (canvas.width / memeCanvas.width);
        ctx.strokeText(topText, canvas.width / 2, topY);
        ctx.fillText(topText, canvas.width / 2, topY);
    }

    if (bottomText) {
        ctx.textBaseline = 'bottom';
        const bottomY = canvas.height - (20 * (canvas.width / memeCanvas.width));
        ctx.strokeText(bottomText, canvas.width / 2, bottomY);
        ctx.fillText(bottomText, canvas.width / 2, bottomY);
    }

    if (customText) {
        ctx.textBaseline = 'middle';
        ctx.strokeText(customText, canvas.width / 2, canvas.height / 2);
        ctx.fillText(customText, canvas.width / 2, canvas.height / 2);
    }
}

function saveToCloud() {
    if (!currentImage && !currentVideo) {
        alert('Please create a meme first!');
        return;
    }

    // Simulate cloud save
    const saveBtn = document.getElementById('saveToCloud');
    const originalText = saveBtn.innerHTML;

    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;

    setTimeout(() => {
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 1500);

        alert('Meme saved to cloud! You can access it from any device.');
    }, 2000);
}

function shareMeme() {
    if (!currentImage && !currentVideo) {
        alert('Please create a meme first!');
        return;
    }

    // Create data URL for sharing
    memeCanvas.toBlob(function(blob) {
        if (navigator.share) {
            const file = new File([blob], 'shome-meme.png', {
                type: 'image/png'
            });

            navigator.share({
                files: [file],
                title: 'Check out my meme!',
                text: 'I created this meme using Shome App',
                url: 'https://shome.app'
            }).catch(console.error);
        } else {
            // Fallback: show share options
            const shareModal = document.createElement('div');
            shareModal.className = 'share-modal';
            shareModal.innerHTML = `
                <div class="share-options">
                    <h3>Share Meme</h3>
                    <div class="share-buttons">
                        <button class="share-option" data-platform="twitter">
                            <i class="fab fa-twitter"></i> Twitter
                        </button>
                        <button class="share-option" data-platform="instagram">
                            <i class="fab fa-instagram"></i> Instagram
                        </button>
                        <button class="share-option" data-platform="whatsapp">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        <button class="share-option" data-platform="copy">
                            <i class="fas fa-copy"></i> Copy Link
                        </button>
                    </div>
                    <button class="close-share">Cancel</button>
                </div>
            `;

            document.body.appendChild(shareModal);

            // Add event listeners
            shareModal.querySelector('.close-share').addEventListener('click', () => {
                shareModal.remove();
            });

            shareModal.querySelectorAll('.share-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    alert(`Sharing to ${btn.dataset.platform}...`);
                    shareModal.remove();
                });
            });
        }
    }, 'image/png');
}

// ===== STICKERS =====
function setupStickers() {
    const stickerGrid = document.getElementById('stickerGrid');
    const stickerCategories = document.querySelectorAll('.sticker-category');

    // Load default stickers (emojis)
    loadStickers('emojis');

    // Category switching
    stickerCategories.forEach(category => {
        category.addEventListener('click', function() {
            stickerCategories.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            loadStickers(this.dataset.category);
        });
    });
}

function loadStickers(category) {
    const stickerGrid = document.getElementById('stickerGrid');
    stickerGrid.innerHTML = '';

    const categoryStickers = stickers[category] || [];

    categoryStickers.forEach(sticker => {
        const stickerItem = document.createElement('div');
        stickerItem.className = 'sticker-item';
        stickerItem.textContent = sticker;

        stickerItem.addEventListener('click', () => {
            addStickerToCanvas(sticker);
        });

        stickerGrid.appendChild(stickerItem);
    });

    // Add custom sticker upload option
    if (category === 'custom') {
        const customSticker = document.createElement('div');
        customSticker.className = 'sticker-item';
        customSticker.innerHTML = '<i class="fas fa-plus"></i>';
        customSticker.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Handle custom sticker upload
                    alert('Custom sticker uploaded! (In a real app, this would process the image)');
                }
            };
            input.click();
        });
        stickerGrid.appendChild(customSticker);
    }
}

function addStickerToCanvas(sticker) {
    // Add sticker at random position
    const x = 50 + Math.random() * (memeCanvas.width - 100);
    const y = 50 + Math.random() * (memeCanvas.height - 100);

    activeStickers.push({
        emoji: sticker,
        x: x,
        y: y
    });

    redrawCanvas();
}

// ===== VIDEO EDITOR =====
function setupVideoEditor() {
    const uploadVideoBtn = document.getElementById('uploadVideoBtn');
    const videoUpload = document.getElementById('videoUpload');
    const recordVideoBtn = document.getElementById('recordVideoBtn');
    const trimStart = document.getElementById('trimStart');
    const trimEnd = document.getElementById('trimEnd');
    const videoSpeed = document.getElementById('videoSpeed');
    const audioSelect = document.getElementById('audioSelect');

    uploadVideoBtn.addEventListener('click', () => {
        videoUpload.click();
    });

    videoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                alert('Please select a video file');
                return;
            }

            const url = URL.createObjectURL(file);
            loadVideo(url);
        }
    });

    recordVideoBtn.addEventListener('click', () => {
        alert('Video recording would start here. In a real app, this would access your camera.');
    });

    // Video trimming
    trimStart.addEventListener('input', updateVideoTrim);
    trimEnd.addEventListener('input', updateVideoTrim);

    videoSpeed.addEventListener('change', updateVideoSpeed);
    audioSelect.addEventListener('change', updateVideoAudio);
}

function loadVideo(url) {
    currentVideo = document.createElement('video');
    currentVideo.src = url;
    currentImage = null;

    currentVideo.addEventListener('loadedmetadata', () => {
        alert(`Video loaded: ${Math.round(currentVideo.duration)} seconds`);
        // In a real app, you would show video preview and controls
    });

    currentVideo.addEventListener('error', () => {
        alert('Error loading video');
    });
}

function updateVideoTrim() {
    const start = document.getElementById('trimStart').value;
    const end = document.getElementById('trimEnd').value;

    if (currentVideo) {
        // In a real app, you would update video playback range
        console.log(`Trim video: ${start}% to ${end}%`);
    }
}

function updateVideoSpeed() {
    const speed = document.getElementById('videoSpeed').value;

    if (currentVideo) {
        currentVideo.playbackRate = parseFloat(speed);
    }
}

function updateVideoAudio() {
    const audio = document.getElementById('audioSelect').value;

    // In a real app, you would add audio track to video
    console.log(`Add audio: ${audio}`);
}

// ===== GIF CREATION =====
function setupGIF() {
    const createGifBtn = document.getElementById('createGifBtn');
    const gifDuration = document.getElementById('gifDuration');
    const gifFramerate = document.getElementById('gifFramerate');
    const gifLoop = document.getElementById('gifLoop');

    createGifBtn.addEventListener('click', createGIF);

    gifDuration.addEventListener('change', updateGIFSettings);
    gifFramerate.addEventListener('change', updateGIFSettings);
    gifLoop.addEventListener('change', updateGIFSettings);
}

function createGIF() {
    if (!currentImage && !currentVideo) {
        alert('Please upload an image or video first!');
        return;
    }

    const duration = document.getElementById('gifDuration').value;
    const framerate = document.getElementById('gifFramerate').value;
    const loop = document.getElementById('gifLoop').value;

    // Show processing message
    const gifPreview = document.getElementById('gifPreview');
    gifPreview.innerHTML = '<div class="loading-spinner"></div><p>Creating GIF...</p>';

    // Simulate GIF creation
    setTimeout(() => {
        gifPreview.innerHTML = `
            <div class="gif-success">
                <i class="fas fa-check-circle"></i>
                <p>GIF created successfully!</p>
                <p>Duration: ${duration}s | FPS: ${framerate}</p>
                <button class="download-gif">Download GIF</button>
            </div>
        `;

        // Add download functionality
        gifPreview.querySelector('.download-gif').addEventListener('click', () => {
            alert('GIF downloaded! (In a real app, this would download the actual GIF file)');
        });
    }, 2000);
}

function updateGIFSettings() {
    // Update GIF preview or settings
    console.log('GIF settings updated');
}

// ===== TEMPLATE FUNCTIONS =====
function setupTemplates() {
    loadTemplates();

    // Close template modal
    document.getElementById('closeTemplate').addEventListener('click', () => {
        templateModal.classList.remove('active');
        memeEditorModal.classList.add('active');
    });

    // Quick create options
    document.getElementById('quickUpload').addEventListener('click', () => {
        switchTabByIndex(2); // Create tab
        setTimeout(() => {
            openMemeEditor();
            document.getElementById('uploadImageBtn').click();
        }, 300);
    });

    document.getElementById('quickVideo').addEventListener('click', () => {
        switchTabByIndex(2);
        setTimeout(() => {
            openMemeEditor();
            // Switch to video tab
            document.querySelector('.editor-tab[data-tab="video"]').click();
        }, 300);
    });

    document.getElementById('quickTemplate').addEventListener('click', () => {
        switchTabByIndex(2);
        setTimeout(() => {
            openMemeEditor();
            document.getElementById('useTemplateBtn').click();
        }, 300);
    });

    document.getElementById('quickGif').addEventListener('click', () => {
        switchTabByIndex(2);
        setTimeout(() => {
            openMemeEditor();
            // Switch to GIF tab
            document.querySelector('.editor-tab[data-tab="gif"]').click();
        }, 300);
    });
}

function loadTemplates() {
    const templateGrid = document.getElementById('templateGrid');
    templateGrid.innerHTML = '';

    memeTemplates.forEach(template => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.dataset.id = template.id;

        templateItem.innerHTML = `
            <img src="${template.image}" alt="${template.name}" loading="lazy">
            <div class="template-label">${template.name}</div>
        `;

        templateItem.addEventListener('click', () => useTemplate(template));
        templateGrid.appendChild(templateItem);
    });
}

function useTemplate(template) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        drawImageOnCanvas(img);

        // Set template-specific text if available
        const textAreas = template.textAreas;
        if (textAreas && textAreas.length > 0) {
            const topTextInput = document.getElementById('topText');
            const bottomTextInput = document.getElementById('bottomText');

            if (textAreas.length >= 2) {
                topTextInput.value = textAreas[0].placeholder || '';
                bottomTextInput.value = textAreas[1].placeholder || '';
            } else if (textAreas.length === 1) {
                topTextInput.value = textAreas[0].placeholder || '';
                bottomTextInput.value = '';
            }

            redrawCanvas();
        }
    };
    img.src = template.image;
    // Close template modal and return to editor
    templateModal.classList.remove('active');
    memeEditorModal.classList.add('active');
}

// ===== RECENT MEMES FUNCTIONS =====
function loadRecentMemes() {
    const recentGrid = document.getElementById('recentMemes');
    const recentMemes = JSON.parse(localStorage.getItem('shome_recent_memes') || '[]');

    recentGrid.innerHTML = '';

    if (recentMemes.length === 0) {
        recentGrid.innerHTML = '<p class="no-recent">No recent creations yet. Make your first meme!</p>';
        return;
    }

    // Show last 6 memes
    recentMemes.slice(0, 6).forEach((memeData, index) => {
        const memeItem = document.createElement('div');
        memeItem.className = 'recent-meme';
        memeItem.innerHTML = `<img src="${memeData}" alt="Recent meme ${index + 1}">`;

        memeItem.addEventListener('click', () => {
            const img = new Image();
            img.onload = function() {
                drawImageOnCanvas(img);
                openMemeEditor();
            };
            img.src = memeData;
        });

        recentGrid.appendChild(memeItem);
    });
}

function addToRecentMemes(memeData) {
    let recentMemes = JSON.parse(localStorage.getItem('shome_recent_memes') || '[]');

    // Add new meme to beginning
    recentMemes.unshift(memeData);

    // Keep only last 10 memes
    if (recentMemes.length > 10) {
        recentMemes = recentMemes.slice(0, 10);
    }

    localStorage.setItem('shome_recent_memes', JSON.stringify(recentMemes));
    loadRecentMemes();
}

// ===== HEADER SCROLL BEHAVIOR =====
function setupHeaderScroll() {
    let lastScrollTop = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add scrolled class when not at top
        if (scrollTop > 10) {
            appHeader.classList.add('scrolled');
        } else {
            appHeader.classList.remove('scrolled');
        }

        // Hide header on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            appHeader.classList.add('hidden');
        } else {
            appHeader.classList.remove('hidden');
        }

        lastScrollTop = scrollTop;
    }, {
        passive: true
    });
}

// ===== PULL TO REFRESH =====
function setupPullToRefresh() {
    let touchStartY = 0;
    let isDragging = false;

    memeFeed.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            touchStartY = e.touches[0].clientY;
        }
    }, {
        passive: true
    });

    memeFeed.addEventListener('touchmove', function(e) {
        if (window.scrollY === 0 && e.touches[0].clientY > touchStartY) {
            const pullDistance = e.touches[0].clientY - touchStartY;
            if (pullDistance > 50 && !isRefreshing) {
                pullToRefresh.classList.add('active');
                isDragging = true;
            }
        }
    }, {
        passive: true
    });

    memeFeed.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            pullToRefresh.classList.remove('active');
            refreshFeed();
        }
    }, {
        passive: true
    });
}

function refreshFeed() {
    isRefreshing = true;
    pullToRefresh.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Refreshing...</span>';

    setTimeout(() => {
        // Clear and reload memes
        const memeCards = document.querySelectorAll('.meme-card:not(.skeleton)');
        memeCards.forEach(card => card.remove());
        feedPage = 0;
        addSkeletonCards();

        setTimeout(() => {
            loadMoreMemes();
            pullToRefresh.innerHTML = '<i class="fas fa-check"></i><span>Refreshed!</span>';

            setTimeout(() => {
                pullToRefresh.innerHTML = '<i class="fas fa-arrow-down"></i><span>Pull to refresh</span>';
                isRefreshing = false;
            }, 1000);
        }, 500);
    }, 1000);
}

// ===== SKELETON LOADING =====
function addSkeletonCards() {
    for (let i = 0; i < 3; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'meme-card skeleton skeleton-card';
        memeFeed.insertBefore(skeletonCard, sentinel);
    }
}

function removeSkeletonCards() {
    const skeletonCards = document.querySelectorAll('.skeleton');
    skeletonCards.forEach(card => card.remove());
}

// ===== MEME CARD FUNCTIONS =====
function handleUpvote(event) {
    const button = event.currentTarget;
    const memeCard = button.closest('.meme-card');
    const memeId = memeCard.dataset.memeId;
    const countElement = memeCard.querySelector('.upvote-count');
    const icon = button.querySelector('i');

    let currentCount = parseInt(countElement.textContent) || 0;

    if (button.classList.contains('active')) {
        button.classList.remove('active');
        currentCount -= 1;
        upvoteStates.set(memeId, false);
        icon.classList.remove('fas');
        icon.classList.add('far');
    } else {
        button.classList.add('active');
        currentCount += 1;
        upvoteStates.set(memeId, true);
        icon.classList.remove('far');
        icon.classList.add('fas');
        // Add animation class
        button.classList.add('liked');
        setTimeout(() => button.classList.remove('liked'), 600);
    }

    countElement.textContent = formatNumber(currentCount);
}

function handleShare(event) {
    const button = event.currentTarget;
    const memeCard = button.closest('.meme-card');
    const memeId = memeCard.dataset.memeId;

    // Add feedback animation
    button.classList.add('shared');
    setTimeout(() => button.classList.remove('shared'), 300);

    if (navigator.share) {
        navigator.share({
            title: 'Check out this meme!',
            text: 'Found this hilarious meme on Shome App',
            url: window.location.href,
        });
    } else {
        alert(`Sharing meme ${memeId}`);
    }
}

// ===== INFINITE SCROLL =====
async function fetchMoreMemes(pageNumber) {
    return new Promise(resolve => {
        setTimeout(() => {
            const newMemes = [];
            const startIdx = pageNumber * memesPerPage;

            for (let i = 0; i < memesPerPage; i++) {
                const memeIndex = (startIdx + i) % memeData.length;
                const meme = memeData[memeIndex];
                const memeId = pageNumber * memesPerPage + i + 1;
                const isActive = upvoteStates.get(memeId) ? 'active' : '';
                const avatarLetter = meme.username.charAt(0).toUpperCase();
                const iconType = isActive ? 'fas' : 'far';

                let mediaContent = '';
                if (meme.type === 'image') {
                    mediaContent = `<img src="${meme.content}" alt="Meme Image" class="meme-image" loading="lazy">`;
                } else if (meme.type === 'video') {
                    mediaContent = `
                        <video class="meme-video" controls>
                            <source src="${meme.content}" type="video/mp4">
                        </video>
                    `;
                } else if (meme.type === 'gif') {
                    mediaContent = `<img src="${meme.content}" alt="GIF Meme" class="meme-gif" loading="lazy">`;
                }

                newMemes.push(`
                    <div class="meme-card" data-meme-id="${memeId}">
                        <div class="card-header">
                            <div class="user-avatar">${avatarLetter}</div>
                            <div class="user-info">
                                <strong>${meme.username}</strong>
                                <small>${Math.floor(Math.random() * 59) + 1}m ago</small>
                            </div>
                        </div>
                        <div class="meme-media-container">
                            ${mediaContent}
                        </div>
                        <div class="card-details">
                            <p class="caption-text">
                                ${meme.caption}
                            </p>
                            
                            <div class="meme-stats">
                                <span><i class="fas fa-fire" style="color: var(--upvote-active-color);"></i> <span class="upvote-count">${formatNumber(meme.likes)}</span> upvotes</span>
                                <span><i class="fas fa-comment-alt"></i> ${formatNumber(meme.comments)} comments</span>
                                <span><i class="fas fa-share"></i> ${formatNumber(meme.shares)} shares</span>
                            </div>
                            
                            <div class="action-bar">
                                <button class="action-btn upvote-btn ${isActive}"><i class="${iconType} fa-fire"></i> Upvote</button>
                                <button class="action-btn comment-btn"><i class="fas fa-comment-alt"></i> Comment</button>
                                <button class="action-btn share-btn"><i class="fas fa-share-square"></i> Share</button>
                                <button class="action-btn remix-btn"><i class="fas fa-magic"></i> Remix</button>
                            </div>
                        </div>
                    </div>
                `);
            }
            resolve(newMemes);
        }, 800);
    });
}

async function loadMoreMemes() {
    if (isLoading) return;
    isLoading = true;

    removeSkeletonCards();

    const newMemesHTML = await fetchMoreMemes(feedPage);
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = newMemesHTML.join('');

    const memeCards = Array.from(tempContainer.children);

    memeCards.forEach((card, index) => {
        memeFeed.insertBefore(card, sentinel);

        // Attach event listeners
        const upvoteBtn = card.querySelector('.upvote-btn');
        const commentBtn = card.querySelector('.comment-btn');
        const shareBtn = card.querySelector('.share-btn');
        const remixBtn = card.querySelector('.remix-btn');

        if (upvoteBtn) upvoteBtn.addEventListener('click', handleUpvote);
        if (commentBtn) commentBtn.addEventListener('click', () => alert('Comments coming soon!'));
        if (shareBtn) shareBtn.addEventListener('click', handleShare);
        if (remixBtn) remixBtn.addEventListener('click', () => {
            alert('Opening remix editor...');
            openMemeEditor();
        });

        // Animate card entrance
        setTimeout(() => {
            card.classList.add('loaded');
        }, 50 + index * 100);
    });

    feedPage++;
    isLoading = false;

    // Add more skeleton cards for next load
    addSkeletonCards();
}

// ===== SHORTS FUNCTIONS =====
function setupShortsFeed() {
    const shortsContainer = document.getElementById('shortsContainer');
    shortsContainer.innerHTML = '';

    shortsData.forEach((short, index) => {
        const shortCard = document.createElement('div');
        shortCard.className = 'short-card';
        shortCard.setAttribute('data-index', index);

        shortCard.innerHTML = `
            <video class="short-player" loop muted playsinline preload="metadata">
                <source src="${short.video}" type="video/mp4">
            </video>
            <div class="short-loading">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="short-overlay">
                <div class="short-creator">
                    <div class="short-avatar">${short.avatar}</div>
                    <div class="short-creator-info">
                        <h3>${short.user}</h3>
                        <p>${short.title}</p>
                    </div>
                </div>
            </div>
            <div class="short-actions">
                <button class="short-action-btn like-btn" data-id="${short.id}">
                    <i class="far fa-heart"></i>
                    <span>${formatNumber(short.likes)}</span>
                </button>
                <button class="short-action-btn comment-btn" data-id="${short.id}">
                    <i class="far fa-comment"></i>
                    <span>${formatNumber(short.comments)}</span>
                </button>
                <button class="short-action-btn share-btn" data-id="${short.id}">
                    <i class="fas fa-share"></i>
                    <span>${formatNumber(short.shares)}</span>
                </button>
            </div>
        `;

        shortsContainer.appendChild(shortCard);

        // Video loading events
        const videoElement = shortCard.querySelector('.short-player');
        const loadingIndicator = shortCard.querySelector('.short-loading');

        videoElement.addEventListener('loadeddata', () => {
            loadingIndicator.style.display = 'none';
        });

        videoElement.addEventListener('waiting', () => {
            loadingIndicator.style.display = 'block';
        });

        videoElement.addEventListener('canplay', () => {
            loadingIndicator.style.display = 'none';
        });
    });

    // Like button handlers
    document.querySelectorAll('.short-action-btn.like-btn').forEach(btn => {
        btn.addEventListener('click', handleShortLike);
    });

    setupShortsSwipe();
}

function handleShortLike(event) {
    const button = event.currentTarget;
    const shortId = button.getAttribute('data-id');
    const likeIcon = button.querySelector('i');
    const likeCount = button.querySelector('span');
    let count = parseInt(likeCount.textContent.replace(/[^0-9.]/g, '')) || 0;

    if (button.classList.contains('liked')) {
        count--;
        button.classList.remove('liked');
        likeIcon.classList.remove('fas');
        likeIcon.classList.add('far');
        videoLikeStates.set(shortId, false);
    } else {
        count++;
        button.classList.add('liked');
        likeIcon.classList.remove('far');
        likeIcon.classList.add('fas');
        button.classList.add('liked');
        setTimeout(() => button.classList.remove('liked'), 600);
        videoLikeStates.set(shortId, true);
    }

    likeCount.textContent = formatNumber(count);
}

function setupShortsSwipe() {
    const shortsContainer = document.getElementById('shortsContainer');
    let startY = 0;
    let isSwiping = false;

    shortsContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            startY = e.touches[0].clientY;
            isSwiping = true;
        }
    }, {
        passive: true
    });

    shortsContainer.addEventListener('touchmove', function(e) {
        if (!isSwiping) return;
        e.preventDefault();
    }, {
        passive: false
    });

    shortsContainer.addEventListener('touchend', function(e) {
        if (!isSwiping) return;

        const endY = e.changedTouches[0].clientY;
        const diff = startY - endY;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentShortIndex < shortsData.length - 1) {
                currentShortIndex++;
            } else if (diff < 0 && currentShortIndex > 0) {
                currentShortIndex--;
            }

            scrollToShort(currentShortIndex);
        }

        isSwiping = false;
    }, {
        passive: true
    });

    // Wheel scrolling with debounce
    const handleDebouncedWheelScroll = debounce((e) => {
        if (e.deltaY > 0 && currentShortIndex < shortsData.length - 1) {
            currentShortIndex++;
            scrollToShort(currentShortIndex);
        } else if (e.deltaY < 0 && currentShortIndex > 0) {
            currentShortIndex--;
            scrollToShort(currentShortIndex);
        }
    }, 350);

    shortsContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        handleDebouncedWheelScroll(e);
    }, {
        passive: false
    });
}

function scrollToShort(index) {
    const shortsContainer = document.getElementById('shortsContainer');
    const shortHeight = window.innerHeight - 140;

    if (index >= 0 && index < shortsData.length) {
        shortsContainer.style.transform = `translateY(-${index * shortHeight}px)`;
        currentShortIndex = index;

        setTimeout(playCurrentShort, 300);
    }
}

function playCurrentShort() {
    const shortCards = document.querySelectorAll('.short-card');

    shortCards.forEach((card, index) => {
        const video = card.querySelector('.short-player');
        if (index === currentShortIndex) {
            video.muted = true;
            video.currentTime = 0;
            video.play().catch(e => {
                console.log("Autoplay prevented for short", index);
            });
        } else {
            video.pause();
        }
    });
}

// ===== PROFILE FUNCTIONS =====
function loadProfileContent(contentType) {
    const contentContainer = document.getElementById(`profile${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`);
    contentContainer.innerHTML = '';

    // Sample content
    const content = contentType === 'shorts' ?
        shortsData :
        contentType === 'gifs' ?
        Array(6).fill().map((_, i) => ({
            type: 'gif',
            content: `https://media.giphy.com/media/${i + 1}/giphy.gif`
        })) :
        Array(6).fill().map((_, i) => ({
            type: i < 3 ? 'image' : 'video',
            content: i < 3 ?
                `https://images.unsplash.com/photo-${150 + i}?auto=format&fit=crop&w=500&q=60` :
                shortsData[i % shortsData.length].video
        }));

    content.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'profile-item';

        if (contentType === 'shorts' || item.type === 'video') {
            itemElement.innerHTML = `
                <video muted playsinline>
                    <source src="${contentType === 'shorts' ? item.video : item.content}" type="video/mp4">
                </video>
                <div class="item-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
            `;
        } else if (item.type === 'gif') {
            itemElement.innerHTML = `
                <img src="${item.content}" alt="GIF ${index + 1}" loading="lazy">
                <div class="item-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
            `;
        } else {
            itemElement.innerHTML = `
                <img src="${item.content}" alt="Profile content ${index + 1}" loading="lazy">
                <div class="item-overlay">
                    <i class="fas fa-expand-alt"></i>
                </div>
            `;
        }

        itemElement.addEventListener('click', () => {
            alert(`Opening ${contentType} item ${index + 1}`);
        });

        contentContainer.appendChild(itemElement);
    });
}

function setupProfileTabs() {
    const profileTabBtns = document.querySelectorAll('.profile-tab-btn');

    profileTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const contentType = this.getAttribute('data-profile-content');

            // Update active tab
            profileTabBtns.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');

            // Hide all content
            document.querySelectorAll('.profile-content').forEach(content => {
                content.classList.remove('active');
            });

            // Show selected content
            const contentContainer = document.getElementById(`profile${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`);
            contentContainer.classList.add('active');

            // Load content if not already loaded
            if (contentContainer.children.length === 0) {
                loadProfileContent(contentType);
            }
        });
    });

    // Edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', () => {
        alert('Edit profile feature would open here');
    });
}

// ===== TAB MANAGEMENT =====
function openMemeEditor() {
    memeEditorModal.classList.add('active');
    resizeCanvas();
    redrawCanvas();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Logo click
    document.getElementById('logo').addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        appHeader.classList.remove('hidden');
        switchTabByIndex(0); // Switch to feed tab
    });

    // Create button in bottom nav
    createNavBtn.addEventListener('click', function() {
        switchTabByIndex(2); // Create tab
        // Add animation feedback
        this.style.transform = 'translateX(-50%) scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'translateX(-50%)';
        }, 150);
    });

    // Infinite scroll observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadMoreMemes();
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px 100px 0px',
        threshold: 0.1
    });

    observer.observe(sentinel);

    // Window resize for canvas
    window.addEventListener('resize', resizeCanvas);

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (memeEditorModal.classList.contains('active')) {
                memeEditorModal.classList.remove('active');
            }
            if (templateModal.classList.contains('active')) {
                templateModal.classList.remove('active');
                memeEditorModal.classList.add('active');
            }
            if (searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
            }
            if (notificationPanel.classList.contains('active')) {
                notificationPanel.classList.remove('active');
            }
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}