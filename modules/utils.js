// modules/utils.js - Utility functions for Shome Meme App

// Debounce function
export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Throttle function
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format file size
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate unique ID
export function generateUniqueId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format time (relative or absolute)
export function formatTime(timestamp, type = 'relative') {
    if (!timestamp) return 'Just now';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (type === 'relative') {
        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
        if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
        return `${Math.floor(diffDay / 365)}y ago`;
    } else {
        // Absolute format
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Show toast notification
export function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        if (toast.dataset.autoRemove !== 'false') {
            toast.remove();
        }
    });

    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    // Add close button event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    return toast;
}

// Show loading indicator
export function showLoading(message = 'Loading...', fullscreen = false) {
    // Remove existing loading
    hideLoading();

    const loading = document.createElement('div');
    loading.className = `loading ${fullscreen ? 'fullscreen' : ''}`;
    loading.id = 'app-loading';

    loading.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(loading);

    // Add styles if not already present
    if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .loading {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .loading.fullscreen {
                background: var(--background-light);
            }
            
            .loading-content {
                background: var(--modal-bg);
                padding: var(--spacing-xl);
                border-radius: var(--border-radius);
                text-align: center;
                box-shadow: var(--modal-shadow);
                min-width: 200px;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                border-top-color: var(--primary-color);
                animation: spin 1s ease-in-out infinite;
                margin: 0 auto var(--spacing-md);
            }
            
            .loading p {
                margin: 0;
                color: var(--text-color);
                font-size: 14px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    return loading;
}

// Hide loading indicator
export function hideLoading() {
    const loading = document.getElementById('app-loading');
    if (loading) {
        loading.remove();
    }
}

// Validate file
export function validateFile(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
    const errors = [];

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        errors.push(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        errors.push(`File too large. Maximum size: ${maxSizeMB}MB`);
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Compress image
export async function compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                const maxWidth = options.maxWidth || 1920;
                const maxHeight = options.maxHeight || 1080;
                const quality = options.quality || 0.8;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress image
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'));
                        }
                    },
                    file.type || 'image/jpeg',
                    quality
                );
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Parse URL parameters
export function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');

    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    }

    return params;
}

// Set URL parameter
export function setUrlParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
}

// Remove URL parameter
export function removeUrlParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
}

// Deep clone object
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.reduce((arr, item, i) => {
        arr[i] = deepClone(item);
        return arr;
    }, []);
    if (typeof obj === 'object') return Object.keys(obj).reduce((newObj, key) => {
        newObj[key] = deepClone(obj[key]);
        return newObj;
    }, {});
    return obj;
}

// Merge objects deeply
export function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, {
                        [key]: source[key]
                    });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, {
                    [key]: source[key]
                });
            }
        });
    }
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// Generate random color
export function getRandomColor() {
    const colors = [
        '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
        '#FF4444', '#00BCD4', '#8BC34A', '#FF5722',
        '#673AB7', '#3F51B5', '#009688', '#FFC107'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Generate gradient colors
export function generateGradient(angle = 45, colors = ['#4CAF50', '#2196F3']) {
    return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}

// Capitalize first letter
export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate text
export function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Format number with commas
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Detect mobile device
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detect touch device
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Get browser info
export function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = '';

    // Detect browser
    if (ua.includes('Firefox')) {
        browser = 'Firefox';
        version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
        browser = 'Chrome';
        version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browser = 'Safari';
        version = ua.match(/Version\/([0-9.]+)/)?.[1] || '';
    } else if (ua.includes('Edg')) {
        browser = 'Edge';
        version = ua.match(/Edg\/([0-9.]+)/)?.[1] || '';
    }

    return {
        browser,
        version
    };
}

// Get device pixel ratio
export function getPixelRatio() {
    return window.devicePixelRatio || 1;
}

// Create blob from data URL
export function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {
        type: mime
    });
}

// Create data URL from blob
export function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Download file
export function downloadFile(data, filename, type = 'application/octet-stream') {
    const blob = new Blob([data], {
        type
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Copy text to clipboard
export async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy text:', error);

        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            return true;
        } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

// Generate hash from string
export function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// Sleep/delay function
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry function with exponential backoff
export async function retry(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await sleep(delay);
        return retry(fn, retries - 1, delay * 2);
    }
}

// Measure performance
export function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
}

// Create UUID
export function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Validate email
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate URL
export function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Sanitize HTML
export function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

// Escape regex characters
export function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get scroll position
export function getScrollPosition(element = window) {
    if (element === window) {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    } else {
        return {
            x: element.scrollLeft,
            y: element.scrollTop
        };
    }
}

// Scroll to element smoothly
export function scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Add CSS class with vendor prefixes
export function addVendorPrefix(property, value) {
    const prefixes = ['webkit', 'moz', 'ms', 'o'];
    const styles = {};

    styles[property] = value;
    prefixes.forEach(prefix => {
        styles[`${prefix}${property.charAt(0).toUpperCase() + property.slice(1)}`] = value;
    });

    return styles;
}

// Get CSS variable value
export function getCSSVariable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Set CSS variable
export function setCSSVariable(name, value) {
    document.documentElement.style.setProperty(name, value);
}

// Create element with attributes
export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else if (value !== null && value !== undefined) {
            element.setAttribute(key, value);
        }
    });

    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
}

// Remove element
export function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

// Toggle element visibility
export function toggleElement(element, show) {
    if (element) {
        element.style.display = show ? '' : 'none';
    }
}

// Fade in element
export function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = '';

    let start = null;

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);

        element.style.opacity = opacity.toString();

        if (progress < duration) {
            window.requestAnimationFrame(animate);
        }
    }

    window.requestAnimationFrame(animate);
}

// Fade out element
export function fadeOut(element, duration = 300) {
    let start = null;

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.max(1 - progress / duration, 0);

        element.style.opacity = opacity.toString();

        if (progress < duration) {
            window.requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
            element.style.opacity = '';
        }
    }

    window.requestAnimationFrame(animate);
}

// Export all utilities
export default {
    debounce,
    throttle,
    formatFileSize,
    generateUniqueId,
    formatTime,
    showToast,
    showLoading,
    hideLoading,
    validateFile,
    compressImage,
    getUrlParams,
    setUrlParam,
    removeUrlParam,
    deepClone,
    deepMerge,
    getRandomColor,
    generateGradient,
    capitalizeFirst,
    truncateText,
    formatNumber,
    isMobile,
    isTouchDevice,
    getBrowserInfo,
    getPixelRatio,
    dataURLtoBlob,
    blobToDataURL,
    downloadFile,
    copyTextToClipboard,
    hashString,
    sleep,
    retry,
    measurePerformance,
    createUUID,
    validateEmail,
    validateURL,
    sanitizeHTML,
    escapeRegex,
    getScrollPosition,
    scrollToElement,
    addVendorPrefix,
    getCSSVariable,
    setCSSVariable,
    createElement,
    removeElement,
    toggleElement,
    fadeIn,
    fadeOut
};