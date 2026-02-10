// modules/textStyling.js
// modules/textStyling.js - CORRECTED IMPORTS
/*import { 
    showToast,
    showLoading,
    hideLoading 
} from './utils.js';*/

let currentTextStyle = {
    font: 'Impact',
    size: 48,
    color: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 3,
    shadow: false,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 5,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    gradient: false,
    gradientColors: ['#ffffff', '#cccccc'],
    outline: false,
    outlineColor: '#000000',
    outlineWidth: 2,
    position: 'center',
    alignment: 'center',
    bold: true,
    italic: false,
    underline: false
};

// Initialize text styling
export function initTextStyling() {
    console.log('✅ Text styling initialized');

    // Set up text styling UI
    setupTextStylingUI();

    // Load saved styles
    loadSavedStyles();
}

// Set up text styling UI
function setupTextStylingUI() {
    // Advanced text options toggle
    const toggleBtn = document.getElementById('toggleAdvancedText');
    const advancedOptions = document.getElementById('advancedTextOptions');

    if (toggleBtn && advancedOptions) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = advancedOptions.style.display === 'none';
            advancedOptions.style.display = isHidden ? 'block' : 'none';

            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
            }

            toggleBtn.classList.toggle('active', isHidden);
        });
    }

    // Text effects checkboxes
    setupTextEffects();

    // Position controls
    setupPositionControls();

    // Font selector (already in memeEditor.js)
    // Color picker (already in memeEditor.js)
    // Size controls (already in memeEditor.js)
}

// Set up text effects
function setupTextEffects() {
    const textOutline = document.getElementById('textOutline');
    const textShadow = document.getElementById('textShadow');
    const textGradient = document.getElementById('textGradient');

    if (textOutline) {
        textOutline.checked = currentTextStyle.outline;
        textOutline.addEventListener('change', (e) => {
            toggleTextEffect('outline', e.target.checked);
        });
    }

    if (textShadow) {
        textShadow.checked = currentTextStyle.shadow;
        textShadow.addEventListener('change', (e) => {
            toggleTextEffect('shadow', e.target.checked);
        });
    }

    if (textGradient) {
        textGradient.checked = currentTextStyle.gradient;
        textGradient.addEventListener('change', (e) => {
            toggleTextEffect('gradient', e.target.checked);
        });
    }
}

// Set up position controls
function setupPositionControls() {
    const positionGrid = document.querySelector('.position-grid');
    if (!positionGrid) return;

    // Set initial active position
    const activeBtn = positionGrid.querySelector(`[data-pos="${currentTextStyle.position}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Add click handlers
    positionGrid.querySelectorAll('.pos-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            positionGrid.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Update text position
            const position = btn.getAttribute('data-pos');
            setTextPosition(position);
        });
    });
}

// Toggle text effect
export function toggleTextEffect(effect, enabled) {
    currentTextStyle[effect] = enabled;

    // Update UI
    updateEffectUI(effect, enabled);

    // Apply to canvas
    applyTextStylesToCanvas();

    showToast(`${effect} ${enabled ? 'enabled' : 'disabled'}`, 'info');
}

// Update effect UI
function updateEffectUI(effect, enabled) {
    const checkbox = document.getElementById(`text${effect.charAt(0).toUpperCase() + effect.slice(1)}`);
    if (checkbox) {
        checkbox.checked = enabled;
    }

    // Show/hide effect options
    const optionsContainer = document.getElementById(`${effect}Options`);
    if (optionsContainer) {
        optionsContainer.style.display = enabled ? 'block' : 'none';
    }
}

// Set text position
function setTextPosition(position) {
    currentTextStyle.position = position;

    // Calculate position coordinates
    let x, y;
    const canvas = document.getElementById('memeCanvas');
    if (!canvas) return;

    switch (position) {
        case 'top-left':
            x = 50;
            y = 50;
            currentTextStyle.alignment = 'left';
            break;
        case 'top-center':
            x = canvas.width / 2;
            y = 50;
            currentTextStyle.alignment = 'center';
            break;
        case 'top-right':
            x = canvas.width - 50;
            y = 50;
            currentTextStyle.alignment = 'right';
            break;
        case 'middle-left':
            x = 50;
            y = canvas.height / 2;
            currentTextStyle.alignment = 'left';
            break;
        case 'center':
            x = canvas.width / 2;
            y = canvas.height / 2;
            currentTextStyle.alignment = 'center';
            break;
        case 'middle-right':
            x = canvas.width - 50;
            y = canvas.height / 2;
            currentTextStyle.alignment = 'right';
            break;
        case 'bottom-left':
            x = 50;
            y = canvas.height - 50;
            currentTextStyle.alignment = 'left';
            break;
        case 'bottom-center':
            x = canvas.width / 2;
            y = canvas.height - 50;
            currentTextStyle.alignment = 'center';
            break;
        case 'bottom-right':
            x = canvas.width - 50;
            y = canvas.height - 50;
            currentTextStyle.alignment = 'right';
            break;
    }

    // Update text layers
    updateTextLayerPositions(x, y, position);

    // Apply styles
    applyTextStylesToCanvas();
}

// Update text layer positions
function updateTextLayerPositions(x, y, position) {
    // This would update existing text layers
    // Implementation depends on how text layers are stored
    console.log('Update text positions to:', {
        x,
        y,
        position
    });
}

// Apply text styles to canvas
function applyTextStylesToCanvas() {
    // Get canvas context
    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas?.getContext('2d');

    if (!ctx) return;

    // Apply styles to context
    ctx.font = `${currentTextStyle.bold ? 'bold ' : ''}${currentTextStyle.italic ? 'italic ' : ''}${currentTextStyle.size}px ${currentTextStyle.font}`;
    ctx.textAlign = currentTextStyle.alignment;
    ctx.textBaseline = 'middle';

    // Set fill style
    if (currentTextStyle.gradient) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, currentTextStyle.gradientColors[0]);
        gradient.addColorStop(1, currentTextStyle.gradientColors[1]);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = currentTextStyle.color;
    }

    // Set stroke style
    if (currentTextStyle.outline) {
        ctx.strokeStyle = currentTextStyle.outlineColor;
        ctx.lineWidth = currentTextStyle.outlineWidth;
    }

    // Set shadow
    if (currentTextStyle.shadow) {
        ctx.shadowColor = currentTextStyle.shadowColor;
        ctx.shadowBlur = currentTextStyle.shadowBlur;
        ctx.shadowOffsetX = currentTextStyle.shadowOffsetX;
        ctx.shadowOffsetY = currentTextStyle.shadowOffsetY;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    // Redraw canvas if needed
    // This would trigger a redraw of text layers
    triggerCanvasRedraw();
}

// Trigger canvas redraw
function triggerCanvasRedraw() {
    // Dispatch custom event for memeEditor to redraw
    const event = new CustomEvent('textStyleChanged', {
        detail: {
            styles: currentTextStyle
        }
    });
    document.dispatchEvent(event);
}

// Set text font
export function setTextFont(font) {
    currentTextStyle.font = font;
    applyTextStylesToCanvas();

    // Update UI
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.value = font;
    }
}

// Set text color
export function setTextColor(color) {
    currentTextStyle.color = color;

    // Convert color name to hex if needed
    if (color.startsWith('#')) {
        currentTextStyle.color = color;
    } else {
        const colorMap = {
            'white': '#ffffff',
            'black': '#000000',
            'red': '#ff4444',
            'blue': '#2196F3',
            'green': '#4CAF50',
            'yellow': '#ffd700'
        };
        currentTextStyle.color = colorMap[color] || color;
    }

    applyTextStylesToCanvas();

    // Update UI
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-color') === color);
    });
}

// Set text size
export function setTextSize(size) {
    currentTextStyle.size = Math.max(12, Math.min(144, size));
    applyTextStylesToCanvas();

    // Update UI
    const sizeValue = document.querySelector('.size-value');
    if (sizeValue) {
        sizeValue.textContent = `${currentTextStyle.size}px`;
    }
}

// Adjust text size
export function adjustTextSize(operation) {
    const newSize = operation === '+' ?
        currentTextStyle.size + 4 :
        currentTextStyle.size - 4;

    setTextSize(newSize);
}

// Set text bold
export function setTextBold(bold) {
    currentTextStyle.bold = bold;
    applyTextStylesToCanvas();
}

// Set text italic
export function setTextItalic(italic) {
    currentTextStyle.italic = italic;
    applyTextStylesToCanvas();
}

// Set text underline
export function setTextUnderline(underline) {
    currentTextStyle.underline = underline;
    // Note: Canvas doesn't support underline directly
    // Would need to draw it manually
    applyTextStylesToCanvas();
}

// Set text shadow
export function setTextShadow(shadowOptions) {
    currentTextStyle.shadow = true;
    currentTextStyle.shadowColor = shadowOptions.color || 'rgba(0, 0, 0, 0.5)';
    currentTextStyle.shadowBlur = shadowOptions.blur || 5;
    currentTextStyle.shadowOffsetX = shadowOptions.offsetX || 2;
    currentTextStyle.shadowOffsetY = shadowOptions.offsetY || 2;

    applyTextStylesToCanvas();
}

// Set text gradient
export function setTextGradient(colors) {
    currentTextStyle.gradient = true;
    currentTextStyle.gradientColors = colors || ['#ffffff', '#cccccc'];
    applyTextStylesToCanvas();
}

// Set text outline
export function setTextOutline(outlineOptions) {
    currentTextStyle.outline = true;
    currentTextStyle.outlineColor = outlineOptions.color || '#000000';
    currentTextStyle.outlineWidth = outlineOptions.width || 2;
    applyTextStylesToCanvas();
}

// Load saved styles
function loadSavedStyles() {
    try {
        const savedStyles = localStorage.getItem('shome_text_styles');
        if (savedStyles) {
            const styles = JSON.parse(savedStyles);
            Object.assign(currentTextStyle, styles);

            // Update UI
            updateUIFromStyles();
        }
    } catch (error) {
        console.error('Error loading text styles:', error);
    }
}

// Save styles
function saveStyles() {
    try {
        localStorage.setItem('shome_text_styles', JSON.stringify(currentTextStyle));
    } catch (error) {
        console.error('Error saving text styles:', error);
    }
}

// Update UI from styles
function updateUIFromStyles() {
    // Update font selector
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.value = currentTextStyle.font;
    }

    // Update color picker
    document.querySelectorAll('.color-option').forEach(btn => {
        // Convert hex to color name for matching
        const colorName = getColorName(currentTextStyle.color);
        btn.classList.toggle('active', btn.getAttribute('data-color') === colorName);
    });

    // Update size display
    const sizeValue = document.querySelector('.size-value');
    if (sizeValue) {
        sizeValue.textContent = `${currentTextStyle.size}px`;
    }

    // Update effects checkboxes
    const textOutline = document.getElementById('textOutline');
    const textShadow = document.getElementById('textShadow');
    const textGradient = document.getElementById('textGradient');

    if (textOutline) textOutline.checked = currentTextStyle.outline;
    if (textShadow) textShadow.checked = currentTextStyle.shadow;
    if (textGradient) textGradient.checked = currentTextStyle.gradient;

    // Update position
    const positionGrid = document.querySelector('.position-grid');
    if (positionGrid) {
        positionGrid.querySelectorAll('.pos-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-pos') === currentTextStyle.position);
        });
    }
}

// Get color name from hex
function getColorName(hex) {
    const colorMap = {
        '#ffffff': 'white',
        '#000000': 'black',
        '#ff4444': 'red',
        '#2196F3': 'blue',
        '#4CAF50': 'green',
        '#ffd700': 'yellow'
    };

    return colorMap[hex.toLowerCase()] || 'white';
}

// Get current text style
export function getCurrentTextStyle() {
    return {
        ...currentTextStyle
    };
}

// Reset text style
export function resetTextStyle() {
    currentTextStyle = {
        font: 'Impact',
        size: 48,
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 3,
        shadow: false,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 5,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        gradient: false,
        gradientColors: ['#ffffff', '#cccccc'],
        outline: false,
        outlineColor: '#000000',
        outlineWidth: 2,
        position: 'center',
        alignment: 'center',
        bold: true,
        italic: false,
        underline: false
    };

    updateUIFromStyles();
    applyTextStylesToCanvas();
    saveStyles();

    showToast('Text styles reset', 'info');
}

// Save style preset
export function saveStylePreset(name) {
    try {
        const presets = JSON.parse(localStorage.getItem('shome_text_presets') || '{}');
        presets[name] = {
            ...currentTextStyle
        };
        localStorage.setItem('shome_text_presets', JSON.stringify(presets));

        showToast(`Style "${name}" saved`, 'success');
    } catch (error) {
        console.error('Error saving style preset:', error);
        showToast('Failed to save style preset', 'error');
    }
}

// Load style preset
export function loadStylePreset(name) {
    try {
        const presets = JSON.parse(localStorage.getItem('shome_text_presets') || '{}');
        const preset = presets[name];

        if (preset) {
            Object.assign(currentTextStyle, preset);
            updateUIFromStyles();
            applyTextStylesToCanvas();
            showToast(`Style "${name}" loaded`, 'success');
        } else {
            showToast(`Style "${name}" not found`, 'error');
        }
    } catch (error) {
        console.error('Error loading style preset:', error);
        showToast('Failed to load style preset', 'error');
    }
}

// Export text style as CSS
export function exportTextStyleAsCSS() {
    const css = `
.text-style-${Date.now()} {
    font-family: ${currentTextStyle.font}, sans-serif;
    font-size: ${currentTextStyle.size}px;
    font-weight: ${currentTextStyle.bold ? 'bold' : 'normal'};
    font-style: ${currentTextStyle.italic ? 'italic' : 'normal'};
    color: ${currentTextStyle.color};
    text-align: ${currentTextStyle.alignment};
    ${currentTextStyle.shadow ? `text-shadow: ${currentTextStyle.shadowOffsetX}px ${currentTextStyle.shadowOffsetY}px ${currentTextStyle.shadowBlur}px ${currentTextStyle.shadowColor};` : ''}
    ${currentTextStyle.gradient ? `background: linear-gradient(90deg, ${currentTextStyle.gradientColors[0]}, ${currentTextStyle.gradientColors[1]}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;` : ''}
}
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(css).then(() => {
        showToast('CSS copied to clipboard', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = css;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('CSS copied to clipboard', 'success');
    });
}

// Add text styling styles
const textStylingStyles = `
    .advanced-text-options {
        transition: all 0.3s ease;
        overflow: hidden;
    }
    
    .text-effects-grid {
        gap: var(--spacing-md);
    }
    
    .effect-option {
        padding: var(--spacing-sm);
        background: rgba(0, 0, 0, 0.05);
        border-radius: var(--border-radius-sm);
        transition: background-color 0.2s;
    }
    
    .effect-option:hover {
        background: rgba(0, 0, 0, 0.1);
    }
    
    .effect-option input[type="checkbox"] {
        accent-color: var(--primary-color);
    }
    
    .position-grid {
        max-width: 240px;
    }
    
    .pos-btn {
        background: rgba(0, 0, 0, 0.05);
        border: 2px solid transparent;
        transition: all 0.2s;
    }
    
    .pos-btn:hover {
        background: rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 0, 0, 0.2);
    }
    
    .pos-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        transform: scale(1.1);
    }
    
    @media (prefers-color-scheme: dark) {
        .effect-option {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .effect-option:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .pos-btn {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .pos-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }
    }
`;

// Add styles to document
const textStylingStyleSheet = document.createElement('style');
textStylingStyleSheet.textContent = textStylingStyles;
document.head.appendChild(textStylingStyleSheet);