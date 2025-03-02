// ✅ Change this Ngrok URL when restarting Ngrok
const NGROK_URL = "https://ea8b-2405-201-c407-c0cf-e89e-ec2e-1fde-66c7.ngrok-free.app"; // Replace this!

// DOM Elements
let fileInput;
let uploadButton;
let dropArea;
let progressContainer;
let progressBar;
let progressText;
let resultCard;
let fileInfo;
let shareLink;
let downloadLink;
let copyLinkButton;
let shareNewButton;
let toast;

// File to upload
let selectedFile = null;

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    fileInput = document.getElementById("file-input");
    uploadButton = document.getElementById("upload-button");
    dropArea = document.getElementById("drop-area");
    progressContainer = document.getElementById("progress-container");
    progressBar = document.getElementById("progress-bar");
    progressText = document.getElementById("progress-text");
    resultCard = document.getElementById("result-card");
    fileInfo = document.getElementById("file-info");
    shareLink = document.getElementById("share-link");
    downloadLink = document.getElementById("download-link");
    copyLinkButton = document.getElementById("copy-link");
    shareNewButton = document.getElementById("share-new");
    toast = document.getElementById("toast");

    // Add event listeners
    fileInput.addEventListener("change", handleFileSelect);
    uploadButton.addEventListener("click", uploadFile);
    dropArea.addEventListener("click", () => fileInput.click());
    copyLinkButton.addEventListener("click", copyLinkToClipboard);
    shareNewButton.addEventListener("click", resetForm);

    // Drag and drop functionality
    setupDragAndDrop();
});

// Handle file selection
function handleFileSelect(event) {
    selectedFile = event.target.files[0];
    
    if (selectedFile) {
        uploadButton.disabled = false;
        dropArea.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>${selectedFile.name} (${formatFileSize(selectedFile.size)})</p>
            <p class="browse-link">Change file</p>
        `;
    }
}

// Format file size to human-readable format
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Set up drag and drop functionality
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('drag-over');
}

function unhighlight() {
    dropArea.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    
    if (file) {
        selectedFile = file;
        uploadButton.disabled = false;
        
        dropArea.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>${file.name} (${formatFileSize(file.size)})</p>
            <p class="browse-link">Change file</p>
        `;
    }
}

// Upload the selected file
async function uploadFile() {
    if (!selectedFile) {
        return;
    }

    // Show progress UI
    dropArea.style.display = 'none';
    progressContainer.style.display = 'block';
    uploadButton.disabled = true;
    
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        // Create a mock progress simulation
        simulateProgress();
        
        // Send file to the server
        const response = await fetch(`${NGROK_URL}/upload`, { 
            method: "POST",
            body: formData
        });

        // Handle server response
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ File uploaded:", result);

        // Complete the progress bar
        progressBar.style.width = '100%';
        progressText.textContent = 'Upload complete!';
        
        // Show success UI after a short delay
        setTimeout(() => {
            showSuccessUI(result);
        }, 500);
    } catch (error) {
        console.error("❌ Error uploading file:", error);
        
        // Show error in progress bar
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = 'var(--error-color)';
        progressText.textContent = `Error: ${error.message}`;
        progressText.style.color = 'var(--error-color)';
        
        // Re-enable upload button after a delay
        setTimeout(() => {
            resetForm();
        }, 3000);
    }
}

// Simulate upload progress
function simulateProgress() {
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 90) {
            clearInterval(interval);
            return;
        }
        width += Math.random() * 10;
        if (width > 90) width = 90;
        progressBar.style.width = width + '%';
    }, 300);
}

// Show success UI
function showSuccessUI(result) {
    // Hide upload UI
    progressContainer.style.display = 'none';
    uploadButton.style.display = 'none';
    
    // Show result card
    resultCard.style.display = 'block';
    
    // Set file info
    fileInfo.textContent = `${selectedFile.name} (${formatFileSize(selectedFile.size)})`;
    
    // Set download link
    const downloadUrl = `${NGROK_URL}/download/${result.filename}`;
    shareLink.value = downloadUrl;
    downloadLink.href = downloadUrl;
}

// Copy link to clipboard
function copyLinkToClipboard() {
    shareLink.select();
    document.execCommand('copy');
    
    // Show toast notification
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Reset the form to upload a new file
function resetForm() {
    // Reset file input
    fileInput.value = '';
    selectedFile = null;
    
    // Reset UI elements
    dropArea.style.display = 'block';
    dropArea.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-cloud">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M12 12v9"></path>
            <path d="m16 16-4-4-4 4"></path>
        </svg>
        <p>Drag & drop files here or <label for="file-input" class="browse-link">browse</label></p>
    `;
    
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    progressBar.style.backgroundColor = 'var(--primary-color)';
    progressText.textContent = 'Uploading...';
    progressText.style.color = 'var(--text-secondary)';
    
    resultCard.style.display = 'none';
    uploadButton.style.display = 'block';
    uploadButton.disabled = true;
}