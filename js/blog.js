// ========================================
// BLOG SYSTEM - Google Sheets API (No Proxy)
// ========================================

const BlogSystem = {
    // Your Google Sheet ID
    SHEET_ID: '1C-7Nx0OoMP_tPTqlZCAb-npbLLdbd-PS96HPrkaECZI',
    
    // Sheet name
    SHEET_NAME: 'Blog Posts',
    
    // Local storage key for backup
    STORAGE_KEY: 'wcdo_blog_posts',
    
    // Default posts
    defaultPosts: [
        {
            id: 1,
            title: 'Community Health Outreach Reaches 500 Families',
            category: 'News',
            image: 'https://via.placeholder.com/800x400/2d5a3d/ffffff?text=Health+Outreach',
            excerpt: 'Our mobile health clinics provided essential healthcare services to 500 families.',
            content: 'The WCDO Community Health Outreach program successfully reached over 500 families.',
            date: '2026-08-15',
            status: 'published',
            author: 'WCDO Team'
        },
        {
            id: 2,
            title: 'Scholarship Program Opens Applications for 2027',
            category: 'Education',
            image: 'https://via.placeholder.com/800x400/2d5a3d/ffffff?text=Scholarship',
            excerpt: 'Applications are now open for our 2027 scholarship program.',
            content: 'We are excited to announce that applications for the 2027 WCDO Scholarship Program are now open.',
            date: '2026-08-10',
            status: 'published',
            author: 'WCDO Team'
        },
        {
            id: 3,
            title: 'Women Empowerment Workshop a Huge Success',
            category: 'Stories',
            image: 'https://via.placeholder.com/800x400/2d5a3d/ffffff?text=Women+Workshop',
            excerpt: 'Over 100 women participated in our recent leadership workshop.',
            content: 'The WCDO Women Empowerment Initiative hosted a transformative workshop for over 100 women.',
            date: '2026-08-05',
            status: 'published',
            author: 'WCDO Team'
        }
    ],
    
    // ========================================
    // GET POSTS FROM GOOGLE SHEETS
    // ========================================
    async getPosts() {
        try {
            // Use the Google Sheets API (no proxy!)
            const url = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${this.SHEET_NAME}`;
            console.log('Fetching from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            
            // Parse the JSONP response
            const jsonData = JSON.parse(text.substring(47, text.length - 2));
            const rows = jsonData.table.rows;
            
            if (!rows || rows.length === 0) {
                console.log('No data found in sheet');
                return this.getLocalPosts();
            }
            
            // Get headers from the first row
            const headers = jsonData.table.cols.map(col => col.label.toLowerCase().replace(/ /g, '_'));
            
            // Convert rows to objects
            const posts = rows.map(row => {
                const post = {};
                row.c.forEach((cell, index) => {
                    const key = headers[index] || `col_${index}`;
                    post[key] = cell ? cell.v : '';
                });
                return post;
            });
            
            // Filter out empty rows and sort by date
            const validPosts = posts.filter(p => p.id).sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            // Cache locally
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validPosts));
            } catch (e) {}
            
            return validPosts;
        } catch (error) {
            console.error('Error fetching from Google Sheets:', error);
            return this.getLocalPosts();
        }
    },
    
    // ========================================
    // GET LOCAL POSTS (Fallback)
    // ========================================
    getLocalPosts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            this.saveLocalPosts(this.defaultPosts);
            return this.defaultPosts;
        } catch (e) {
            return this.defaultPosts;
        }
    },
    
    saveLocalPosts(posts) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
        } catch (e) {}
    },
    
    // ========================================
    // GET PUBLISHED POSTS ONLY
    // ========================================
    async getPublishedPosts() {
        const allPosts = await this.getPosts();
        return allPosts.filter(post => post.status === 'published');
    },
    
    // ========================================
    // GET A SINGLE POST BY ID
    // ========================================
    async getPost(id) {
        const posts = await this.getPosts();
        return posts.find(post => post.id == id);
    },
    
    // ========================================
    // SEARCH POSTS
    // ========================================
    async searchPosts(query) {
        const posts = await this.getPosts();
        const q = query.toLowerCase().trim();
        if (!q) return posts;
        return posts.filter(post => 
            post.title?.toLowerCase().includes(q) || 
            post.excerpt?.toLowerCase().includes(q) || 
            post.content?.toLowerCase().includes(q) ||
            post.category?.toLowerCase().includes(q)
        );
    }
};

// ========================================
// BLOG RENDERER
// ========================================

async function renderBlogPosts(posts) {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;
    
    if (!posts) {
        posts = await BlogSystem.getPublishedPosts();
    }
    
    if (!posts || posts.length === 0) {
        blogGrid.innerHTML = `
            <div class="no-posts" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-blog" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
                <h3>No blog posts yet</h3>
                <p style="color: var(--gray-dark);">Check back soon for updates and stories from our community.</p>
            </div>
        `;
        return;
    }
    
    blogGrid.innerHTML = posts.map(post => `
        <div class="blog-card" data-id="${post.id}" onclick="openBlogDetail(${post.id})">
            <img src="${post.image || 'https://via.placeholder.com/800x400/2d5a3d/ffffff?text=WCDO+Blog'}" alt="${post.title}" loading="lazy">
            <div class="blog-card-content">
                <div class="blog-meta">
                    <span class="category">${post.category || 'News'}</span>
                    <span>${post.date || 'Recent'}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt || (post.content ? post.content.substring(0, 120) + '...' : '')}</p>
                <span class="read-more">Read More <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>
    `).join('');
}

// ========================================
// BLOG DETAIL MODAL
// ========================================

async function openBlogDetail(id) {
    const post = await BlogSystem.getPost(id);
    if (!post) {
        showNotification('Post not found.', 'error');
        return;
    }
    
    const modal = document.getElementById('blogModal');
    const body = document.getElementById('modalBody');
    
    if (!modal || !body) return;
    
    body.innerHTML = `
        <div class="blog-detail">
            <h2>${post.title}</h2>
            <div class="blog-meta">
                <span class="category">${post.category || 'News'}</span>
                <span>${post.date || 'Recent'}</span>
                <span>By ${post.author || 'WCDO Team'}</span>
            </div>
            ${post.image ? `<img src="${post.image}" alt="${post.title}" style="max-width:100%; border-radius:12px; margin:20px 0;">` : ''}
            <div class="blog-content">
                ${post.content ? post.content.split('\n').map(p => `<p>${p}</p>`).join('') : '<p>Content not available.</p>'}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ========================================
// NOTIFICATION HELPER
// ========================================

function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 18px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2E7D32, #1B5E20)' : 'linear-gradient(135deg, #e53935, #c62828)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 400px;
        font-weight: 500;
        animation: slideInRight 0.5s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
    `;
    
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    icon.style.fontSize = '1.3rem';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(text);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
    
    notification.addEventListener('click', function() {
        this.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => this.remove(), 500);
    });
}

// ========================================
// INITIALIZE BLOG
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    const publishedPosts = await BlogSystem.getPublishedPosts();
    renderBlogPosts(publishedPosts);
    
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
        searchInput.addEventListener('input', async function() {
            const query = this.value;
            const results = await BlogSystem.searchPosts(query);
            renderBlogPosts(results);
        });
    }
    
    const adminBtn = document.getElementById('openAdminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            const adminModal = document.getElementById('adminModal');
            if (adminModal) adminModal.classList.add('active');
        });
    }
    
    const modal = document.getElementById('blogModal');
    const closeBtn = modal?.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// ========================================
// EXPOSE FOR GLOBAL USE
// ========================================

window.BlogSystem = BlogSystem;
window.renderBlogPosts = renderBlogPosts;
window.openBlogDetail = openBlogDetail;
