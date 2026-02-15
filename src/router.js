// Simple router
export function initRouter() {
    const pages = {
        '/': '/index.html',
        '/blog': '/src/blog.html',
        '/cart': '/src/cart.html',
        '/admin': '/src/admin.html',
        '/success': '/src/success.html'
    };

    // Handle navigation
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href.startsWith(window.location.origin)) {
            e.preventDefault();
            const path = link.pathname;
            if (pages[path]) {
                navigateTo(pages[path]);
            }
        }
    });
}

// Navigate to page
function navigateTo(page) {
    fetch(page)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // Update the main content
            document.querySelector('main').innerHTML = newDoc.querySelector('main').innerHTML;
            
            // Update the title
            document.title = newDoc.title;
            
            // Update URL
            window.history.pushState({}, '', page);
        })
        .catch(error => console.error('Navigation error:', error));
}