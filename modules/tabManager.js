// modules/tabManager.js
let currentTab = 'feed';
let tabHistory = ['feed'];
let isTransitioning = false;

// Initialize tab manager
export function initTabManager(tabContents, navItems) {
    console.log('✅ Tab manager initialized');

    // Set initial active tab
    switchTab('feed');

    // Set up navigation
    setupTabNavigation(navItems);

    // Set up create button
    setupCreateButton();

    // Set up profile tab switching
    setupProfileTabs();
    setupSwipeNavigation();
}

let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50;

function setupSwipeNavigation() {
    const appContainer = document.querySelector('.app-container');
    if (!appContainer) return;

    appContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    appContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    // Also support mouse for desktop testing
    appContainer.addEventListener('mousedown', (e) => {
        touchStartX = e.screenX;
        document.addEventListener('mouseup', handleMouseUp);
    });

    function handleMouseUp(e) {
        touchEndX = e.screenX;
        handleSwipe();
        document.removeEventListener('mouseup', handleMouseUp);
    }
}

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) < SWIPE_THRESHOLD) return;
    
    const tabOrder = ['feed', 'shorts', 'create', 'profile'];
    const currentIndex = tabOrder.indexOf(currentTab);
    
    if (swipeDistance > 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        const prevTab = tabOrder[currentIndex - 1];
        switchTab(prevTab);
    } else if (swipeDistance < 0 && currentIndex < tabOrder.length - 1) {
        // Swipe left - go to next tab
        const nextTab = tabOrder[currentIndex + 1];
        switchTab(nextTab);
    }
}

// Set up tab navigation
function setupTabNavigation(navItems) {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const tab = item.getAttribute('data-tab');

            // Don't switch if already on this tab
            if (tab === currentTab) return;

            // Don't allow switching during transition
            if (isTransitioning) return;

            switchTab(tab);
        });
    });
}

// Set up create button
function setupCreateButton() {
    const createNavBtn = document.getElementById('createNavBtn');
    const createTabBtn = document.querySelector('.nav-item[data-tab="create"]');

    createNavBtn.addEventListener('click', () => {
        // Switch to create tab
        switchTab('create');

        // Scroll to top of create tab
        const createTab = document.getElementById('create');
        if (createTab) {
            createTab.scrollTop = 0;
        }
    });

    // Make create tab button also work
    if (createTabBtn) {
        createTabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('create');
        });
    }
}

// Set up profile tabs
function setupProfileTabs() {
    const profileTabBtns = document.querySelectorAll('.profile-tab-btn');

    profileTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const contentId = btn.getAttribute('data-profile-content');
            switchProfileContent(contentId);
        });
    });
}

// Switch main tab
export function switchTab(tabId) {
    if (isTransitioning || tabId === currentTab) return;

    isTransitioning = true;

    // Get elements
    const oldTab = document.getElementById(currentTab);
    const newTab = document.getElementById(tabId);
    const oldNav = document.querySelector(`.nav-item[data-tab="${currentTab}"]`);
    const newNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);

    if (!newTab || !newNav) {
        isTransitioning = false;
        return;
    }

    // Add to history (max 10 entries)
    tabHistory.push(tabId);
    if (tabHistory.length > 10) {
        tabHistory.shift();
    }

    // Animation: Slide out old tab
    if (oldTab) {
        oldTab.classList.add('exiting');
        oldTab.classList.remove('active');

        setTimeout(() => {
            oldTab.classList.remove('exiting');
        }, 300);
    }

    // Update navigation
    if (oldNav) oldNav.classList.remove('active');
    newNav.classList.add('active');

    // Show new tab with animation
    newTab.classList.add('entering');
    newTab.classList.add('active');

    setTimeout(() => {
        newTab.classList.remove('entering');
        isTransitioning = false;
    }, 300);

    // Update current tab
    currentTab = tabId;

    // Load tab-specific content
    loadTabContent(tabId);

    // Update URL hash
    updateUrlHash(tabId);

    // Log tab change
    console.log(`📱 Switched to ${tabId} tab`);
    
    // NEW: Scroll to top if clicking feed icon (even if already on feed)
    if (tabId === 'feed') {
        const feedContainer = document.getElementById('memeFeed');
        if (feedContainer) {
            // Smooth scroll to top
            feedContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
}

// Switch profile content
function switchProfileContent(contentId) {
    // Hide all profile content
    document.querySelectorAll('.profile-content').forEach(content => {
        content.classList.remove('active');
    });

    // Deactivate all profile tab buttons
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected content
    const selectedContent = document.getElementById(`profile${capitalizeFirst(contentId)}`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }

    // Activate selected button
    const selectedBtn = document.querySelector(`.profile-tab-btn[data-profile-content="${contentId}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }

    // Load content if needed
    loadProfileContent(contentId);
}

// Load tab-specific content
function loadTabContent(tabId) {
    switch (tabId) {
        
            // Add to loadTabContent function
        case 'feed':
            setupInfiniteScroll();
            break;
            

        case 'shorts':
            loadShorts();
            break;

        case 'create':
            loadCreateContent();
            break;

        case 'profile':
            loadProfile();
            break;
    }
}

// Add new function for infinite scroll
function setupInfiniteScroll() {
    const feedContainer = document.getElementById('memeFeed');
    if (!feedContainer) return;

    let isLoading = false;
    let page = 1;
    const pageSize = 10;

    const loadMoreContent = async () => {
        if (isLoading) return;
        
        isLoading = true;
        
        // Show loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-more';
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading more...</p>
        `;
        feedContainer.appendChild(loadingElement);

        try {
            // Load more content (this should come from feedManager)
            await loadMoreFeedContent(page, pageSize);
            page++;
        } catch (error) {
            console.error('Error loading more content:', error);
        } finally {
            // Remove loading indicator
            loadingElement.remove();
            isLoading = false;
        }
    };

    // Intersection Observer for infinite scroll
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading) {
            loadMoreContent();
        }
    }, {
        rootMargin: '100px', // Load when 100px from bottom
        threshold: 0.1
    });

    // Create sentinel element
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '1px';
    feedContainer.appendChild(sentinel);
    
    observer.observe(sentinel);

    // Also listen to scroll events as fallback
    feedContainer.addEventListener('scroll', () => {
        const scrollPosition = feedContainer.scrollTop + feedContainer.clientHeight;
        const scrollHeight = feedContainer.scrollHeight;
        
        if (scrollHeight - scrollPosition < 200 && !isLoading) {
            loadMoreContent();
        }
    });
}

// Helper function - you'll need to implement this or connect to feedManager
async function loadMoreFeedContent(page, pageSize) {
    // This should call feedManager's loadMoreMemes function
    if (window.App?.modules?.feedManager?.loadMoreMemes) {
        return await window.App.modules.feedManager.loadMoreMemes();
    }
    
    // Fallback: simulate loading
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// Load shorts content
function loadShorts() {
    const shortsContainer = document.getElementById('shortsContainer');
    if (!shortsContainer) return;

    // Show loading
    shortsContainer.innerHTML = `
        <div class="short-loading">
            <div class="loading-spinner"></div>
            <p>Loading shorts...</p>
        </div>
    `;

    // Simulate loading delay
    setTimeout(() => {
        renderShorts();
    }, 1000);
}

// Render shorts
function renderShorts() {
    const shortsContainer = document.getElementById('shortsContainer');
    if (!shortsContainer) return;

    // Mock shorts data
    const shorts = [{
            id: 1,
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-funny-cat-1582-large.mp4',
            creator: 'CatLover',
            caption: 'When the zoomies hit at 3 AM 😹',
            likes: 1250,
            comments: 89,
            shares: 45
        },
        {
            id: 2,
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-with-tennis-ball-1495-large.mp4',
            creator: 'DoggoMeme',
            caption: 'Me waiting for the weekend',
            likes: 892,
            comments: 56,
            shares: 23
        }
    ];

    shortsContainer.innerHTML = shorts.map(short => `
        <div class="short-card" data-id="${short.id}">
            <video class="short-player" autoplay muted loop playsinline>
                <source src="${short.videoUrl}" type="video/mp4">
            </video>
            <div class="short-overlay">
                <div class="short-creator">
                    <div class="short-avatar">${short.creator.charAt(0)}</div>
                    <div class="short-creator-info">
                        <h3>${short.creator}</h3>
                        <p>${short.caption}</p>
                    </div>
                </div>
            </div>
            <div class="short-actions">
                <button class="short-action-btn like-short">
                    <i class="far fa-heart"></i>
                    <span>${short.likes}</span>
                </button>
                <button class="short-action-btn comment-short">
                    <i class="far fa-comment"></i>
                    <span>${short.comments}</span>
                </button>
                <button class="short-action-btn share-short">
                    <i class="fas fa-share"></i>
                    <span>${short.shares}</span>
                </button>
            </div>
        </div>
    `).join('');

    // Set up shorts navigation
    setupShortsNavigation();

    // Set up shorts interactions
    setupShortsInteractions();
}

// Set up shorts navigation
function setupShortsNavigation() {
    const prevBtn = document.getElementById('prevShort');
    const nextBtn = document.getElementById('nextShort');
    const shortsContainer = document.getElementById('shortsContainer');

    if (!prevBtn || !nextBtn || !shortsContainer) return;

    let currentShortIndex = 0;
    const shortCards = shortsContainer.querySelectorAll('.short-card');
    const totalShorts = shortCards.length;

    prevBtn.addEventListener('click', () => {
        if (currentShortIndex > 0) {
            currentShortIndex--;
            scrollToShort(currentShortIndex);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentShortIndex < totalShorts - 1) {
            currentShortIndex++;
            scrollToShort(currentShortIndex);
        }
    });
    // Set up swipe gestures
    let startY = 0;
    let isSwiping = false;

    shortsContainer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isSwiping = true;
    });

    shortsContainer.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;

        const currentY = e.touches[0].clientY;
        const diff = startY - currentY;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentShortIndex < totalShorts - 1) {
                // Swipe up - next short
                currentShortIndex++;
                scrollToShort(currentShortIndex);
                isSwiping = false;
            } else if (diff < 0 && currentShortIndex > 0) {
                // Swipe down - previous short
                currentShortIndex--;
                scrollToShort(currentShortIndex);
                isSwiping = false;
            }
        }
    });

    shortsContainer.addEventListener('touchend', () => {
        isSwiping = false;
    });
}

// Scroll to specific short
function scrollToShort(index) {
    const shortsContainer = document.getElementById('shortsContainer');
    const shortCards = shortsContainer.querySelectorAll('.short-card');

    if (shortCards[index]) {
        // Pause all videos
        shortCards.forEach(card => {
            const video = card.querySelector('video');
            if (video) {
                video.pause();
            }
        });

        // Scroll to short
        shortsContainer.style.transform = `translateY(-${index * 100}vh)`;

        // Play current video
        const currentVideo = shortCards[index].querySelector('video');
        if (currentVideo) {
            currentVideo.play().catch(e => console.log('Auto-play prevented:', e));
        }
    }
}

// Set up shorts interactions
function setupShortsInteractions() {
    const shortsContainer = document.getElementById('shortsContainer');

    shortsContainer.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('.like-short');
        const commentBtn = e.target.closest('.comment-short');
        const shareBtn = e.target.closest('.share-short');

        if (likeBtn) {
            const shortCard = likeBtn.closest('.short-card');
            const likeIcon = likeBtn.querySelector('i');
            const likeCount = likeBtn.querySelector('span');

            const isLiked = likeIcon.classList.contains('fas');

            if (isLiked) {
                likeIcon.className = 'far fa-heart';
                const currentCount = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = currentCount - 1;
            } else {
                likeIcon.className = 'fas fa-heart';
                likeBtn.classList.add('liked');
                const currentCount = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = currentCount + 1;

                setTimeout(() => {
                    likeBtn.classList.remove('liked');
                }, 600);
            }
        }

        if (commentBtn) {
            // Show comment modal for short
            const shortCard = commentBtn.closest('.short-card');
            const shortId = shortCard?.dataset.id;
            if (shortId) {
                // Similar to meme comment modal
                console.log('Comment on short:', shortId);
            }
        }

        if (shareBtn) {
            // Share short
            const shortCard = commentBtn.closest('.short-card');
            const shortId = shortCard?.dataset.id;
            if (shortId) {
                console.log('Share short:', shortId);
            }
        }
    });
}

// Load create tab content
function loadCreateContent() {
    // Recent memes are loaded by scripts.js
    // Cloud preview is loaded by scripts.js

    // Set up quick create options (already done in scripts.js)
    // Additional create tab setup can go here
}

// Load profile
function loadProfile() {
    // Profile stats are loaded by scripts.js
    // Load user memes
    loadUserMemes();
}

// Load user memes
function loadUserMemes() {
    const profileMemes = document.getElementById('profileMemes');
    if (!profileMemes) return;

    // Show loading
    profileMemes.innerHTML = `
        <div class="profile-loading">
            <div class="loading-spinner"></div>
        </div>
    `;

    // Load user's memes
    setTimeout(() => {
        renderUserMemes();
    }, 500);
}

// Render user memes
function renderUserMemes() {
    const profileMemes = document.getElementById('profileMemes');
    if (!profileMemes) return;

    // Mock user memes
    const userMemes = Array.from({
        length: 12
    }, (_, i) => ({
        id: i + 1,
        src: `https://picsum.photos/seed/profile${i}/300/300`,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100)
    }));

    profileMemes.innerHTML = userMemes.map(meme => `
        <div class="profile-item" data-id="${meme.id}">
            <img src="${meme.src}" alt="User meme ${meme.id}" loading="lazy">
            <div class="item-overlay">
                <div class="item-stats">
                    <span><i class="fas fa-heart"></i> ${meme.likes}</span>
                    <span><i class="fas fa-comment"></i> ${meme.comments}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load profile content
function loadProfileContent(contentType) {
    const contentElement = document.getElementById(`profile${capitalizeFirst(contentType)}`);
    if (!contentElement) return;

    // Show loading
    contentElement.innerHTML = `
        <div class="profile-loading">
            <div class="loading-spinner"></div>
            <p>Loading ${contentType}...</p>
        </div>
    `;

    // Load content based on type
    setTimeout(() => {
        switch (contentType) {
            case 'memes':
                renderUserMemes();
                break;
            case 'videos':
                renderUserVideos();
                break;
            case 'gifs':
                renderUserGifs();
                break;
            case 'liked':
                renderLikedContent();
                break;
            case 'cloud':
                renderCloudContent();
                break;
        }
    }, 500);
}

// Render user videos
function renderUserVideos() {
    const contentElement = document.getElementById('profileVideos');
    if (!contentElement) return;

    // Mock videos
    const videos = Array.from({
        length: 9
    }, (_, i) => ({
        id: i + 1,
        src: 'https://assets.mixkit.co/videos/preview/mixkit-funny-cat-1582-large.mp4',
        thumbnail: `https://picsum.photos/seed/video${i}/300/300`,
        views: Math.floor(Math.random() * 5000)
    }));

    contentElement.innerHTML = videos.map(video => `
        <div class="profile-item" data-id="${video.id}">
            <video poster="${video.thumbnail}" class="profile-video">
                <source src="${video.src}" type="video/mp4">
            </video>
            <div class="item-overlay">
                <i class="fas fa-play"></i>
                <span>${video.views} views</span>
            </div>
        </div>
    `).join('');
}

// Render user GIFs
function renderUserGifs() {
    const contentElement = document.getElementById('profileGifs');
    if (!contentElement) return;

    // Mock GIFs
    const gifs = Array.from({
        length: 9
    }, (_, i) => ({
        id: i + 1,
        src: `https://media.giphy.com/media/${['3o7abAHdYvZdBNnGZq','l0MYt5jPR6QX5pnqM','26tknCqiJrBQG6DrC','xT9IgzoKnwFNmISR8I','13CoXDiaCcCoyk'][i % 5]}/giphy.gif`,
        views: Math.floor(Math.random() * 3000)
    }));

    contentElement.innerHTML = gifs.map(gif => `
        <div class="profile-item" data-id="${gif.id}">
            <img src="${gif.src}" alt="GIF ${gif.id}" loading="lazy">
            <div class="item-overlay">
                <i class="fas fa-film"></i>
                <span>${gif.views} views</span>
            </div>
        </div>
    `).join('');
}

// Render liked content
function renderLikedContent() {
    const contentElement = document.getElementById('profileLiked');
    if (!contentElement) return;

    // Get liked memes from localStorage
    const likedMemes = JSON.parse(localStorage.getItem('shome_liked_memes') || '{}');
    const likedIds = Object.keys(likedMemes).filter(id => likedMemes[id]);

    if (likedIds.length === 0) {
        contentElement.innerHTML = `
            <div class="empty-liked">
                <i class="far fa-heart"></i>
                <h3>No liked content yet</h3>
                <p>Memes you like will appear here</p>
            </div>
        `;
        return;
    }

    // Mock liked content
    const likedContent = likedIds.slice(0, 9).map((id, i) => ({
        id: id,
        src: `https://picsum.photos/seed/liked${i}/300/300`
    }));

    contentElement.innerHTML = likedContent.map(item => `
        <div class="profile-item" data-id="${item.id}">
            <img src="${item.src}" alt="Liked content" loading="lazy">
            <div class="item-overlay">
                <i class="fas fa-heart"></i>
            </div>
        </div>
    `).join('');
}

// Render cloud content
function renderCloudContent() {
    const contentElement = document.getElementById('profileCloud');
    if (!contentElement) return;

    // Get cloud memes from localStorage
    const cloudMemes = JSON.parse(localStorage.getItem('shome_cloud_memes') || '[]');

    if (cloudMemes.length === 0) {
        contentElement.innerHTML = `
            <div class="empty-cloud">
                <i class="fas fa-cloud"></i>
                <h3>No cloud content</h3>
                <p>Memes saved to cloud will appear here</p>
            </div>
        `;
        return;
    }

    contentElement.innerHTML = cloudMemes.slice(0, 9).map(meme => `
        <div class="profile-item" data-id="${meme.id}">
            <img src="${meme.dataUrl}" alt="Cloud meme" loading="lazy">
            <div class="item-overlay">
                <i class="fas fa-cloud"></i>
            </div>
        </div>
    `).join('');
}

// Update URL hash
function updateUrlHash(tabId) {
    if (history.pushState) {
        history.pushState(null, null, `#${tabId}`);
    } else {
        window.location.hash = `#${tabId}`;
    }
}

// Get current tab
export function getCurrentTab() {
    return currentTab;
}

// Go back to previous tab
export function goBack() {
    if (tabHistory.length > 1) {
        tabHistory.pop(); // Remove current
        const previousTab = tabHistory.pop(); // Get previous
        if (previousTab) {
            switchTab(previousTab);
        }
    }
}

// Utility function
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add styles for profile loading
const profileStyles = `
    .profile-loading {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-light);
    }
    
    .empty-liked,
    .empty-cloud {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-light);
    }
    
    .empty-liked i,
    .empty-cloud i {
        font-size: 48px;
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
    }
    
    .profile-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .item-stats {
        display: flex;
        gap: var(--spacing-md);
        color: white;
        font-size: 14px;
    }
`;

// Add styles to document
const tabStyleSheet = document.createElement('style');
tabStyleSheet.textContent = profileStyles;
document.head.appendChild(tabStyleSheet);