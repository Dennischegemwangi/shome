// Function to handle image upload
function handleImageUpload(event) {
    const files = event.target.files;
    // Handle the file upload logic here
    console.log(files);
}

// Function to set up event listeners
function setupEventListeners() {
    const fileInput = document.getElementById('image-upload');
    fileInput.addEventListener('change', handleImageUpload);
    // Other event listeners can be added here
}