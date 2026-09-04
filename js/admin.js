// ========================================
// ADMIN DASHBOARD - WITH GOOGLE SHEETS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // GOOGLE SHEETS CONFIGURATION
    // ========================================
    // !!! IMPORTANT: Replace with your actual Web App URL !!!
const GOOGLE_APPS_SCRIPT_URL = 'https://api.allorigins.win/raw?url=' + 
    encodeURIComponent('https://script.google.com/macros/s/AKfycbw8UTjHnLcZqWaXrYwOM-0nThpWNCiA7qw1_VRzHp_lWcS1fAVDAnWvVhV4NUJw0XHHmw/exec');
    // Your other DOM elements (adminModal, loginForm, etc.)
    const adminModal = document.getElementById('adminModal');
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const adminLogin = document.getElementById('adminLogin');
    const logoutBtn = document.getElementById('logoutAdmin');
    const newPostBtn = document.getElementById('newPostBtn');
    const postFormContainer = document.getElementById('postFormContainer');
    const postForm = document.getElementById('postForm');
    const cancelPostBtn = document.getElementById('cancelPostBtn');
    const closeAdminBtn = document.getElementById('closeAdmin');
    const adminPostsList = document.getElementById('adminPostsList');

    // ========================================
    // ADMIN LOGIN (Unchanged)
    // ========================================
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'wcdo2026'
    };
    let isLoggedIn = sessionStorage.getItem('wcdo_admin_logged') === 'true';

    function showAdminPanel() {
        adminLogin.style.display = 'none';
        adminPanel.style.display = 'block';
        isLoggedIn = true;
        sessionStorage.setItem('wcdo_admin_logged', 'true');
        renderAdminPosts();
        updateAdminStats();
    }

    function showLogin() {
        adminLogin.style.display = 'block';
        adminPanel.style.display = 'none';
        isLoggedIn = false;
        sessionStorage.removeItem('wcdo_admin_logged');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value.trim();

            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                showAdminPanel();
                document.getElementById('adminUsername').value = '';
                document.getElementById('adminPassword').value = '';
                showNotification('Login successful!', 'success');
            } else {
                showNotification('Invalid username or password.', 'error');
            }
        });
    }

    if (isLoggedIn && adminLogin && adminPanel) {
        showAdminPanel();
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showLogin();
            showNotification('Logged out successfully.', 'success');
        });
    }

    // ========================================
    // GOOGLE SHEETS API FUNCTIONS [NEW]
    // ========================================

    // Get all blog posts from Google Sheets
    async function getBlogPostsFromSheets() {
        try {
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getPosts`);
            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                console.error('Error fetching posts:', result.data);
                return [];
            }
        } catch (error) {
            console.error('Network error fetching posts:', error);
            // Fallback to local storage if network fails
            return BlogSystem.getLocalPosts();
        }
    }

    // Save a blog post to Google Sheets
    async function saveBlogPostToSheets(postData) {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'savePost',
                    ...postData
                })
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Network error saving post:', error);
            return { success: false, data: error.toString() };
        }
    }

    // Delete a blog post from Google Sheets
    async function deletePostFromSheets(id) {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deletePost',
                    id: id
                })
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Network error deleting post:', error);
            return { success: false, data: error.toString() };
        }
    }

    // ========================================
    // MODIFIED: SAVE POST (Create/Update)
    // ========================================
    if (postForm) {
        postForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const id = document.getElementById('editPostId').value;
            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value;
            const image = document.getElementById('postImage').value.trim();
            const excerpt = document.getElementById('postExcerpt').value.trim();
            const content = document.getElementById('postContent').value.trim();
            const status = document.getElementById('postStatus').value;

            if (!title || !content) {
                showNotification('Title and content are required.', 'error');
                return;
            }

            const postData = {
                id: id || undefined, // Let the script generate ID if new
                title,
                category,
                image: image || 'https://via.placeholder.com/800x400/2d5a3d/ffffff?text=WCDO+Blog',
                excerpt: excerpt || content.substring(0, 150) + '...',
                content,
                status,
                date: new Date().toISOString().split('T')[0]
            };

            // Disable submit button to prevent double submission
            const submitBtn = document.getElementById('savePostBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            try {
                // Save to Google Sheets
                const result = await saveBlogPostToSheets(postData);

                if (result.success) {
                    showNotification(id ? 'Post updated successfully!' : 'Post created successfully!', 'success');
                    // Reset and refresh
                    postFormContainer.style.display = 'none';
                    postForm.reset();
                    await renderAdminPosts(); // Refresh the list
                    updateAdminStats();
                    // Also refresh the public blog view if needed
                    if (typeof renderBlogPosts === 'function') {
                        const posts = await getBlogPostsFromSheets();
                        renderBlogPosts(posts);
                    }
                } else {
                    showNotification('Failed to save post: ' + result.data, 'error');
                }
            } catch (error) {
                showNotification('Network error. Please try again.', 'error');
                console.error('Form submission error:', error);
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Post';
            }
        });
    }

    // ========================================
    // MODIFIED: RENDER ADMIN POSTS
    // ========================================
    async function renderAdminPosts() {
        if (!adminPostsList) return;

        // Show loading state
        adminPostsList.innerHTML = '<p style="text-align:center; padding:20px;">Loading posts...</p>';

        try {
            // Fetch posts from Google Sheets
            const posts = await getBlogPostsFromSheets();

            if (posts.length === 0) {
                adminPostsList.innerHTML = `
                    <p style="text-align: center; padding: 30px; color: #666;">
                        No posts yet. Create your first post!
                    </p>
                `;
                return;
            }

            adminPostsList.innerHTML = posts.map(post => `
                <div class="admin-post-item">
                    <div class="post-info">
                        <h4>${post.title}</h4>
                        <span>${post.category} • ${post.status} • ${post.date || 'Recent'}</span>
                    </div>
                    <div class="post-actions">
                        <button class="edit-btn" onclick="editPost(${post.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="deletePost(${post.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            adminPostsList.innerHTML = `
                <p style="text-align: center; padding: 30px; color: #c62828;">
                    <i class="fas fa-exclamation-circle"></i> Error loading posts. Check your connection.
                </p>
            `;
            console.error('Error rendering admin posts:', error);
        }
    }

    // ========================================
    // MODIFIED: UPDATE ADMIN STATS
    // ========================================
    async function updateAdminStats() {
        try {
            const posts = await getBlogPostsFromSheets();
            const published = posts.filter(p => p.status === 'published');
            const drafts = posts.filter(p => p.status === 'draft');

            document.getElementById('totalPosts').textContent = posts.length;
            document.getElementById('publishedPosts').textContent = published.length;
            document.getElementById('draftPosts').textContent = drafts.length;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // ========================================
    // MODIFIED: EDIT POST (Global function)
    // ========================================
    window.editPost = async function(id) {
        // Fetch fresh data
        const posts = await getBlogPostsFromSheets();
        const post = posts.find(p => p.id == id);
        if (!post) return;

        document.getElementById('editPostId').value = id;
        document.getElementById('formTitle').textContent = 'Edit Post';
        document.getElementById('postTitle').value = post.title || '';
        document.getElementById('postCategory').value = post.category || 'News';
        document.getElementById('postImage').value = post.image || '';
        document.getElementById('postExcerpt').value = post.excerpt || '';
        document.getElementById('postContent').value = post.content || '';
        document.getElementById('postStatus').value = post.status || 'published';

        postFormContainer.style.display = 'block';
        postFormContainer.scrollIntoView({ behavior: 'smooth' });
    };

    // ========================================
    // MODIFIED: DELETE POST (Global function)
    // ========================================
    window.deletePost = async function(id) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            const result = await deletePostFromSheets(id);
            if (result.success) {
                await renderAdminPosts();
                updateAdminStats();
                if (typeof renderBlogPosts === 'function') {
                    const posts = await getBlogPostsFromSheets();
                    renderBlogPosts(posts);
                }
                showNotification('Post deleted successfully.', 'success');
            } else {
                showNotification('Failed to delete post: ' + result.data, 'error');
            }
        } catch (error) {
            showNotification('Network error. Please try again.', 'error');
            console.error('Delete error:', error);
        }
    };

    // ========================================
    // NEW POST BUTTON
    // ========================================
    if (newPostBtn) {
        newPostBtn.addEventListener('click', function() {
            postFormContainer.style.display = 'block';
            document.getElementById('formTitle').textContent = 'Create New Post';
            document.getElementById('editPostId').value = '';
            postForm.reset();
            postFormContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ========================================
    // CANCEL POST
    // ========================================
    if (cancelPostBtn) {
        cancelPostBtn.addEventListener('click', function() {
            postFormContainer.style.display = 'none';
            postForm.reset();
        });
    }

    // ========================================
    // CLOSE ADMIN MODAL
    // ========================================
    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', function() {
            adminModal.classList.remove('active');
            document.body.style.overflow = '';
            postFormContainer.style.display = 'none';
        });
    }

    if (adminModal) {
        adminModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
                postFormContainer.style.display = 'none';
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && adminModal?.classList.contains('active')) {
            adminModal.classList.remove('active');
            document.body.style.overflow = '';
            postFormContainer.style.display = 'none';
        }
    });

    // ========================================
    // HELPER FUNCTIONS
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

    // Initial load
    if (isLoggedIn) {
        renderAdminPosts();
        updateAdminStats();
    }

    // Inject animation styles if not present
    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
});