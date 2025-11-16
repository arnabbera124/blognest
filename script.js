const API_BASE = 'https://blognest-fvpz.onrender.com';
    // script.js - client-side logic for BlogNest (localStorage-based, no backend required)
    (function () {
      // ---------- Constants & localStorage keys ----------
      const USERS_KEY = 'bn_users_v1';
      const AUTH_KEY = 'bn_auth_v1';
      const BLOGS_KEY = 'bn_blogs_v1';
      const THEME_KEY = 'bn_theme_v1';

      // ---------- DOM helpers ----------
      const $ = id => document.getElementById(id);
      const by = sel => document.querySelector(sel);
      const all = sel => Array.from(document.querySelectorAll(sel));

      // --- Get ALL DOM elements ---
      
      // Modals
      const loginModal = $('loginModal');
      const signupModal = $('signupModal');
      const blogModal = $('blogModal');
      const closeModal = $('closeModal');
      const cancelBlog = $('cancelBlog');
      const closeLoginModal = $('closeLoginModal');
      const closeSignupModal = $('closeSignupModal');

      // Forms
      const userLoginForm = $('userLoginForm');
      const adminLoginForm = $('adminLoginForm');
      const signupForm = $('signupForm');
      const blogForm = $('blogForm');
      const contactForm = $('contactForm');
      
      // Auth & Navbar (Desktop) - REFACTORED
      const contactNavBtn = $('contactNavBtn');
      const createBlogBtn = $('createBlogBtn');
      const logoutBtn = $('logoutBtn');
      const avatarWrapper = $('avatarWrapper');
      const avatarInitials = $('avatarInitials');
      const avatarTooltip = $('avatarTooltip');
      const adminBtn = $('adminBtn');
      const profileArea = $('profileArea'); // This ONLY holds login/signup buttons now
      const notificationBtn = $('notificationBtn');
      const themeToggle = $('themeToggle');

      // Mobile Menu
      const mobileMenuToggle = $('mobileMenuToggle');
      const mobileMenu = $('mobileMenu');
      const mobileMenuClose = $('mobileMenuClose');
      const mobileProfileArea = $('mobileProfileArea');
      const mobileCreateBlogBtn = $('mobileCreateBlogBtn');
      const mobileSearchInput = $('mobileSearchInput');
      const mobileNotificationBtn = $('mobileNotificationBtn');
      const mobileThemeToggle = $('mobileThemeToggle');

      // Blog List
      const blogsGrid = $('blogsGrid');
      const searchInput = $('searchInput');
      const categoryFilter = $('categoryFilter');
      const statusFilter = $('statusFilter');

      // Blog Detail
      const blogDetailContent = $('blogDetailContent');

      // Admin Panel
      const adminNav = $('adminNav');
      const totalBlogs = $('totalBlogs');
      const publishedBlogs = $('publishedBlogs');
      const draftBlogs = $('draftBlogs');
      const totalUsers = $('totalUsers');
      const usersTableBody = $('usersTableBody');
      
      // Other
      const getStartedBtn = $('getStartedBtn');
      const toast = $('toast');
      let toastTimeout;

      // ---------- Utilities ----------
      function nowIso() { return new Date().toISOString(); }
      function uid(prefix = '') { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 9); }
      function loadJSON(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
      }
      function saveJSON(key, v) { localStorage.setItem(key, JSON.stringify(v)); }
      function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
      }

      // ---------- Data layer (localStorage) ----------
      function loadUsers() { return loadJSON(USERS_KEY, []); }
      function saveUsers(list) { saveJSON(USERS_KEY, list); }

      function loadBlogs() { return loadJSON(BLOGS_KEY, []); }
      function saveBlogs(list) { saveJSON(BLOGS_KEY, list); }

      function getAuth() { return loadJSON(AUTH_KEY, null); }
      function setAuth(obj) { saveJSON(AUTH_KEY, obj); }
      function clearAuth() { localStorage.removeItem(AUTH_KEY); }

      // Auth helpers - add to script.js
function setToken(token) { localStorage.setItem('bn_token', token); }
function getToken() { return localStorage.getItem('bn_token'); }
function clearToken() { localStorage.removeItem('bn_token'); }

// Update setAuth to also save token (if you get token from server)
function setAuthAndToken(user, token) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  setToken(token);
}

// Keep existing clearAuth but also clear token
function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  clearToken();
}



      // ---------- Seed demo data ----------
      (function seedIfEmpty() {
        if (!loadUsers().length) {
          const demoUsers = [
            { id: uid('u_'), name: 'Admin', email: 'admin@blognest.com', password: 'admin123', role: 'admin' },
            { id: uid('u_'), name: 'Alice Writer', email: 'alice@demo.com', password: 'password123', role: 'user' },
          ];
          saveUsers(demoUsers);
        }
        if (!loadBlogs().length) {
          const demoBlogs = [
            { id: uid('b_'), title: 'The Future of AI in Web Development', content: 'AI is revolutionizing... (content)', category: 'technology', tags: 'ai, web, javascript', status: 'published', author: 'Admin', authorId: 'admin', date: '2025-11-15T10:00:00Z', image: 'https://placehold.co/600x400/4f46e5/ffffff?text=AI+Future' },
            { id: uid('b_'), title: 'My Top 5 Travel Destinations for 2026', content: 'From the mountains to the sea... (content)', category: 'travel', tags: 'travel, adventure', status: 'published', author: 'Alice Writer', authorId: 'alice', date: '2025-11-14T14:30:00Z', image: 'https://placehold.co/600x400/ec4899/ffffff?text=Travel+2026' },
            { id: uid('b_'), title: 'A Guide to Healthy Eating', content: 'Eating healthy doesn\'t have to be boring... (content)', category: 'health', tags: 'food, health, lifestyle', status: 'draft', author: 'Admin', authorId: 'admin', date: '2025-11-16T09:00:00Z', image: 'https://placehold.co/600x400/10b981/ffffff?text=Healthy+Eating' },
            { id: uid('b_'), title: 'Learning React: A Beginner\'s Journey', content: 'I started learning React... (content)', category: 'technology', tags: 'react, javascript, coding', status: 'published', author: 'Alice Writer', authorId: 'alice', date: '2025-11-10T11:00:00Z', image: 'https://placehold.co/600x400/f59e0b/ffffff?text=Learning+React' },
          ];
          saveBlogs(demoBlogs);
        }
      })();

      // ---------- Core Functions ----------

      /** Shows a toast notification */
      function showToast(message, type = 'success') {
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = message;
        // Basic type styling (can be expanded)
        toast.style.backgroundColor = type === 'danger' ? 'var(--danger)' : 'var(--success)';
        toast.style.color = '#fff';
        if (type === 'danger') {
            toast.style.backgroundColor = 'var(--danger)';
        } else if (type === 'success') {
            toast.style.backgroundColor = 'var(--success)';
        } else {
            toast.style.backgroundColor = 'var(--card-bg)';
            toast.style.color = 'var(--text)';
        }
        
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
          toast.classList.remove('show');
        }, 3000);
      }

      /** Opens a modal */
      function openModal(modalEl) {
        modalEl.classList.add('active');
      }

      /** Closes all modals */
      function closeModalFn() {
        all('.modal').forEach(m => m.classList.remove('active'));
      }

      /** User Login */
      function login(email, password) {
        const users = loadUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          setAuth(user);
          renderAuthUI();
          handleHashChange(); // Re-render page based on new auth state
          closeModalFn();
          showToast(`Welcome back, ${user.name}!`);
        } else {
          showToast('Invalid email or password.', 'danger');
        }
      }

      /** User Logout */
      function logout() {
        clearAuth();
        renderAuthUI();
        handleHashChange(); // Re-render page (e.g., exit admin panel)
      }

      /** User Signup */
      function signup(name, email, password, role) {
        const users = loadUsers();
        if (users.some(u => u.email === email)) {
          showToast('An account with this email already exists.', 'danger');
          return;
        }
        const newUser = { id: uid('u_'), name, email, password, role };
        users.push(newUser);
        saveUsers(users);
        setAuth(newUser);
        renderAuthUI();
        handleHashChange();
        closeModalFn();
        showToast(`Welcome to BlogNest, ${name}!`);
      }

      /** Update Auth UI (Navbar, Mobile Menu) - REFACTORED */
      function renderAuthUI() {
        const auth = getAuth();
        
        // --- Get all desktop elements ---
        const contactNavBtn = $('contactNavBtn');
        const createBlogBtn = $('createBlogBtn');
        const logoutBtn = $('logoutBtn');
        const avatarWrapper = $('avatarWrapper');
        const avatarInitials = $('avatarInitials');
        const avatarTooltip = $('avatarTooltip');
        const adminBtn = $('adminBtn');
        const profileArea = $('profileArea'); // This holds login/signup buttons

        // --- Get mobile elements ---
        const mobileProfileArea = $('mobileProfileArea');
        const mobileCreateBlogBtn = $('mobileCreateBlogBtn');

        if (auth) {
          // --- DESKTOP ---
          // Show logged-in items
          if (contactNavBtn) contactNavBtn.style.display = 'inline-flex';
          if (createBlogBtn) createBlogBtn.style.display = 'inline-flex';
          if (logoutBtn) logoutBtn.style.display = 'inline-flex';
          
          // Configure and show avatar
          if (avatarWrapper) {
            avatarWrapper.style.display = 'inline-flex';
            avatarInitials.textContent = escapeHtml(auth.name[0].toUpperCase());
            avatarInitials.title = escapeHtml(auth.name);
            avatarTooltip.textContent = `Hi, ${escapeHtml(auth.name)}`;
          }

          // Show admin button if admin
          if (adminBtn && auth.role === 'admin') {
            adminBtn.style.display = 'inline-flex';
          } else if (adminBtn) {
            adminBtn.style.display = 'none';
          }

          // Hide logged-out items
          if (profileArea) profileArea.style.display = 'none';

          // --- MOBILE ---
          mobileProfileArea.innerHTML = `
            <div class="mobile-menu-avatar">
              <span class="avatar">${escapeHtml(auth.name[0].toUpperCase())}</span>
              <span class="avatar-name">Hi, ${escapeHtml(auth.name)}</span>
            </div>
            <button class="btn btn-outline" id="mobileLogoutBtn" style="width:100%; justify-content:center;"><i class="fas fa-sign-out-alt"></i> Logout</button>
          `;
          mobileCreateBlogBtn.style.display = 'inline-flex';

        } else {
          // --- DESKTOP ---
          // Hide logged-in items
          if (contactNavBtn) contactNavBtn.style.display = 'none';
          if (createBlogBtn) createBlogBtn.style.display = 'none';
          if (logoutBtn) logoutBtn.style.display = 'none';
          if (avatarWrapper) avatarWrapper.style.display = 'none';
          if (adminBtn) adminBtn.style.display = 'none';

          // Show logged-out items
          if (profileArea) profileArea.style.display = 'flex';
          
          // --- MOBILE ---
          mobileProfileArea.innerHTML = `
            <button class="btn btn-outline" id="mobileLoginBtn" style="width:100%; justify-content:center;"><i class="fas fa-sign-in-alt"></i> Login</button>
            <button class="btn btn-outline" id="mobileSignupBtn" style="width:100%; justify-content:center;"><i class="fas fa-user-plus"></i> Sign Up</button>
          `;
          mobileCreateBlogBtn.style.display = 'none';
        }

        // --- Re-add event listeners ---
        if (auth) {
          // Must check if elements exist before adding listeners
          if ($('logoutBtn')) {
            // Need to replace listener to avoid duplicates
            $('logoutBtn').onclick = () => {
              logout();
              showToast('Logged out successfully.');
            };
          }
          if ($('mobileLogoutBtn')) {
            $('mobileLogoutBtn').onclick = () => {
              mobileMenu.classList.remove('active');
              logout();
              showToast('Logged out successfully.');
            };
          }
        } else {
          // Desktop login/signup
          if ($('loginBtn')) {
            $('loginBtn').onclick = () => {
              openModal(loginModal);
            };
          }
          if ($('signupBtn')) {
            $('signupBtn').onclick = () => {
              openModal(signupModal);
            };
          }
          
          // Mobile login/signup
          if ($('mobileLoginBtn')) {
            $('mobileLoginBtn').onclick = () => {
              mobileMenu.classList.remove('active');
              openModal(loginModal);
            };
          }
          if ($('mobileSignupBtn')) {
            $('mobileSignupBtn').onclick = () => {
              mobileMenu.classList.remove('active');
              openModal(signupModal);
            };
          }
        }
      }

      /** Renders blogs based on current filters and auth state */
      function renderBlogs() {
        if (!blogsGrid) return; // Not on the right page

        const blogs = loadBlogs();
        const auth = getAuth();
        const search = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const status = statusFilter.value;

        const filteredBlogs = blogs.filter(blog => {
          const auth = getAuth();
          // Filter by auth
          if (blog.status === 'draft' && (!auth || blog.authorId !== auth.id)) {
            return false;
          }
          // Filter by status
          if (auth && auth.role === 'admin') {
            if (status !== 'all' && blog.status !== status) return false;
          } else if (auth) {
            // Regular user sees their own drafts or published posts
            if (status === 'draft' && (blog.status !== 'draft' || blog.authorId !== auth.id)) return false;
            if (status === 'published' && blog.status !== 'published') return false;
          } else {
            // Guest only sees published
            if (blog.status !== 'published') return false;
          }

          // Filter by category
          if (category !== 'all' && blog.category !== category) return false;

          // Filter by search
          if (search && !blog.title.toLowerCase().includes(search) && !blog.content.toLowerCase().includes(search)) {
            return false;
          }
          
          return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date

        blogsGrid.innerHTML = filteredBlogs.map(blog => {
          const tags = blog.tags.split(',').map(tag => tag.trim() ? `<span class="blog-tag">${escapeHtml(tag)}</span>` : '').join('');
          
          // Show edit/delete only for author or admin
          let actions = '';
          if (auth && (auth.id === blog.authorId || auth.role === 'admin')) {
            actions = `
              <button class="btn-small btn-edit" data-id="${blog.id}"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn-small btn-delete" data-id="${blog.id}"><i class="fas fa-trash"></i> Delete</button>
              ${blog.status === 'draft' ? `<button class="btn-small btn-publish" data-id="${blog.id}"><i class="fas fa-check"></i> Publish</button>` : ''}
            `;
          }

          return `
            <div class="blog-card ${blog.status}">
              <img src="${escapeHtml(blog.image) || 'https://placehold.co/600x400/f0f0f0/aaaaaa?text=No+Image'}" alt="${escapeHtml(blog.title)}" class="blog-card-image" onerror="this.src='https://placehold.co/600x400/f0f0f0/aaaaaa?text=Image+Error'">
              
              <div class="blog-card-content">
                ${blog.status === 'draft' ? '<span class="blog-status status-draft">Draft</span>' : ''}
                
                <div class="blog-meta">
                  <span class="blog-meta-category">${escapeHtml(blog.category)}</span>
                  <span>&bull;</span>
                  <span>${new Date(blog.date).toLocaleDateString()}</span>
                </div>
                
                <h3 class="blog-title"><a href="#blog/${blog.id}" class="blog-link" data-id="${blog.id}">${escapeHtml(blog.title)}</a></h3>
                
                <div class="blog-content">${escapeHtml(blog.content.substring(0, 100))}...</div>
                
                <div class="blog-tags">${tags}</div>
                
                <div class="blog-actions">
                  <a href="#blog/${blog.id}" class="btn-small btn-view blog-link" data-id="${blog.id}"><i class="fas fa-eye"></i> View</a>
                  ${actions}
                </div>
              </div>
            </div>
          `;
        }).join('');
        
        // Add event listeners for new buttons
        all('.blog-card .btn-edit').forEach(btn => btn.addEventListener('click', () => editBlog(btn.dataset.id)));
        all('.blog-card .btn-delete').forEach(btn => btn.addEventListener('click', () => deleteBlog(btn.dataset.id)));
        all('.blog-card .btn-publish').forEach(btn => btn.addEventListener('click', () => publishBlog(btn.dataset.id)));
      }
      
      /** Show blog detail page */
      function renderBlogDetail(blogId) {
        const blog = loadBlogs().find(b => b.id === blogId);
        if (!blog) {
          showToast('Blog post not found.', 'danger');
          window.location.hash = '#home-blogs';
          return;
        }
        
        const tags = blog.tags.split(',').map(tag => tag.trim() ? `<span class="blog-tag">${escapeHtml(tag)}</span>` : '').join('');
        
        blogDetailContent.innerHTML = `
          <div class="blog-detail-header">
            <div class="blog-detail-meta">
              <span class="category">${escapeHtml(blog.category.toUpperCase())}</span>
              <span>&bull;</span>
              <span class="date">${new Date(blog.date).toLocaleDateString()}</span>
              <span>&bull;</span>
              <span class="author">By ${escapeHtml(blog.author)}</span>
            </div>
            <h1>${escapeHtml(blog.title)}</h1>
          </div>
          
          <img src="${escapeHtml(blog.image) || 'https://placehold.co/800x400/f0f0f0/aaaaaa?text=No+Image'}" alt="${escapeHtml(blog.title)}" class="blog-detail-image" onerror="this.src='https://placehold.co/800x400/f0f0f0/aaaaaa?text=Image+Error'">
          
          <div class="blog-detail-body">
            <p>${escapeHtml(blog.content).replace(/\n/g, '</p><p>')}</p>
          </div>
          
          <div class="blog-detail-tags">
            ${tags}
          </div>
        `;
      }
      
      /** Show Admin Dashboard data */
      function renderAdminDashboard() {
        if (!totalBlogs) return; // Not on admin page
        const blogs = loadBlogs();
        const users = loadUsers();
        
        totalBlogs.textContent = blogs.length;
        publishedBlogs.textContent = blogs.filter(b => b.status === 'published').length;
        draftBlogs.textContent = blogs.filter(b => b.status === 'draft').length;
        totalUsers.textContent = users.length;
        
        usersTableBody.innerHTML = users.map(user => `
          <tr>
            <td>${escapeHtml(user.id)}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td><span class="blog-tag" style="background: ${user.role === 'admin' ? 'var(--primary)' : 'var(--secondary)'}; color: #fff;">${escapeHtml(user.role)}</span></td>
            <td>
              <button class="btn-small btn-delete" data-id="${user.id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
          </tr>
        `).join('');
        
        // Add listeners for user delete buttons
        all('#usersTableBody .btn-delete').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.id)));
      }
      
      /** Handle Admin Page Navigation */
      function navigateAdminPage(pageId) {
        all('.admin-page').forEach(p => p.classList.remove('active'));
        all('.admin-nav-link').forEach(a => a.classList.remove('active'));
        
        $(`admin-page-${pageId}`).classList.add('active');
        by(`.admin-nav-link[data-page="${pageId}"]`).classList.add('active');
        
        if (pageId === 'dashboard' || pageId === 'users') {
          renderAdminDashboard();
        }
      }

      /** Save a new blog or update an existing one */
      function saveBlog(e) {
        e.preventDefault();
        const auth = getAuth();
        if (!auth) {
          showToast('You must be logged in to create a post.', 'danger');
          return;
        }

        const id = $('blogId').value;
        const blogs = loadBlogs();
        const newBlog = {
          id: id || uid('b_'),
          title: $('blogTitle').value,
          image: $('blogImage').value, // Get image URL
          content: $('blogContent').value,
          category: $('blogCategory').value,
          tags: $('blogTags').value,
          status: $('blogStatus').value,
          author: auth.name,
          authorId: auth.id,
          date: new Date().toISOString()
        };

        if (id) {
          // Update
          const index = blogs.findIndex(b => b.id === id);
          blogs[index] = { ...blogs[index], ...newBlog }; // Keep original date if updating
        } else {
          // Create
          blogs.push(newBlog);
        }

        saveBlogs(blogs);
        renderBlogs();
        closeModalFn();
        blogForm.reset();
        showToast(`Blog post ${id ? 'updated' : 'created'} successfully.`);
      }

      /** Open blog modal for editing */
      function editBlog(id) {
        const blog = loadBlogs().find(b => b.id === id);
        if (!blog) return;

        $('modalTitle').textContent = 'Edit Blog Post';
        $('blogId').value = blog.id;
        $('blogTitle').value = blog.title;
        $('blogImage').value = blog.image;
        $('blogContent').value = blog.content;
        $('blogCategory').value = blog.category;
        $('blogTags').value = blog.tags;
        $('blogStatus').value = blog.status;

        openModal(blogModal);
      }

      /** Delete a blog post */
      function deleteBlog(id) {
        if (!confirm('Are you sure you want to delete this blog post? This cannot be undone.')) {
          return;
        }
        let blogs = loadBlogs();
        blogs = blogs.filter(b => b.id !== id);
        saveBlogs(blogs);
        renderBlogs();
        showToast('Blog post deleted.', 'success');
      }
      
      /** Delete a user */
      function deleteUser(id) {
        const auth = getAuth();
        if (auth.id === id) {
          showToast('You cannot delete your own account.', 'danger');
          return;
        }
        if (!confirm('Are you sure you want to delete this user?')) {
          return;
        }
        let users = loadUsers();
        users = users.filter(u => u.id !== id);
        saveUsers(users);
        renderAdminDashboard(); // Re-render user list
        showToast('User deleted.', 'success');
      }

      /** Publish a blog post */
      function publishBlog(id) {
        let blogs = loadBlogs();
        const index = blogs.findIndex(b => b.id === id);
        if (index > -1) {
          blogs[index].status = 'published';
          saveBlogs(blogs);
          renderBlogs();
          showToast('Blog post published!', 'success');
        }
      }
      
      /** Handle Signup Form Validation */
      function validateSignupForm() {
        let isValid = true;
        const email = $('signupEmail').value;
        const pass = $('signupPassword').value;
        const confirmPass = $('signupPasswordConfirm').value;
        
        // Hide all errors
        all('.form-error').forEach(el => el.style.display = 'none');

        // Email validation
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          $('emailError').style.display = 'block';
          isValid = false;
        }
        // Password length
        if (pass.length < 8) {
          $('pwdError').style.display = 'block';
          isValid = false;
        }
        // Password match
        if (pass !== confirmPass) {
          $('pwdMatchError').style.display = 'block';
          isValid = false;
        }
        
        return isValid;
      }
      
      /** Simple Page Router */
      function handleHashChange() {
        const hash = window.location.hash || '#home';
        const auth = getAuth();
        
        // Hide all pages
        all('.page').forEach(p => p.classList.remove('active'));
        
        if (hash.startsWith('#blog/')) {
          // --- Show Blog Detail Page ---
          const blogId = hash.substring(6);
          $('page-blog-detail').classList.add('active');
          renderBlogDetail(blogId);
          
        } else if (hash.startsWith('#admin')) {
          // --- Show Admin Page ---
          if (auth && auth.role === 'admin') {
            $('page-admin').classList.add('active');
            const subpage = hash.split('/')[1] || 'dashboard';
            navigateAdminPage(subpage);
          } else {
            // Not admin, redirect to home
            showToast('You do not have permission to access this page.', 'danger');
            window.location.hash = '#home';
          }
          
        } else {
          // --- Show Home Page ---
          $('page-home').classList.add('active');
          // Scroll to the specific section if hash matches (e.g., #contact)
          const sectionId = hash.substring(1); // remove #
          const section = $(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo(0, 0); // Scroll to top for #home
          }
          // Always render blogs on home page
          renderBlogs();
        }
        
        // Update active nav link
        all('.nav-link').forEach(link => {
          const linkHref = link.getAttribute('href');
          // Special case for "Blogs" link
          if (linkHref === '#home-blogs' && (hash === '#home-blogs' || hash.startsWith('#blog/'))) {
            link.classList.add('active');
          } else {
            link.classList.toggle('active', linkHref === hash);
          }
        });
        
        // Also update the contact button
        if (contactNavBtn) {
            contactNavBtn.classList.toggle('active', hash === '#contact');
        }
      }
      
      
      // ---------- Slideshow ----------
      let slideIndex = 1;
      let slideTimer;

      function plusSlides(n) {
        clearTimeout(slideTimer);
        showSlides(slideIndex += n);
      }

      function currentSlide(n) {
        clearTimeout(slideTimer);
        showSlides(slideIndex = n);
      }

      function showSlides(n) {
        let i;
        let slides = all(".slide");
        let dots = all(".dot");
        if (n > slides.length) {slideIndex = 1}    
        if (n < 1) {slideIndex = slides.length}
        
        for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";  
        }
        for (i = 0; i < dots.length; i++) {
          dots[i].className = dots[i].className.replace(" active", "");
        }
        
        if (slides.length > 0) {
          slides[slideIndex-1].style.display = "block";  
          dots[slideIndex-1].className += " active";
        }
        
        // Auto-scroll
        slideTimer = setTimeout(() => {
          showSlides(slideIndex += 1);
        }, 5000); // Change image every 5 seconds
      }

      // ---------- Theme Toggle ----------
      function applyTheme(theme) {
        if (theme === 'dark') {
          document.body.classList.add('dark-theme');
          themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
          mobileThemeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
          document.body.classList.remove('dark-theme');
          themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
          mobileThemeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
      }

      function toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
      }
      
      // ---------- Event Listeners ----------
      
      // Theme
      themeToggle.addEventListener('click', toggleTheme);
      mobileThemeToggle.addEventListener('click', toggleTheme);

      // Modals
      [closeModal, cancelBlog, closeLoginModal, closeSignupModal].forEach(btn => {
        btn.addEventListener('click', closeModalFn);
      });

      // Mobile Menu
      mobileMenuToggle.addEventListener('click', () => mobileMenu.classList.add('active'));
      mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('active'));
      // Close mobile menu when a nav link is clicked
      all('.mobile-menu-nav a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('active');
        });
      });
      
      // Mobile search
      mobileSearchInput.addEventListener('input', () => {
        searchInput.value = mobileSearchInput.value;
        renderBlogs();
      });

      // Login/Signup
      userLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login($('userEmail').value, $('userPassword').value);
      });
      adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login($('adminEmail').value, $('adminPassword').value);
      });
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateSignupForm()) return;
        signup(
          $('signupName').value,
          $('signupEmail').value,
          $('signupPassword').value,
          $('signupRole').value
        );
      });
      
      // Login Tabs
      all('.login-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          all('.login-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          all('.login-form').forEach(f => f.classList.remove('active'));
          $(`${tab.dataset.tab}LoginForm`).classList.add('active');
        });
      });

      // Blog Form
      blogForm.addEventListener('submit', saveBlog);

      // Blog Filters
      [searchInput, categoryFilter, statusFilter].forEach(el => {
        el.addEventListener('input', renderBlogs);
      });
      
      // "Get Started" Button
      getStartedBtn.addEventListener('click', () => {
        const auth = getAuth();
        if (auth) {
          $('createBlogBtn').click(); // Open write modal
        } else {
          openModal(signupModal); // Open signup modal
        }
      });
      
      // Contact Form
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Message sent! (Demo)');
        contactForm.reset();
      });

      // Notification Buttons
      notificationBtn.addEventListener('click', () => showToast('No new notifications.', 'info'));
      mobileNotificationBtn.addEventListener('click', () => showToast('No new notifications.', 'info'));

      // "Write Blog" buttons
      createBlogBtn.addEventListener('click', () => {
        $('modalTitle').textContent = 'Create New Blog';
        blogForm.reset();
        $('blogId').value = '';
        openModal(blogModal);
      });
      mobileCreateBlogBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        $('modalTitle').textContent = 'Create New Blog';
        blogForm.reset();
        $('blogId').value = '';
        openModal(blogModal);
      });
      
      // NEW: Add listener for the new contact button in the auth area
      // This button just acts like the main nav link
      if (contactNavBtn) {
        contactNavBtn.addEventListener('click', (e) => {
            const mainContactLink = by('#main-nav a[href="#contact"]');
            if(mainContactLink) {
                e.preventDefault();
                mainContactLink.click(); // Trigger the click on the real nav link
            }
        });
      }
      
      // Admin Nav
      adminNav.addEventListener('click', (e) => {
        e.preventDefault();
        const link = e.target.closest('a');
        if (link) {
          window.location.hash = link.getAttribute('href');
        }
      });

      // Page Router
      window.addEventListener('hashchange', handleHashChange);

      // SLIDESHOW: Added event listeners here
      if ($('slidePrev')) {
        $('slidePrev').addEventListener('click', () => plusSlides(-1));
      }
      if ($('slideNext')) {
        $('slideNext').addEventListener('click', () => plusSlides(1));
      }
      all('.dot[data-slide]').forEach(dot => {
        dot.addEventListener('click', () => currentSlide(parseInt(dot.dataset.slide)));
      });

      // ---------- Initial Load ----------
      function init() {
        // Apply saved theme
        const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
        applyTheme(savedTheme);
        
        // Set up auth state
        renderAuthUI();
        
        // Load initial page
        handleHashChange();
        
        // Start slideshow
        showSlides(slideIndex);
      }

      // Run app
      init();

    })();
  
