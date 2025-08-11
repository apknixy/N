document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY", // Replace with your actual config
        authDomain: "addmint-7ab6b.firebaseapp.com",
        databaseURL: "https://addmint-7ab6b-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "addmint-7ab6b",
        storageBucket: "addmint-7ab6b.appspot.com", // Corrected storage bucket
        messagingSenderId: "504015450137",
        appId: "1:504015450137:web:694b176313582cce1e7a88",
        measurementId: "G-H7J7M23Z82"
    };

    // --- Firebase Initialization ---
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Global State ---
    let currentUser = null;
    let currentUserData = {};
    let currentProfileViewingId = null;

    // --- DOM Elements ---
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');
    const loggedInContent = document.getElementById('logged-in-content');
    
    // Auth elements
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');

    const mainContent = document.querySelector('.main-content');
    const bottomNavItems = document.querySelectorAll('.app-bottom-nav .nav-item');
    const screenSections = document.querySelectorAll('.main-content .app-screen');
    
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    const postsFeed = document.getElementById('posts-feed');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // --- Utility Functions ---
    const showToast = (message, type = 'info', duration = 3000) => {
        const toast = document.getElementById('toast-notification');
        toast.textContent = message;
        toast.className = `toast-notification show ${type}`;
        setTimeout(() => {
            toast.className = 'toast-notification';
        }, duration);
    };

    const showScreen = (screenId) => {
        // Hide all screens
        screenSections.forEach(screen => screen.classList.remove('active'));
        document.querySelectorAll('.app-bottom-nav .nav-item').forEach(item => item.classList.remove('active'));

        // Show target screen
        const targetScreen = document.getElementById(`${screenId}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Highlight active nav item
        const activeNavItem = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // Special actions for screens
        if(screenId === 'home') loadHomeFeed();
        if(screenId === 'profile') loadProfile(currentUser.uid); // Default to own profile
        if(screenId === 'earnings') loadEarningsData();

        sidebar.classList.remove('open');
        mainContent.scrollTop = 0; // Scroll to top on screen change
    };

    // --- Authentication ---
    auth.onAuthStateChanged(async (user) => {
        splashScreen.classList.add('hidden');
        if (user) {
            currentUser = user;
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                currentUserData = { uid: user.uid, ...userDoc.data() };
                loginScreen.classList.remove('active');
                signupScreen.classList.remove('active');
                loggedInContent.classList.remove('hidden');
                showScreen('home'); // Show home feed after login
            } else {
                // This case happens if a user is created in Auth but not Firestore
                // This can be a setup step.
                showToast('Please complete your profile.', 'info');
                logout(); // Force logout to re-trigger signup with profile creation
            }
        } else {
            currentUser = null;
            currentUserData = {};
            loggedInContent.classList.add('hidden');
            loginScreen.classList.add('active');
            signupScreen.classList.remove('active');
        }
    });

    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginScreen.classList.remove('active');
        signupScreen.classList.add('active');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupScreen.classList.remove('active');
        loginScreen.classList.add('active');
    });

    signupBtn.addEventListener('click', async () => {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const username = document.getElementById('signup-username').value.trim().toLowerCase();

        if (!username || !/^[a-z0-9_]{3,15}$/.test(username)) {
            showToast('Username must be 3-15 characters, lowercase letters, numbers, or underscores.', 'error');
            return;
        }

        const usernameCheck = await db.collection('users').where('username', '==', username).get();
        if (!usernameCheck.empty) {
            showToast('Username is already taken.', 'error');
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create user profile in Firestore
            await db.collection('users').doc(user.uid).set({
                username: username,
                email: user.email,
                displayName: username,
                bio: 'Welcome to AddMint!',
                profilePicUrl: 'https://i.imgur.com/3gL4tYH.png', // A default placeholder
                isPrivate: false,
                followers: [],
                following: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
             showToast('Account created successfully!', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    const logout = () => {
        auth.signOut().then(() => {
            showToast('Logged out successfully.');
            window.location.reload(); // Easiest way to reset all state
        });
    }

    logoutBtn.addEventListener('click', logout);

    // --- Navigation Handlers ---
    menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screenId = e.currentTarget.dataset.screen;
            showScreen(screenId);
        });
    });
    
    sidebar.querySelectorAll('a[data-screen]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screenId = e.currentTarget.dataset.screen;
            showScreen(screenId);
        });
    });


    // --- Home Feed ---
    const loadHomeFeed = async () => {
        postsFeed.innerHTML = '';
        loadingSpinner.classList.remove('hidden');

        // Logic to get posts from followed users
        const following = currentUserData.following || [];
        if (following.length === 0) {
            postsFeed.innerHTML = `<p>Follow people to see their posts here.</p>`;
            loadingSpinner.classList.add('hidden');
            return;
        }

        try {
            const postsQuery = await db.collection('posts')
                .where('authorId', 'in', following)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            
            loadingSpinner.classList.add('hidden');
            if (postsQuery.empty) {
                postsFeed.innerHTML = `<p>No posts from the people you follow yet.</p>`;
            } else {
                postsQuery.docs.forEach(doc => {
                    renderPost(doc.id, doc.data());
                });
            }
        } catch (error) {
            console.error("Error loading home feed: ", error);
            showToast('Could not load feed.', 'error');
            loadingSpinner.classList.add('hidden');
        }
    };
    
    // --- Post Rendering ---
    const renderPost = (postId, postData) => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.dataset.postId = postId;

        const isLiked = postData.likes?.includes(currentUser.uid);

        postCard.innerHTML = `
            <div class="post-header">
                <img src="${postData.authorProfilePic}" class="profile-avatar" data-userid="${postData.authorId}">
                <span class="username" data-userid="${postData.authorId}">@${postData.authorUsername}</span>
            </div>
            <div class="post-content">
                <div class="post-content-inner">${postData.content}</div>
            </div>
            <div class="post-footer">
                <div class="post-actions">
                    <span class="like-button ${isLiked ? 'liked' : ''}" title="Like">
                        <i class="fa-heart ${isLiked ? 'fas' : 'far'}"></i>
                        <span class="count">${postData.likeCount || 0}</span>
                    </span>
                    <span class="comment-button" title="Comment">
                        <i class="far fa-comment"></i>
                        <span class="count">${postData.commentCount || 0}</span>
                    </span>
                    <span class="share-button" title="Share"><i class="far fa-paper-plane"></i></span>
                </div>
                <div class="post-options-btn" title="Options"><i class="fas fa-ellipsis-h"></i></div>
            </div>
        `;
        postsFeed.appendChild(postCard);

        // Add event listeners
        postCard.querySelector('.like-button').addEventListener('click', () => toggleLike(postId));
    };

    // --- Profile Management ---
    const loadProfile = async (userId) => {
        currentProfileViewingId = userId;
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                showToast('User not found', 'error');
                return;
            }
            const userData = userDoc.data();

            // Populate profile details
            document.getElementById('my-profile-avatar').src = userData.profilePicUrl;
            document.getElementById('my-profile-displayname').textContent = userData.displayName;
            document.getElementById('my-profile-username').textContent = `@${userData.username}`;
            document.getElementById('my-profile-bio').textContent = userData.bio;
            document.getElementById('my-followers-count').textContent = userData.followers?.length || 0;
            document.getElementById('my-following-count').textContent = userData.following?.length || 0;

            // Handle button visibility
            const editBtn = document.getElementById('edit-profile-btn');
            const followBtn = document.getElementById('follow-user-btn');
            const unfollowBtn = document.getElementById('unfollow-user-btn');

            if (userId === currentUser.uid) {
                editBtn.classList.remove('hidden');
                followBtn.classList.add('hidden');
                unfollowBtn.classList.add('hidden');
            } else {
                editBtn.classList.add('hidden');
                const isFollowing = currentUserData.following?.includes(userId);
                followBtn.classList.toggle('hidden', isFollowing);
                unfollowBtn.classList.toggle('hidden', !isFollowing);
            }
            
            // Load user's posts
            loadProfilePosts(userId);

        } catch (error) {
            console.error("Error loading profile: ", error);
            showToast('Could not load profile.', 'error');
        }
    };
    
    const loadProfilePosts = async (userId) => {
        const profilePostsFeed = document.getElementById('profile-posts-feed');
        profilePostsFeed.innerHTML = '<div class="loader"></div>';
        
        const postsSnapshot = await db.collection('posts').where('authorId', '==', userId).orderBy('createdAt', 'desc').get();
        profilePostsFeed.innerHTML = '';
        if(postsSnapshot.empty) {
            profilePostsFeed.innerHTML = '<p>No posts yet.</p>';
            return;
        }
        postsSnapshot.forEach(doc => {
            // This is simplified, for grid you'd create smaller post elements
            const postImg = doc.data().content.match(/<img src="([^"]+)"/);
            if(postImg) {
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-post-item';
                gridItem.innerHTML = `<img src="${postImg[1]}" alt="post">`;
                profilePostsFeed.appendChild(gridItem);
            }
        });
        document.getElementById('my-posts-count').children[0].textContent = postsSnapshot.size;
    };
    
    // --- Post Interactions ---
    const toggleLike = async (postId) => {
        const postRef = db.collection('posts').doc(postId);
        const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
        const likeButton = postCard.querySelector('.like-button');
        const likeIcon = likeButton.querySelector('i');
        const likeCount = likeButton.querySelector('.count');

        const isLiked = likeButton.classList.contains('liked');

        try {
            await db.runTransaction(async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists) throw "Post does not exist!";

                const newLikeCount = (postDoc.data().likeCount || 0) + (isLiked ? -1 : 1);
                
                transaction.update(postRef, {
                    likeCount: newLikeCount,
                    likes: isLiked 
                        ? firebase.firestore.FieldValue.arrayRemove(currentUser.uid) 
                        : firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                });
                
                // Optimistic UI update
                likeButton.classList.toggle('liked');
                likeIcon.classList.toggle('fas');
                likeIcon.classList.toggle('far');
                likeCount.textContent = newLikeCount;
            });
        } catch (error) {
            console.error("Error liking post: ", error);
            showToast("Failed to update like.", 'error');
        }
    };


    // --- Earnings & Withdrawal ---
    const loadEarningsData = async () => {
         // This requires aggregating data, best done with cloud functions for performance.
         // Client-side aggregation is slow and expensive.
         // Here's a simplified simulation.
         const monetizedViewsEl = document.getElementById('monetized-views-count');
         const estimatedEarningsEl = document.getElementById('estimated-earnings');
         const progressFill = document.getElementById('payout-progress');
         const progressText = document.getElementById('progress-text');
         const withdrawBtn = document.getElementById('withdraw-btn');

         // In a real app, you would fetch this pre-calculated value from the user's document.
         // For now, let's simulate it.
         const totalMonetizedViews = 55000; // SIMULATED VALUE
         const earningRate = 0.5 / 1000; // $0.50 per 1000 views
         const payoutThreshold = 100000;

         monetizedViewsEl.textContent = totalMonetizedViews.toLocaleString();
         estimatedEarningsEl.textContent = `$${(totalMonetizedViews * earningRate).toFixed(2)}`;

         const progress = Math.min((totalMonetizedViews / payoutThreshold) * 100, 100);
         progressFill.style.width = `${progress}%`;
         progressText.textContent = `${totalMonetizedViews.toLocaleString()}/${payoutThreshold.toLocaleString()}`;

         if (totalMonetizedViews >= payoutThreshold) {
             withdrawBtn.disabled = false;
         }
    };

    document.getElementById('withdraw-btn').addEventListener('click', () => {
        document.getElementById('withdraw-modal').classList.remove('hidden');
        document.getElementById('withdraw-views').value = document.getElementById('monetized-views-count').textContent;
    });
    
    // Add close handlers for modals
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
        });
    });

    document.getElementById('submit-withdrawal-btn').addEventListener('click', () => {
        const upi = document.getElementById('withdraw-upi').value;
        const paypal = document.getElementById('withdraw-paypal').value;
        
        if(!upi && !paypal) {
            showToast('Please provide a UPI ID or PayPal email.', 'error');
            return;
        }

        // Simplified mailto: link. A serverless function is the robust solution.
        const subject = `Withdrawal Request from ${currentUserData.username}`;
        const body = `
            User: ${currentUserData.username} (UID: ${currentUser.uid})
            Views: ${document.getElementById('withdraw-views').value}
            UPI: ${upi || 'N/A'}
            PayPal: ${paypal || 'N/A'}
        `;
        window.location.href = `mailto:apknixy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        document.getElementById('withdraw-modal').classList.add('hidden');
        showToast('Your withdrawal request has been prepared for sending!', 'success');
    });

    // --- Final Initializations ---
    // Settings toggles
    document.getElementById('dark-mode-checkbox').addEventListener('change', (e) => {
        document.documentElement.classList.toggle('dark-mode', e.target.checked);
        document.documentElement.classList.toggle('light-mode', !e.target.checked);
    });

});
