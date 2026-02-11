// modules/searchManager.js
//import { showToast, debounce, generateUniqueId } from './utils.js';

// modules/searchManager.js - CORRECTED IMPORTS  
import { 
    showToast, 
    debounce, 
    generateUniqueId,
   // showLoading,
   // hideLoading 
} from './utils.js';

let searchHistory = [];
let searchResults = {};
let currentSearchQuery = '';

// Initialize search manager
export function initSearchManager() {
    console.log('✅ Search manager initialized');
    
    // Load search history
    loadSearchHistory();
    
    // Set up search functionality
    setupSearch();
    
    // Set up search results display
    setupSearchResults();
}

// Load search history from localStorage
function loadSearchHistory() {
    try {
        const savedHistory = localStorage.getItem('shome_search_history');
        if (savedHistory) {
            searchHistory = JSON.parse(savedHistory);
            renderRecentSearches();
        }
    } catch (error) {
        console.error('Error loading search history:', error);
        searchHistory = [];
    }
}

// Save search history to localStorage
function saveSearchHistory() {
    try {
        localStorage.setItem('shome_search_history', JSON.stringify(searchHistory));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

// Set up search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const closeSearchBtn = document.getElementById('closeSearch');
    const searchBar = document.querySelector('.search-bar');
    
    if (!searchInput) return;
    
    // Show search bar on search button click
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchBar.classList.add('active');
            setTimeout(() => searchInput.focus(), 100);
        });
    }
    
    // Close search
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            searchBar.classList.remove('active');
            searchInput.value = '';
            clearSearchResults();
        });
    }
    
    // Search on input with debounce
    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query) {
            performSearch(query);
        } else {
            clearSearchResults();
            showRecentSearches();
        }
    }, 300));
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
                addToSearchHistory(query);
            }
        }
    });
    
    // Close search on escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchBar.classList.remove('active');
            searchInput.value = '';
            clearSearchResults();
        }
    });
}

// Set up search results display
function setupSearchResults() {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;
    
    // Set up click outside to close
    document.addEventListener('click', (e) => {
        const searchBar = document.querySelector('.search-bar');
        if (searchBar && searchBar.classList.contains('active')) {
            if (!searchBar.contains(e.target) && !document.getElementById('searchBtn')?.contains(e.target)) {
                searchBar.classList.remove('active');
                document.getElementById('searchInput').value = '';
                clearSearchResults();
            }
        }
    });
}

// Perform search
export async function performSearch(query) {
    if (!query.trim()) {
        showRecentSearches();
        return;
    }
    
    currentSearchQuery = query;
    
    showLoading('Searching...');
    
    try {
        // Perform search across different categories
        const [memes, users, tags] = await Promise.all([
            searchMemes(query),
            searchUsers(query),
            searchTags(query)
        ]);
        
        searchResults = {
            memes: memes,
            users: users,
            tags: tags,
            query: query
        };
        
        renderSearchResults();
        
        // Add to search history
        addToSearchHistory(query);
        
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed', 'error');
    } finally {
        hideLoading();
    }
}

// Search memes
async function searchMemes(query) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in production, this would be an API call
    return [
        {
            id: 'search_meme_1',
            type: 'meme',
            imageUrl: `https://picsum.photos/seed/meme_search_1/200/200`,
            caption: `Funny meme about ${query}`,
            userName: 'MemeMaster',
            likes: 234,
            timestamp: Date.now() - 3600000
        },
        {
            id: 'search_meme_2',
            type: 'meme',
            imageUrl: `https://picsum.photos/seed/meme_search_2/200/200`,
            caption: `Relatable ${query} moment`,
            userName: 'JokeKing',
            likes: 189,
            timestamp: Date.now() - 7200000
        },
        {
            id: 'search_meme_3',
            type: 'meme',
            imageUrl: `https://picsum.photos/seed/meme_search_3/200/200`,
            caption: `${query} be like`,
            userName: 'FunnyGuy',
            likes: 456,
            timestamp: Date.now() - 10800000
        }
    ];
}

// Search users
async function searchUsers(query) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
        {
            id: 'search_user_1',
            type: 'user',
            userName: `${query}Lover`,
            displayName: `${query.charAt(0).toUpperCase() + query.slice(1)} Fan`,
            avatar: 'FL',
            followers: 1234,
            isFollowing: false
        },
        {
            id: 'search_user_2',
            type: 'user',
            userName: `${query}Master`,
            displayName: `Professional ${query}`,
            avatar: 'PM',
            followers: 5678,
            isFollowing: true
        },
        {
            id: 'search_user_3',
            type: 'user',
            userName: `KingOf${query.charAt(0).toUpperCase() + query.slice(1)}`,
            displayName: `${query.charAt(0).toUpperCase() + query.slice(1)} Enthusiast`,
            avatar: 'KE',
            followers: 890,
            isFollowing: false
        }
    ];
}

// Search tags
async function searchTags(query) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const tags = [
        `#${query}`,
        `#${query}memes`,
        `#${query}funny`,
        `#${query}lover`,
        `#${query}moment`,
        `#${query}life`,
        `#${query}_daily`,
        `#${query}vibes`
    ];
    
    return tags.slice(0, 5).map(tag => ({
        id: `tag_${generateUniqueId()}`,
        type: 'tag',
        name: tag,
        postCount: Math.floor(Math.random() * 1000) + 100
    }));
}

// Render search results
function renderSearchResults() {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;
    
    const { memes, users, tags, query } = searchResults;
    
    let html = `
        <div class="results-header">
            <h4>Results for "${query}"</h4>
            <button class="clear-search" id="clearCurrentSearch">Clear</button>
        </div>
    `;
    
    // Users section
    if (users.length > 0) {
        html += `
            <div class="results-section">
                <h4>Users</h4>
                ${users.map(user => `
                    <div class="search-result user-result" data-id="${user.id}" data-type="user">
                        <div class="result-avatar">${user.avatar}</div>
                        <div class="result-info">
                            <strong>${user.userName}</strong>
                            <small>${user.displayName}</small>
                            <small>${user.followers.toLocaleString()} followers</small>
                        </div>
                        <button class="follow-btn ${user.isFollowing ? 'following' : ''}" 
                                data-user-id="${user.id}">
                            ${user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Memes section
    if (memes.length > 0) {
        html += `
            <div class="results-section">
                <h4>Memes</h4>
                <div class="meme-results-grid">
                    ${memes.map(meme => `
                        <div class="meme-result" data-id="${meme.id}" data-type="meme">
                            <img src="${meme.imageUrl}" alt="${meme.caption}" loading="lazy">
                            <div class="meme-result-overlay">
                                <div class="meme-result-info">
                                    <p>${meme.caption}</p>
                                    <small>by ${meme.userName}</small>
                                    <small>${meme.likes} likes</small>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Tags section
    if (tags.length > 0) {
        html += `
            <div class="results-section">
                <h4>Tags</h4>
                <div class="tag-results">
                    ${tags.map(tag => `
                        <div class="tag-result" data-tag="${tag.name}">
                            <span class="tag-name">${tag.name}</span>
                            <small class="tag-count">${tag.postCount} posts</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // No results
    if (memes.length === 0 && users.length === 0 && tags.length === 0) {
        html += `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h4>No results found</h4>
                <p>Try different keywords or check spelling</p>
            </div>
        `;
    }
    
    searchResultsContainer.innerHTML = html;
    
    // Add event listeners
    setupResultInteractions();
}

// Set up result interactions
function setupResultInteractions() {
    // User follow buttons
    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = btn.getAttribute('data-user-id');
            const isFollowing = btn.classList.contains('following');
            
            if (isFollowing) {
                // Unfollow
                btn.classList.remove('following');
                btn.textContent = 'Follow';
                showToast(`Unfollowed user`, 'info');
            } else {
                // Follow
                btn.classList.add('following');
                btn.textContent = 'Following';
                showToast(`Started following user`, 'success');
            }
            
            // Update local state
            updateFollowStatus(userId, !isFollowing);
        });
    });
    
    // Meme clicks
    document.querySelectorAll('.meme-result').forEach(result => {
        result.addEventListener('click', () => {
            const memeId = result.getAttribute('data-id');
            openMemeDetails(memeId);
        });
    });
    
    // User clicks
    document.querySelectorAll('.user-result').forEach(result => {
        result.addEventListener('click', () => {
            const userId = result.getAttribute('data-id');
            openUserProfile(userId);
        });
    });
    
    // Tag clicks
    document.querySelectorAll('.tag-result').forEach(result => {
        result.addEventListener('click', () => {
            const tag = result.getAttribute('data-tag');
            openTagFeed(tag);
        });
    });
    
    // Clear current search
    const clearBtn = document.getElementById('clearCurrentSearch');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            clearSearchResults();
            showRecentSearches();
        });
    }
}

// Open meme details
function openMemeDetails(memeId) {
    // Close search
    document.querySelector('.search-bar').classList.remove('active');
    
    // For now, show a toast
    // In production, this would open a meme detail view
    showToast(`Opening meme ${memeId}`, 'info');
    
    // You could implement a modal or navigate to meme view
    console.log('Open meme:', memeId);
}

// Open user profile
function openUserProfile(userId) {
    // Close search
    document.querySelector('.search-bar').classList.remove('active');
    
    // Switch to profile tab and load user
    // For now, just show toast
    showToast(`Opening user profile`, 'info');
    
    // In production, switch to profile tab with user data
    console.log('Open user:', userId);
}

// Open tag feed
function openTagFeed(tag) {
    // Close search
    document.querySelector('.search-bar').classList.remove('active');
    
    // Add hashtag to search
    document.getElementById('searchInput').value = tag;
    
    // Perform search for tag
    performSearch(tag.replace('#', ''));
}

// Update follow status
function updateFollowStatus(userId, isFollowing) {
    // Update in search results
    if (searchResults.users) {
        const user = searchResults.users.find(u => u.id === userId);
        if (user) {
            user.isFollowing = isFollowing;
        }
    }
    
    // Update in localStorage
    const following = JSON.parse(localStorage.getItem('shome_following') || '{}');
    following[userId] = isFollowing;
    localStorage.setItem('shome_following', JSON.stringify(following));
}

// Add to search history
function addToSearchHistory(query) {
    // Remove if already exists
    searchHistory = searchHistory.filter(item => item.query !== query);
    
    // Add to beginning
    searchHistory.unshift({
        id: generateUniqueId(),
        query: query,
        timestamp: Date.now()
    });
    
    // Keep only last 10 searches
    if (searchHistory.length > 10) {
        searchHistory.pop();
    }
    
    // Save to localStorage
    saveSearchHistory();
    
    // Update UI
    renderRecentSearches();
}

// Render recent searches
function renderRecentSearches() {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer || searchHistory.length === 0) return;
    
    let html = `
        <div class="results-section">
            <div class="recent-searches-header">
                <h4>Recent Searches</h4>
                <button class="clear-all-searches" id="clearAllSearches">
                    Clear all
                </button>
            </div>
            <div class="recent-searches">
                ${searchHistory.map(item => `
                    <div class="recent-search-item" data-query="${item.query}">
                        <i class="fas fa-history"></i>
                        <span class="recent-query">${item.query}</span>
                        <button class="remove-search" data-query="${item.query}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add popular searches section
    html += `
        <div class="results-section">
            <h4>Popular Searches</h4>
            <div class="popular-searches">
                ${['funny', 'memes', 'cats', 'dank', 'viral', 'trending', 'comedy', 'lol'].map(tag => `
                    <div class="popular-search-item" data-query="${tag}">
                        <i class="fas fa-fire"></i>
                        <span>${tag}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    searchResultsContainer.innerHTML = html;
    
    // Add event listeners for recent searches
    document.querySelectorAll('.recent-search-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-search')) {
                const query = item.getAttribute('data-query');
                document.getElementById('searchInput').value = query;
                performSearch(query);
            }
        });
    });
    
    // Remove search from history
    document.querySelectorAll('.remove-search').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const query = btn.getAttribute('data-query');
            removeFromSearchHistory(query);
        });
    });
    
    // Clear all searches
    const clearAllBtn = document.getElementById('clearAllSearches');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllSearchHistory);
    }
    
    // Popular searches
    document.querySelectorAll('.popular-search-item').forEach(item => {
        item.addEventListener('click', () => {
            const query = item.getAttribute('data-query');
            document.getElementById('searchInput').value = query;
            performSearch(query);
        });
    });
}

// Remove from search history
function removeFromSearchHistory(query) {
    searchHistory = searchHistory.filter(item => item.query !== query);
    saveSearchHistory();
    renderRecentSearches();
}

// Clear all search history
export function clearSearchHistory() {
    searchHistory = [];
    saveSearchHistory();
    
    const searchResultsContainer = document.getElementById('searchResults');
    if (searchResultsContainer) {
        searchResultsContainer.innerHTML = `
            <div class="no-recent-searches">
                <i class="fas fa-search"></i>
                <p>No recent searches</p>
            </div>
        `;
    }
    
    showToast('Search history cleared', 'info');
}

// Clear search results
function clearSearchResults() {
    searchResults = {};
    const searchResultsContainer = document.getElementById('searchResults');
    if (searchResultsContainer) {
        searchResultsContainer.innerHTML = '';
    }
}

// Show recent searches
function showRecentSearches() {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;
    
    if (searchHistory.length === 0) {
        searchResultsContainer.innerHTML = `
            <div class="no-recent-searches">
                <i class="fas fa-search"></i>
                <p>No recent searches</p>
                <small>Try searching for memes, users, or tags</small>
            </div>
        `;
        return;
    }
    
    renderRecentSearches();
}

// Clear all search history (from UI)
function clearAllSearchHistory() {
    if (searchHistory.length === 0) return;
    
    if (confirm('Clear all search history?')) {
        clearSearchHistory();
    }
}

// Show loading state
function showLoading(message = 'Loading...') {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;
    
    searchResultsContainer.innerHTML = `
        <div class="search-loading">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

// Hide loading
function hideLoading() {
    // Loading state is replaced when results are rendered
}

// Add search styles
const searchStyles = `
    .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--modal-border);
    }
    
    .clear-search {
        background: none;
        border: none;
        color: var(--primary-color);
        font-size: 14px;
        cursor: pointer;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--border-radius-xs);
    }
    
    .clear-search:hover {
        background: rgba(76, 175, 80, 0.1);
    }
    
    .recent-searches-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);
    }
    
    .clear-all-searches {
        background: none;
        border: none;
        color: var(--text-light);
        font-size: 12px;
        cursor: pointer;
    }
    
    .recent-search-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-sm);
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        transition: background-color 0.2s;
        margin-bottom: 2px;
    }
    
    .recent-search-item:hover {
        background: rgba(0, 0, 0, 0.05);
    }
    
    .recent-search-item i {
        color: var(--text-light);
        margin-right: var(--spacing-sm);
        font-size: 14px;
        width: 20px;
    }
    
    .recent-query {
        flex: 1;
        font-size: 14px;
    }
    
    .remove-search {
        background: none;
        border: none;
        color: var(--text-light);
        font-size: 12px;
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s;
    }
    
    .recent-search-item:hover .remove-search {
        opacity: 1;
    }
    
    .remove-search:hover {
        background: rgba(0, 0, 0, 0.1);
    }
    
    .popular-searches {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
    }
    
    .popular-search-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(0, 0, 0, 0.05);
        border-radius: 20px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-size: 14px;
    }
    
    .popular-search-item:hover {
        background: rgba(0, 0, 0, 0.1);
    }
    
    .popular-search-item i {
        color: #ff4444;
        margin-right: var(--spacing-xs);
        font-size: 12px;
    }
    
    .search-result {
        display: flex;
        align-items: center;
        padding: var(--spacing-sm);
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        transition: background-color 0.2s;
        margin-bottom: 2px;
    }
    
    .search-result:hover {
        background: rgba(0, 0, 0, 0.05);
    }
    
    .result-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: var(--spacing-md);
        flex-shrink: 0;
    }
    
    .result-info {
        flex: 1;
    }
    
    .result-info strong {
        display: block;
        font-size: 15px;
        margin-bottom: 2px;
    }
    
    .result-info small {
        display: block;
        color: var(--text-light);
        font-size: 12px;
        margin-bottom: 1px;
    }
    
    .follow-btn {
        padding: var(--spacing-xs) var(--spacing-md);
        border: 1px solid var(--primary-color);
        background: var(--primary-color);
        color: white;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .follow-btn.following {
        background: transparent;
        color: var(--primary-color);
    }
    
    .meme-results-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
    }
    
    .meme-result {
        aspect-ratio: 1;
        background: #f0f0f0;
        border-radius: var(--border-radius-sm);
        overflow: hidden;
        position: relative;
        cursor: pointer;
    }
    
    .meme-result img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }
    
    .meme-result:hover img {
        transform: scale(1.05);
    }
    
    .meme-result-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
        padding: var(--spacing-sm);
        color: white;
        transform: translateY(100%);
        transition: transform 0.3s;
    }
    
    .meme-result:hover .meme-result-overlay {
        transform: translateY(0);
    }
    
    .tag-results {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
    }
    
    .tag-result {
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(76, 175, 80, 0.1);
        border-radius: 20px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .tag-result:hover {
        background: rgba(76, 175, 80, 0.2);
    }
    
    .tag-name {
        font-weight: 500;
        font-size: 14px;
    }
    
    .tag-count {
        display: block;
        font-size: 11px;
        color: var(--text-light);
    }
    
    .no-results, .no-recent-searches, .search-loading {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-light);
    }
    
    .no-results i, .no-recent-searches i, .search-loading i {
        font-size: 48px;
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
    }
    
    .search-loading .loading-spinner {
        margin: 0 auto var(--spacing-md);
    }
    
    @media (prefers-color-scheme: dark) {
        .recent-search-item:hover,
        .search-result:hover,
        .popular-search-item:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .popular-search-item {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .remove-search:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    }
`;

// Add styles to document
const searchStyleSheet = document.createElement('style');
searchStyleSheet.textContent = searchStyles;
document.head.appendChild(searchStyleSheet);