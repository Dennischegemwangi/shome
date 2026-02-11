// ===== GLOBAL VARIABLES =====



let feedPage = 0;
const memesPerPage = 3;
const sentinel = document.getElementById('loading-sentinel');
const memeFeed = document.getElementById('memeFeed');
const appHeader = document.getElementById('appHeader');
const pullToRefresh = document.getElementById('pullToRefresh');
let isLoading = false;
let isRefreshing = false;

// Meme Editor Variables
const memeEditorModal = document.getElementById('memeEditorModal');
const memeCanvas = document.getElementById('memeCanvas');
const ctx = memeCanvas.getContext('2d');
let currentImage = null;
let fontSize = 48;
let textColor = 'white';
let fontFamily = 'Impact';
let currentFilter = 'none';

// Template Variables
const templateModal = document.getElementById('templateModal');
const templateGrid = document.getElementById('templateGrid');

// State management
const upvoteStates = new Map();
const videoLikeStates = new Map();
let currentShortIndex = 0;
let startY = 0;

// Tab management
const tabBtns = document.querySelectorAll('.tab-btn');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const createNavBtn = document.getElementById('createNavBtn');

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
        type: 'image',
        content: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        username: 'FunnyGuy99',
        caption: 'Monday mornings be like... #mondayvibes #relatable',
        likes: 389,
        comments: 67,
        shares: 15
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
    },
    {
        id: 5,
        name: "Expanding Brain",
        image: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Expanding_Brain_meme.jpg/220px-Expanding_Brain_meme.jpg",
        textAreas: [{
                top: 20,
                left: 'center',
                placeholder: "Small brain"
            },
            {
                top: 40,
                left: 'center',
                placeholder: "Medium brain"
            },
            {
                top: 60,
                left: 'center',
                placeholder: "Big brain"
            },
            {
                top: 80,
                left: 'center',
                placeholder: "Galaxy brain"
            }
        ]
    },
    {
        id: 6,
        name: "Woman Yelling at Cat",
        image: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Woman_yelling_at_a_cat.jpg/220px-Woman_yelling_at_a_cat.jpg",
        textAreas: [{
                top: 50,
                left: 50,
                placeholder: "Angry woman..."
            },
            {
                top: 50,
                right: 50,
                placeholder: "Confused cat..."
            }
        ]
    }
];

// ===== INITIALIZATION =====


document.addEventListener('DOMContentLoaded', function() {
    // Add skeleton loading cards
    addSkeletonCards();

    // Load initial content after a short delay
    setTimeout(() => {
        loadMoreMemes();
        setupShortsFeed();
        loadProfileContent('memes');
        loadRecentMemes();
    }, 600);

    setupEventListeners();
    setupProfileTabs();
    setupMemeEditor();
    setupTemplates();

    // Start header hide/show logic
    setupHeaderScroll();

    // Setup pull to refresh
    setupPullToRefresh();
});

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
            // Scrolling down
            appHeader.classList.add('hidden');
        } else {
            // Scrolling up
            appHeader.classList.remove('hidden');
        }

        lastScrollTop = scrollTop;
    }, {
        passive: true
    });
}

// ===== MEME EDITOR FUNCTIONS =====
function setupMemeEditor() {
    // Initialize canvas
    resizeCanvas();
    drawInitialCanvas();

    // Setup event listeners for editor
    setupEditorListeners();
}

function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    const containerWidth = container.clientWidth - 40; // 20px padding on each side
    const containerHeight = 400;

    memeCanvas.width = containerWidth;
    memeCanvas.height = containerHeight;
}

function drawInitialCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, memeCanvas.width, memeCanvas.height);

    // Draw placeholder text
    ctx.fillStyle = '#cccccc';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Upload an image or choose a template', memeCanvas.width / 2, memeCanvas.height / 2);
}

function drawImageOnCanvas(image) {
    currentImage = image;
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
            // Image is wider than canvas
            drawWidth = memeCanvas.width;
            drawHeight = memeCanvas.width / imageRatio;
            offsetX = 0;
            offsetY = (memeCanvas.height - drawHeight) / 2;
        } else {
            // Image is taller than canvas
            drawHeight = memeCanvas.height;
            drawWidth = memeCanvas.height * imageRatio;
            offsetX = (memeCanvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        // Apply filter
        ctx.filter = getFilterValue(currentFilter);

        // Draw image
        ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);

        // Reset filter for text
        ctx.filter = 'none';

        // Draw text
        drawTextOnCanvas();
    } else {
        drawInitialCanvas();
    }
}

function drawTextOnCanvas() {
    const topText = document.getElementById('topText').value;
    const bottomText = document.getElementById('bottomText').value;

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
}

function getFilterValue(filter) {
    switch (filter) {
        case 'grayscale':
            return 'grayscale(100%)';
        case 'sepia':
            return 'sepia(100%)';
        case 'invert':
            return 'invert(100%)';
        case 'brightness':
            return 'brightness(150%)';
        case 'contrast':
            return 'contrast(200%)';
        default:
            return 'none';
    }
}

function setupEditorListeners() {
    // Text input listeners
    const topTextInput = document.getElementById('topText');
    const bottomTextInput = document.getElementById('bottomText');
    const fontSelect = document.getElementById('fontSelect');
    const colorOptions = document.querySelectorAll('.color-option');
    const sizeBtns = document.querySelectorAll('.size-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    topTextInput.addEventListener('input', redrawCanvas);
    bottomTextInput.addEventListener('input', redrawCanvas);

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
    document.getElementById('resetMeme').addEventListener('click', () => {
        currentImage = null;
        document.getElementById('topText').value = '';
        document.getElementById('bottomText').value = '';
        fontSize = 48;
        textColor = 'white';
        fontFamily = 'Impact';
        currentFilter = 'none';

        // Reset UI
        document.querySelector('.size-value').textContent = '48px';
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.color === 'white');
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'none');
        });

        drawInitialCanvas();
    });

    // Save meme
    document.getElementById('saveMeme').addEventListener('click', saveMeme);

    // Share meme
    document.getElementById('shareMeme').addEventListener('click', shareMeme);
}

function saveMeme() {
    if (!currentImage) {
        alert('Please upload an image or choose a template first!');
        return;
    }

    // Create a temporary canvas for download
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Use original image dimensions for better quality
    tempCanvas.width = currentImage.width;
    tempCanvas.height = currentImage.height;

    // Scale text proportionally
    const scaleFactor = tempCanvas.width / memeCanvas.width;
    const scaledFontSize = fontSize * scaleFactor;

    // Draw image with filter
    tempCtx.filter = getFilterValue(currentFilter);
    tempCtx.drawImage(currentImage, 0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.filter = 'none';

    // Draw text
    const topText = document.getElementById('topText').value;
    const bottomText = document.getElementById('bottomText').value;

    tempCtx.fillStyle = textColor;
    tempCtx.strokeStyle = 'black';
    tempCtx.lineWidth = 4 * scaleFactor;
    tempCtx.font = `${scaledFontSize}px ${fontFamily}`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'top';

    if (topText) {
        const topY = 20 * scaleFactor;
        tempCtx.strokeText(topText, tempCanvas.width / 2, topY);
        tempCtx.fillText(topText, tempCanvas.width / 2, topY);
    }

    if (bottomText) {
        tempCtx.textBaseline = 'bottom';
        const bottomY = tempCanvas.height - (20 * scaleFactor);
        tempCtx.strokeText(bottomText, tempCanvas.width / 2, bottomY);
        tempCtx.fillText(bottomText, tempCanvas.width / 2, bottomY);
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

function shareMeme() {
    if (!currentImage) {
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
            }).catch(console.error);
        } else {
            // Fallback: download
            saveMeme();
        }
    }, 'image/png');
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
        switchTab('create');
        setTimeout(() => {
            openMemeEditor();
            document.getElementById('uploadImageBtn').click();
        }, 300);
    });

    document.getElementById('quickTemplate').addEventListener('click', () => {
        switchTab('create');
        setTimeout(() => {
            openMemeEditor();
            document.getElementById('useTemplateBtn').click();
        }, 300);
    });

    document.getElementById('quickBlank').addEventListener('click', () => {
        switchTab('create');
        setTimeout(openMemeEditor, 300);
    });
}

function loadTemplates() {
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
        recentGrid.innerHTML = '<p class="no-recent">No recent memes yet. Create your first one!</p>';
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

                const mediaContent = meme.type === 'image' ?
                    `<img src="${meme.content}" alt="Meme Image" class="meme-image" loading="lazy">` :
                    `
                        <video class="meme-video" controls>
                            <source src="${meme.content}" type="video/mp4">
                        </video>
                      `;

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

        if (upvoteBtn) upvoteBtn.addEventListener('click', handleUpvote);
        if (commentBtn) commentBtn.addEventListener('click', () => alert('Comments coming soon!'));
        if (shareBtn) shareBtn.addEventListener('click', handleShare);

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
    const shortHeight = window.innerHeight - 70;

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
}

// ===== TAB MANAGEMENT =====
function switchTab(tabId) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update bottom nav items
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update tab content
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');

            // Handle tab-specific actions
            if (tabId === 'shorts') {
                if (currentShortIndex !== 0) {
                    currentShortIndex = 0;
                    scrollToShort(currentShortIndex);
                } else {
                    setTimeout(playCurrentShort, 100);
                }
            }
        } else {
            content.classList.remove('active');
        }
    });
}

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
    });

    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Bottom navigation
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Create button in bottom nav
    createNavBtn.addEventListener('click', function() {
        switchTab('create');
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