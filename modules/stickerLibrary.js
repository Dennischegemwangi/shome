// modules/stickerLibrary.js
//import { showToast, generateUniqueId } from './utils.js';

// modules/stickerLibrary.js - CORRECTED IMPORTS
import { 
    showToast, 
    //generateUniqueId,
   // showLoading,
   // hideLoading 
} from './utils.js';

let stickers = [];
let categories = ['all', 'emojis', 'memes', 'reactions', 'custom'];
let currentCategory = 'all';
let customStickers = [];

// Initialize sticker library
export function initStickerLibrary() {
    console.log('✅ Sticker library initialized');
    
    // Load stickers
    loadStickers();
    
    // Load custom stickers
    loadCustomStickers();
    
    // Set up sticker library UI
    setupStickerLibraryUI();
    
    // Set up sticker interactions
    setupStickerInteractions();
}

// Load stickers
function loadStickers() {
    // Default stickers
    stickers = [
        // Emojis
        { id: 'emoji_1', category: 'emojis', type: 'emoji', emoji: '😂', name: 'Crying Laughing' },
        { id: 'emoji_2', category: 'emojis', type: 'emoji', emoji: '😭', name: 'Loudly Crying' },
        { id: 'emoji_3', category: 'emojis', type: 'emoji', emoji: '😎', name: 'Cool' },
        { id: 'emoji_4', category: 'emojis', type: 'emoji', emoji: '🤔', name: 'Thinking' },
        { id: 'emoji_5', category: 'emojis', type: 'emoji', emoji: '👀', name: 'Eyes' },
        { id: 'emoji_6', category: 'emojis', type: 'emoji', emoji: '💀', name: 'Skull' },
        { id: 'emoji_7', category: 'emojis', type: 'emoji', emoji: '🔥', name: 'Fire' },
        { id: 'emoji_8', category: 'emojis', type: 'emoji', emoji: '✨', name: 'Sparkles' },
        
        // Meme Faces
        { id: 'meme_1', category: 'memes', type: 'image', url: 'https://i.imgflip.com/1c1uej.jpg', name: 'Drake' },
        { id: 'meme_2', category: 'memes', type: 'image', url: 'https://i.imgflip.com/1h7in3.jpg', name: 'Distracted' },
        { id: 'meme_3', category: 'memes', type: 'image', url: 'https://i.imgflip.com/1otk96.jpg', name: 'Mocking' },
        { id: 'meme_4', category: 'memes', type: 'image', url: 'https://i.imgflip.com/2hgfw.jpg', name: 'Hide Pain' },
        { id: 'meme_5', category: 'memes', type: 'image', url: 'https://i.imgflip.com/28j0te.jpg', name: 'Argument' },
        { id: 'meme_6', category: 'memes', type: 'image', url: 'https://i.imgflip.com/345v97.jpg', name: 'Woman Cat' },
        
        // Reactions
        { id: 'reaction_1', category: 'reactions', type: 'image', url: 'https://i.imgflip.com/1e4qg0.jpg', name: 'Upvote' },
        { id: 'reaction_2', category: 'reactions', type: 'image', url: 'https://i.imgflip.com/3i7p.jpg', name: 'Downvote' },
        { id: 'reaction_3', category: 'reactions', type: 'emoji', emoji: '❤️', name: 'Heart' },
        { id: 'reaction_4', category: 'reactions', type: 'emoji', emoji: '👍', name: 'Thumbs Up' },
        { id: 'reaction_5', category: 'reactions', type: 'emoji', emoji: '👎', name: 'Thumbs Down' },
        { id: 'reaction_6', category: 'reactions', type: 'emoji', emoji: '🎉', name: 'Party' }
    ];
}

// Load custom stickers from localStorage
function loadCustomStickers() {
    try {
        const saved = localStorage.getItem('shome_custom_stickers');
        if (saved) {
            customStickers = JSON.parse(saved);
            // Add to stickers array with custom category
            customStickers.forEach(sticker => {
                stickers.push({
                    ...sticker,
                    category: 'custom',
                    type: 'image',
                    custom: true
                });
            });
        }
    } catch (error) {
        console.error('Error loading custom stickers:', error);
        customStickers = [];
    }
}

// Save custom stickers to localStorage
function saveCustomStickers() {
    try {
        localStorage.setItem('shome_custom_stickers', JSON.stringify(customStickers));
    } catch (error) {
        console.error('Error saving custom stickers:', error);
    }
}

// Set up sticker library UI
function setupStickerLibraryUI() {
    const stickerModal = document.getElementById('stickerModal');
    const closeStickerBtn = document.getElementById('closeSticker');
    const addCustomStickerBtn = document.getElementById('addCustomSticker');
    const stickerUpload = document.getElementById('stickerUpload');
    
    if (!stickerModal) return;
    
    // Close button
    if (closeStickerBtn) {
        closeStickerBtn.addEventListener('click', () => {
            stickerModal.classList.remove('active');
        });
    }
    
    // Category buttons
    setupCategoryButtons();
    
    // Add custom sticker
    if (addCustomStickerBtn && stickerUpload) {
        addCustomStickerBtn.addEventListener('click', () => {
            stickerUpload.click();
        });
        
        stickerUpload.addEventListener('change', handleStickerUpload);
    }
    
    // Open from meme editor
    const openStickerLibraryBtn = document.getElementById('openStickerLibrary');
    if (openStickerLibraryBtn) {
        openStickerLibraryBtn.addEventListener('click', () => {
            stickerModal.classList.add('active');
            loadStickersByCategory('all');
        });
    }
    
    // Upload sticker from meme editor
    const uploadStickerBtn = document.getElementById('uploadStickerBtn');
    const memeStickerUpload = document.getElementById('stickerUpload');
    
    if (uploadStickerBtn && memeStickerUpload) {
        uploadStickerBtn.addEventListener('click', () => {
            memeStickerUpload.click();
        });
        
        memeStickerUpload.addEventListener('change', handleStickerUpload);
    }
}

// Set up category buttons
function setupCategoryButtons() {
    const categoryContainer = document.querySelector('.sticker-categories');
    if (!categoryContainer) return;
    
    // Clear existing buttons
    categoryContainer.innerHTML = '';
    
    // Create category buttons
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = `category-btn ${category === 'all' ? 'active' : ''}`;
        button.setAttribute('data-category', category);
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        
        button.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Load stickers for category
            loadStickersByCategory(category);
            currentCategory = category;
        });
        
        categoryContainer.appendChild(button);
    });
}

// Load stickers by category
export function loadStickersByCategory(category) {
    const stickerGrid = document.getElementById('stickerGrid');
    if (!stickerGrid) return;
    
    let filteredStickers = [];
    
    if (category === 'all') {
        filteredStickers = stickers;
    } else if (category === 'custom') {
        filteredStickers = stickers.filter(s => s.category === 'custom');
    } else {
        filteredStickers = stickers.filter(s => s.category === category);
    }
    
    // If no stickers in category, show empty state
    if (filteredStickers.length === 0) {
        stickerGrid.innerHTML = `
            <div class="empty-stickers">
                <i class="fas fa-sticky-note"></i>
                <h4>No stickers found</h4>
                <p>${category === 'custom' ? 'Upload your own stickers!' : 'Try another category'}</p>
            </div>
        `;
        return;
    }
    
    // Render stickers
    stickerGrid.innerHTML = filteredStickers.map(sticker => {
        if (sticker.type === 'emoji') {
            return `
                <div class="sticker-item emoji-sticker" 
                     data-id="${sticker.id}" 
                     data-type="emoji"
                     data-content="${sticker.emoji}"
                     title="${sticker.name}">
                    <span class="sticker-emoji">${sticker.emoji}</span>
                </div>
            `;
        } else {
            return `
                <div class="sticker-item image-sticker" 
                     data-id="${sticker.id}" 
                     data-type="image"
                     data-url="${sticker.url}"
                     title="${sticker.name}">
                    <img src="${sticker.url}" alt="${sticker.name}" loading="lazy">
                </div>
            `;
        }
    }).join('');
}

// Handle sticker upload
async function handleStickerUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Image must be less than 5MB', 'error');
        return;
    }
    
    showLoading('Uploading sticker...');
    
    try {
        // Create blob URL for immediate use
        const blobUrl = URL.createObjectURL(file);
        
        // Create sticker object
        const sticker = {
            id: generateUniqueId(),
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            url: blobUrl,
            blob: file,
            timestamp: Date.now(),
            custom: true
        };
        
        // Add to custom stickers
        customStickers.push(sticker);
        saveCustomStickers();
        
        // Add to stickers array
        stickers.push({
            ...sticker,
            category: 'custom',
            type: 'image'
        });
        
        // Update sticker grid if custom category is active
        if (currentCategory === 'custom' || currentCategory === 'all') {
            loadStickersByCategory(currentCategory);
        }
        
        showToast('Sticker uploaded successfully!', 'success');
        
        // Switch to custom category
        const customBtn = document.querySelector('.category-btn[data-category="custom"]');
        if (customBtn) {
            customBtn.click();
        }
        
    } catch (error) {
        console.error('Error uploading sticker:', error);
        showToast('Failed to upload sticker', 'error');
    } finally {
        hideLoading();
        e.target.value = '';
    }
}

// Set up sticker interactions
function setupStickerInteractions() {
    // Sticker click (delegated to grid)
    const stickerGrid = document.getElementById('stickerGrid');
    if (!stickerGrid) return;
    
    stickerGrid.addEventListener('click', (e) => {
        const stickerItem = e.target.closest('.sticker-item');
        if (!stickerItem) return;
        
        const stickerId = stickerItem.getAttribute('data-id');
        const stickerType = stickerItem.getAttribute('data-type');
        
        if (stickerType === 'emoji') {
            const emoji = stickerItem.getAttribute('data-content');
            addStickerToCanvas(emoji, 'emoji');
        } else {
            const imageUrl = stickerItem.getAttribute('data-url');
            addStickerToCanvas(imageUrl, 'image');
        }
        
        // Close sticker modal
        document.getElementById('stickerModal').classList.remove('active');
    });
    
    // Sticker drag & drop for reordering (custom stickers only)
    setupStickerDragAndDrop();
}

// Add sticker to canvas
function addStickerToCanvas(content, type) {
    // Dispatch event for memeEditor to handle
    const event = new CustomEvent('addStickerToCanvas', {
        detail: {
            content: content,
            type: type,
            timestamp: Date.now()
        }
    });
    document.dispatchEvent(event);
    
    showToast('Sticker added to canvas', 'success');
}

// Set up sticker drag and drop
function setupStickerDragAndDrop() {
    const stickerGrid = document.getElementById('stickerGrid');
    if (!stickerGrid) return;
    
    let draggedItem = null;
    
    // Only allow drag for custom stickers
    stickerGrid.addEventListener('dragstart', (e) => {
        const stickerItem = e.target.closest('.sticker-item');
        if (!stickerItem) return;
        
        const stickerId = stickerItem.getAttribute('data-id');
        const sticker = getStickerById(stickerId);
        
        if (sticker?.custom) {
            draggedItem = stickerItem;
            e.dataTransfer.setData('text/plain', stickerId);
            stickerItem.classList.add('dragging');
        } else {
            e.preventDefault(); // Don't allow drag for non-custom stickers
        }
    });
    
    stickerGrid.addEventListener('dragend', (e) => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    });
    
    stickerGrid.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = getDragAfterElement(stickerGrid, e.clientY);
        const draggable = document.querySelector('.dragging');
        
        if (draggable && afterElement) {
            stickerGrid.insertBefore(draggable, afterElement);
        }
    });
    
    stickerGrid.addEventListener('drop', (e) => {
        e.preventDefault();
        const stickerId = e.dataTransfer.getData('text/plain');
        
        // Reorder custom stickers array based on new position
        reorderCustomStickers();
    });
}

// Get element after which to insert dragged item
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sticker-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Reorder custom stickers
function reorderCustomStickers() {
    const stickerGrid = document.getElementById('stickerGrid');
    if (!stickerGrid) return;
    
    const stickerItems = [...stickerGrid.querySelectorAll('.sticker-item[data-type="image"]')];
    const newOrder = [];
    
    stickerItems.forEach(item => {
        const stickerId = item.getAttribute('data-id');
        const sticker = getStickerById(stickerId);
        if (sticker?.custom) {
            newOrder.push(sticker);
        }
    });
    
    // Update custom stickers array
    customStickers = newOrder.filter(sticker => sticker.custom);
    saveCustomStickers();
    
    showToast('Stickers reordered', 'info');
}

// Get sticker by ID
export function getStickerById(stickerId) {
    return stickers.find(s => s.id === stickerId);
}

// Add custom sticker
export function addCustomSticker(stickerData) {
    const sticker = {
        id: generateUniqueId(),
        ...stickerData,
        category: 'custom',
        type: 'image',
        custom: true,
        timestamp: Date.now()
    };
    
    customStickers.push(sticker);
    stickers.push(sticker);
    
    saveCustomStickers();
    
    // Update UI if custom category is active
    if (currentCategory === 'custom' || currentCategory === 'all') {
        loadStickersByCategory(currentCategory);
    }
    
    return sticker;
}

// Delete custom sticker
export function deleteCustomSticker(stickerId) {
    const index = customStickers.findIndex(s => s.id === stickerId);
    if (index === -1) return false;
    
    // Remove from customStickers
    const [deletedSticker] = customStickers.splice(index, 1);
    
    // Remove from stickers array
    const stickerIndex = stickers.findIndex(s => s.id === stickerId);
    if (stickerIndex !== -1) {
        stickers.splice(stickerIndex, 1);
    }
    
    // Revoke blob URL if exists
    if (deletedSticker.url && deletedSticker.url.startsWith('blob:')) {
        URL.revokeObjectURL(deletedSticker.url);
    }
    
    saveCustomStickers();
    
    // Update UI
    if (currentCategory === 'custom' || currentCategory === 'all') {
        loadStickersByCategory(currentCategory);
    }
    
    showToast('Sticker deleted', 'info');
    return true;
}

// Export stickers
export function exportStickers() {
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        stickerCount: customStickers.length,
        stickers: customStickers.map(s => ({
            name: s.name,
            url: s.url,
            timestamp: s.timestamp
        }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shome_stickers_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Stickers exported successfully', 'success');
}

// Import stickers
export async function importStickers(file) {
    if (!file.type.includes('json')) {
        showToast('Please upload a JSON file', 'error');
        return;
    }
    
    showLoading('Importing stickers...');
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.stickers || !Array.isArray(data.stickers)) {
            throw new Error('Invalid sticker file format');
        }
        
        let importedCount = 0;
        
        for (const stickerData of data.stickers) {
            try {
                // Fetch image from URL
                const response = await fetch(stickerData.url);
                if (!response.ok) continue;
                
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const sticker = {
                    id: generateUniqueId(),
                    name: stickerData.name || 'Imported Sticker',
                    url: blobUrl,
                    blob: blob,
                    timestamp: stickerData.timestamp || Date.now(),
                    custom: true
                };
                
                customStickers.push(sticker);
                stickers.push({
                    ...sticker,
                    category: 'custom',
                    type: 'image'
                });
                
                importedCount++;
            } catch (error) {
                console.error('Error importing sticker:', error);
            }
        }
        
        saveCustomStickers();
        
        // Update UI
        if (currentCategory === 'custom' || currentCategory === 'all') {
            loadStickersByCategory(currentCategory);
        }
        
        showToast(`Imported ${importedCount} stickers`, 'success');
        
    } catch (error) {
        console.error('Error importing stickers:', error);
        showToast('Failed to import stickers', 'error');
    } finally {
        hideLoading();
    }
}

// Search stickers
export function searchStickers(query) {
    if (!query.trim()) {
        loadStickersByCategory(currentCategory);
        return;
    }
    
    const stickerGrid = document.getElementById('stickerGrid');
    if (!stickerGrid) return;
    
    const filteredStickers = stickers.filter(sticker => {
        const nameMatch = sticker.name?.toLowerCase().includes(query.toLowerCase());
        const categoryMatch = sticker.category?.toLowerCase().includes(query.toLowerCase());
        
        return nameMatch || categoryMatch;
    });
    
    if (filteredStickers.length === 0) {
        stickerGrid.innerHTML = `
            <div class="empty-stickers">
                <i class="fas fa-search"></i>
                <h4>No matching stickers</h4>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }
    
      // Render filtered stickers
    stickerGrid.innerHTML = filteredStickers.map(sticker => {
        if (sticker.type === 'emoji') {
            return `
                <div class="sticker-item emoji-sticker" 
                     data-id="${sticker.id}" 
                     data-type="emoji"
                     data-content="${sticker.emoji}"
                     title="${sticker.name}">
                    <span class="sticker-emoji">${sticker.emoji}</span>
                </div>
            `;
        } else {
            return `
                <div class="sticker-item image-sticker" 
                     data-id="${sticker.id}" 
                     data-type="image"
                     data-url="${sticker.url}"
                     title="${sticker.name}">
                    <img src="${sticker.url}" alt="${sticker.name}" loading="lazy">
                </div>
            `;
        }
    }).join('');
}

// Get sticker categories
export function getStickerCategories() {
    return [...categories];
}

// Get stickers by category
export function getStickersByCategory(category) {
    if (category === 'all') return [...stickers];
    return stickers.filter(s => s.category === category);
}

// Show loading
function showLoading(message = 'Loading...') {
    // Implement loading state
    const stickerGrid = document.getElementById('stickerGrid');
    if (stickerGrid) {
        stickerGrid.innerHTML = `
            <div class="sticker-loading">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

// Hide loading
function hideLoading() {
    // Loading state will be replaced when stickers are rendered
}

// Sticker library styles
const stickerLibraryStyles = `
    .sticker-item {
        transition: all 0.2s ease;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: var(--border-radius-sm);
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .sticker-item:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10;
    }
    
    .sticker-item.dragging {
        opacity: 0.5;
        cursor: grabbing;
    }
    
    .emoji-sticker {
        font-size: 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .sticker-emoji {
        display: block;
        text-align: center;
    }
    
    .image-sticker img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 8px;
    }
    
    .empty-stickers, .sticker-loading {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-light);
    }
    
    .empty-stickers i, .sticker-loading i {
        font-size: 48px;
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
    }
    
    .sticker-loading .loading-spinner {
        margin: 0 auto var(--spacing-md);
    }
    
    .sticker-categories {
        padding: var(--spacing-md) var(--spacing-lg);
        border-bottom: 1px solid var(--modal-border);
        display: flex;
        gap: var(--spacing-sm);
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    .category-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(0, 0, 0, 0.05);
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
        transition: all 0.2s;
        color: var(--text-color);
    }
    
    .category-btn:hover {
        background: rgba(0, 0, 0, 0.1);
    }
    
    .category-btn.active {
        background: var(--primary-color);
        color: white;
    }
    
    .sticker-grid {
        flex: 1;
        padding: var(--spacing-lg);
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: var(--spacing-md);
        overflow-y: auto;
    }
    
    .sticker-footer {
        padding: var(--spacing-lg);
        border-top: 1px solid var(--modal-border);
        display: flex;
        justify-content: center;
    }
    
    @media (prefers-color-scheme: dark) {
        .sticker-item {
            background: #2d2d2d;
        }
        
        .category-btn {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .category-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .emoji-sticker {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
    }
    
    @media (max-width: 480px) {
        .sticker-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        }
        
        .emoji-sticker {
            font-size: 24px;
        }
    }
`;

// Add styles to document
const stickerStyleSheet = document.createElement('style');
stickerStyleSheet.textContent = stickerLibraryStyles;
document.head.appendChild(stickerStyleSheet);