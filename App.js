class App {
  constructor() {
    // Initial state
    this.user = JSON.parse(localStorage.getItem('user')) || null;
    this.posts = [
      {
        id: '1',
        avatar: 'https://scontent-jnb2-1.cdninstagram.com/v/t51.2885-19/458315032_487378207491526_1272689892531119702_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=107&ccb=7-5&_nc_sid=bf7eb4&_nc_ohc=-bRrhh7pJREQ7kNvwE_8dDx&_nc_oc=AdlgM-nU-YTROt7Jnr9ET4QAggVS75YjHeF2gN3PY3EKW69j62AhVYoECPDNvtCLoLM&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-jnb2-1.cdninstagram.com&oh=00_AfJFvMPEM8cEickKHAf1pnuTw7xADpx5M-hlLqfhP8-7oA&oe=6833D622',
        username: 'eckhard_dednam',
        time: '21min Ago',
        image: 'https://media.licdn.com/dms/image/v2/D4E03AQEw6JQ7ddN-Ww/profile-displayphoto-shrink_200_200/B4EZVGvv91H0Ak-/0/1740648677851?e=1753315200&v=beta&t=yS0YWYOEEhvU8cEyttOvY59BDhxHalnldh0riCBClEM',
        likes: '42',
        caption: 'Success',
        comments: []
      },
      {
        id: '2',
        avatar: 'https://scontent-jnb2-1.cdninstagram.com/v/t51.75761-19/499981008_18280277284248243_1846528086172006743_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=100&ccb=7-5&_nc_sid=f7ccc5&_nc_ohc=rY7eoUsnwoIQ7kNvwF4uFYr&_nc_oc=AdkJ9j1iiI_eoJpjhZ5tNhbAfAqozYf8aGRPex5yHhul8ptrwx51y4-O8BgfSYzCrxE&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-jnb2-1.cdninstagram.com&_nc_gid=E35GtQW7PW2jqkgalOOHhg&oh=00_AfKMwDrToNBcbvVrB8QeQj4QPHc9GKj6pQAJo_0zFPDs8g&oe=6833DCE5',
        username: 'jayps_dejager',
        time: '3 Weeks Ago',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        likes: '369',
        caption: 'Remember the days when moments were lived, not posted? 💭',
        comments: []
      }
    ];
    this.isLogin = true;

    // DOM elements
    this.$authSection = document.getElementById('auth-section');
    this.$appContainer = document.getElementById('app-container');
    this.$authForm = document.getElementById('auth-form');
    this.$authEmail = document.getElementById('auth-email');
    this.$authPassword = document.getElementById('auth-password');
    this.$authSubmit = document.getElementById('auth-submit');
    this.$authError = document.getElementById('auth-error');
    this.$authToggle = document.getElementById('auth-toggle');
    this.$createSection = document.getElementById('create-section');
    this.$createForm = document.getElementById('create-post-form');
    this.$postImage = document.getElementById('post-image');
    this.$postCaption = document.getElementById('post-caption');
    this.$createCancel = document.getElementById('create-cancel');
    this.$homeSection = document.getElementById('home-section');
    this.$postSection = document.getElementById('post-section');
    this.$profileSection = document.getElementById('profile-section');
    this.$profileImage = document.getElementById('profile-image');
    this.$profileUsername = document.getElementById('profile-username');
    this.$profilePostCount = document.getElementById('profile-post-count');
    this.$profilePosts = document.getElementById('profile-posts');
    this.$rightProfileUsername = document.getElementById('right-profile-username');
    this.$logoutButton = document.getElementById('logout-button');
    this.$sidebarItems = document.querySelectorAll('.sidebar-item[data-section]');

    // Initialize
    this.init();
  }

  init() {
    // Set initial UI based on user state
    if (this.user) {
      this.showApp();
      this.updateProfileUI();
    } else {
      this.showAuth();
    }

    // Event listeners
    this.$authForm.addEventListener('submit', (e) => this.handleAuth(e));
    this.$authToggle.addEventListener('click', () => this.toggleAuthMode());
    this.$createForm.addEventListener('submit', (e) => this.handleCreatePost(e));
    this.$createCancel.addEventListener('click', () => this.showSection('home'));
    this.$logoutButton.addEventListener('click', () => this.handleLogout());
    this.$sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        if (!this.user && item.dataset.section !== 'home') {
          alert('Please log in to access this section.');
          return;
        }
        this.showSection(item.dataset.section);
      });
    });

    // Display initial posts
    this.displayPosts();
  }

  showAuth() {
    this.$authSection.style.display = 'flex';
    this.$appContainer.style.display = 'none';
  }

  showApp() {
    this.$authSection.style.display = 'none';
    this.$appContainer.style.display = 'flex';
    this.showSection('home');
  }

  handleAuth(e) {
    e.preventDefault();
    const email = this.$authEmail.value;
    const password = this.$authPassword.value;

    if (!email || !password) {
      this.$authError.textContent = 'Please fill in all fields.';
      return;
    }

    this.user = {
      email,
      displayName: email.split('@')[0],
      photoURL: 'https://via.placeholder.com/150'
    };
    localStorage.setItem('user', JSON.stringify(this.user));
    this.$authError.textContent = '';
    this.$authEmail.value = '';
    this.$authPassword.value = '';
    this.showApp();
    this.updateProfileUI();
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.$authSubmit.textContent = this.isLogin ? 'Log In' : 'Sign Up';
    this.$authToggle.textContent = this.isLogin ? "Don't have an account? Sign up" : 'Have an account? Log in';
  }

  handleLogout() {
    this.user = null;
    localStorage.removeItem('user');
    this.showAuth();
    this.$authEmail.value = '';
    this.$authPassword.value = '';
    this.$authError.textContent = '';
    window.scrollTo(0, 0);
    this.isLogin = true;
    this.$authSubmit.textContent = 'Log In';
    this.$authToggle.textContent = "Don't have an account? Sign up";
  }

  handleCreatePost(e) {
    e.preventDefault();
    const file = this.$postImage.files[0];
    const caption = this.$postCaption.value.trim();

    if (!file || !caption) {
      alert('Please upload an image and add a caption.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newPost = {
        id: Date.now().toString(),
        avatar: this.user.photoURL,
        username: this.user.displayName,
        time: 'Just now',
        image: reader.result,
        likes: '0',
        caption,
        comments: []
      };
      this.posts.unshift(newPost);
      localStorage.setItem('posts', JSON.stringify(this.posts));
      this.$postImage.value = '';
      this.$postCaption.value = '';
      this.showSection('home');
    };
    reader.readAsDataURL(file);
  }

  showSection(section) {
    this.$homeSection.style.display = section === 'home' ? 'block' : 'none';
    this.$createSection.style.display = section === 'create' ? 'block' : 'none';
    this.$profileSection.style.display = section === 'profile' ? 'block' : 'none';
    if (section === 'home') {
      this.displayPosts();
    } else if (section === 'profile') {
      this.displayProfilePosts();
    }
  }

  displayPosts() {
    this.$postSection.innerHTML = this.posts.map(post => `
      <div class="post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-avatar" style="background-image: url(${post.avatar}); background-size: cover;"></div>
          <span class="post-username">${post.username}</span>
          <span class="post-time">${post.time}</span>
        </div>
        <div class="post-image">
          <img src="${post.image}" alt="Post">
        </div>
        <div class="post-footer">
          <div class="post-actions-row">
            <div class="post-actions">
              <span class="material-symbols-outlined">favorite</span>
              <span class="material-symbols-outlined">chat_bubble</span>
              <span class="material-symbols-outlined">send</span>
            </div>
            <div class="post-bookmark">
              <span class="material-symbols-outlined">bookmark</span>
            </div>
          </div>
          <div class="post-likes">${post.likes} likes</div>
          <div class="post-caption">
            <span class="post-username">${post.username}</span> ${post.caption}
          </div>
          <div class="post-comments" id="comments-${post.id}">
            ${post.comments.map(comment => `
              <div class="comment">
                <span class="comment-username">${comment.username}</span>
                <span class="comment-text">${comment.text}</span>
              </div>
            `).join('')}
          </div>
          <div class="post-comment-container">
            <input type="text" placeholder="Add a comment..." class="post-comment-input" data-post-id="${post.id}">
            <span class="material-symbols-outlined send-comment" data-post-id="${post.id}">send</span>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners for comment submission
    document.querySelectorAll('.send-comment').forEach(icon => {
      icon.addEventListener('click', (e) => {
        const postId = e.target.getAttribute('data-post-id');
        this.handleAddComment(postId);
      });
    });

    // Also allow pressing Enter to submit
    document.querySelectorAll('.post-comment-input').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const postId = e.target.getAttribute('data-post-id');
          this.handleAddComment(postId);
        }
      });
    });
  }

  handleAddComment(postId) {
    const commentInput = document.querySelector(`.post-comment-input[data-post-id="${postId}"]`);
    const commentText = commentInput.value.trim();
    
    if (!commentText) return;
    
    if (!this.user) {
      alert('Please log in to comment.');
      return;
    }

    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.comments.push({
        username: this.user.displayName,
        text: commentText
      });
      localStorage.setItem('posts', JSON.stringify(this.posts));
      this.displayPosts();
      commentInput.value = '';
    }
  }

  updateProfileUI() {
    this.$profileImage.src = this.user.photoURL;
    this.$profileUsername.textContent = this.user.displayName;
    this.$rightProfileUsername.textContent = this.user.displayName;
    this.displayProfilePosts();
  }

  displayProfilePosts() {
    const userPosts = this.posts.filter(post => post.username === this.user.displayName);
    this.$profilePostCount.textContent = `${userPosts.length} posts`;
    this.$profilePosts.innerHTML = userPosts.map(post => `
      <img src="${post.image}" alt="Post" class="profile-post-image">
    `).join('');
  }
}

const app = new App();