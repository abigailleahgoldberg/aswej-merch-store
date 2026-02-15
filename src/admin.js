import './style.css';

// Function to generate a URL-friendly slug
function generateSlug(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Function to save a post
async function savePost(postData) {
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });
        
        if (!response.ok) throw new Error('Failed to save post');
        
        return await response.json();
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Failed to save post. Please try again.');
    }
}

// Function to load existing posts
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Function to display posts in the manager
function displayPosts(posts) {
    const container = document.getElementById('posts-list');
    if (!container) return;

    container.innerHTML = posts.map(post => `
        <div class="post-item">
            <h3>${post.title}</h3>
            <div class="post-meta">
                <span>${new Date(post.date).toLocaleDateString()}</span>
                <span>${post.category}</span>
            </div>
            <div class="post-actions">
                <button onclick="editPost('${post.id}')" class="btn-secondary">Edit</button>
                <button onclick="deletePost('${post.id}')" class="btn-danger">Delete</button>
            </div>
        </div>
    `).join('');
}

// Form submission handler
document.getElementById('post-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const postData = {
        title: formData.get('title'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags: formData.get('tags').split(',').map(tag => tag.trim()),
        date: new Date().toISOString().split('T')[0],
        slug: generateSlug(formData.get('title'))
    };
    
    const saved = await savePost(postData);
    if (saved) {
        alert('Post saved successfully!');
        loadPosts();
        clearForm();
    }
});

// Function to clear the form
window.clearForm = function() {
    document.getElementById('post-form').reset();
};

// Initialize
document.addEventListener('DOMContentLoaded', loadPosts);