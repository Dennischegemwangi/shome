// modules/socialSharing.js
// modules/socialSharing.js - CORRECTED IMPORTS
import { 
    showToast, 
    generateUniqueId,
    showLoading,
    hideLoading 
} from './utils.js';

const sharingPlatforms = [{
        id: 'twitter',
        name: 'Twitter',
        icon: 'fab fa-twitter',
        color: '#1DA1F2',
        shareUrl: 'https://twitter.com/intent/tweet',
        enabled: true
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: 'fab fa-facebook',
        color: '#1877F2',
        shareUrl: 'https://www.facebook.com/sharer/sharer.php',
        enabled: true
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: 'fab fa-instagram',
        color: '#E4405F',
        shareUrl: 'instagram://',
        enabled: true
    },
    {
        id: 'reddit',
        name: 'Reddit',
        icon: 'fab fa-reddit',
        color: '#FF4500',
        shareUrl: 'https://reddit.com/submit',
        enabled: true
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: 'fab fa-whatsapp',
        color: '#25D366',
        shareUrl: 'https://api.whatsapp.com/send',
        enabled: true
    },
    {
        id: 'telegram',
        name: 'Telegram',
        icon: 'fab fa-telegram',
        color: '#0088CC',
        shareUrl: 'https://t.me/share/url',
        enabled: true
    },
    {
        id: 'pinterest',
        name: 'Pinterest',
        icon: 'fab fa-pinterest',
        color: '#E60023',
        shareUrl: 'https://pinterest.com/pin/create/button',
        enabled: true
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: 'fab fa-tiktok',
        color: '#000000',
        shareUrl: 'https://www.tiktok.com/upload',
        enabled: true
    },
    {
        id: 'copy',
        name: 'Copy Link',
        icon: 'fas fa-link',
        color: '#666666',
        shareUrl: '',
        enabled: true
    },
    {
        id: 'download',
        name: 'Download',
        icon: 'fas fa-download',
        color: '#4CAF50',
        shareUrl: '',
        enabled: true
    }
];

let currentShareData = null;

// Initialize social sharing
export function initSocialSharing() {
    console.log('✅ Social sharing initialized');

    // Set up social sharing UI
    setupSocialSharingUI();

    // Set up share modal
    setupShareModal();
}

// Set up social sharing UI
function setupSocialSharingUI() {
    const shareModal = document.getElementById('shareModal');
    const closeShareBtn = document.getElementById('closeShare');
    const shareCaption = document.getElementById('shareCaption');
    const charCount = document.querySelector('.char-count');

    if (!shareModal) return;

    // Close button
    if (closeShareBtn) {
        closeShareBtn.addEventListener('click', () => {
            shareModal.classList.remove('active');
            currentShareData = null;
        });
    }

    // Character count for caption
    if (shareCaption && charCount) {
        shareCaption.addEventListener('input', () => {
            const count = shareCaption.value.length;
            charCount.textContent = `${count}/280`;

            // Update color based on count
            if (count > 250) {
                charCount.style.color = '#ff4444';
            } else if (count > 200) {
                charCount.style.color = '#FF9800';
            } else {
                charCount.style.color = 'var(--text-light)';
            }
        });
    }

    // Copy link buttons
    setupCopyButtons();

    // Load sharing platforms
    loadSharingPlatforms();
}

// Set up share modal
function setupShareModal() {
    // Listen for share meme event
    document.addEventListener('shareMeme', (e) => {
        const {
            imageUrl,
            caption
        } = e.detail;
        openShareModal(imageUrl, caption);
    });
}

// Load sharing platforms
function loadSharingPlatforms() {
    const platformGrid = document.getElementById('platformGrid');
    if (!platformGrid) return;

    platformGrid.innerHTML = sharingPlatforms.map(platform => `
        <button class="platform-btn" 
                data-platform="${platform.id}"
                style="--platform-color: ${platform.color}"
                ${!platform.enabled ? 'disabled' : ''}>
            <i class="${platform.icon}"></i>
            <span>${platform.name}</span>
        </button>
    `).join('');

    // Add event listeners
    platformGrid.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const platformId = btn.getAttribute('data-platform');
            shareToPlatform(platformId);
        });
    });
}

// Open share modal
export function openShareModal(imageUrl, caption = '') {
    const shareModal = document.getElementById('shareModal');
    const sharePreview = document.getElementById('sharePreview');
    const shareCaption = document.getElementById('shareCaption');
    const directLink = document.getElementById('directLink');
    const embedCode = document.getElementById('embedCode');

    if (!shareModal || !sharePreview) return;

    // Set preview image
    sharePreview.src = imageUrl;

    // Set caption
    if (shareCaption) {
        shareCaption.value = caption;
        // Trigger character count update
        const event = new Event('input');
        shareCaption.dispatchEvent(event);
    }

    // Generate share data
    currentShareData = {
        imageUrl: imageUrl,
        caption: caption,
        timestamp: Date.now()
    };

    // Generate direct link
    const shareId = generateUniqueId();
    const directLinkUrl = `${window.location.origin}/share/${shareId}`;
    if (directLink) {
        directLink.value = directLinkUrl;
    }

    // Generate embed code
    const embedHtml = `<iframe src="${directLinkUrl}/embed" width="600" height="400" frameborder="0" allowfullscreen></iframe>`;
    if (embedCode) {
        embedCode.value = embedHtml;
    }

    // Open modal
    shareModal.classList.add('active');
}

// Share to platform
export async function shareToPlatform(platformId) {
    if (!currentShareData) {
        showToast('No content to share', 'error');
        return;
    }

    const platform = sharingPlatforms.find(p => p.id === platformId);
    if (!platform || !platform.enabled) {
        showToast('Platform not available', 'error');
        return;
    }

    const caption = document.getElementById('shareCaption')?.value || currentShareData.caption;

    switch (platformId) {
        case 'twitter':
            await shareToTwitter(currentShareData.imageUrl, caption);
            break;
        case 'facebook':
            await shareToFacebook(currentShareData.imageUrl, caption);
            break;
        case 'instagram':
            await shareToInstagram(currentShareData.imageUrl, caption);
            break;
        case 'reddit':
            await shareToReddit(currentShareData.imageUrl, caption);
            break;
        case 'whatsapp':
            await shareToWhatsApp(currentShareData.imageUrl, caption);
            break;
        case 'telegram':
            await shareToTelegram(currentShareData.imageUrl, caption);
            break;
        case 'pinterest':
            await shareToPinterest(currentShareData.imageUrl, caption);
            break;
        case 'tiktok':
            await shareToTikTok(currentShareData.imageUrl, caption);
            break;
        case 'copy':
            await copyShareLink();
            break;
        case 'download':
            await downloadShareImage();
            break;
        default:
            showToast('Platform not supported', 'error');
    }
}

// Share to Twitter
async function shareToTwitter(imageUrl, caption) {
    try {
        const text = encodeURIComponent(caption.substring(0, 280));
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

        openShareWindow(shareUrl, 'twitter-share');
        showToast('Opening Twitter...', 'info');

    } catch (error) {
        console.error('Error sharing to Twitter:', error);
        showToast('Failed to share to Twitter', 'error');
    }
}

// Share to Facebook
async function shareToFacebook(imageUrl, caption) {
    try {
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

        openShareWindow(shareUrl, 'facebook-share');
        showToast('Opening Facebook...', 'info');

    } catch (error) {
        console.error('Error sharing to Facebook:', error);
        showToast('Failed to share to Facebook', 'error');
    }
}

// Share to Instagram
async function shareToInstagram(imageUrl, caption) {
    try {
        // Instagram doesn't support direct sharing via URL
        // Instead, we can download the image and prompt user to upload

        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Create download for user to then upload to Instagram
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'shome_meme_instagram.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        showToast('Image downloaded. Open Instagram to upload.', 'success');

    } catch (error) {
        console.error('Error sharing to Instagram:', error);
        showToast('Failed to prepare for Instagram', 'error');
    }
}

// Share to Reddit
async function shareToReddit(imageUrl, caption) {
    try {
        const title = encodeURIComponent(caption.substring(0, 300));
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;

        openShareWindow(shareUrl, 'reddit-share');
        showToast('Opening Reddit...', 'info');

    } catch (error) {
        console.error('Error sharing to Reddit:', error);
        showToast('Failed to share to Reddit', 'error');
    }
}

// Share to WhatsApp
async function shareToWhatsApp(imageUrl, caption) {
    try {
        const text = encodeURIComponent(caption + '\n\n' + window.location.href);
        const shareUrl = `https://api.whatsapp.com/send?text=${text}`;

        openShareWindow(shareUrl, 'whatsapp-share');
        showToast('Opening WhatsApp...', 'info');

    } catch (error) {
        console.error('Error sharing to WhatsApp:', error);
        showToast('Failed to share to WhatsApp', 'error');
    }
}

// Share to Telegram
async function shareToTelegram(imageUrl, caption) {
    try {
        const text = encodeURIComponent(caption);
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;

        openShareWindow(shareUrl, 'telegram-share');
        showToast('Opening Telegram...', 'info');

    } catch (error) {
        console.error('Error sharing to Telegram:', error);
        showToast('Failed to share to Telegram', 'error');
    }
}

// Share to Pinterest
async function shareToPinterest(imageUrl, caption) {
    try {
        const media = encodeURIComponent(imageUrl);
        const description = encodeURIComponent(caption);
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://pinterest.com/pin/create/button/?media=${media}&description=${description}&url=${url}`;

        openShareWindow(shareUrl, 'pinterest-share');
        showToast('Opening Pinterest...', 'info');

    } catch (error) {
        console.error('Error sharing to Pinterest:', error);
        showToast('Failed to share to Pinterest', 'error');
    }
}

// Share to TikTok
async function shareToTikTok(imageUrl, caption) {
    try {
        // TikTok doesn't support direct sharing via URL
        // Similar to Instagram, download the image

        const response = await fetch(imageUrl);
        const blob = await response.blob();

        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'shome_meme_tiktok.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        showToast('Image downloaded. Open TikTok to upload.', 'success');

    } catch (error) {
        console.error('Error sharing to TikTok:', error);
        showToast('Failed to prepare for TikTok', 'error');
    }
}

// Copy share link
async function copyShareLink() {
    try {
        const directLink = document.getElementById('directLink');
        if (!directLink) return;

        await navigator.clipboard.writeText(directLink.value);
        showToast('Link copied to clipboard!', 'success');

    } catch (error) {
        console.error('Error copying link:', error);

        // Fallback
        const directLink = document.getElementById('directLink');
        if (directLink) {
            directLink.select();
            document.execCommand('copy');
            showToast('Link copied to clipboard!', 'success');
        }
    }
}

// Download share image
async function downloadShareImage() {
    if (!currentShareData?.imageUrl) return;

    try {
        const response = await fetch(currentShareData.imageUrl);
        const blob = await response.blob();

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shome_meme_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Image downloaded!', 'success');

    } catch (error) {
        console.error('Error downloading image:', error);
        showToast('Failed to download image', 'error');
    }
}

// Set up copy buttons
function setupCopyButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.copy-link')) {
            const button = e.target.closest('.copy-link');
            const targetId = button.getAttribute('data-copy');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                copyToClipboard(targetElement.value || targetElement.textContent);
            }
        }
    });
}

// Copy to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);

        // Fallback method
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Copied to clipboard!', 'success');
            return true;
        } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
            showToast('Failed to copy to clipboard', 'error');
            return false;
        }
    }
}

// Generate share link
export function generateShareLink(contentId, type = 'meme') {
    const baseUrl = window.location.origin;
    const shareId = generateUniqueId();

    return {
        directLink: `${baseUrl}/share/${shareId}`,
        embedLink: `${baseUrl}/embed/${shareId}`,
        shortLink: `${baseUrl}/s/${shareId.substring(0, 8)}`
    };
}

// Get embed code
export function getEmbedCode(contentUrl, width = 600, height = 400) {
    return `<iframe src="${contentUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
}

// Open share window
function openShareWindow(url, name = 'share', width = 600, height = 400) {
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const features = `
        width=${width},
        height=${height},
        top=${top},
        left=${left},
        scrollbars=yes,
        status=yes,
        resizable=yes
    `;

    window.open(url, name, features);
}

// Share meme with data
export async function shareMemeWithData(memeData, platformId = null) {
    try {
        // Create a temporary image for sharing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 1200;
        canvas.height = 630; // Facebook/Twitter recommended size

        // Draw meme
        // This would require the actual meme drawing logic
        // For now, we'll use a placeholder

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Open share modal
        openShareModal(dataUrl, memeData.caption || 'Check out my meme!');

        // If platform specified, share directly
        if (platformId) {
            setTimeout(() => shareToPlatform(platformId), 500);
        }

    } catch (error) {
        console.error('Error sharing meme:', error);
        showToast('Failed to prepare meme for sharing', 'error');
    }
}

// QR Code generation for sharing
export function generateQRCode(url, size = 200) {
    return new Promise((resolve, reject) => {
        // This would use a QR code library
        // For demo, return a placeholder
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Draw simple QR code placeholder
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = '#000000';
        // Draw simple pattern
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillRect(i * size / 10, j * size / 10, size / 10, size / 10);
                }
            }
        }

        resolve(canvas.toDataURL());
    });
}

// Social sharing styles
const socialSharingStyles = `
    .share-preview {
        padding: var(--spacing-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-bottom: 1px solid var(--modal-border);
    }
    
    #sharePreview {
        max-width: 300px;
        max-height: 300px;
        border-radius: var(--border-radius);
        box-shadow: var(--card-shadow);
    }
    
    .share-options {
        padding: var(--spacing-xl);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
    }
    
    .share-input {
        position: relative;
    }
    
    #shareCaption {
        width: 100%;
        padding: var(--spacing-md);
        border: 2px solid #e0e0e0;
        border-radius: var(--border-radius-sm);
        font-size: 16px;
        background: var(--modal-bg);
        color: var(--text-color);
        resize: none;
        min-height: 80px;
        font-family: var(--font-body);
    }
    
    .char-count {
        position: absolute;
        bottom: -20px;
        right: 0;
        font-size: 12px;
        color: var(--text-light);
        transition: color 0.2s;
    }
    
    .platform-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: var(--spacing-md);
    }
    
    .platform-btn {
        padding: var(--spacing-md);
        background: #f0f0f0;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        transition: all 0.2s;
        color: var(--text-color);
    }
    
    .platform-btn:hover {
        transform: translateY(-2px);
        box-shadow: var(--card-shadow);
        background: var(--platform-color, #f0f0f0);
        color: white;
    }
    
    .platform-btn:hover i {
        transform: scale(1.1);
    }
    
    .platform-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }
    
    .platform-btn i {
        font-size: 24px;
        transition: transform 0.2s;
        color: var(--platform-color, var(--text-color));
    }
    
    .platform-btn:hover i {
        color: white;
    }
    
    .platform-btn span {
        font-size: 12px;
        font-weight: 500;
    }
    
    .share-links {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }
    
    .link-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }
    
    .link-item label {
        font-size: 14px;
        color: var(--text-light);
        font-weight: 500;
    }
    
    .link-input {
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .link-input input,
    .link-input textarea {
        flex: 1;
        padding: var(--spacing-sm) var(--spacing-md);
        border: 2px solid #e0e0e0;
        border-radius: var(--border-radius-sm);
        font-size: 14px;
        background: var(--modal-bg);
        color: var(--text-color);
        resize: none;
        font-family: monospace;
    }
    
    .link-input textarea {
        min-height: 80px;
        line-height: 1.4;
    }
    
    .copy-link {
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
        min-width: 44px;
    }
    
    .copy-link:hover {
        background: #3d8b40;
    }
    
    .qr-code-container {
        text-align: center;
        padding: var(--spacing-lg);
        border-top: 1px solid var(--modal-border);
    }
    
    .qr-code {
        margin: 0 auto var(--spacing-md);
        padding: var(--spacing-sm);
        background: white;
        border-radius: var(--border-radius-sm);
        display: inline-block;
    }
    
    @media (prefers-color-scheme: dark) {
        .share-preview {
            background: #2d2d2d;
        }
        
        .platform-btn {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .platform-btn:hover {
            background: var(--platform-color, rgba(255, 255, 255, 0.2));
        }
        
        .link-input input,
        .link-input textarea {
            background: #2d2d2d;
            border-color: #3d3d3d;
        }
    }
    
    @media (max-width: 480px) {
        .platform-grid {
            grid-template-columns: repeat(3, 1fr);
        }
        
        .platform-btn {
            padding: var(--spacing-sm);
        }
        
        .platform-btn i {
            font-size: 20px;
        }
        
        .platform-btn span {
            font-size: 11px;
        }
    }
`;

// Add styles to document
const socialStyleSheet = document.createElement('style');
socialStyleSheet.textContent = socialSharingStyles;
document.head.appendChild(socialStyleSheet);
// Export all public functions
/*export {
    initSocialSharing,
    shareToPlatform,
    generateShareLink,
    copyToClipboard,
    getEmbedCode,
    openShareModal
};*/