// modules/notificationManager.js
//import { showToast, generateUniqueId, formatTime } from './utils.js';
// modules/notificationManager.js - CORRECTED IMPORTS
import { 
    showToast, 
    generateUniqueId, 
    formatTime,
    showLoading,
    hideLoading 
} from './utils.js';

let notifications = [];
let notificationSocket = null;
let unreadCount = 0;

// Initialize notification manager
export function initNotificationManager() {
    console.log('✅ Notification manager initialized');
    
    // Load notifications
    loadNotifications();
    
    // Set up notification UI
    setupNotificationUI();
    
    // Set up real-time notifications
    setupRealtimeNotifications();
    
    // Update badge
    updateNotificationBadge();
}

// Load notifications from localStorage
function loadNotifications() {
    try {
        const savedNotifications = localStorage.getItem('shome_notifications');
        if (savedNotifications) {
            notifications = JSON.parse(savedNotifications);
        } else {
            // Create initial notifications
            notifications = generateInitialNotifications();
            saveNotifications();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        notifications = generateInitialNotifications();
    }
    
    // Calculate unread count
    unreadCount = notifications.filter(n => !n.read).length;
}

// Save notifications to localStorage
function saveNotifications() {
    try {
        localStorage.setItem('shome_notifications', JSON.stringify(notifications));
    } catch (error) {
        console.error('Error saving notifications:', error);
    }
}

// Generate initial notifications
function generateInitialNotifications() {
    return [
        {
            id: generateUniqueId(),
            type: 'like',
            title: 'New Like',
            message: 'Your meme "Monday Mood" got 50 likes!',
            icon: 'fas fa-heart',
            color: '#ff4444',
            read: false,
            timestamp: Date.now() - 3600000,
            data: { memeId: 'meme_1', likes: 50 }
        },
        {
            id: generateUniqueId(),
            type: 'follow',
            title: 'New Follower',
            message: 'MemeKing started following you',
            icon: 'fas fa-user-plus',
            color: '#4CAF50',
            read: false,
            timestamp: Date.now() - 7200000,
            data: { userId: 'user_2', userName: 'MemeKing' }
        },
        {
            id: generateUniqueId(),
            type: 'comment',
            title: 'New Comment',
            message: 'FunnyGuy commented: "This is hilarious! 😂"',
            icon: 'fas fa-comment',
            color: '#2196F3',
            read: true,
            timestamp: Date.now() - 10800000,
            data: { 
                memeId: 'meme_2', 
                commentId: 'comment_1',
                comment: 'This is hilarious! 😂',
                userName: 'FunnyGuy'
            }
        },
        {
            id: generateUniqueId(),
            type: 'trending',
            title: 'Trending Alert',
            message: 'Your meme is trending in #funny',
            icon: 'fas fa-fire',
            color: '#FF9800',
            read: true,
            timestamp: Date.now() - 14400000,
            data: { tag: '#funny', rank: 5 }
        },
        {
            id: generateUniqueId(),
            type: 'system',
            title: 'Welcome!',
            message: 'Welcome to Shome Meme App! Start creating memes now.',
            icon: 'fas fa-rocket',
            color: '#9C27B0',
            read: true,
            timestamp: Date.now() - 86400000,
            data: {}
        }
    ];
}

// Set up notification UI
function setupNotificationUI() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotificationsBtn = document.getElementById('closeNotifications');
    const markAllReadBtn = document.getElementById('markAllRead');
    const clearNotificationsBtn = document.getElementById('clearNotifications');
    
    if (!notificationBtn || !notificationPanel) return;
    
    // Toggle notification panel
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationPanel.classList.toggle('active');
        
        if (notificationPanel.classList.contains('active')) {
            // Mark all as read when opening
            markAllAsRead();
            // Render notifications
            renderNotifications();
        }
    });
    
    // Close notifications
    if (closeNotificationsBtn) {
        closeNotificationsBtn.addEventListener('click', () => {
            notificationPanel.classList.remove('active');
        });
    }
    
    // Mark all as read
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllAsRead();
        });
    }
    
    // Clear all notifications
    if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener('click', () => {
            clearAllNotifications();
        });
    }
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });
}

// Render notifications
function renderNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="empty-notifications">
                <i class="far fa-bell"></i>
                <h4>No notifications</h4>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
    
    notificationList.innerHTML = sortedNotifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" 
             data-id="${notification.id}"
             data-type="${notification.type}">
            <div class="notification-icon" style="color: ${notification.color}">
                <i class="${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <small>${formatTime(notification.timestamp)}</small>
            </div>
            ${!notification.read ? '<div class="notification-dot"></div>' : ''}
        </div>
    `).join('');
    
    // Add click handlers
    notificationList.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const notificationId = item.getAttribute('data-id');
            const notificationType = item.getAttribute('data-type');
            handleNotificationClick(notificationId, notificationType);
        });
    });
}

// Handle notification click
function handleNotificationClick(notificationId, notificationType) {
    // Mark as read
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        unreadCount--;
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
    }
    
    // Handle action based on type
    switch (notificationType) {
        case 'like':
            // Navigate to liked meme
            if (notification.data?.memeId) {
                openMeme(notification.data.memeId);
            }
            break;
            
        case 'comment':
            // Open comment thread
            if (notification.data?.memeId && notification.data?.commentId) {
                openComments(notification.data.memeId, notification.data.commentId);
            }
            break;
            
        case 'follow':
            // Open follower's profile
            if (notification.data?.userId) {
                openProfile(notification.data.userId);
            }
            break;
            
        case 'trending':
            // Open trending page
            if (notification.data?.tag) {
                openTrending(notification.data.tag);
            }
            break;
    }
    
    // Close notification panel
    document.getElementById('notificationPanel').classList.remove('active');
}

// Show new notification
export function showNotification(title, message, type = 'info', data = {}) {
    const notificationTypes = {
        'info': { icon: 'fas fa-info-circle', color: '#2196F3' },
        'success': { icon: 'fas fa-check-circle', color: '#4CAF50' },
        'warning': { icon: 'fas fa-exclamation-triangle', color: '#FF9800' },
        'error': { icon: 'fas fa-exclamation-circle', color: '#ff4444' },
        'like': { icon: 'fas fa-heart', color: '#ff4444' },
        'comment': { icon: 'fas fa-comment', color: '#2196F3' },
        'follow': { icon: 'fas fa-user-plus', color: '#4CAF50' },
        'trending': { icon: 'fas fa-fire', color: '#FF9800' }
    };
    
    const notificationType = notificationTypes[type] || notificationTypes.info;
    
    const notification = {
        id: generateUniqueId(),
        type: type,
        title: title,
        message: message,
        icon: notificationType.icon,
        color: notificationType.color,
        read: false,
        timestamp: Date.now(),
        data: data
    };
    
    // Add to notifications array
    notifications.unshift(notification);
    unreadCount++;
    
    // Keep only last 100 notifications
    if (notifications.length > 100) {
        notifications.pop();
    }
    
    // Save to localStorage
    saveNotifications();
    
    // Update badge
    updateNotificationBadge();
    
    // Render if panel is open
    if (document.getElementById('notificationPanel')?.classList.contains('active')) {
        renderNotifications();
    }
    
    // Show toast for important notifications
    if (type !== 'info' && type !== 'system') {
        showToast(message, type);
    }
    
    // Play notification sound
    playNotificationSound();
    
    return notification;
}

// Mark all as read
export function markAllAsRead() {
    let changed = false;
    
    notifications.forEach(notification => {
        if (!notification.read) {
            notification.read = true;
            changed = true;
        }
    });
    
    if (changed) {
        unreadCount = 0;
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
        showToast('All notifications marked as read', 'success');
    }
}

// Clear all notifications
export function clearAllNotifications() {
    if (notifications.length === 0) return;
    
    if (confirm('Clear all notifications?')) {
        notifications = [];
        unreadCount = 0;
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
        showToast('All notifications cleared', 'info');
    }
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
        
        // Add animation for new notifications
        if (unreadCount === 1) {
            badge.classList.add('new');
            setTimeout(() => badge.classList.remove('new'), 1000);
        }
    } else {
        badge.style.display = 'none';
    }
}

// Set up real-time notifications
function setupRealtimeNotifications() {
    // In production, this would connect to a WebSocket server
    // For demo, we'll simulate real-time notifications
    
    // Simulate incoming notifications
    setInterval(() => {
        if (Math.random() > 0.8 && window.App?.state?.isOnline) {
            simulateIncomingNotification();
        }
    }, 60000); // Every minute
    
    // Listen for custom events from other modules
    document.addEventListener('memeLiked', (e) => {
        const { memeId, memeCaption, userName } = e.detail;
        showNotification(
            'New Like',
            `${userName} liked your meme "${memeCaption}"`,
            'like',
            { memeId, memeCaption, userName }
        );
    });
    
    document.addEventListener('newComment', (e) => {
        const { memeId, comment, userName } = e.detail;
        showNotification(
            'New Comment',
            `${userName} commented: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
            'comment',
            { memeId, comment, userName }
        );
    });
    
    document.addEventListener('newFollower', (e) => {
        const { userId, userName } = e.detail;
        showNotification(
            'New Follower',
            `${userName} started following you`,
            'follow',
            { userId, userName }
        );
    });
}

// Simulate incoming notification
function simulateIncomingNotification() {
    const notificationTypes = [
        {
            type: 'like',
            title: 'Popular Meme',
            message: 'Your meme got 100+ upvotes!',
            data: { memeId: 'trending_' + generateUniqueId() }
        },
        {
            type: 'follow',
            title: 'New Follower',
            message: 'MemeEnthusiast started following you',
            data: { userId: 'user_' + generateUniqueId() }
        },
        {
            type: 'comment',
            title: 'New Comment',
            message: 'LaughMaster commented on your meme',
            data: { memeId: 'meme_' + generateUniqueId() }
        },
        {
            type: 'trending',
            title: 'Trending Now',
            message: 'Your meme is featured on the trending page',
            data: { tag: '#viral' }
        },
        {
            type: 'system',
            title: 'New Feature',
            message: 'Check out the new GIF creator tool!',
            data: { feature: 'gif_creator' }
        }
    ];
    
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    showNotification(randomType.title, randomType.message, randomType.type, randomType.data);
}

// Play notification sound
function playNotificationSound() {
    // Check if user has sound enabled
    const soundEnabled = localStorage.getItem('shome_notification_sound') !== 'false';
    
    if (!soundEnabled) return;
    
    try {
        // Create audio context for notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio context not supported:', error);
    }
}

// Open meme
function openMeme(memeId) {
    // For now, show toast
    // In production, open meme detail view
    showToast(`Opening meme ${memeId}`, 'info');
}

// Open comments
function openComments(memeId, commentId) {
    showToast(`Opening comments for meme ${memeId}`, 'info');
}

// Open profile
function openProfile(userId) {
    showToast(`Opening profile ${userId}`, 'info');
}

// Open trending
function openTrending(tag) {
    showToast(`Opening trending ${tag}`, 'info');
}

// Get unread count
export function getUnreadCount() {
    return unreadCount;
}

// Get notifications
export function getNotifications() {
    return [...notifications];
}

// Add notification styles
const notificationStyles = `
    .notification-item {
        position: relative;
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--modal-border);
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: flex-start;
    }
    
    .notification-item:hover {
        background: rgba(0, 0, 0, 0.03);
    }
    
    .notification-item.unread {
        background: rgba(76, 175, 80, 0.05);
    }
    
    .notification-item.unread:hover {
        background: rgba(76, 175, 80, 0.08);
    }
    
    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-md);
        flex-shrink: 0;
        font-size: 18px;
    }
    
    .notification-item.unread .notification-icon {
        background: rgba(76, 175, 80, 0.1);
    }
    
    .notification-content {
        flex: 1;
        min-width: 0;
    }
    
    .notification-content h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-color);
    }
    
    .notification-content p {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: var(--text-light);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    
    .notification-content small {
        font-size: 12px;
        color: var(--text-light);
    }
    
    .notification-dot {
        position: absolute;
        top: 20px;
        right: var(--spacing-md);
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: pulse 2s infinite;
    }
    
    .empty-notifications {
        padding: var(--spacing-xl);
        text-align: center;
        color: var(--text-light);
    }
    
    .empty-notifications i {
        font-size: 48px;
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
    }
    
    .empty-notifications h4 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 18px;
        color: var(--text-color);
    }
    
    .empty-notifications p {
        margin: 0;
        font-size: 14px;
    }
    
    .notification-footer {
        padding: var(--spacing-md);
        border-top: 1px solid var(--modal-border);
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .notification-footer .action-btn {
        flex: 1;
        justify-content: center;
        padding: var(--spacing-sm);
        font-size: 13px;
    }
    
    @keyframes pulse {
        0%, 100% { 
            opacity: 1;
            transform: scale(1);
        }
        50% { 
            opacity: 0.5;
            transform: scale(1.2);
        }
    }
    
    @media (prefers-color-scheme: dark) {
        .notification-item:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .notification-icon {
            background: rgba(255, 255, 255, 0.1);
        }
    }
`;

// Add styles to document
const notificationStyleSheet = document.createElement('style');
notificationStyleSheet.textContent = notificationStyles;
document.head.appendChild(notificationStyleSheet);