import './style.css';

// Function to load blog posts
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const { posts } = await response.json();
        displayPosts(posts);
        setFeaturedPost(posts[0]); // Latest post as featured
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Function to display posts
function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.innerHTML = posts.map(post => `
        <article class="blog-post">
            <h3>${post.title}</h3>
            <div class="post-meta">
                <span class="date">${new Date(post.date).toLocaleDateString()}</span>
                <span class="category">${post.category}</span>
            </div>
            <p>${post.excerpt}</p>
            <div class="post-footer">
                <a href="/post/${post.slug}" class="read-more">Read More</a>
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
                </div>
            </div>
        </article>
    `).join('');
}

// Function to set featured post
function setFeaturedPost(post) {
    const featured = document.querySelector('.featured-post');
    if (!featured || !post) return;

    featured.innerHTML = `
        <h2>Featured Post</h2>
        <article class="blog-post featured">
            <h3>${post.title}</h3>
            <div class="post-meta">
                <span class="date">${new Date(post.date).toLocaleDateString()}</span>
                <span class="author">By ${post.author}</span>
            </div>
            <p>${post.excerpt}</p>
            <div class="post-footer">
                <a href="/post/${post.slug}" class="read-more">Read More</a>
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
                </div>
            </div>
        </article>
    `;
}

// Function to filter posts by category
function filterByCategory(category) {
    const posts = document.querySelectorAll('.blog-post:not(.featured)');
    posts.forEach(post => {
        const postCategory = post.querySelector('.category').textContent;
        post.style.display = category === 'all' || postCategory === category ? 'block' : 'none';
    });
}

// Social sharing functionality
function sharePost(platform, postUrl, title) {
    const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(title)}`
    };

    window.open(urls[platform], 'share-dialog', 'width=600,height=400');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();

    // Add category filter listeners
    document.querySelectorAll('.categories a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            filterByCategory(category);
        });
    });
});