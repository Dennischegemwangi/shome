// modules/cloudStorage.js
// modules/cloudStorage.js - CORRECTED IMPORTS
import { 
    showToast, 
    generateUniqueId, 
    formatFileSize, 
    formatTime,
    //showLoading,
   // hideLoading 
} from './utils.js';

let cloudMemes = [];
let cloudStorage = {
    used: 0, // in GB
    total: 5, // 5 GB free tier
    lastSync: null,
    isSyncing: false
};

// Initialize cloud storage
export function initCloudStorage() {
    console.log('✅ Cloud storage initialized');

    // Load cloud data
    loadCloudData();

    // Set up cloud storage UI
    setupCloudStorageUI();

    // Set up automatic sync
    setupAutoSync();
}

// Load cloud data from localStorage
function loadCloudData() {
    try {
        const savedMemes = localStorage.getItem('shome_cloud_memes');
        if (savedMemes) {
            cloudMemes = JSON.parse(savedMemes);
        }

        const savedStorage = localStorage.getItem('shome_cloud_storage');
        if (savedStorage) {
            Object.assign(cloudStorage, JSON.parse(savedStorage));
        }

        // Calculate used storage
        calculateUsedStorage();

    } catch (error) {
        console.error('Error loading cloud data:', error);
        cloudMemes = [];
        cloudStorage = {
            used: 0,
            total: 5,
            lastSync: null,
            isSyncing: false
        };
    }
}

// Save cloud data to localStorage
function saveCloudData() {
    try {
        localStorage.setItem('shome_cloud_memes', JSON.stringify(cloudMemes));
        localStorage.setItem('shome_cloud_storage', JSON.stringify(cloudStorage));
    } catch (error) {
        console.error('Error saving cloud data:', error);
    }
}

// Calculate used storage
function calculateUsedStorage() {
    // Estimate storage usage (in GB)
    // Each meme is roughly 0.001 GB (1MB)
    cloudStorage.used = (cloudMemes.length * 0.001).toFixed(3);
}

// Set up cloud storage UI
function setupCloudStorageUI() {
    const cloudModal = document.getElementById('cloudModal');
    const closeCloudBtn = document.getElementById('closeCloud');
    const openCloudModalBtn = document.getElementById('openCloudModal');
    const syncNowBtn = document.getElementById('syncNowBtn');
    const uploadToCloudBtn = document.getElementById('uploadToCloudBtn');
    const manageStorageBtn = document.getElementById('manageStorageBtn');

    if (!cloudModal) return;

    // Close button
    if (closeCloudBtn) {
        closeCloudBtn.addEventListener('click', () => {
            cloudModal.classList.remove('active');
        });
    }

    // Open modal from create tab
    if (openCloudModalBtn) {
        openCloudModalBtn.addEventListener('click', () => {
            cloudModal.classList.add('active');
            loadCloudMemes();
            updateCloudStats();
        });
    }

    // Open modal from header (if exists)
    const cloudMenuBtn = document.getElementById('cloudMenuBtn');
    if (cloudMenuBtn) {
        cloudMenuBtn.addEventListener('click', () => {
            cloudModal.classList.add('active');
            loadCloudMemes();
            updateCloudStats();
        });
    }

    // Sync now button
    if (syncNowBtn) {
        syncNowBtn.addEventListener('click', syncWithCloud);
    }

    // Upload current meme button
    if (uploadToCloudBtn) {
        uploadToCloudBtn.addEventListener('click', uploadCurrentToCloud);
    }

    // Manage storage button
    if (manageStorageBtn) {
        manageStorageBtn.addEventListener('click', manageStorage);
    }

    // Set up cloud memes grid
    setupCloudMemesGrid();
}

// Set up cloud memes grid
function setupCloudMemesGrid() {
    const cloudMemesGrid = document.getElementById('cloudMemes');
    if (!cloudMemesGrid) return;

    // Will be populated when loading memes
}

// Update cloud stats in UI
function updateCloudStats() {
    const usedStorageEl = document.getElementById('usedStorage');
    const memeCountEl = document.getElementById('memeCount');
    const lastSyncEl = document.getElementById('lastSync');

    if (usedStorageEl) {
        usedStorageEl.textContent = `${cloudStorage.used} GB`;
    }

    if (memeCountEl) {
        memeCountEl.textContent = cloudMemes.length;
    }

    if (lastSyncEl && cloudStorage.lastSync) {
        lastSyncEl.textContent = formatTime(cloudStorage.lastSync);
    }

    // Update storage bar
    updateStorageBar();
}

// Update storage bar
function updateStorageBar() {
    const storageBar = document.querySelector('.storage-bar');
    if (!storageBar) return;

    const percentage = (cloudStorage.used / cloudStorage.total) * 100;
    storageBar.style.width = `${Math.min(percentage, 100)}%`;

    // Update color based on usage
    if (percentage > 90) {
        storageBar.style.background = '#ff4444';
    } else if (percentage > 70) {
        storageBar.style.background = '#FF9800';
    } else {
        storageBar.style.background = 'var(--primary-color)';
    }
}

// Set up auto sync
function setupAutoSync() {
    // Sync every 5 minutes if online
    setInterval(() => {
        if (navigator.onLine && !cloudStorage.isSyncing) {
            syncWithCloud();
        }
    }, 5 * 60 * 1000);

    // Sync when coming online
    window.addEventListener('online', () => {
        if (!cloudStorage.isSyncing) {
            syncWithCloud();
        }
    });
}

// Sync with cloud
export async function syncWithCloud() {
    if (cloudStorage.isSyncing) {
        showToast('Sync already in progress', 'info');
        return;
    }

    cloudStorage.isSyncing = true;
    showLoading('Syncing with cloud...');

    try {
        // In a real app, this would sync with a backend server
        // For demo, we'll simulate sync with localStorage

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update last sync time
        cloudStorage.lastSync = Date.now();

        // Save to localStorage (simulating cloud save)
        saveCloudData();

        // Update UI
        updateCloudStats();

        showToast('Cloud sync completed', 'success');

    } catch (error) {
        console.error('Error syncing with cloud:', error);
        showToast('Sync failed', 'error');
    } finally {
        cloudStorage.isSyncing = false;
        hideLoading();
    }
}

// Upload current meme to cloud
export async function uploadToCloud(memeData) {
    if (!memeData) {
        showToast('No meme to upload', 'error');
        return false;
    }

    // Check storage limit
    const estimatedSize = memeData.dataUrl.length * 0.000000001; // Rough estimate in GB
    if (cloudStorage.used + estimatedSize > cloudStorage.total) {
        showToast('Cloud storage full. Upgrade plan or delete old memes.', 'error');
        return false;
    }

    showLoading('Uploading to cloud...');

    try {
        // Create cloud meme object
        const cloudMeme = {
            id: generateUniqueId(),
            ...memeData,
            uploadedAt: Date.now(),
            lastModified: Date.now(),
            version: 1,
            tags: memeData.tags || [],
            isPublic: false,
            views: 0,
            downloads: 0
        };

        // Add to cloud memes
        cloudMemes.unshift(cloudMeme); // Add to beginning

        // Update storage usage
        cloudStorage.used = parseFloat((cloudStorage.used + estimatedSize).toFixed(3));
        cloudStorage.lastSync = Date.now();

        // Save to cloud
        await syncWithCloud();

        // Update UI
        updateCloudStats();

        showToast('Meme uploaded to cloud!', 'success');
        return cloudMeme;

    } catch (error) {
        console.error('Error uploading to cloud:', error);
        showToast('Upload failed', 'error');
        return false;
    } finally {
        hideLoading();
    }
}

// Upload current canvas to cloud
async function uploadCurrentToCloud() {
    // Get canvas data from meme editor
    const canvas = document.getElementById('memeCanvas');
    if (!canvas) {
        showToast('No meme to upload', 'error');
        return;
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    const memeData = {
        dataUrl: dataUrl,
        timestamp: Date.now(),
        title: 'Untitled Meme',
        description: 'Created with Shome Meme App',
        tags: ['meme', 'shome']
    };

    await uploadToCloud(memeData);
}

// Load cloud memes
export async function loadCloudMemes() {
    const cloudMemesGrid = document.getElementById('cloudMemes');
    const cloudPreviewGrid = document.getElementById('cloudPreviewGrid');

    if (!cloudMemesGrid && !cloudPreviewGrid) return;

    if (cloudMemes.length === 0) {
        const emptyHtml = `
            <div class="empty-cloud">
                <i class="fas fa-cloud"></i>
                <h4>No cloud memes yet</h4>
                <p>Your memes saved to cloud will appear here</p>
            </div>
        `;

        if (cloudMemesGrid) cloudMemesGrid.innerHTML = emptyHtml;
        if (cloudPreviewGrid) cloudPreviewGrid.innerHTML = '';
        return;
    }

    // Render meme grid
    const memeHtml = cloudMemes.slice(0, 12).map(meme => `
        <div class="cloud-meme-item" data-id="${meme.id}">
            <img src="${meme.dataUrl}" alt="Cloud meme" loading="lazy">
            <div class="cloud-meme-overlay">
                <div class="cloud-meme-actions">
                    <button class="cloud-action download-meme" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="cloud-action share-meme" title="Share">
                        <i class="fas fa-share"></i>
                    </button>
                    <button class="cloud-action delete-meme" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cloud-meme-info">
                    <small>${formatTime(meme.uploadedAt)}</small>
                </div>
            </div>
        </div>
    `).join('');

    if (cloudMemesGrid) cloudMemesGrid.innerHTML = memeHtml;

    // Render preview grid (first 6 memes)
    const previewHtml = cloudMemes.slice(0, 6).map(meme => `
        <div class="cloud-preview-item" data-id="${meme.id}">
            <img src="${meme.dataUrl}" alt="Cloud meme" loading="lazy">
        </div>
    `).join('');

    if (cloudPreviewGrid) cloudPreviewGrid.innerHTML = previewHtml;

    // Add event listeners
    setupCloudMemeInteractions();
}

// Set up cloud meme interactions
function setupCloudMemeInteractions() {
    const cloudMemesGrid = document.getElementById('cloudMemes');
    if (!cloudMemesGrid) return;

    cloudMemesGrid.addEventListener('click', (e) => {
        const memeItem = e.target.closest('.cloud-meme-item');
        if (!memeItem) return;

        const memeId = memeItem.getAttribute('data-id');
        const meme = cloudMemes.find(m => m.id === memeId);
        if (!meme) return;

        // Handle action buttons
        if (e.target.closest('.download-meme')) {
            e.stopPropagation();
            downloadCloudMeme(meme);
        } else if (e.target.closest('.share-meme')) {
            e.stopPropagation();
            shareCloudMeme(meme);
        } else if (e.target.closest('.delete-meme')) {
            e.stopPropagation();
            deleteCloudMeme(memeId, memeItem);
        } else {
            // Open meme viewer
            openCloudMemeViewer(meme);
        }
    });
}

// Download cloud meme
async function downloadCloudMeme(meme) {
    showLoading('Preparing download...');

    try {
        // Convert data URL to blob
        const response = await fetch(meme.dataUrl);
        const blob = await response.blob();

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shome_meme_${meme.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Update download count
        meme.downloads = (meme.downloads || 0) + 1;
        saveCloudData();

        showToast('Meme downloaded', 'success');

    } catch (error) {
        console.error('Error downloading meme:', error);
        showToast('Download failed', 'error');
    } finally {
        hideLoading();
    }
}

// Share cloud meme
async function shareCloudMeme(meme) {
    try {
        // Convert data URL to blob for sharing
        const response = await fetch(meme.dataUrl);
        const blob = await response.blob();

        const filesArray = [
            new File([blob], `shome_meme_${meme.id}.jpg`, {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
            })
        ];

        const shareData = {
            files: filesArray,
            title: meme.title || 'Shome Meme',
            text: meme.description || 'Check out this meme!'
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);

            // Update share count
            meme.shares = (meme.shares || 0) + 1;
            saveCloudData();

        } else {
            // Fallback to copy link
            const shareLink = `${window.location.origin}/meme/${meme.id}`;
            await navigator.clipboard.writeText(shareLink);
            showToast('Link copied to clipboard', 'success');
        }

    } catch (error) {
        console.error('Error sharing meme:', error);
        showToast('Share failed', 'error');
    }
}

// Delete cloud meme
async function deleteCloudMeme(memeId, memeElement) {
    if (!confirm('Delete this meme from cloud? This action cannot be undone.')) {
        return;
    }

    showLoading('Deleting meme...');

    try {
        // Find meme
        const memeIndex = cloudMemes.findIndex(m => m.id === memeId);
        if (memeIndex === -1) {
            throw new Error('Meme not found');
        }

        // Remove from array
        const [deletedMeme] = cloudMemes.splice(memeIndex, 1);

        // Update storage usage
        const estimatedSize = deletedMeme.dataUrl.length * 0.000000001;
        cloudStorage.used = Math.max(0, cloudStorage.used - estimatedSize);

        // Save changes
        saveCloudData();

        // Remove from UI
        if (memeElement) {
            memeElement.remove();
        }

        // Reload memes if empty
        if (cloudMemes.length === 0) {
            loadCloudMemes();
        }

        updateCloudStats();

        showToast('Meme deleted from cloud', 'info');

    } catch (error) {
        console.error('Error deleting meme:', error);
        showToast('Delete failed', 'error');
    } finally {
        hideLoading();
    }
}

// Open cloud meme viewer
function openCloudMemeViewer(meme) {
    // Create modal for viewing meme
    const viewerModal = document.createElement('div');
    viewerModal.className = 'cloud-viewer-modal active';

    viewerModal.innerHTML = `
        <div class="cloud-viewer-content">
            <div class="cloud-viewer-header">
                <h3>${meme.title || 'Cloud Meme'}</h3>
                <button class="close-viewer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cloud-viewer-body">
                <img src="${meme.dataUrl}" alt="${meme.title || 'Meme'}" class="viewer-image">
                <div class="cloud-viewer-info">
                    <div class="info-item">
                        <strong>Uploaded:</strong>
                        <span>${formatTime(meme.uploadedAt)}</span>
                    </div>
                    <div class="info-item">
                        <strong>Size:</strong>
                        <span>${formatFileSize(meme.dataUrl.length * 0.75)}</span>
                    </div>
                    <div class="info-item">
                        <strong>Views:</strong>
                        <span>${meme.views || 0}</span>
                    </div>
                    <div class="info-item">
                        <strong>Downloads:</strong>
                        <span>${meme.downloads || 0}</span>
                    </div>
                    ${meme.tags?.length ? `
                    <div class="info-item">
                        <strong>Tags:</strong>
                        <div class="tag-list">
                            ${meme.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${meme.description ? `
                    <div class="info-item">
                        <strong>Description:</strong>
                        <p>${meme.description}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="cloud-viewer-footer">
                <button class="action-btn secondary download-viewer">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="action-btn secondary share-viewer">
                    <i class="fas fa-share"></i> Share
                </button>
                <button class="action-btn edit-meme">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(viewerModal);

    // Update view count
    meme.views = (meme.views || 0) + 1;
    saveCloudData();

    // Set up event listeners
    const closeBtn = viewerModal.querySelector('.close-viewer');
    const downloadBtn = viewerModal.querySelector('.download-viewer');
    const shareBtn = viewerModal.querySelector('.share-viewer');
    const editBtn = viewerModal.querySelector('.edit-meme');

    closeBtn.addEventListener('click', () => {
        viewerModal.remove();
    });

    downloadBtn.addEventListener('click', () => {
        downloadCloudMeme(meme);
    });

    shareBtn.addEventListener('click', () => {
        shareCloudMeme(meme);
    });

    editBtn.addEventListener('click', () => {
        editCloudMeme(meme);
        viewerModal.remove();
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            viewerModal.remove();
        }
    });

    // Close on background click
    viewerModal.addEventListener('click', (e) => {
        if (e.target === viewerModal) {
            viewerModal.remove();
        }
    });
}

// Edit cloud meme
function editCloudMeme(meme) {
    // Load meme into editor
    const event = new CustomEvent('loadMemeIntoEditor', {
        detail: {
            meme
        }
    });
    document.dispatchEvent(event);

    // Close cloud modal if open
    document.getElementById('cloudModal')?.classList.remove('active');

    // Open meme editor
    document.getElementById('memeEditorModal').classList.add('active');

    showToast('Meme loaded into editor', 'success');
}

// Manage storage
function manageStorage() {
    // Create storage management modal
    const storageModal = document.createElement('div');
    storageModal.className = 'storage-management-modal active';

    const usedPercentage = (cloudStorage.used / cloudStorage.total) * 100;

    storageModal.innerHTML = `
        <div class="storage-management-content">
            <div class="storage-management-header">
                <h3>Storage Management</h3>
                <button class="close-storage-management">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="storage-stats">
                <div class="storage-progress">
                    <div class="storage-progress-bar" style="width: ${usedPercentage}%"></div>
                </div>
                <div class="storage-numbers">
                    <span>${cloudStorage.used} GB used</span>
                    <span>${cloudStorage.total - cloudStorage.used} GB free</span>
                    <span>${cloudStorage.total} GB total</span>
                </div>
            </div>
            <div class="storage-actions">
                <button class="action-btn clear-cache">
                    <i class="fas fa-broom"></i> Clear Cache
                </button>
                <button class="action-btn export-data">
                    <i class="fas fa-file-export"></i> Export Data
                </button>
                <button class="action-btn upgrade-storage">
                    <i class="fas fa-arrow-up"></i> Upgrade Storage
                </button>
            </div>
            <div class="large-files">
                <h4>Large Files</h4>
                <div class="files-list">
                    ${cloudMemes
                        .sort((a, b) => b.dataUrl.length - a.dataUrl.length)
                        .slice(0, 5)
                        .map(meme => `
                            <div class="large-file-item" data-id="${meme.id}">
                                <img src="${meme.dataUrl}" alt="Meme">
                                <div class="file-info">
                                    <span>${formatFileSize(meme.dataUrl.length * 0.75)}</span>
                                    <button class="delete-file" data-id="${meme.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(storageModal);

    // Set up event listeners
    const closeBtn = storageModal.querySelector('.close-storage-management');
    const clearCacheBtn = storageModal.querySelector('.clear-cache');
    const exportBtn = storageModal.querySelector('.export-data');
    const upgradeBtn = storageModal.querySelector('.upgrade-storage');

    closeBtn.addEventListener('click', () => {
        storageModal.remove();
    });

    clearCacheBtn.addEventListener('click', clearCache);
    exportBtn.addEventListener('click', exportCloudData);
    upgradeBtn.addEventListener('click', upgradeStorage);

    // Delete file buttons
    storageModal.querySelectorAll('.delete-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const memeId = btn.getAttribute('data-id');
            const fileItem = btn.closest('.large-file-item');
            deleteCloudMeme(memeId, fileItem);
        });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            storageModal.remove();
        }
    });

    // Close on background click
    storageModal.addEventListener('click', (e) => {
        if (e.target === storageModal) {
            storageModal.remove();
        }
    });
}

// Clear cache
async function clearCache() {
    if (!confirm('Clear all cached data? This will not delete your cloud memes.')) {
        return;
    }

    showLoading('Clearing cache...');

    try {
        // Clear localStorage items that aren't cloud data
        const keysToKeep = ['shome_cloud_memes', 'shome_cloud_storage'];
        const keys = Object.keys(localStorage);

        for (const key of keys) {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        }

        // Clear session storage
        sessionStorage.clear();

        // Clear IndexedDB if needed

        showToast('Cache cleared successfully', 'success');

    } catch (error) {
        console.error('Error clearing cache:', error);
        showToast('Failed to clear cache', 'error');
    } finally {
        hideLoading();
    }
}

// Export cloud data
async function exportCloudData() {
    showLoading('Preparing export...');

    try {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            memes: cloudMemes.map(meme => ({
                id: meme.id,
                title: meme.title,
                description: meme.description,
                tags: meme.tags,
                uploadedAt: meme.uploadedAt,
                dataUrl: meme.dataUrl.substring(0, 100) + '...' // Truncate for demo
            })),
            storage: cloudStorage
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {
            type: 'application/json'
        });

        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shome_cloud_backup_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Data exported successfully', 'success');

    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Export failed', 'error');
    } finally {
        hideLoading();
    }
}

// Upgrade storage
function upgradeStorage() {
    // In a real app, this would open a payment/upgrade modal
    // For demo, show upgrade options
    const upgradeModal = document.createElement('div');
    upgradeModal.className = 'upgrade-modal active';

    upgradeModal.innerHTML = `
        <div class="upgrade-content">
            <div class="upgrade-header">
                <h3>Upgrade Storage</h3>
                <button class="close-upgrade">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="upgrade-options">
                <div class="upgrade-option">
                    <h4>Free</h4>
                    <div class="storage-size">5 GB</div>
                    <div class="price">$0/month</div>
                    <button class="action-btn current">Current Plan</button>
                </div>
                <div class="upgrade-option recommended">
                    <div class="recommended-badge">Most Popular</div>
                    <h4>Pro</h4>
                    <div class="storage-size">50 GB</div>
                    <div class="price">$4.99/month</div>
                    <button class="action-btn primary">Upgrade</button>
                </div>
                <div class="upgrade-option">
                    <h4>Ultimate</h4>
                    <div class="storage-size">200 GB</div>
                    <div class="price">$9.99/month</div>
                    <button class="action-btn primary">Upgrade</button>
                </div>
            </div>
            <div class="upgrade-features">
                <h4>Pro Features:</h4>
                <ul>
                    <li><i class="fas fa-check"></i> 50 GB Storage</li>
                    <li><i class="fas fa-check"></i> Priority Support</li>
                    <li><i class="fas fa-check"></i> Advanced Analytics</li>
                    <li><i class="fas fa-check"></i> No Watermarks</li>
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(upgradeModal);

    // Set up event listeners
    const closeBtn = upgradeModal.querySelector('.close-upgrade');
    const upgradeBtns = upgradeModal.querySelectorAll('.action-btn.primary');

    closeBtn.addEventListener('click', () => {
        upgradeModal.remove();
    });

    upgradeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Upgrade functionality would open payment modal', 'info');
            // In production, implement payment processing
        });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            upgradeModal.remove();
        }
    });

    // Close on background click
    upgradeModal.addEventListener('click', (e) => {
        if (e.target === upgradeModal) {
            upgradeModal.remove();
        }
    });
}

// Get cloud stats
export function getCloudStats() {
    return {
        ...cloudStorage,
        memeCount: cloudMemes.length,
        lastSync: cloudStorage.lastSync
    };
}

// Get cloud memes
export function getCloudMemes() {
    return [...cloudMemes];
}

// Search cloud memes
export function searchCloudMemes(query) {
    if (!query.trim()) return cloudMemes;

    return cloudMemes.filter(meme => {
        const titleMatch = meme.title?.toLowerCase().includes(query.toLowerCase());
        const descMatch = meme.description?.toLowerCase().includes(query.toLowerCase());
        const tagMatch = meme.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        return titleMatch || descMatch || tagMatch;
    });
}

// Show loading
function showLoading(message = 'Loading...') {
    // Implement loading state
    const loadingEl = document.createElement('div');
    loadingEl.className = 'cloud-loading';
    loadingEl.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;

    document.body.appendChild(loadingEl);
}

// Hide loading
function hideLoading() {
    const loadingEl = document.querySelector('.cloud-loading');
    if (loadingEl) {
        loadingEl.remove();
    }
}

// Cloud storage styles
const cloudStorageStyles = `
    .cloud-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
        background: var(--modal-bg);
        padding: var(--spacing-lg);
        border-radius: var(--border-radius);
        box-shadow: var(--card-shadow);
    }
    
    .cloud-stat {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
    }
    
    .cloud-stat i {
        font-size: 32px;
        color: var(--primary-color);
        width: 60px;
        height: 60px;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .stat-info {
        display: flex;
        flex-direction: column;
    }
    
    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-color);
    }
    
    .stat-label {
        font-size: 14px;
        color: var(--text-light);
    }
    
    .cloud-actions {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }
    
    .cloud-action-btn {
        flex: 1;
        padding: var(--spacing-md);
        background: #f0f0f0;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        transition: all 0.2s;
        min-width: 150px;
    }
    
    .cloud-action-btn:hover {
        background: #e0e0e0;
        transform: translateY(-1px);
    }
    
    .cloud-memes {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--spacing-md);
    }
    
    .cloud-meme-item {
        aspect-ratio: 1;
        background: #f0f0f0;
        border-radius: var(--border-radius-sm);
        overflow: hidden;
        position: relative;
        cursor: pointer;
    }
    
    .cloud-meme-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }
    
    .cloud-meme-item:hover img {
        transform: scale(1.05);
    }
    
    .cloud-meme-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.5) 30%,
            transparent 50%,
            transparent 70%,
            rgba(0, 0, 0, 0.7) 100%
        );
        opacity: 0;
        transition: opacity 0.3s;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: var(--spacing-sm);
    }
    
    .cloud-meme-item:hover .cloud-meme-overlay {
        opacity: 1;
    }
    
    .cloud-meme-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-xs);
    }
    
    .cloud-action {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.2s;
    }
    
    .cloud-action:hover {
        background: white;
        transform: scale(1.1);
    }
    
    .cloud-meme-info {
        color: white;
        font-size: 11px;
        text-align: center;
    }
    
    .empty-cloud {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-light);
    }
    
    .empty-cloud i {
        font-size: 48px;
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
    }
    
    .empty-cloud h4 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 18px;
        color: var(--text-color);
    }
    
    .empty-cloud p {
        margin: 0;
        font-size: 14px;
    }
    
    .cloud-preview-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
    }
    
    @media (min-width: 480px) {
        .cloud-preview-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    
    .cloud-preview-item {
        aspect-ratio: 1;
        background: #f0f0f0;
        border-radius: var(--border-radius-sm);
        overflow: hidden;
        cursor: pointer;
    }
    
    .cloud-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }
    
    .cloud-preview-item:hover img {
        transform: scale(1.05);
    }
    
    /* Cloud Viewer Modal */
    .cloud-viewer-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-md);
    }
    
    .cloud-viewer-content {
        background: var(--modal-bg);
        border-radius: var(--border-radius);
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .cloud-viewer-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--modal-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .cloud-viewer-body {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }
    
    .viewer-image {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
        border-radius: var(--border-radius-sm);
        align-self: center;
    }
    
    .cloud-viewer-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .info-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }
    
    .info-item strong {
        font-size: 14px;
        color: var(--text-light);
    }
    
    .info-item span, .info-item p {
        font-size: 16px;
        color: var(--text-color);
    }
    
    .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
    }
    
    .tag {
        background: rgba(76, 175, 80, 0.1);
        color: var(--primary-color);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
    }
    
    .cloud-viewer-footer {
        padding: var(--spacing-lg);
        border-top: 1px solid var(--modal-border);
        display: flex;
        gap: var(--spacing-sm);
    }
    
    /* Storage Management Modal */
    .storage-management-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-md);
    }
    
    .storage-management-content {
        background: var(--modal-bg);
        border-radius: var(--border-radius);
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .storage-management-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--modal-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .storage-stats {
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .storage-progress {
        height: 8px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        overflow: hidden;
    }
    
    .storage-progress-bar {
        height: 100%;
        background: var(--primary-color);
        border-radius: 4px;
        transition: width 0.3s;
    }
    
    .storage-numbers {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: var(--text-light);
    }
    
    .storage-actions {
        padding: 0 var(--spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }
    
    .large-files {
        padding: var(--spacing-lg);
        border-top: 1px solid var(--modal-border);
    }
    
    .large-files h4 {
        margin: 0 0 var(--spacing-md) 0;
        font-size: 16px;
    }
    
    .files-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }
    
    .large-file-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-sm);
        background: rgba(0, 0, 0, 0.05);
        border-radius: var(--border-radius-sm);
    }
    
    .large-file-item img {
        width: 40px;
        height: 40px;
        border-radius: var(--border-radius-sm);
        object-fit: cover;
    }
    
    .file-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .delete-file {
        background: none;
        border: none;
        color: var(--text-light);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: 50%;
    }
    
    .delete-file:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #ff4444;
    }
    
    /* Upgrade Modal */
    .upgrade-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-md);
    }
    .upgrade-content {
        background: var(--modal-bg);
        border-radius: var(--border-radius);
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .upgrade-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--modal-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .upgrade-options {
        padding: var(--spacing-lg);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
    }
    
    .upgrade-option {
        background: var(--modal-bg);
        border: 2px solid var(--modal-border);
        border-radius: var(--border-radius);
        padding: var(--spacing-lg);
        text-align: center;
        position: relative;
        transition: all 0.3s;
    }
    
    .upgrade-option:hover {
        border-color: var(--primary-color);
        transform: translateY(-4px);
    }
    
    .upgrade-option.recommended {
        border-color: var(--primary-color);
        background: rgba(76, 175, 80, 0.05);
    }
    
    .recommended-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .storage-size {
        font-size: 24px;
        font-weight: 700;
        margin: var(--spacing-md) 0;
        color: var(--text-color);
    }
    
    .price {
        font-size: 18px;
        color: var(--text-light);
        margin-bottom: var(--spacing-lg);
    }
    
    .upgrade-features {
        padding: var(--spacing-lg);
        border-top: 1px solid var(--modal-border);
    }
    
    .upgrade-features h4 {
        margin: 0 0 var(--spacing-md) 0;
        font-size: 16px;
    }
    
    .upgrade-features ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }
    
    .upgrade-features li {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    
    .upgrade-features i {
        color: var(--primary-color);
    }
    
    .cloud-loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 3000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    @media (prefers-color-scheme: dark) {
        .cloud-action-btn {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .cloud-action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .cloud-meme-item {
            background: #2d2d2d;
        }
        
        .large-file-item {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .delete-file:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    }
`;

// Add styles to document
const cloudStyleSheet = document.createElement('style');
cloudStyleSheet.textContent = cloudStorageStyles;
document.head.appendChild(cloudStyleSheet);