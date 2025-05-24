class App {
  constructor() {
    // Initialize Firebase
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.storage = firebase.storage();

    // Current user state
    this.user = null;
    this.posts = [];
    this.isLogin = true;

    // DOM elements - UPDATED SELECTORS
    this.$authSection = document.getElementById("auth-section");
    this.$appContainer = document.getElementById("app-container");
    this.$authForm = document.getElementById("auth-form");
    this.$authEmail = document.getElementById("auth-email");
    this.$authPassword = document.getElementById("auth-password");
    this.$authSubmit = document.getElementById("auth-submit");
    this.$authError = document.getElementById("auth-error");
    this.$authToggle = document.getElementById("auth-toggle");
    this.$createSection = document.getElementById("create-section");
    this.$createForm = document.getElementById("create-post-form");
    this.$postImage = document.getElementById("post-image");
    this.$postCaption = document.getElementById("post-caption");
    this.$createCancel = document.getElementById("create-cancel");
    this.$homeSection = document.getElementById("home-section");
    this.$postSection = document.getElementById("post-section");
    this.$profileSection = document.getElementById("profile-section");
    this.$profileImage = document.getElementById("profile-image");
    this.$profileUsername = document.getElementById("profile-username");
    this.$profilePostCount = document.getElementById("profile-post-count");
    this.$profilePosts = document.getElementById("profile-posts");
    this.$logoutButton = document.getElementById("logout-button");
    this.$sidebarItems = document.querySelectorAll(".sidebar-item[data-section]");

    // Initialize
    this.initAuthListener();
    this.initEventListeners();
  }

  initAuthListener() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = {
          uid: user.uid,
          displayName: user.displayName || user.email.split("@")[0],
          email: user.email,
          photoURL: user.photoURL || "https://placehold.co/150",
        };
        this.showApp();
        this.initPostsListener();
      } else {
        this.user = null;
        this.posts = [];
        this.showAuth();
      }
    });
  }

  initEventListeners() {
    if (this.$authForm) {
      this.$authForm.addEventListener("submit", (e) => this.handleAuth(e));
    }
    if (this.$authToggle) {
      this.$authToggle.addEventListener("click", () => this.toggleAuthMode());
    }
    if (this.$createForm) {
      this.$createForm.addEventListener("submit", (e) => this.handleCreatePost(e));
    }
    if (this.$createCancel) {
      this.$createCancel.addEventListener("click", () => this.showSection("home"));
    }
    if (this.$logoutButton) {
      this.$logoutButton.addEventListener("click", () => this.handleLogout());
    }
    this.$sidebarItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (!this.user && item.dataset.section !== "home") {
          alert("Please log in to access this section.");
          return;
        }
        this.showSection(item.dataset.section);
      });
    });
  }

  initPostsListener() {
    this.db.collection("posts").orderBy("timestamp", "desc").onSnapshot(
      (snapshot) => {
        if (snapshot.empty) {
          this.posts = [];
        } else {
          this.posts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }
        this.displayPosts();
        if (this.$profileSection.style.display === "block") {
          this.displayProfilePosts();
        }
      },
      (error) => {
        console.error("Error fetching posts:", error);
        this.$postSection.innerHTML = "<p>Error loading posts. Please try again later.</p>";
      }
    );
  }

  async handleAuth(e) {
    e.preventDefault();
    const email = this.$authEmail.value.trim();
    const password = this.$authPassword.value.trim();

    if (!email || !password) {
      this.$authError.textContent = "Please enter both email and password.";
      return;
    }

    try {
      if (this.isLogin) {
        await this.auth.signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
          displayName: email.split("@")[0],
        });
        await this.db.collection("users").doc(userCredential.user.uid).set({
          displayName: email.split("@")[0],
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      this.$authError.textContent = "";
      this.$authEmail.value = "";
      this.$authPassword.value = "";
    } catch (error) {
      console.error("Authentication error:", error);
      this.$authError.textContent = error.message;
    }
  }

  async handleCreatePost(e) {
    e.preventDefault();
    const file = this.$postImage.files[0];
    const caption = this.$postCaption.value.trim();

    // Validate inputs
    if (!file) {
      alert("Please upload an image.");
      return;
    }
    if (!caption) {
      alert("Please add a caption.");
      return;
    }
    if (!this.user) {
      alert("You must be logged in to create a post.");
      return;
    }

    try {
      // Ensure Firebase is initialized
      if (!this.storage || !this.db) {
        throw new Error("Firebase services are not properly initialized.");
      }

      // Create a unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const filename = `post_${timestamp}.${fileExt}`;

      // Upload image to Firebase Storage with proper initialization
      const storageRef = this.storage.ref(`posts/${this.user.uid}/${filename}`);
      const uploadTask = storageRef.put(file, {
        contentType: file.type,
        customMetadata: {
          'cache-control': 'public,max-age=31536000'
        }
      });
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Handle progress if needed
        },
        (error) => {
          throw error;
        },
        async () => {
          const imageUrl = await uploadTask.snapshot.ref.getDownloadURL();

          // Add post to Firestore
          await this.db.collection("posts").add({
            avatar: this.user.photoURL || "https://placehold.co/150",
            username: this.user.displayName,
            image: imageUrl,
            caption,
            likes: 0,
            comments: [],
            authorId: this.user.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });

          // Reset form and navigate to home
          this.$postImage.value = "";
          this.$postCaption.value = "";
          this.showSection("home");
          alert("Post created successfully!");
        }
      );
    } catch (error) {
      console.error("Error creating post:", error);
      alert(`Failed to create post. Error: ${error.message}`);
    }
  }

  handleLogout() {
    this.auth.signOut();
  }

  showAuth() {
    this.$authSection.style.display = "flex";
    this.$appContainer.style.display = "none";
  }

  showApp() {
    this.$authSection.style.display = "none";
    this.$appContainer.style.display = "flex";
    this.showSection("home");
  }

  showSection(section) {
    this.$homeSection.style.display = section === "home" ? "block" : "none";
    this.$createSection.style.display = section === "create" ? "block" : "none";
    this.$profileSection.style.display = section === "profile" ? "block" : "none";
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.$authSubmit.textContent = this.isLogin ? "Log In" : "Sign Up";
    this.$authToggle.textContent = this.isLogin ? "Don't have an account? Sign up" : "Have an account? Log in";
  }

  displayPosts() {
    if (!Array.isArray(this.posts)) {
      this.posts = [];
      this.$postSection.innerHTML = "<p>No posts available.</p>";
      return;
    }

    this.$postSection.innerHTML = this.posts
      .map(
        (post) => `
      <div class="post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-avatar" style="background-image: url(${post.avatar || "https://placehold.co/150"})"></div>
          <span class="post-username">${post.username || "Unknown"}</span>
          <span class="post-time">${this.formatDate(post.timestamp?.toDate())}</span>
        </div>
        <div class="post-image">
          <img src="${post.image || "https://placehold.co/468x585"}" alt="Post" onerror="this.src='https://placehold.co/468x585'">
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
          <div class="post-likes">${post.likes || 0} likes</div>
          <div class="post-caption">
            <span class="post-username">${post.username || "Unknown"}</span> ${post.caption || ""}
          </div>
          <div class="post-comments" id="comments-${post.id}">
            ${post.comments?.map((comment) => `
              <div class="comment">
                <span class="comment-username">${comment.username}</span>
                <span class="comment-text">${comment.text}</span>
              </div>
            `).join("") || ""}
          </div>
          <div class="post-comment-container">
            <input type="text" placeholder="Add a comment..." class="post-comment-input" data-post-id="${post.id}">
            <span class="material-symbols-outlined send-comment" data-post-id="${post.id}">send</span>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    document.querySelectorAll(".send-comment").forEach((icon) => {
      icon.addEventListener("click", (e) => {
        const postId = e.target.dataset.postId;
        this.handleAddComment(postId);
      });
    });

    document.querySelectorAll(".post-comment-input").forEach((input) => {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const postId = e.target.dataset.postId;
          this.handleAddComment(postId);
        }
      });
    });
  }

  async handleAddComment(postId) {
    const commentInput = document.querySelector(`.post-comment-input[data-post-id="${postId}"]`);
    const commentText = commentInput.value.trim();

    if (!commentText || !this.user) return;

    try {
      const postRef = this.db.collection("posts").doc(postId);
      await postRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion({
          username: this.user.displayName,
          text: commentText,
        }),
      });
      commentInput.value = "";
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  displayProfilePosts() {
    if (!this.user) return;

    const userPosts = this.posts.filter((post) => post.authorId === this.user.uid);
    this.$profilePostCount.textContent = `${userPosts.length} posts`;
    this.$profileUsername.textContent = this.user.displayName;
    this.$profileImage.src = this.user.photoURL;

    this.$profilePosts.innerHTML = userPosts
      .map((post) => `
      <img src="${post.image || "https://placehold.co/128"}" alt="Post" class="profile-post-image" onerror="this.src='https://placehold.co/128'">
    `).join("");
  }

  formatDate(date) {
    if (!date) return "Just now";
    const now = new Date();
    const diff = now - date;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "Just now";
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    return `${Math.floor(diff / day)}d ago`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
});