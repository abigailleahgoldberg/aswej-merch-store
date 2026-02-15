import './style.css';

// Sample blog post data structure
const blogPosts = [
    {
        id: 1,
        title: "Welcome to the JewSA Blog",
        excerpt: "A place for Jewish humor, culture, and community stories.",
        date: "2026-02-15",
        category: "announcements",
        content: "Full post content will go here...",
        author: "The JewSA Team"
    }
];

// Function to create a blog post element
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'blog-post';
    article.innerHTML = `
        <h3>${post.title}</h3>
        <div class="post-meta">
            <span class="date">${new Date(post.date).toLocaleDateString()}</span>
            <span class="category">${post.category}</span>
        </div>
        <p>${post.excerpt}</p>
        <a href="/post/${post.id}" class="read-more">Read More</a>
    `;
    return article;
}

// Function to load and display blog posts
function displayPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    blogPosts.forEach(post => {
        container.appendChild(createPostElement(post));
    });
}

// Filter posts by category
function filterByCategory(category) {
    const filtered = blogPosts.filter(post => post.category === category);
    const container = document.getElementById('posts-container');
    container.innerHTML = '';
    filtered.forEach(post => {
        container.appendChild(createPostElement(post));
    });
}

// Initialize blog functionality
document.addEventListener('DOMContentLoaded', () => {
    displayPosts();

    // Add category filter listeners
    document.querySelectorAll('.categories a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            filterByCategory(category);
        });
    });
});