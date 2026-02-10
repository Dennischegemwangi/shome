// modules/memeEditor.js

//import { showToast, generateUniqueId, compressImage } from './utils.js';
// Add at the top of memeEditor.js (after the existing import)
import { showToast, generateUniqueId, compressImage, showLoading, hideLoading } from './utils.js';

let canvas, ctx;
let currentImage = null;
let textLayers = [];
let stickers = [];
let currentFilter = 'none';
let isDrawing = false;
let selectedLayer = null;

// Initialize meme editor
export async function initMemeEditor(canvasElement) {
    if (!canvasElement) {
        throw new Error('Canvas element not found');
    }
    
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    
    // Set up canvas
    setupCanvas();
    
    // Set up event listeners
    setupCanvasEvents();
    
    // Set up editor controls
    setupEditorControls();
    
    console.log('✅ Meme editor initialized');
}

// Set up canvas
function setupCanvas() {
    // Set initial background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw watermark
    drawWatermark();
    
    // Set up default text style
    ctx.font = '48px Impact';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
}

// Draw watermark
function drawWatermark() {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SHOME', canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

// Set up canvas events
function setupCanvasEvents() {
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
}

// Set up editor controls
function setupEditorControls() {
    // Image upload
    const uploadBtn = document.getElementById('uploadImageBtn');
    const fileInput = document.getElementById('imageUpload');
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImageUpload);
    
    // Text controls
    const topTextInput = document.getElementById('topText');
    const bottomTextInput = document.getElementById('bottomText');
    const addTextBtn = document.getElementById('addTextLayerBtn');
    
    addTextBtn.addEventListener('click', () => {
        const topText = topTextInput.value.trim();
        const bottomText = bottomTextInput.value.trim();
        
        if (topText) {
            addText(topText, 'top');
            topTextInput.value = '';
        }
        
        if (bottomText) {
            addText(bottomText, 'bottom');
            bottomTextInput.value = '';
        }
    });
    
    topTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addText(topTextInput.value.trim(), 'top');
            topTextInput.value = '';
        }
    });
    
    bottomTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addText(bottomTextInput.value.trim(), 'bottom');
            bottomTextInput.value = '';
        }
    });
    
    // Font selection
    const fontSelect = document.getElementById('fontSelect');
    fontSelect.addEventListener('change', (e) => {
        setTextFont(e.target.value);
    });
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const color = e.target.getAttribute('data-color');
            setTextColor(color);
        });
    });
    
    // Size controls
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operation = e.target.getAttribute('data-size');
            adjustTextSize(operation);
        });
    });
    
    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            applyFilter(filter);
        });
    });
    
    // Reset button
    document.getElementById('resetMeme').addEventListener('click', resetMemeCanvas);
    
    // Save buttons
    document.getElementById('saveLocal').addEventListener('click', saveToLocal);
    document.getElementById('saveCloud').addEventListener('click', saveMemeToCloud);
    document.getElementById('shareMeme').addEventListener('click', shareMeme);
    
    // Template button
    document.getElementById('useTemplateBtn').addEventListener('click', () => {
        document.getElementById('templateModal').classList.add('active');
    });
    
    // Sticker library
    document.getElementById('openStickerLibrary').addEventListener('click', () => {
        document.getElementById('stickerModal').classList.add('active');
    });
}

// Handle image upload
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!validateFile(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
        showToast('Please upload a valid image file (JPEG, PNG, GIF, WebP)', 'error');
        return;
    }
    
    showLoading('Processing image...');
    
    try {
        // Compress image if needed
        const compressedBlob = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8
        });
        
        // Create image from blob
        const img = new Image();
        img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Calculate dimensions to fit canvas while maintaining aspect ratio
            const scale = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );
            
            const width = img.width * scale;
            const height = img.height * scale;
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            // Draw image
            ctx.drawImage(img, x, y, width, height);
            
            // Store current image
            currentImage = {
                img: img,
                x: x,
                y: y,
                width: width,
                height: height
            };
            
            // Redraw text layers and stickers
            redrawLayers();
            
            hideLoading();
            showToast('Image uploaded successfully!', 'success');
        };
        
        img.onerror = () => {
            hideLoading();
            showToast('Failed to load image', 'error');
        };
        
        img.src = URL.createObjectURL(compressedBlob);
    } catch (error) {
        hideLoading();
        console.error('Error processing image:', error);
        showToast('Failed to process image', 'error');
    }
    
    // Reset file input
    e.target.value = '';
}

// Add text to canvas
export function addText(text, position = 'center') {
    if (!text.trim()) return;
    
    const textLayer = {
        id: generateUniqueId(),
        text: text,
        position: position,
        font: 'Impact',
        size: 48,
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 3,
        x: canvas.width / 2,
        y: position === 'top' ? 60 : canvas.height - 60,
        maxWidth: canvas.width * 0.8
    };
    
    textLayers.push(textLayer);
    drawText(textLayer);
}

// Draw text layer
function drawText(layer) {
    ctx.save();
    
    // Set text properties
    ctx.font = `${layer.size}px ${layer.font}`;
    ctx.fillStyle = layer.color;
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = layer.strokeWidth;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate position
    let x, y;
    
    switch(layer.position) {
        case 'top':
            x = canvas.width / 2;
            y = 60;
            break;
        case 'bottom':
            x = canvas.width / 2;
            y = canvas.height - 60;
            break;
        case 'center':
            x = canvas.width / 2;
            y = canvas.height / 2;
            break;
        default:
            x = layer.x || canvas.width / 2;
            y = layer.y || canvas.height / 2;
    }
    
    // Draw text with stroke (outline)
    ctx.strokeText(layer.text, x, y);
    ctx.fillText(layer.text, x, y);
    
    // Store position
    layer.x = x;
    layer.y = y;
    
    ctx.restore();
}

// Add sticker to canvas
export function addStickerToCanvas(stickerUrl, x, y, width = 100, height = 100) {
    const sticker = new Image();
    sticker.onload = () => {
        stickers.push({
            id: generateUniqueId(),
            img: sticker,
            x: x,
            y: y,
            width: width,
            height: height,
            rotation: 0,
            scale: 1
        });
        
        drawSticker(sticker, x, y, width, height);
    };
    sticker.src = stickerUrl;
}

// Draw sticker
function drawSticker(img, x, y, width, height) {
    ctx.drawImage(img, x - width/2, y - height/2, width, height);
}

// Apply filter to canvas
export function applyFilterToCanvas(filter) {
    currentFilter = filter;
    redrawCanvas();
}

// Redraw entire canvas
function redrawCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply filter
    ctx.save();
    applyCanvasFilter(ctx, currentFilter);
    
    // Draw background image
    if (currentImage) {
        ctx.drawImage(currentImage.img, currentImage.x, currentImage.y, 
                     currentImage.width, currentImage.height);
    } else {
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawWatermark();
    }
    
    ctx.restore();
    
    // Redraw text layers
    textLayers.forEach(drawText);
    
    // Redraw stickers
    stickers.forEach(sticker => {
        drawSticker(sticker.img, sticker.x, sticker.y, sticker.width, sticker.height);
    });
}

// Apply canvas filter
function applyCanvasFilter(context, filter) {
    switch(filter) {
        case 'grayscale':
            context.filter = 'grayscale(100%)';
            break;
        case 'sepia':
            context.filter = 'sepia(100%)';
            break;
        case 'invert':
            context.filter = 'invert(100%)';
            break;
        case 'brightness':
            context.filter = 'brightness(150%)';
            break;
        case 'contrast':
            context.filter = 'contrast(200%)';
            break;
        case 'hue-rotate':
            context.filter = 'hue-rotate(90deg)';
            break;
        case 'saturate':
            context.filter = 'saturate(200%)';
            break;
        default:
            context.filter = 'none';
    }
}

// Reset canvas
export function resetMemeCanvas() {
    textLayers = [];
    stickers = [];
    currentImage = null;
    currentFilter = 'none';
    selectedLayer = null;
    
    setupCanvas();
    showToast('Canvas reset', 'info');
}

// Save meme to local storage
function saveToLocal() {
    const dataUrl = canvas.toDataURL('image/png');
    const memeData = {
        id: generateUniqueId(),
        dataUrl: dataUrl,
        timestamp: Date.now(),
        textLayers: [...textLayers],
        stickers: stickers.map(s => ({
            url: s.img.src,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height
        }))
    };
    
    // Get existing memes from localStorage
    const savedMemes = JSON.parse(localStorage.getItem('shome_memes') || '[]');
    savedMemes.push(memeData);
    
    // Save to localStorage
    localStorage.setItem('shome_memes', JSON.stringify(savedMemes));
    
    // Update recent memes
    updateRecentMemes(memeData);
    
    showToast('Meme saved locally!', 'success');
}

// Save meme to cloud
export async function saveMemeToCloud() {
    showLoading('Saving to cloud...');
    
    try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // In a real app, this would upload to your server
        // For demo, we'll simulate with localStorage
        
        const cloudMeme = {
            id: generateUniqueId(),
            dataUrl: dataUrl,
            timestamp: Date.now(),
            userId: window.App.state.currentUser.id,
            likes: 0,
            shares: 0,
            textLayers: [...textLayers],
            stickers: stickers.map(s => ({
                url: s.img.src,
                x: s.x,
                y: s.y,
                width: s.width,
                height: s.height
            }))
        };
        
        // Simulate API call
        await simulateApiCall(1000);
        
        // Update cloud storage
        const cloudMemes = JSON.parse(localStorage.getItem('shome_cloud_memes') || '[]');
        cloudMemes.push(cloudMeme);
        localStorage.setItem('shome_cloud_memes', JSON.stringify(cloudMemes));
        
        // Update cloud stats
        window.App.state.cloudStorage.memes = cloudMemes;
        window.App.state.cloudStorage.used = cloudMemes.length * 0.01; // 0.01 GB per meme
        
        hideLoading();
        showToast('Meme saved to cloud!', 'success');
        
        // Update UI
        if (typeof window.App !== 'undefined' && window.App.state) {
            window.App.state.cloudStorage = window.App.state.cloudStorage;
            updateCloudStatsUI();
        }
        
        return cloudMeme;
    } catch (error) {
        hideLoading();
        console.error('Error saving to cloud:', error);
        showToast('Failed to save to cloud', 'error');
        throw error;
    }
}

// Share meme
function shareMeme() {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const shareModal = document.getElementById('shareModal');
    const sharePreview = document.getElementById('sharePreview');
    
    sharePreview.src = dataUrl;
    shareModal.classList.add('active');
}

// Update recent memes
function updateRecentMemes(memeData) {
    const recentMemes = JSON.parse(localStorage.getItem('shome_recent_memes') || '[]');
    
    // Add new meme at the beginning
    recentMemes.unshift({
        id: memeData.id,
        dataUrl: memeData.dataUrl,
        timestamp: memeData.timestamp
    });
    
    // Keep only last 10 memes
    if (recentMemes.length > 10) {
        recentMemes.pop();
    }
    
    localStorage.setItem('shome_recent_memes', JSON.stringify(recentMemes));
    
    // Update UI if on create tab
    loadRecentMemesUI();
}

// Load recent memes UI
function loadRecentMemesUI() {
    const recentMemes = JSON.parse(localStorage.getItem('shome_recent_memes') || '[]');
    const grid = document.getElementById('recentMemes');
    
    if (!grid) return;
    
    grid.innerHTML = recentMemes.map(meme => `
        <div class="recent-meme" data-id="${meme.id}">
            <img src="${meme.dataUrl}" alt="Recent meme" loading="lazy">
        </div>
    `).join('');
}

// Update cloud stats UI
function updateCloudStatsUI() {
    const cloud = window.App.state.cloudStorage;
    
    const usedStorageEl = document.getElementById('usedStorage');
    const memeCountEl = document.getElementById('memeCount');
    
    if (usedStorageEl) {
        usedStorageEl.textContent = `${cloud.used.toFixed(1)} GB`;
    }
    
    if (memeCountEl) {
        memeCountEl.textContent = cloud.memes.length;
    }
}

// Load template gallery
export async function loadTemplateGallery() {
    const templateGrid = document.getElementById('templateGrid');
    if (!templateGrid) return;
    
    // Mock templates - in production, these would come from an API
    const templates = [
        { id: 1, name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
        { id: 2, name: 'Drake Hotline Bling', url: 'https://i.imgflip.com/30b1gx.jpg' },
        { id: 3, name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
        { id: 4, name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
        { id: 5, name: 'Expanding Brain', url: 'https://i.imgflip.com/1jwhww.jpg' },
        { id: 6, name: 'Left Exit 12', url: 'https://i.imgflip.com/22bdq6.jpg' },
        { id: 7, name: 'Mocking Spongebob', url: 'https://i.imgflip.com/1otk96.jpg' },
        { id: 8, name: 'Boardroom Meeting', url: 'https://i.imgflip.com/m78d.jpg' },
        { id: 9, name: 'Woman Yelling at Cat', url: 'https://i.imgflip.com/345v97.jpg' },
        { id: 10, name: 'American Chopper', url: 'https://i.imgflip.com/28j0te.jpg' },
        { id: 11, name: 'Hide the Pain', url: 'https://i.imgflip.com/2hgfw.jpg' },
        { id: 12, name: 'They\'re the Same', url: 'https://i.imgflip.com/46e43q.png' }
    ];
    
    templateGrid.innerHTML = templates.map(template => `
        <div class="template-item" data-id="${template.id}">
            <img src="${template.url}" alt="${template.name}" loading="lazy">
            <div class="template-label">${template.name}</div>
        </div>
    `).join('');
    
    // Add click events
    templateGrid.querySelectorAll('.template-item').forEach(item => {
        item.addEventListener('click', async () => {
            const templateId = item.getAttribute('data-id');
            const template = templates.find(t => t.id == templateId);
            
            if (template) {
                await loadTemplate(template.url);
                document.getElementById('templateModal').classList.remove('active');
                document.getElementById('memeEditorModal').classList.add('active');
                showToast(`Loaded "${template.name}" template`, 'success');
            }
        });
    });
}

// Load template image
async function loadTemplate(url) {
    showLoading('Loading template...');
    
    try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions to fit canvas
        const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
        );
        
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        
        // Draw template
        ctx.drawImage(img, x, y, width, height);
        
        // Store current image
        currentImage = {
            img: img,
            x: x,
            y: y,
            width: width,
            height: height
        };
        
        // Clear text layers and stickers
        textLayers = [];
        stickers = [];
        
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Error loading template:', error);
        showToast('Failed to load template', 'error');
    }
}

// Set text font
export function setTextFont(font) {
    if (selectedLayer) {
        selectedLayer.font = font;
    } else {
        textLayers.forEach(layer => {
            layer.font = font;
        });
    }
    
    redrawCanvas();
    updateFontSelectorUI(font);
}

// Set text color
export function setTextColor(color) {
    if (selectedLayer) {
        selectedLayer.color = color;
    } else {
        textLayers.forEach(layer => {
            layer.color = color;
        });
    }
    
    redrawCanvas();
    updateColorPickerUI(color);
}

// Adjust text size
function adjustTextSize(operation) {
    if (selectedLayer) {
        selectedLayer.size = Math.max(12, Math.min(144, 
            operation === '+' ? selectedLayer.size + 4 : selectedLayer.size - 4
        ));
    } else {
        textLayers.forEach(layer => {
            layer.size = Math.max(12, Math.min(144, 
                operation === '+' ? layer.size + 4 : layer.size - 4
            ));
        });
    }
    
    redrawCanvas();
    updateSizeDisplay();
}

// Update font selector UI
function updateFontSelectorUI(font) {
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.value = font;
    }
}

// Update color picker UI
function updateColorPickerUI(color) {
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-color') === color);
    });
}

// Update size display
function updateSizeDisplay() {
    const sizeValue = document.querySelector('.size-value');
    if (sizeValue && textLayers.length > 0) {
        sizeValue.textContent = `${textLayers[0].size}px`;
    }
}

// Apply filter
function applyFilter(filter) {
    currentFilter = filter;
    
    // Update filter buttons UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
    
    redrawCanvas();
    showToast(`Applied ${filter} filter`, 'info');
}

// Get current meme data
export function getCurrentMemeData() {
    return {
        image: currentImage,
        textLayers: [...textLayers],
        stickers: [...stickers],
        filter: currentFilter,
        canvasData: canvas.toDataURL()
    };
}

// Handle canvas click
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on text layer
    selectedLayer = null;
    
    for (let i = textLayers.length - 1; i >= 0; i--) {
        const layer = textLayers[i];
        const metrics = ctx.measureText(layer.text);
        const layerWidth = metrics.width;
        const layerHeight = layer.size;
        
        if (x >= layer.x - layerWidth/2 && x <= layer.x + layerWidth/2 &&
            y >= layer.y - layerHeight/2 && y <= layer.y + layerHeight/2) {
            selectedLayer = layer;
            showTextLayerControls(layer);
            break;
        }
    }
    
    // If clicked on empty space, hide controls
    if (!selectedLayer) {
        hideTextLayerControls();
    }
}

// Handle mouse/touch events for dragging
function handleMouseDown(e) {
    isDrawing = true;
    handleDragStart(e.clientX, e.clientY);
}

function handleMouseMove(e) {
    if (!isDrawing) return;
    handleDrag(e.clientX, e.clientY);
}

function handleMouseUp() {
    isDrawing = false;
    handleDragEnd();
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        e.preventDefault();
        isDrawing = true;
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    }
}

function handleTouchMove(e) {
    if (!isDrawing || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleDrag(touch.clientX, touch.clientY);
}

function handleTouchEnd(e) {
    isDrawing = false;
    handleDragEnd();
}

function handleDragStart(x, y) {
    const rect = canvas.getBoundingClientRect();
    const posX = x - rect.left;
    const posY = y - rect.top;
    
    // Check if dragging text layer
    if (selectedLayer) {
        const metrics = ctx.measureText(selectedLayer.text);
        const layerWidth = metrics.width;
        const layerHeight = selectedLayer.size;
        
        if (posX >= selectedLayer.x - layerWidth/2 && posX <= selectedLayer.x + layerWidth/2 &&
            posY >= selectedLayer.y - layerHeight/2 && posY <= selectedLayer.y + layerHeight/2) {
            // Start dragging text layer
            selectedLayer.dragging = true;
            selectedLayer.dragOffsetX = posX - selectedLayer.x;
            selectedLayer.dragOffsetY = posY - selectedLayer.y;
        }
    }
}

function handleDrag(x, y) {
    const rect = canvas.getBoundingClientRect();
    const posX = x - rect.left;
    const posY = y - rect.top;
    
    if (selectedLayer && selectedLayer.dragging) {
        // Update text layer position
        selectedLayer.x = posX - selectedLayer.dragOffsetX;
        selectedLayer.y = posY - selectedLayer.dragOffsetY;
        selectedLayer.position = 'custom'; // Mark as custom position
        
        redrawCanvas();
    }
}

function handleDragEnd() {
    if (selectedLayer) {
        selectedLayer.dragging = false;
        delete selectedLayer.dragOffsetX;
        delete selectedLayer.dragOffsetY;
    }
}

// Show text layer controls
function showTextLayerControls(layer) {
    // Update UI controls to match selected layer
    updateFontSelectorUI(layer.font);
    updateColorPickerUI(layer.color);
    updateSizeDisplay(layer.size);
    
    // Show layer controls
    const advancedOptions = document.getElementById('advancedTextOptions');
    if (advancedOptions) {
        advancedOptions.style.display = 'block';
    }
}

// Hide text layer controls
function hideTextLayerControls() {
    const advancedOptions = document.getElementById('advancedTextOptions');
    if (advancedOptions) {
        advancedOptions.style.display = 'none';
    }
}

// Redraw all layers
function redrawLayers() {
    textLayers.forEach(drawText);
    stickers.forEach(sticker => {
        drawSticker(sticker.img, sticker.x, sticker.y, sticker.width, sticker.height);
    });
}

// Simulate API call (for demo)
function simulateApiCall(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for testing
export { canvas, ctx, textLayers, stickers };
// Export all public functions
export {
   // initMemeEditor,
  //  loadTemplateGallery,
  // saveMemeToCloud ,
  //saveToCloud ,
   // resetMemeCanvas,
   // getCurrentMemeData,
  //  addText,
//    addStickerToCanvas,
    applyFilter  // Add this export
};