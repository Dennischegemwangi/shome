// ===== GLOBAL VARIABLES =====
let feedPage = 0;
const memesPerPage = 3;
const memeFeed = document.getElementById('memeFeed');
const appHeader = document.getElementById('appHeader');
let isLoading = false;

// Meme Editor Variables
const memeEditorModal = document.getElementById('memeEditorModal');
const memeCanvas = document.getElementById('memeCanvas');
const ctx = memeCanvas.getContext('2d');
let currentImage = null;
let fontSize = 48;
let textColor = 'white';
let fontFamily = 'Impact';
let currentFilter = 'none';

// Editor Tabs
const editorTabs = document.querySelectorAll('.editor-tab');
const controlsSections = document.querySelectorAll('.controls-section');
const canvasContainer = document.querySelector('.canvas-container');
const videoEditorContainer = document.getElementById('videoEditorContainer');
const gifCreatorContainer = document.getElementById('gifCreatorContainer');

// Video Editor Elements
const videoPlayer = document.getElementById('videoPlayer');
const trimStart = document.getElementById('trimStart');
const trimEnd = document.getElementById('trimEnd');
const trimStartValue = document.getElementById('trimStartValue');
const trimEndValue = document.getElementById('trimEndValue');

// GIF Creator Elements
const gifFrames = document.getElementById('gifFrames');
const gifFPS = document.getElementById('gifFPS');
const gifFPSValue = document.getElementById('gifFPSValue');
const gifDurationSlider = document.getElementById('gifDurationSlider');
const gifDurationValue = document.getElementById('gifDurationValue');

// Template Variables
const templateModal = document.getElementById('templateModal');
const templateGrid = document.getElementById('templateGrid');

// Cloud Modal
const cloudModal = document.getElementById('cloudModal');
const cloudGrid = document.getElementById('cloudGrid');

// State Management
const upvoteStates = new Map();
const videoLikeStates = new Map();
let currentShortIndex = 0;

// Sticker Library
const stickers = {
    emoji: ['😂', '😭', '🤣', '😍', '🥰', '😎', '🤔', '👀', '🔥', '💀', '✨', '🎉'],
    memes: ['🤡', '👑', '💎', '🎯', '🚀', '💯', '⭐', '🎭', '📈', '🎪'],
    symbols: ['❤️', '✨', '🌟', '💫', '☀️', '🌈', '⚡', '💥', '☄️', '🌊'],
    custom: []
};

// Tab Management
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

const memeTemplates = [{
        id: 1,
        name: "Distracted Boyfriend",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 2,
        name: "Drake Hotline Bling",
        image: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 3,
        name: "Two Buttons",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 4,
        name: "Change My Mind",
        image: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 5,
        name: "Expanding Brain",
        image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 6,
        name: "Woman Yelling at Cat",
        image: "https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    addSkeletonCards();

    setTimeout(() => {
        loadMoreMemes();
        setupShortsFeed();
        loadRecentMemes();
        loadCloudSaves();
        setupTemplates();
        setupStickers();
    }, 600);

    setupEventListeners();
    setupMemeEditor();
    setupVideoEditor();
    setupGIFCreator();
    setupHeaderScroll();
    setupPullToRefresh();
});

// ===== MEME EDITOR FUNCTIONS =====
function setupMemeEditor() {
    resizeCanvas();
    drawInitialCanvas();
    setupEditorListeners();
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

function drawImageOnCanvas(image) {
    currentImage = image;
    redrawCanvas();
}

function redrawCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, memeCanvas.width, memeCanvas.height);

    if (currentImage) {
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

        ctx.filter = getFilterValue(currentFilter);
        ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);
        ctx.filter = 'none';

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
    ctx.lineWidth = 2;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    if (topText) {
        ctx.strokeText(topText, memeCanvas.width / 2, 20);
        ctx.fillText(topText, memeCanvas.width / 2, 20);
    }

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
    // Text inputs
    document.getElementById('topText').addEventListener('input', redrawCanvas);
    document.getElementById('bottomText').addEventListener('input', redrawCanvas);

    // Font selection
    document.getElementById('fontSelect').addEventListener('change', function() {
        fontFamily = this.value;
        redrawCanvas();
    });

    // Color options
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            textColor = this.dataset.color;
            redrawCanvas();
        });
    });

    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
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

    // Style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            redrawCanvas();
        });
    });

    // Stroke width
    document.getElementById('strokeWidth').addEventListener('input', function() {
        document.getElementById('strokeValue').textContent = `${this.value}px`;
        redrawCanvas();
    });

    // Shadow blur
    document.getElementById('shadowBlur').addEventListener('input', function() {
        document.getElementById('shadowValue').textContent = `${this.value}px`;
        redrawCanvas();
    });

    // Custom color
    document.getElementById('customColorBtn').addEventListener('click', () => {
        document.getElementById('customColor').click();
    });

    document.getElementById('customColor').addEventListener('input', function() {
        textColor = this.value;
        redrawCanvas();
    });

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            redrawCanvas();
        });
    });

    // Upload image
    document.getElementById('uploadImageBtn').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });

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

    // Use template
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

        document.querySelector('.size-value').textContent = '48px';
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.color === 'white');
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'none');
        });
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        drawInitialCanvas();
    });

    // Save meme
    document.getElementById('saveMeme').addEventListener('click', saveMeme);

    // Share meme
    document.getElementById('shareMemeBtn').addEventListener('click', shareMeme);

    // Save to cloud
    document.getElementById('saveToCloudBtn').addEventListener('click', saveToCloud);

    // Editor tabs
    editorTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const editorType = this.dataset.editor;

            editorTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            controlsSections.forEach(section => section.classList.remove('active'));

            if (editorType === 'image') {
                document.getElementById('imageControls').classList.add('active');
                memeCanvas.style.display = 'block';
                videoEditorContainer.classList.remove('active');
                gifCreatorContainer.classList.remove('active');
            } else if (editorType === 'video') {
                document.getElementById('videoControls').classList.add('active');
                memeCanvas.style.display = 'none';
                videoEditorContainer.classList.add('active');
                gifCreatorContainer.classList.remove('active');
            } else if (editorType === 'gif') {
                document.getElementById('gifControls').classList.add('active');
                memeCanvas.style.display = 'none';
                videoEditorContainer.classList.remove('active');
                gifCreatorContainer.classList.add('active');
            }
        });
    });
}

// ===== VIDEO EDITOR FUNCTIONS =====
function setupVideoEditor() {
    // Video upload
    document.getElementById('uploadVideoBtn').addEventListener('click', () => {
        document.getElementById('videoUpload').click();
    });

    document.getElementById('videoUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            videoPlayer.src = url;

            videoPlayer.addEventListener('loadedmetadata', function() {
                const duration = Math.floor(videoPlayer.duration);
                trimStart.max = duration;
                trimEnd.max = duration;
                trimEnd.value = duration;
                trimStartValue.textContent = '0s';
                trimEndValue.textContent = `${duration}s`;
            });
        }
    });

    // Trim controls
    trimStart.addEventListener('input', function() {
        const value = parseInt(this.value);
        trimStartValue.textContent = `${value}s`;
        videoPlayer.currentTime = value;
    });

    trimEnd.addEventListener('input', function() {
        const value = parseInt(this.value);
        trimEndValue.textContent = `${value}s`;
    });

    // Apply trim
    document.getElementById('applyTrim').addEventListener('click', function() {
        const startTime = parseInt(trimStart.value);
        const endTime = parseInt(trimEnd.value);

        if (startTime >= endTime) {
            alert('Start time must be less than end time');
            return;
        }

        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Trimming...';

        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Trim Applied';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cut"></i> Apply Trim';
            }, 2000);
        }, 1500);
    });

    // Add text to video
    document.getElementById('addVideoText').addEventListener('click', function() {
        const text = document.getElementById('videoText').value;
        if (!text) {
            alert('Please enter text');
            return;
        }

        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Text Added';
            document.getElementById('videoText').value = '';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-plus"></i> Add Text';
            }, 2000);
        }, 1000);
    });
}

// ===== GIF CREATOR FUNCTIONS =====
function setupGIFCreator() {
    // GIF source upload
    document.getElementById('uploadGIFSourceBtn').addEventListener('click', () => {
        document.getElementById('gifSourceUpload').click();
    });

    document.getElementById('gifSourceUpload').addEventListener('change', function(e) {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        gifFrames.innerHTML = '';

        // Handle up to 5 images
        let loadedCount = 0;
        files.forEach((file, index) => {
            if (file.type.startsWith('image/') && index < 5) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.position = 'absolute';
                    img.style.opacity = '0';
                    gifFrames.appendChild(img);

                    loadedCount++;
                    if (loadedCount === Math.min(files.length, 5)) {
                        animateGIFPreview();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // GIF settings
    gifFPS.addEventListener('input', function() {
        gifFPSValue.textContent = this.value;
    });

    gifDurationSlider.addEventListener('input', function() {
        gifDurationValue.textContent = `${this.value}s`;
    });

    // Quality control
    document.getElementById('gifQuality').addEventListener('input', function() {
        const quality = parseInt(this.value);
        let qualityText = 'Low';
        if (quality >= 8) qualityText = 'High';
        else if (quality >= 5) qualityText = 'Medium';
        document.getElementById('gifQualityValue').textContent = qualityText;
    });

    // Add text to GIF
    document.getElementById('addGIFText').addEventListener('click', function() {
        const text = document.getElementById('gifText').value;
        if (!text) {
            alert('Please enter text for the GIF');
            return;
        }

        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Added';
            document.getElementById('gifText').value = '';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-plus"></i> Add Text';
            }, 2000);
        }, 1000);
    });

    // Generate GIF
    document.getElementById('generateGIF').addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        this.disabled = true;

        setTimeout(() => {
            const link = document.createElement('a');
            link.download = 'shome-gif.gif';
            link.href = 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif';
            link.click();

            this.innerHTML = '<i class="fas fa-play-circle"></i> Create GIF';
            this.disabled = false;

            alert('GIF created and downloaded!');
        }, 2000);
    });
}

function animateGIFPreview() {
    const images = gifFrames.querySelectorAll('img');
    if (images.length === 0) return;

    let currentIndex = 0;
    const fps = parseInt(gifFPS.value);
    const interval = 1000 / fps;

    const animate = () => {
        images.forEach((img, index) => {
            img.style.opacity = index === currentIndex ? '1' : '0';
        });
        currentIndex = (currentIndex + 1) % images.length;
    };

    // Clear any existing interval
    if (window.gifPreviewInterval) {
        clearInterval(window.gifPreviewInterval);
    }

    window.gifPreviewInterval = setInterval(animate, interval);

    // Update frame count and duration
    const frameCount = images.length;
    const duration = frameCount / fps;
    document.getElementById('gifFrameCount').textContent = `${frameCount} frames`;
    document.getElementById('gifDuration').textContent = `${duration.toFixed(1)}s`;
}

// ===== STICKER LIBRARY =====
function setupStickers() {
    loadStickers('emoji');

    // Category switcher
    document.querySelectorAll('.sticker-category').forEach(category => {
        category.addEventListener('click', function() {
            document.querySelectorAll('.sticker-category').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            loadStickers(this.dataset.category);
        });
    });

    // Upload custom sticker
    document.getElementById('uploadStickerBtn').addEventListener('click', () => {
        document.getElementById('stickerUpload').click();
    });

    document.getElementById('stickerUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                stickers.custom.push(event.target.result);
                loadStickers('custom');
            };
            reader.readAsDataURL(file);
        }
    });
}

function loadStickers(category) {
    const stickerGrid = document.getElementById('stickerGrid');
    stickerGrid.innerHTML = '';

    stickers[category].forEach(sticker => {
        const stickerItem = document.createElement('div');
        stickerItem.className = 'sticker-item';

        if (typeof sticker === 'string' && sticker.match(/\p{Emoji}/u)) {
            stickerItem.textContent = sticker;
        } else {
            const img = document.createElement('img');
            img.src = sticker;
            img.alt = 'Sticker';
            stickerItem.appendChild(img);
        }

        stickerItem.addEventListener('click', () => {
            addStickerToCanvas(sticker);
        });

        stickerGrid.appendChild(stickerItem);
    });
}

function addStickerToCanvas(sticker) {
    if (typeof sticker === 'string' && sticker.match(/\p{Emoji}/u)) {
        ctx.font = '48px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker, memeCanvas.width / 2, memeCanvas.height / 2);
    } else {
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img,
                memeCanvas.width / 2 - img.width / 4,
                memeCanvas.height / 2 - img.height / 4,
                img.width / 2,
                img.height / 2
            );
        };
        img.src = sticker;
    }
}

// ===== TEMPLATE FUNCTIONS =====
function setupTemplates() {
    loadTemplates();

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

    document.getElementById('quickVideo').addEventListener('click', () => {
        switchTab('create');
        setTimeout(() => {
            openMemeEditor();
            document.querySelector('[data-editor="video"]').click();
            document.getElementById('uploadVideoBtn').click();
        }, 300);
    });

    document.getElementById('quickGIF').addEventListener('click', () => {
        switchTab('create');
        setTimeout(() => {
            openMemeEditor();
            document.querySelector('[data-editor="gif"]').click();
            document.getElementById('uploadGIFSourceBtn').click();
        }, 300);
    });

    document.getElementById('quickTemplateCreate').addEventListener('click', () => {
        switchTab('create');
        setTimeout(() => {
            openMemeEditor();
            document.getElementById('useTemplateBtn').click();
        }, 300);
    });

    document.getElementById('quickCloudAccess').addEventListener('click', () => {
        cloudModal.classList.add('active');
        loadCloudSaves();
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
    img.onload = function() {
        drawImageOnCanvas(img);
    };
    img.src = template.image;

    templateModal.classList.remove('active');
    memeEditorModal.classList.add('active');
}

// ===== CLOUD SAVE FUNCTIONS =====
function setupCloudModal() {
    document.getElementById('closeCloud').addEventListener('click', () => {
        cloudModal.classList.remove('active');
    });
}

function saveToCloud() {
    if (!currentImage) {
        alert('Please create something first!');
        return;
    }

    const dataURL = memeCanvas.toDataURL('image/png');
    let cloudSaves = JSON.parse(localStorage.getItem('shome_cloud_saves') || '[]');

    const saveObject = {
        id: Date.now(),
        type: 'image',
        data: dataURL,
        timestamp: Date.now(),
        title: `Creation ${cloudSaves.length + 1}`
    };

    cloudSaves.unshift(saveObject);

    if (cloudSaves.length > 50) {
        cloudSaves = cloudSaves.slice(0, 50);
    }

    localStorage.setItem('shome_cloud_saves', JSON.stringify(cloudSaves));
    updateCloudStats();
    loadCloudSaves();

    const saveBtn = document.getElementById('saveToCloudBtn');
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    setTimeout(() => {
        saveBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Cloud';
    }, 2000);
}

function loadCloudSaves() {
    const cloudSaves = JSON.parse(localStorage.getItem('shome_cloud_saves') || '[]');

    if (cloudSaves.length === 0) {
        cloudGrid.innerHTML = `
            <div class="no-cloud-saves">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>No cloud saves yet</p>
                <p>Save your creations to access them anywhere</p>
            </div>
        `;
        return;
    }
    document.getElementById('cloudCount').textContent = cloudSaves.length;

    if (cloudSaves[0]?.timestamp) {
        const date = new Date(cloudSaves[0].timestamp);
        document.getElementById('cloudLast').textContent = formatTime(cloudSaves[0].timestamp);
    }

    cloudGrid.innerHTML = '';

    cloudSaves.slice(0, 12).forEach(save => {
        const cloudItem = document.createElement('div');
        cloudItem.className = 'cloud-item';

        cloudItem.innerHTML = `
            <img src="${save.data}" alt="${save.title}">
            <div class="cloud-item-info">
                <div>${save.title}</div>
                <div>${formatTime(save.timestamp)}</div>
            </div>
        `;

        cloudItem.addEventListener('click', () => {
            const img = new Image();
            img.onload = function() {
                drawImageOnCanvas(img);
                memeEditorModal.classList.add('active');
                cloudModal.classList.remove('active');
            };
            img.src = save.data;
        });

        cloudGrid.appendChild(cloudItem);
    });
}

function updateCloudStats() {
    const cloudSaves = JSON.parse(localStorage.getItem('shome_cloud_saves') || '[]');
    document.getElementById('cloudCount').textContent = cloudSaves.length;

    if (cloudSaves.length > 0) {
        document.getElementById('cloudLast').textContent = formatTime(cloudSaves[0].timestamp);
    }
}

// ===== SOCIAL SHARING =====
function shareMeme() {
    if (!currentImage) {
        alert('Please create something first!');
        return;
    }

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
            const link = document.createElement('a');
            link.download = 'shome-meme.png';
            link.href = URL.createObjectURL(blob);
            link.click();
            alert('Meme downloaded! You can now share it.');
        }
    }, 'image/png');
}

// ===== RECENT MEMES FUNCTIONS =====
function loadRecentMemes() {
    const recentGrid = document.getElementById('recentMemes');
    const recentMemes = JSON.parse(localStorage.getItem('shome_recent_memes') || '[]');

    recentGrid.innerHTML = '';

    if (recentMemes.length === 0) {
        recentGrid.innerHTML = `
            <div class="no-recent">
                <i class="fas fa-plus-circle"></i>
                <p>No recent memes yet</p>
            </div>
        `;
        return;
    }

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
    recentMemes.unshift(memeData);

    if (recentMemes.length > 10) {
        recentMemes = recentMemes.slice(0, 10);
    }

    localStorage.setItem('shome_recent_memes', JSON.stringify(recentMemes));
    loadRecentMemes();
}

function saveMeme() {
    if (!currentImage) {
        alert('Please upload an image first!');
        return;
    }

    const link = document.createElement('a');
    link.download = 'shome-meme.png';
    link.href = memeCanvas.toDataURL('image/png');
    link.click();

    addToRecentMemes(link.href);
    alert('Meme saved successfully!');
}

// ===== UTILITY FUNCTIONS =====
function openMemeEditor() {
    memeEditorModal.classList.add('active');
    resizeCanvas();
    redrawCanvas();
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

function switchTab(tabId) {
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
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

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Create button
    createNavBtn.addEventListener('click', function() {
        switchTab('create');
        this.style.transform = 'translateX(-50%) scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'translateX(-50%)';
        }, 150);
    });

    // Infinite scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadMoreMemes();
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(document.getElementById('loading-sentinel'));

    // Window resize
    window.addEventListener('resize', resizeCanvas);
}

function setupHeaderScroll() {
    let lastScrollTop = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 10) {
            appHeader.classList.add('scrolled');
        } else {
            appHeader.classList.remove('scrolled');
        }

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

function setupPullToRefresh() {
    let touchStartY = 0;
    const pullToRefresh = document.getElementById('pullToRefresh');

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
            if (pullDistance > 50) {
                pullToRefresh.classList.add('active');
            }
        }
    }, {
        passive: true
    });

    memeFeed.addEventListener('touchend', function() {
        pullToRefresh.classList.remove('active');
    }, {
        passive: true
    });
}
// ===== MEME FEED FUNCTIONS =====
function addSkeletonCards() {
    for (let i = 0; i < 3; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'meme-card skeleton skeleton-card';
        memeFeed.insertBefore(skeletonCard, document.getElementById('loading-sentinel'));
    }
}

function removeSkeletonCards() {
    const skeletonCards = document.querySelectorAll('.skeleton');
    skeletonCards.forEach(card => card.remove());
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
        memeFeed.insertBefore(card, document.getElementById('loading-sentinel'));

        const upvoteBtn = card.querySelector('.upvote-btn');
        if (upvoteBtn) upvoteBtn.addEventListener('click', handleUpvote);

        setTimeout(() => {
            card.classList.add('loaded');
        }, 50 + index * 100);
    });

    feedPage++;
    isLoading = false;
    addSkeletonCards();
}

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
                    `<video class="meme-video" controls><source src="${meme.content}" type="video/mp4"></video>`;

                newMemes.push(`
                    <div class="meme-card" data-meme-id="${memeId}">
                        <div class="card-header">
                            <div class="user-avatar">${avatarLetter}</div>
                            <div class="user-info">
                                <strong>${meme.username}</strong>
                                <small>${Math.floor(Math.random() * 59) + 1}m ago</small>
                            </div>
                        </div>
                        <div class="meme-media-container">${mediaContent}</div>
                        <div class="card-details">
                            <p class="caption-text">${meme.caption}</p>
                            <div class="meme-stats">
                                <span><i class="fas fa-fire"></i> <span class="upvote-count">${meme.likes}</span> upvotes</span>
                                <span><i class="fas fa-comment-alt"></i> ${meme.comments} comments</span>
                                <span><i class="fas fa-share"></i> ${meme.shares} shares</span>
                            </div>
                            <div class="action-bar">
                                <button class="action-btn upvote-btn ${isActive}"><i class="${iconType} fa-fire"></i> Upvote</button>
                                <button class="action-btn comment-btn"><i class="fas fa-comment-alt"></i> Comment</button>
                                <button class="action-btn share-btn"><i class="fas fa-share-square"></i> Share</button>
                            </div>
                        </div>
                    </div>
                `);
            }
            resolve(newMemes);
        }, 800);
    });
}

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
        button.classList.add('liked');
        setTimeout(() => button.classList.remove('liked'), 600);
    }

    countElement.textContent = currentCount;
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
            <video class="short-player" loop muted playsinline>
                <source src="${short.video}" type="video/mp4">
            </video>
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
                    <span>${short.likes}</span>
                </button>
                <button class="short-action-btn comment-btn" data-id="${short.id}">
                    <i class="far fa-comment"></i>
                    <span>${short.comments}</span>
                </button>
                <button class="short-action-btn share-btn" data-id="${short.id}">
                    <i class="fas fa-share"></i>
                    <span>${short.shares}</span>
                </button>
            </div>
        `;

        shortsContainer.appendChild(shortCard);

        const videoElement = shortCard.querySelector('.short-player');
        videoElement.addEventListener('click', () => {
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        });
    });

    document.querySelectorAll('.short-action-btn.like-btn').forEach(btn => {
        btn.addEventListener('click', handleShortLike);
    });
}

function handleShortLike(event) {
    const button = event.currentTarget;
    const shortId = button.getAttribute('data-id');
    const likeIcon = button.querySelector('i');
    const likeCount = button.querySelector('span');
    let count = parseInt(likeCount.textContent) || 0;

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

    likeCount.textContent = count;
}

// ===== PROFILE FUNCTIONS =====
function loadProfileContent(contentType) {
    const contentContainer = document.getElementById(`profile${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`);
    contentContainer.innerHTML = '';

    const content = contentType === 'shorts' ?
        shortsData :
        Array(6).fill().map((_, i) => ({
            type: i < 3 ? 'image' : 'video',
            content: i < 3 ?
                `https://images.unsplash.com/photo-${150 + i}?auto=format&fit=crop&w=500&q=60` : shortsData[i % shortsData.length].video
        }));

    content.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'profile-item';

        if (contentType === 'shorts' || item.type === 'video') {
            itemElement.innerHTML = `<video muted playsinline><source src="${contentType === 'shorts' ? item.video : item.content}" type="video/mp4"></video>`;
        } else {
            itemElement.innerHTML = `<img src="${item.content}" alt="Profile content ${index + 1}" loading="lazy">`;
        }

        contentContainer.appendChild(itemElement);
    });
}

function setupProfileTabs() {
    const profileTabBtns = document.querySelectorAll('.profile-tab-btn');

    profileTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const contentType = this.getAttribute('data-profile-content');

            profileTabBtns.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.profile-content').forEach(content => {
                content.classList.remove('active');
            });

            const contentContainer = document.getElementById(`profile${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`);
            contentContainer.classList.add('active');

            if (contentContainer.children.length === 0) {
                loadProfileContent(contentType);
            }
        });
    });
}