// modules/feedManager.js
//import { showToast, generateUniqueId, formatTime } from './utils.js';
// At the top of feedManager.js
//import { showToast, generateUniqueId, formatTime } from './utils.js';

// modules/feedManager.js - CORRECTED IMPORTS
import { 
    showToast, 
    generateUniqueId, 
    formatTime,
    showLoading,
    hideLoading 
} from './utils.js';

let currentPage = 1;
let isLoading = false;
let hasMore = true;
const pageSize = 10;
let infiniteScrollObserver = null;

// Initialize feed manager
export function initFeedManager() {
    console.log('✅ Feed manager initialized');
    
    // Set up infinite scroll
    setupInfiniteScroll();
    
    // Set up meme interactions
    setupMemeInteractions();
    
    // Load initial feed
    loadMoreMemes();
}

// Set up infinite scroll
// Add at the TOP of feedManager.js (with other variables)


function setupInfiniteScroll() {
    // Clean up previous observer if it exists
    if (infiniteScrollObserver) {
        infiniteScrollObserver.disconnect();
        infiniteScrollObserver = null;
        console.log('🔄 Cleaned up previous infinite scroll observer');
    }
    
    // Get the loading sentinel element
    const sentinel = document.getElementById('loading-sentinel');
    if (!sentinel) {
        console.warn('⚠️ No loading sentinel found for infinite scroll');
        return;
    }
    
    console.log('🔍 Setting up infinite scroll, observing sentinel:', sentinel);
    
    // Create new IntersectionObserver
    infiniteScrollObserver = new IntersectionObserver((entries) => {
        // Only trigger when sentinel enters viewport
        if (entries[0].isIntersecting) {
            console.log('🎯 Sentinel is intersecting viewport');
            
            // Check if we can load more content
            if (!isLoading && hasMore) {
                console.log('⬇️ Loading more memes...');
                loadMoreMemes();
            } else if (isLoading) {
                console.log('⏳ Already loading, skipping...');
            } else if (!hasMore) {
                console.log('🚫 No more content to load');
            }
        }
    }, {
        threshold: 0.1, // Trigger when 10% of sentinel is visible
        rootMargin: '50px' // Trigger 50px before reaching the bottom
    });
    
    // Start observing the sentinel
    infiniteScrollObserver.observe(sentinel);
    console.log('✅ Infinite scroll setup complete');
}

// Set up meme interactions
function setupMemeInteractions() {
    // Delegate events to feed container
    const feedContainer = document.getElementById('memeFeed');
    
    feedContainer.addEventListener('click', (e) => {
        // Upvote button
        if (e.target.closest('.upvote-btn')) {
            const card = e.target.closest('.meme-card');
            const memeId = card?.dataset.id;
            if (memeId) {
                upvoteMeme(memeId, card);
            }
        }
        
        // Comment button
        if (e.target.closest('.comment-btn')) {
            const card = e.target.closest('.meme-card');
            const memeId = card?.dataset.id;
            if (memeId) {
                showCommentModal(memeId);
            }
        }
        
        // Share button
        if (e.target.closest('.share-btn')) {
            const card = e.target.closest('.meme-card');
            const memeId = card?.dataset.id;
            if (memeId) {
                shareMeme(memeId);
            }
        }
        
        // Save button
        if (e.target.closest('.save-btn')) {
            const card = e.target.closest('.meme-card');
            const memeId = card?.dataset.id;
            if (memeId) {
                saveMeme(memeId);
            }
        }

        // More options (open menu)
        if (e.target.closest('.more-options')) {
            const card = e.target.closest('.meme-card');
            const memeId = card?.dataset.id;
            console.log('⋯ More options clicked for', memeId);
            showToast('More options clicked', 'info');
            // TODO: implement contextual menu (save, report, share, copy link)
        }
    });
}

// Load more memes
export async function loadMoreMemes() {
    if (isLoading) {
        console.log('⏳ Already loading, skipping...');
        return;
    }
    
    if (!hasMore) {
        console.log('🚫 No more content to load');
        return;
    }
    
    console.log(`⬇️ Loading page ${currentPage}...`);
    isLoading = true;
    showLoadingIndicator(true);
    
    try {
        // Fetch memes from API/local storage
        const memes = await fetchMemes(currentPage, pageSize);
        console.log(`📥 Received ${memes.length} memes`);
        
        if (memes.length === 0) {
            console.log('🏁 No more memes to load');
            hasMore = false;
            showNoMoreContent();
            return;
        }
        
        // Render memes
        renderMemes(memes);
        console.log(`🎨 Rendered ${memes.length} memes`);
        
        // Update page
        currentPage++;
        console.log(`📄 Updated to page ${currentPage}`);
        
        // Check if we have more content
        hasMore = memes.length === pageSize;
        console.log(`📊 Has more content: ${hasMore}`);
        
    } catch (error) {
        console.error('❌ Error loading memes:', error);
        showToast('Failed to load memes', 'error');
        
    } finally {
        isLoading = false;
        showLoadingIndicator(false);
        console.log('🏁 Loading completed');
    }
}

// Refresh feed
export async function refreshFeed() {
    showLoading('Refreshing feed...');
    
    try {
        console.log('🔄 Starting feed refresh...');
        
        // Clean up infinite scroll observer FIRST
        if (infiniteScrollObserver) {
            infiniteScrollObserver.disconnect();
            infiniteScrollObserver = null;
            console.log('🧹 Cleaned up infinite scroll observer');
        }
        
        // Reset state
        currentPage = 1;
        isLoading = false;
        hasMore = true;
        console.log('📊 Reset feed state:', { currentPage, isLoading, hasMore });
        
        // Clear current feed
        const feedContainer = document.getElementById('memeFeed');
        if (!feedContainer) {
            throw new Error('Feed container not found');
        }
        
        // Remove all meme cards
        const memes = feedContainer.querySelectorAll('.meme-card');
        console.log(`🗑️ Removing ${memes.length} meme cards`);
        memes.forEach(meme => meme.remove());
        
        // Remove old sentinel if exists
        const oldSentinel = document.getElementById('loading-sentinel');
        if (oldSentinel) {
            oldSentinel.remove();
            console.log('🗑️ Removed old loading sentinel');
        }
        
        // Create new sentinel element
        const newSentinel = document.createElement('div');
        newSentinel.id = 'loading-sentinel';
        newSentinel.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading more content...</p>
        `;
        
        // Append to feed container
        feedContainer.appendChild(newSentinel);
        console.log('➕ Added new loading sentinel');
        
        // Wait for DOM to update
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Set up infinite scroll with NEW sentinel
        setupInfiniteScroll();
        
        // Load fresh content
        console.log('⬇️ Loading fresh memes...');
        await loadMoreMemes();
        
        console.log('✅ Feed refresh completed successfully');
        showToast('Feed refreshed!', 'success');
        
    } catch (error) {
        console.error('❌ Feed refresh failed:', error);
        showToast('Failed to refresh feed', 'error');
        
        // IMPORTANT: Re-setup infinite scroll even if refresh fails
        setTimeout(() => {
            console.log('🔄 Re-setting up infinite scroll after error');
            setupInfiniteScroll();
        }, 100);
        
    } finally {
        // Always hide loading spinner
        console.log('🏁 Hiding loading spinner');
        hideLoading();
    }
}

// Fetch memes (mock/API)
async function fetchMemes(page, limit) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo, use mock data
    // In production, this would fetch from your API
    return generateMockMemes(limit);
}

// Generate mock memes
function generateMockMemes(count) {
    const memes = [];
    const templates = [
        'distracted_boyfriend',
        'drake_hotline',
        'two_buttons',
        'change_my_mind',
        'expanding_brain',
        'woman_yelling_cat'
    ];
    
    const users = [
        { id: 1, name: 'MemeKing', avatar: 'MK' },
        { id: 2, name: 'FunnyGuy', avatar: 'FG' },
        { id: 3, name: 'LaughMaster', avatar: 'LM' },
        { id: 4, name: 'JokeLord', avatar: 'JL' },
        { id: 5, name: 'ComedyQueen', avatar: 'CQ' }
    ];
    
    const captions = [
        'When you realize Monday is tomorrow 😭',
        'Me trying to adult like:',
        'My brain at 3 AM:',
        'When the WiFi goes down:',
        'How it feels to chew 5 gum:',
        'My social battery:',
        'Trying to explain the meme to my parents:',
        'When someone says "it\'s not that deep":',
        'My confidence vs. my abilities:',
        'The moment you post something and regret it:'
    ];
    
    for (let i = 0; i < count; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const template = templates[Math.floor(Math.random() * templates.length)];
        const likes = Math.floor(Math.random() * 1000);
        const comments = Math.floor(Math.random() * 100);
        const shares = Math.floor(Math.random() * 50);
        const isLiked = Math.random() > 0.7;
        const isSaved = Math.random() > 0.8;
        const timestamp = Date.now() - Math.floor(Math.random() * 86400000 * 7); // Within last 7 days
        
        memes.push({
            id: `meme_${generateUniqueId()}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            imageUrl: `https://picsum.photos/seed/${template}_${i}/600/400`,
            caption: captions[Math.floor(Math.random() * captions.length)],
            likes: likes,
            comments: comments,
            shares: shares,
            isLiked: isLiked,
            isSaved: isSaved,
            timestamp: timestamp,
            tags: ['funny', 'relatable', 'meme', 'viral']
        });
    }
    
    return memes;
}

// Render memes to feed
function renderMemes(memes) {
    const feedContainer = document.getElementById('memeFeed');
    if (!feedContainer) return;
    
    // Remove loading sentinel temporarily
    const sentinel = document.getElementById('loading-sentinel');
    if (sentinel) sentinel.remove();
    
    // Create meme cards
    memes.forEach(meme => {
        const memeCard = createMemeCard(meme);
        feedContainer.appendChild(memeCard);
        
        // Add fade-in animation
        setTimeout(() => {
            memeCard.classList.add('loaded');
        }, 50);
    });
    
    // Re-add loading sentinel
    if (sentinel) {
        feedContainer.appendChild(sentinel);
    }
}

// Create meme card HTML
function createMemeCard(meme) {
    const card = document.createElement('div');
    card.className = 'meme-card';
    card.dataset.id = meme.id;
    
    const timeAgo = formatTime(meme.timestamp);
    const likeIcon = meme.isLiked ? 'fas fa-heart' : 'far fa-heart';
    const saveIcon = meme.isSaved ? 'fas fa-bookmark' : 'far fa-bookmark';
    
    card.innerHTML = `
        <div class="card-header">
            <div class="user-avatar">${meme.userAvatar}</div>
            <div class="user-info">
                <strong>${meme.userName}</strong>
                <small>${timeAgo}</small>
            </div>
            <button class="more-options">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        
        <div class="meme-media-container">
            <img src="${meme.imageUrl}" 
                 alt="${meme.caption}" 
                 class="meme-image"
                 loading="lazy">
        </div>
        
        <div class="card-details">
            <p class="caption-text">${meme.caption}</p>
            <div class="meme-stats">
                <span><i class="fas fa-heart"></i> ${formatNumber(meme.likes)}</span>
                <span><i class="fas fa-comment"></i> ${formatNumber(meme.comments)}</span>
                <span><i class="fas fa-share"></i> ${formatNumber(meme.shares)}</span>
            </div>
        </div>
        
        <div class="action-bar">
            <button class="action-btn upvote-btn ${meme.isLiked ? 'active' : ''}" data-action="upvote">
                <i class="${likeIcon}"></i>
                <span class="upvote-count">${formatNumber(meme.likes)}</span>
            </button>
            
            <button class="action-btn comment-btn" data-action="comment">
                <i class="far fa-comment"></i>
                <span>Comment</span>
            </button>
            
            <button class="action-btn share-btn" data-action="share">
                <i class="fas fa-share"></i>
                <span>Share</span>
            </button>
            
            <button class="action-btn save-btn ${meme.isSaved ? 'active' : ''}" data-action="save">
                <i class="${saveIcon}"></i>
                <span>Save</span>
            </button>
        </div>
    `;
    
    return card;
}

// Upvote meme
export async function upvoteMeme(memeId, cardElement) {
    const upvoteBtn = cardElement.querySelector('.upvote-btn');
    const upvoteCount = cardElement.querySelector('.upvote-count');
    const heartIcon = cardElement.querySelector('.upvote-btn i');
    
    const isLiked = upvoteBtn.classList.contains('active');
    let currentLikes = parseInt(upvoteCount.textContent.replace(/,/g, '')) || 0;
    
    // Optimistic update
    if (isLiked) {
        // Unlike
        upvoteBtn.classList.remove('active');
        heartIcon.className = 'far fa-heart';
        upvoteCount.textContent = formatNumber(currentLikes - 1);
        
        // Animation
        upvoteBtn.classList.add('unliked');
        setTimeout(() => upvoteBtn.classList.remove('unliked'), 300);
    } else {
        // Like
        upvoteBtn.classList.add('active');
        heartIcon.className = 'fas fa-heart';
        upvoteCount.textContent = formatNumber(currentLikes + 1);
        
        // Animation
        upvoteBtn.classList.add('liked');
        setTimeout(() => upvoteBtn.classList.remove('liked'), 600);
    }
    
    try {
        // In production, send API request
        await simulateApiCall(300);
        
        // Update local storage
        updateLocalMemeLikes(memeId, !isLiked);
        
    } catch (error) {
        console.error('Error updating like:', error);
        // Revert optimistic update
        if (isLiked) {
            upvoteBtn.classList.add('active');
            heartIcon.className = 'fas fa-heart';
            upvoteCount.textContent = formatNumber(currentLikes);
        } else {
            upvoteBtn.classList.remove('active');
            heartIcon.className = 'far fa-heart';
            upvoteCount.textContent = formatNumber(currentLikes);
        }
        showToast('Failed to update like', 'error');
    }
}

// Comment on meme
export async function commentOnMeme(memeId, comment) {
    if (!comment.trim()) return;
    
    showLoading('Posting comment...');
    
    try {
        // In production, send to API
        await simulateApiCall(500);
        
        // Update local storage
        addLocalComment(memeId, {
            id: generateUniqueId(),
            userId: window.App?.state?.currentUser?.id || 'user_anonymous',
            userName: window.App?.state?.currentUser?.name || 'You',
            text: comment,
            timestamp: Date.now()
        });
        
        showToast('Comment posted!', 'success');
        
        // Update comment count in UI if visible
        updateCommentCountUI(memeId);
        
    } catch (error) {
        console.error('Error posting comment:', error);
        showToast('Failed to post comment', 'error');
    } finally {
        hideLoading();
    }
}

// Share meme
export async function shareMeme(memeId) {
    try {
        // Get meme data
        const meme = await getMemeById(memeId);
        
        if (!meme) {
            showToast('Meme not found', 'error');
            return;
        }
        
        // Show share modal
        const shareModal = document.getElementById('shareModal');
        const sharePreview = document.getElementById('sharePreview');
        
        sharePreview.src = meme.imageUrl;
        document.getElementById('shareCaption').value = meme.caption;
        
        // Generate share link
        const shareLink = `${window.location.origin}/meme/${memeId}`;
        document.getElementById('directLink').value = shareLink;
        
        // Generate embed code
        const embedCode = `<iframe src="${shareLink}" width="600" height="400" frameborder="0"></iframe>`;
        document.getElementById('embedCode').value = embedCode;
        
        // Update character count
        updateCharCount();
        
        shareModal.classList.add('active');
        
        // Increment share count
        incrementShareCount(memeId);
        
    } catch (error) {
        console.error('Error sharing meme:', error);
        showToast('Failed to share meme', 'error');
    }
}

// Save meme
async function saveMeme(memeId) {
    const card = document.querySelector(`.meme-card[data-id="${memeId}"]`);
    if (!card) return;
    
    const saveBtn = card.querySelector('.save-btn');
    const saveIcon = saveBtn.querySelector('i');
    const isSaved = saveBtn.classList.contains('active');
    
    // Toggle save state
    if (isSaved) {
        saveBtn.classList.remove('active');
        saveIcon.className = 'far fa-bookmark';
        showToast('Removed from saved', 'info');
    } else {
        saveBtn.classList.add('active');
        saveIcon.className = 'fas fa-bookmark';
        showToast('Saved to your collection!', 'success');
    }
    
    // Update local storage
    updateLocalMemeSave(memeId, !isSaved);
}

// Get meme by ID
async function getMemeById(memeId) {
    // For demo, return mock data
    // In production, fetch from API
    return {
        id: memeId,
        imageUrl: 'https://picsum.photos/600/400',
        caption: 'Mock meme caption',
        userId: 'user_1'
    };
}

// Show comment modal
function showCommentModal(memeId) {
    // Create comment modal
    const modal = document.createElement('div');
    modal.className = 'comment-modal active';
    modal.innerHTML = `
        <div class="comment-modal-content">
            <div class="comment-modal-header">
                <h3>Comments</h3>
                <button class="close-comments"><i class="fas fa-times"></i></button>
            </div>
            <div class="comments-list" id="commentsList-${memeId}">
                <!-- Comments will be loaded here -->
            </div>
            <div class="comment-input-container">
                <input type="text" 
                       id="commentInput-${memeId}" 
                       placeholder="Add a comment..." 
                       class="comment-input">
                <button class="comment-submit-btn" data-meme-id="${memeId}">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load comments
    loadComments(memeId);
    
    // Set up event listeners
    modal.querySelector('.close-comments').addEventListener('click', () => {
        modal.remove();
    });
    
    const commentInput = modal.querySelector(`#commentInput-${memeId}`);
    const submitBtn = modal.querySelector('.comment-submit-btn');
    
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitComment(memeId, commentInput.value);
            commentInput.value = '';
        }
    });
    
    submitBtn.addEventListener('click', () => {
        submitComment(memeId, commentInput.value);
        commentInput.value = '';
    });
}

// Load comments
async function loadComments(memeId) {
    const commentsList = document.getElementById(`commentsList-${memeId}`);
    if (!commentsList) return;
    
    try {
        // Fetch comments from API/local storage
        const comments = await fetchComments(memeId);
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <i class="far fa-comment"></i>
                    <p>No comments yet. Be the first!</p>
                </div>
            `;
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-avatar">${comment.userAvatar || comment.userName.charAt(0)}</div>
                <div class="comment-content">
                    <strong>${comment.userName}</strong>
                    <p>${comment.text}</p>
                    <small>${formatTime(comment.timestamp)}</small>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `
            <div class="error-comments">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load comments</p>
            </div>
        `;
    }
}

// Submit comment
async function submitComment(memeId, comment) {
    if (!comment.trim()) return;
    
    await commentOnMeme(memeId, comment);
    
    // Reload comments
    loadComments(memeId);
}

// Fetch comments (mock)
async function fetchComments(memeId) {
    await simulateApiCall(300);
    
    // Mock comments
    return [
        {
            id: 'comment_1',
            userId: 'user_2',
            userName: 'FunnyGuy',
            userAvatar: 'FG',
            text: 'This is hilarious! 😂',
            timestamp: Date.now() - 3600000 // 1 hour ago
        },
        {
            id: 'comment_2',
            userId: 'user_3',
            userName: 'LaughMaster',
            userAvatar: 'LM',
            text: 'So relatable!',
            timestamp: Date.now() - 7200000 // 2 hours ago
        },
        {
            id: 'comment_3',
            userId: window.App?.state?.currentUser?.id || 'user_1',
            userName: window.App?.state?.currentUser?.name || 'You',
            userAvatar: window.App?.state?.currentUser?.avatar || 'Y',
            text: 'Thanks everyone!',
            timestamp: Date.now() - 1800000 // 30 mins ago
        }
    ];
}

// Local storage helpers
function updateLocalMemeLikes(memeId, liked) {
    const likedMemes = JSON.parse(localStorage.getItem('shome_liked_memes') || '{}');
    likedMemes[memeId] = liked;
    localStorage.setItem('shome_liked_memes', JSON.stringify(likedMemes));
}

function updateLocalMemeSave(memeId, saved) {
    const savedMemes = JSON.parse(localStorage.getItem('shome_saved_memes') || '{}');
    savedMemes[memeId] = saved;
    localStorage.setItem('shome_saved_memes', JSON.stringify(savedMemes));
}

function addLocalComment(memeId, comment) {
    const comments = JSON.parse(localStorage.getItem('shome_comments') || '{}');
    if (!comments[memeId]) comments[memeId] = [];
    comments[memeId].push(comment);
    localStorage.setItem('shome_comments', JSON.stringify(comments));
}

function incrementShareCount(memeId) {
    const shares = JSON.parse(localStorage.getItem('shome_shares') || '{}');
    shares[memeId] = (shares[memeId] || 0) + 1;
    localStorage.setItem('shome_shares', JSON.stringify(shares));
}

// UI helpers
function showLoadingIndicator(show) {
    const sentinel = document.getElementById('loading-sentinel');
    if (sentinel) {
        sentinel.style.display = show ? 'block' : 'none';
    }
}

function showNoMoreContent() {
    const sentinel = document.getElementById('loading-sentinel');
    if (sentinel) {
        sentinel.innerHTML = '<p>No more content to load</p>';
    }
}

function updateCommentCountUI(memeId) {
    const card = document.querySelector(`.meme-card[data-id="${memeId}"]`);
    if (!card) return;
    
    const commentCount = card.querySelector('.meme-stats span:nth-child(2)');
    if (commentCount) {
        const currentCount = parseInt(commentCount.textContent.replace(/[^0-9]/g, '')) || 0;
        commentCount.innerHTML = `<i class="fas fa-comment"></i> ${formatNumber(currentCount + 1)}`;
    }
}

function updateCharCount() {
    const captionInput = document.getElementById('shareCaption');
    const charCount = document.querySelector('.char-count');
    
    if (captionInput && charCount) {
        const count = captionInput.value.length;
        charCount.textContent = `${count}/280`;
        
        // Update color based on count
        if (count > 250) {
            charCount.style.color = '#ff4444';
        } else if (count > 200) {
            charCount.style.color = '#FF9800';
        } else {
            charCount.style.color = 'var(--text-light)';
        }
    }
}

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function simulateApiCall(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add styles for comment modal
const commentModalStyles = `
    .comment-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 2000;
        display: flex;
        align-items: flex-end;
        animation: slideUp 0.3s ease;
    }
    
    .comment-modal-content {
        background: var(--modal-bg);
        width: 100%;
        max-height: 80vh;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        display: flex;
        flex-direction: column;
    }
    
    .comment-modal-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--modal-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .comments-list {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-lg);
    }
    
    .comment-item {
        display: flex;
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .comment-avatar {
        width: 36px;
        height: 36px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        margin-right: var(--spacing-md);
        flex-shrink: 0;
    }
    
    .comment-input-container {
        padding: var(--spacing-md);
        border-top: 1px solid var(--modal-border);
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .comment-input {
        flex: 1;
        padding: var(--spacing-md);
        border: 2px solid var(--modal-border);
        border-radius: 24px;
        background: var(--modal-bg);
        color: var(--text-color);
    }
    
    .comment-submit-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = commentModalStyles;
document.head.appendChild(styleSheet);
// Export all public functions
export {
    //initFeedManager,
 //   loadMoreMemes,
  //  refreshFeed,
    upvoteMeme as likeMeme,  // Alias for compatibility
//    commentOnMeme,
  //  shareMeme
};

// Add this at the bottom of feedManager.js
// Clean up observer when page unloads
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (infiniteScrollObserver) {
            infiniteScrollObserver.disconnect();
            console.log('🧹 Cleaned up infinite scroll observer on page unload');
        }
    });
}