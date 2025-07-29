document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyDlZA4grzF3fx95-11E4s7ASXwkIij1k1w",
        authDomain: "addmint-7ab6b.firebaseapp.com",
        projectId: "addmint-7ab6b",
        storageBucket: "addmint-7ab6b.appspot.com",
    };

    // --- Initialize Firebase ---
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    // --- DOM Elements ---
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const mainContent = document.querySelector('.main-content');
    const toastNotification = document.getElementById('toast-notification');
    const modalContainer = document.getElementById('modal-container');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- Global State ---
    let currentUser = null;
    let currentUserData = {};
    let currentProfileViewingId = null;
    let activeScreen = 'home';
    let postCache = []; // Cache for infinite looping
    let fetchingPosts = false;
    let currentNeonPost = null;

    // --- Logo Generation ---
    const PROFILE_LOGOS = Array.from({ length: 50 }, (_, i) => `logo-${i + 1}`);
    function generateLogoStyles() {
        const styleSheet = document.getElementById('dynamic-logo-styles');
        let styles = '';
        PROFILE_LOGOS.forEach((logoClass, i) => {
            const hue1 = (i * 25) % 360;
            const hue2 = (hue1 + 180) % 360;
            const rotation = (i * 15) % 90;
            styles += `
                .${logoClass} { background: linear-gradient(${rotation}deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 60%)); }
                .${logoClass}::before {
                    content: ''; position: absolute; inset: 15%;
                    background: white; mix-blend-mode: overlay;
                    transform: rotate(${rotation * 2}deg);
                    opacity: 0.3;
                    clip-path: polygon(${(i%4)*25}% 0, 100% ${(i%5)*20}%, ${100 - (i%3)*20}% 100%, 0 ${100 - (i%2)*30}%);
                }
            `;
        });
        styleSheet.innerHTML = styles;
    }
    generateLogoStyles();

    // =================================================================================
    // --- AUTHENTICATION FLOW ---
    // =================================================================================

    auth.onAuthStateChanged(user => {
        if (user && user.emailVerified) {
            currentUser = user;
            listenToUserData(user.uid);
            initializeApp();
        } else if (user && !user.emailVerified) {
            showAuthScreen('verify-email');
            document.getElementById('verification-email-display').textContent = user.email;
        } else {
            currentUser = null;
            showAuthScreen('login');
        }
    });

    function showAuthScreen(screenName) {
        splashScreen.classList.add('hidden');
        appContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenName}-screen`).classList.add('active');
    }

    function initializeApp() {
        authContainer.classList.add('hidden');
        splashScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadPosts();
    }
    
    function listenToUserData(userId) {
        db.collection('users').doc(userId).onSnapshot((doc) => {
            if (doc.exists) {
                currentUserData = { uid: doc.id, ...doc.data() };
                updateHeaderStats(currentUserData);
                checkDailyRewardStatus(currentUserData.lastRewardClaim);
            } else {
                // First time login after verification, force profile setup
                if (activeScreen !== 'profile-setup') {
                    showModal('profile-setup');
                }
            }
        }, err => console.error("Error listening to user data:", err));
    }

    // --- Auth Event Listeners ---
    document.getElementById('show-signup').addEventListener('click', () => showAuthScreen('signup'));
    document.getElementById('show-login').addEventListener('click', () => showAuthScreen('login'));
    
    document.getElementById('login-btn').addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';
        auth.signInWithEmailAndPassword(email, pass)
            .catch(err => errorEl.textContent = err.message);
    });

    document.getElementById('signup-btn').addEventListener('click', () => {
        const email = document.getElementById('signup-email').value;
        const pass = document.getElementById('signup-password').value;
        const errorEl = document.getElementById('signup-error');
        errorEl.textContent = '';
        auth.createUserWithEmailAndPassword(email, pass)
            .then(userCredential => {
                userCredential.user.sendEmailVerification();
                showAuthScreen('verify-email');
                document.getElementById('verification-email-display').textContent = email;
            })
            .catch(err => errorEl.textContent = err.message);
    });
    
    document.getElementById('resend-verification-btn').addEventListener('click', () => {
        auth.currentUser?.sendEmailVerification()
            .then(() => showToast("Verification email resent!", 'success'))
            .catch(err => showToast(`Error: ${err.message}`, 'error'));
    });

    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());


    // =================================================================================
    // --- UI & NAVIGATION ---
    // =================================================================================

    function showToast(message, type = 'info', duration = 3000) {
        toastNotification.textContent = message;
        toastNotification.className = `toast-notification show ${type}`;
        setTimeout(() => {
            toastNotification.className = 'toast-notification';
        }, duration);
    }
    
    function showModal(type, data = {}) {
        let content = '';
        switch(type) {
            case 'profile-setup':
                content = getProfileSetupHTML();
                break;
            case 'edit-profile':
                content = getProfileSetupHTML(currentUserData);
                break;
            case 'ad':
                content = `
                    <h3>Watch an Ad</h3>
                    <p>An ad is now playing to earn you rewards.</p>
                    <div id="ad-simulation">
                        <div class="ad-loader"></div>
                        <p>Simulating ad... please wait.</p>
                    </div>
                    <p style="font-size: 0.8em; color: var(--text-secondary); margin-top: 15px;">
                        In a real app, this would be a video ad from a network like Unity Ads.
                    </p>
                `;
                simulateAd(data.purpose);
                break;
            case 'daily-reward':
                 content = `
                    <h3>Daily Reward!</h3>
                    <div class="reward-icon gift-icon-large"></div>
                    <p>You've earned your daily reward:</p>
                    <ul class="reward-list">
                        <li><strong>10</strong> Coins</li>
                        <li><strong>10</strong> Credits</li>
                        <li><strong>2</strong> Limits</li>
                    </ul>
                `;
                break;
            case 'follow-list':
                content = `<h3>${data.title}</h3><ul id="follow-list-ul" class="follow-list"><li>Loading...</li></ul>`;
                populateFollowList(data.userId, data.listType);
                break;
        }
        modalBody.innerHTML = content;
        modalContainer.classList.remove('hidden');

        // Add event listeners for newly created content
        if (type === 'profile-setup' || type === 'edit-profile') {
            attachProfileFormListeners(type === 'edit-profile');
        }
    }
    
    function closeModal() {
        modalContainer.classList.add('hidden');
        modalBody.innerHTML = '';
    }
    modalCloseBtn.addEventListener('click', closeModal);

    function switchScreen(screenName) {
        document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenName}-screen`).classList.add('active');
        document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.screen === screenName));
        activeScreen = screenName;
        
        // Specific actions on screen switch
        document.getElementById('refresh-posts-btn').classList.toggle('hidden', screenName !== 'home');

        if (screenName === 'profile' && !currentProfileViewingId) {
            renderProfilePage(currentUser.uid);
        } else if (screenName === 'messages') {
            renderMessageList();
        }
    }
    
    // Setup navigation listeners
    document.querySelectorAll('[data-screen]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = el.dataset.screen;
            currentProfileViewingId = null; // Reset when navigating via main menus
            switchScreen(screen);
            if (document.querySelector('.sidebar.open')) {
                document.querySelector('.sidebar').classList.remove('open');
            }
        });
    });
    
    document.getElementById('menu-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.add('open'));
    document.querySelector('.close-sidebar').addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));


    // =================================================================================
    // --- REWARDS & ECONOMY ---
    // =================================================================================

    function updateHeaderStats(data) {
        document.getElementById('header-coins').textContent = `${formatNumber(data.coins || 0)} C`;
        document.getElementById('header-credits').textContent = `${formatNumber(data.credits || 0)} Cr`;
        document.getElementById('header-limit').textContent = `${formatNumber(data.postLimit || 0)} L`;
    }
    
    function formatNumber(num = 0) {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
        return num;
    }

    // --- Ad Logic ---
    function simulateAd(purpose) {
        setTimeout(() => {
            // This function is called by the WebView in your MIT App Inventor app
            // For testing in browser, we call it ourselves after a delay.
            window.adCompleteCallback(purpose);
        }, 5000); // 5 second simulation
    }

    // This function MUST be global so the WebView can access it
    window.adCompleteCallback = async (rewardType) => {
        console.log(`Ad complete. Reward type: ${rewardType}`);
        if (!currentUser) return;

        const userRef = db.collection('users').doc(currentUser.uid);
        let updates = {};
        let message = '';
        
        switch (rewardType) {
            case 'coins':
                updates.coins = firebase.firestore.FieldValue.increment(10);
                message = "You earned 10 Coins!";
                break;
            case 'credits':
                updates.credits = firebase.firestore.FieldValue.increment(10);
                message = "You earned 10 Credits!";
                break;
            case 'limit':
                updates.postLimit = firebase.firestore.FieldValue.increment(1);
                message = "You earned 1 Post Limit!";
                break;
            case 'boost-1':
            case 'boost-2':
            case 'boost-3':
                // The reward is the post being published, handled in the upload function
                const requiredAds = parseInt(document.getElementById('post-boost').value, 10);
                let watchedAds = parseInt(document.getElementById('publish-post-btn').dataset.watchedAds || '0', 10) + 1;
                document.getElementById('publish-post-btn').dataset.watchedAds = watchedAds;

                if(watchedAds < requiredAds) {
                    showToast(`Ad ${watchedAds} of ${requiredAds} watched.`, 'info');
                    showModal('ad', { purpose: `boost-${requiredAds}` }); // Show next ad
                    return; // Don't close modal or publish yet
                } else {
                     showToast('All ads watched! Ready to publish.', 'success');
                     document.getElementById('publish-post-btn').click(); // Auto-publish
                }
                break;
        }
        
        if (Object.keys(updates).length > 0) {
            await userRef.update(updates).catch(err => console.error(err));
            showToast(message, 'success');
        }
        closeModal();
    };
    
    // Header currency click listeners
    document.getElementById('header-coins').addEventListener('click', () => showModal('ad', { purpose: 'coins' }));
    document.getElementById('header-credits').addEventListener('click', () => showModal('ad', { purpose: 'credits' }));
    document.getElementById('header-limit').addEventListener('click', () => showModal('ad', { purpose: 'limit' }));
    
    // --- Daily Reward ---
    const DAILY_REWARD_INTERVAL = 24 * 60 * 60 * 1000;
    function checkDailyRewardStatus(lastClaimTimestamp) {
        if (!lastClaimTimestamp) {
            document.getElementById('gift-claim-btn').classList.add('neon-glow');
            return;
        }
        const lastClaim = lastClaimTimestamp.toMillis();
        const now = Date.now();
        document.getElementById('gift-claim-btn').classList.toggle('neon-glow', now - lastClaim >= DAILY_REWARD_INTERVAL);
    }
    
    document.getElementById('gift-claim-btn').addEventListener('click', async () => {
        const lastClaimTime = currentUserData.lastRewardClaim ? currentUserData.lastRewardClaim.toMillis() : 0;
        const now = Date.now();
        if (now - lastClaimTime < DAILY_REWARD_INTERVAL) {
            return showToast("You've already claimed your daily reward.", 'info');
        }
        
        try {
            await db.collection('users').doc(currentUser.uid).update({
                coins: firebase.firestore.FieldValue.increment(10),
                credits: firebase.firestore.FieldValue.increment(10),
                postLimit: firebase.firestore.FieldValue.increment(2),
                lastRewardClaim: firebase.firestore.FieldValue.serverTimestamp()
            });
            showModal('daily-reward');
        } catch (err) {
            console.error(err);
            showToast('Error claiming reward.', 'error');
        }
    });


    // =================================================================================
    // --- POST FEED & RENDERING ---
    // =================================================================================

    async function loadPosts() {
        if (fetchingPosts) return;
        fetchingPosts = true;
        document.getElementById('loading-spinner').classList.remove('hidden');

        try {
            // If cache is empty, fill it
            if (postCache.length === 0) {
                const snapshot = await db.collection('posts').orderBy('timestamp', 'desc').limit(50).get();
                postCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (postCache.length === 0) {
                   document.getElementById('posts-feed').innerHTML = '<p class="info-text">No posts here yet. Be the first!</p>';
                   fetchingPosts = false;
                   document.getElementById('loading-spinner').classList.add('hidden');
                   return;
                }
            }

            // Get a random batch from the cache
            let batch = [];
            for (let i = 0; i < 7; i++) {
                batch.push(postCache[Math.floor(Math.random() * postCache.length)]);
            }
            renderPostBatch(batch);
            
        } catch (err) {
            console.error("Error loading posts:", err);
            showToast("Could not load posts.", "error");
        } finally {
            fetchingPosts = false;
            document.getElementById('loading-spinner').classList.add('hidden');
        }
    }
    
    // Smart batch rendering
    function renderPostBatch(posts) {
        const feed = document.getElementById('posts-feed');
        let i = 0;
        while(i < posts.length) {
            const layoutRNG = Math.random();
            if (layoutRNG < 0.6 || posts.length - i < 2) { // 60% chance for vertical
                feed.appendChild(createPostElement(posts[i]));
                i++;
            } else if (layoutRNG < 0.85 && posts.length - i >= 4) { // 25% chance for table
                const tableContainer = document.createElement('div');
                tableContainer.className = 'table-post-container';
                for(let j=0; j<4; j++) {
                    tableContainer.appendChild(createPostElement(posts[i+j], 'table'));
                }
                feed.appendChild(tableContainer);
                i += 4;
            } else { // 15% chance for horizontal
                const horizontalContainer = document.createElement('div');
                horizontalContainer.className = 'horizontal-post-container';
                for(let j=0; j<2; j++) {
                    horizontalContainer.appendChild(createPostElement(posts[i+j], 'horizontal'));
                }
                feed.appendChild(horizontalContainer);
                i += 2;
            }
        }
    }
    
    mainContent.addEventListener('scroll', () => {
        if (activeScreen !== 'home') return;
        if (mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 300) {
            loadPosts();
        }
    });
    
    document.getElementById('refresh-posts-btn').addEventListener('click', () => {
        document.getElementById('posts-feed').innerHTML = '';
        postCache = [];
        loadPosts();
    });

    // --- Create single post element ---
    function createPostElement(postData, type = 'vertical') {
        if (!postData) return document.createElement('div'); // Safety check
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.dataset.postId = postData.id;

        const isLiked = postData.likedBy && postData.likedBy.includes(currentUser.uid);
        const userReaction = postData.userReactions ? postData.userReactions[currentUser.uid] : null;

        const content = postData.content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        postCard.innerHTML = `
            <div class="post-header">
                <div class="profile-avatar ${postData.userProfileLogo}" data-userid="${postData.userId}"></div>
                <span class="username" data-userid="${postData.userId}">${postData.username}</span>
                <div class="post-options">...</div>
                <div class="options-dropdown hidden">
                    <span class="report-btn">Report</span>
                    ${postData.userId === currentUser.uid ? `<span class="delete-btn">Delete</span>` : ''}
                </div>
            </div>
            <div class="post-content">
                <p>${content}</p>
                ${postData.imageUrl ? `<img src="${postData.imageUrl}" alt="Post image" loading="lazy">` : ''}
            </div>
            <div class="post-footer">
                <div class="post-actions">
                    <span class="like-button"><i class="fa-heart ${isLiked ? 'fas' : 'far'}"></i> <span class="like-count">${formatNumber(postData.likes)}</span></span>
                    <span class="views-count"><i class="far fa-eye"></i> ${formatNumber(postData.views)}</span>
                </div>
                <div class="reactions-display" title="Long press post to react">
                    ${Object.entries(postData.reactions || {}).sort((a,b) => b[1] - a[1]).slice(0,3).map(([emoji, count]) => `<span class="emoji">${emoji}</span>`).join('')}
                    <span class="count">${formatNumber(Object.values(postData.reactions || {}).reduce((a, b) => a + b, 0))}</span>
                </div>
            </div>
            <div class="emoji-picker hidden">
                <span class="emoji-option" data-emoji="👍">👍</span>
                <span class="emoji-option" data-emoji="❤️">❤️</span>
                <span class="emoji-option" data-emoji="😂">😂</span>
                <span class="emoji-option" data-emoji="🔥">🔥</span>
                <span class="emoji-option" data-emoji="😢">😢</span>
                ${userReaction ? '<span class="emoji-option remove-reaction">❌</span>' : ''}
            </div>
        `;
        
        // Add all event listeners
        attachPostListeners(postCard, postData);
        db.collection('posts').doc(postData.id).update({ views: firebase.firestore.FieldValue.increment(1) });
        
        return postCard;
    }


    // =================================================================================
    // --- POST INTERACTIONS ---
    // =================================================================================

    function attachPostListeners(postCard, postData) {
        let longPressTimer;
        
        // Single Click for Neon, Double Click for Like
        postCard.addEventListener('click', (e) => {
            if (e.target.closest('a, .post-options, .username, .profile-avatar, .like-button')) return;
            
            // Neon glow effect
            if (currentNeonPost) currentNeonPost.classList.remove('neon-glow');
            postCard.classList.add('neon-glow');
            currentNeonPost = postCard;
            setTimeout(() => postCard.classList.remove('neon-glow'), 3000);
        });
        
        postCard.addEventListener('dblclick', (e) => {
             if (e.target.closest('a, .post-options, .username, .profile-avatar, .like-button')) return;
             handleLike(postCard, postData);
        });

        // Long Press for Reactions
        const startPress = (e) => {
            if (e.target.closest('a, .post-options, .username, .profile-avatar')) return;
            longPressTimer = setTimeout(() => {
                postCard.querySelector('.emoji-picker').classList.remove('hidden');
            }, 500);
        };
        const endPress = () => clearTimeout(longPressTimer);
        postCard.addEventListener('mousedown', startPress);
        postCard.addEventListener('mouseup', endPress);
        postCard.addEventListener('mouseleave', endPress);
        postCard.addEventListener('touchstart', startPress);
        postCard.addEventListener('touchend', endPress);

        // Individual button listeners
        postCard.querySelector('.like-button').addEventListener('click', () => handleLike(postCard, postData));
        postCard.querySelector('.username').addEventListener('click', () => renderProfilePage(postData.userId));
        postCard.querySelector('.profile-avatar').addEventListener('click', () => renderProfilePage(postData.userId));
        postCard.querySelector('.post-options').addEventListener('click', (e) => {
            e.stopPropagation();
            postCard.querySelector('.options-dropdown').classList.toggle('hidden');
        });
        
        // Dropdown listeners
        const deleteBtn = postCard.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.addEventListener('click', () => handleDeletePost(postData.id));
        postCard.querySelector('.report-btn').addEventListener('click', () => handleReportPost(postData.id));

        // Emoji picker listener
        postCard.querySelectorAll('.emoji-option').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const emoji = el.classList.contains('remove-reaction') ? null : el.dataset.emoji;
                handleReaction(postData.id, emoji);
                postCard.querySelector('.emoji-picker').classList.add('hidden');
            });
        });
    }

    async function handleLike(postCard, postData) {
        const postRef = db.collection('posts').doc(postData.id);
        const likeIcon = postCard.querySelector('.like-button .fa-heart');
        const likeCount = postCard.querySelector('.like-button .like-count');
        const isLiked = likeIcon.classList.contains('fas');

        // Optimistic UI update
        likeIcon.classList.toggle('fas', !isLiked);
        likeIcon.classList.toggle('far', isLiked);
        if (!isLiked) likeIcon.style.animation = 'bounceIn 0.4s';
        likeCount.textContent = formatNumber(postData.likes + (isLiked ? -1 : 1));

        try {
            await postRef.update({
                likedBy: isLiked ? firebase.firestore.FieldValue.arrayRemove(currentUser.uid) : firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
                likes: firebase.firestore.FieldValue.increment(isLiked ? -1 : 1)
            });
            postData.likes += (isLiked ? -1 : 1); // Update local data
        } catch (err) {
            console.error(err); // Revert on error
            likeIcon.classList.toggle('fas', isLiked);
            likeIcon.classList.toggle('far', !isLiked);
            likeCount.textContent = formatNumber(postData.likes);
        }
    }
    
    async function handleReaction(postId, emoji) {
        const postRef = db.collection('posts').doc(postId);
        try {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(postRef);
                if (!doc.exists) throw "Post not found";
                
                const postData = doc.data();
                const reactions = postData.reactions || {};
                const userReactions = postData.userReactions || {};
                const oldReaction = userReactions[currentUser.uid];

                // Decrement old reaction if exists
                if (oldReaction) {
                    reactions[oldReaction] = (reactions[oldReaction] || 1) - 1;
                    if (reactions[oldReaction] <= 0) delete reactions[oldReaction];
                }
                
                // Increment new reaction if exists
                if (emoji) {
                    reactions[emoji] = (reactions[emoji] || 0) + 1;
                    userReactions[currentUser.uid] = emoji;
                } else {
                    delete userReactions[currentUser.uid]; // Remove reaction
                }
                transaction.update(postRef, { reactions, userReactions });
            });
            showToast('Reaction updated!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to react.', 'error');
        }
    }
    
    async function handleDeletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await db.collection('posts').doc(postId).delete();
            // Also decrement user's post count
            await db.collection('users').doc(currentUser.uid).update({ postCount: firebase.firestore.FieldValue.increment(-1) });
            document.querySelector(`.post-card[data-post-id="${postId}"]`)?.remove();
            showToast('Post deleted.', 'info');
        } catch (err) {
            console.error(err);
            showToast('Could not delete post.', 'error');
        }
    }


    // =================================================================================
    // --- PROFILE & USER MANAGEMENT ---
    // =================================================================================
    
    async function renderProfilePage(userId) {
        switchScreen('profile');
        currentProfileViewingId = userId;
        const profileContainer = document.getElementById('profile-screen');
        profileContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) throw new Error("User not found");
            const userData = { uid: userDoc.id, ...userDoc.data() };
            
            const isOwnProfile = userId === currentUser.uid;

            profileContainer.innerHTML = `
                <div id="profile-screen-content">
                    <div class="profile-header-area">
                        <div class="profile-avatar-large ${userData.profileLogo || 'logo-1'}"></div>
                        <h2 class="profile-username">@${userData.username}</h2>
                        <div class="profile-stats">
                            <div><span>${formatNumber(userData.postCount)}</span>Posts</div>
                            <div class="clickable-stat" data-list="followers"><span>${formatNumber(userData.followersCount)}</span>Followers</div>
                            <div class="clickable-stat" data-list="following"><span>${formatNumber(userData.followingCount)}</span>Following</div>
                        </div>
                        <div class="profile-actions">
                            ${isOwnProfile 
                                ? `<button id="render-edit-profile-btn" class="btn secondary-btn">Edit Profile</button>`
                                : `
                                    <button id="follow-btn" class="btn primary-btn">${currentUserData.following?.includes(userId) ? 'Unfollow' : 'Follow'}</button>
                                    <button id="message-btn" class="btn secondary-btn">Message</button>
                                `
                            }
                        </div>
                         <div class="profile-socials">
                             ${userData.whatsapp ? `<a href="https://wa.me/${userData.whatsapp.replace(/\D/g, '')}" target="_blank" class="social-link"><div class="coded-icon-sidebar youtube-icon-sidebar"></div> WhatsApp</a>` : ''}
                             ${userData.instagram ? `<a href="https://instagram.com/${userData.instagram}" target="_blank" class="social-link"><div class="coded-icon-sidebar instagram-icon-sidebar"></div> Instagram</a>` : ''}
                         </div>
                    </div>
                    <div class="profile-posts-area">
                        <h3>Posts</h3>
                        <div class="posts-feed" id="profile-posts-feed"><div class="loading-spinner"></div></div>
                    </div>
                </div>
            `;
            
            // Add event listeners for the new elements
            if(isOwnProfile) {
                document.getElementById('render-edit-profile-btn').addEventListener('click', () => showModal('edit-profile'));
            } else {
                document.getElementById('follow-btn').addEventListener('click', () => handleFollow(userId));
                document.getElementById('message-btn').addEventListener('click', () => renderChatWindow(userId));
            }
            document.querySelectorAll('.clickable-stat').forEach(el => {
                el.addEventListener('click', () => showModal('follow-list', { userId, listType: el.dataset.list, title: el.dataset.list.charAt(0).toUpperCase() + el.dataset.list.slice(1) }));
            });
            
            // Load user's posts
            const postsSnapshot = await db.collection('posts').where('userId', '==', userId).orderBy('timestamp', 'desc').get();
            const profilePostsFeed = document.getElementById('profile-posts-feed');
            profilePostsFeed.innerHTML = '';
            if (postsSnapshot.empty) {
                profilePostsFeed.innerHTML = '<p class="info-text">This user has no posts yet.</p>';
            } else {
                postsSnapshot.docs.forEach(doc => profilePostsFeed.appendChild(createPostElement({id: doc.id, ...doc.data()})));
            }
            
        } catch (err) {
            console.error(err);
            profileContainer.innerHTML = '<p class="error-message">Could not load profile.</p>';
        }
    }
    
    async function handleFollow(targetUserId) {
        const targetRef = db.collection('users').doc(targetUserId);
        const selfRef = db.collection('users').doc(currentUser.uid);
        const isFollowing = currentUserData.following?.includes(targetUserId);
        
        const batch = db.batch();
        
        // Update self
        batch.update(selfRef, {
            following: isFollowing ? firebase.firestore.FieldValue.arrayRemove(targetUserId) : firebase.firestore.FieldValue.arrayUnion(targetUserId),
            followingCount: firebase.firestore.FieldValue.increment(isFollowing ? -1 : 1)
        });
        // Update target
        batch.update(targetRef, {
            followers: isFollowing ? firebase.firestore.FieldValue.arrayRemove(currentUser.uid) : firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
            followersCount: firebase.firestore.FieldValue.increment(isFollowing ? -1 : 1)
        });
        
        try {
            await batch.commit();
            showToast(isFollowing ? 'Unfollowed' : 'Followed', 'success');
            document.getElementById('follow-btn').textContent = isFollowing ? 'Follow' : 'Unfollow';
        } catch (err) {
            console.error(err);
            showToast('Action failed.', 'error');
        }
    }

    function getProfileSetupHTML(data = {}) {
        return `
            <form id="profile-form">
                <h3>${data.username ? 'Edit' : 'Setup'} Your Profile</h3>
                <div class="form-group">
                    <label>Username</label>
                    <div class="username-availability-check">
                        <input type="text" id="edit-username" value="${data.username || ''}" placeholder="@username" required>
                        <div id="username-status" class="status-indicator"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Profile Logo</label>
                    <div class="logo-options-grid">
                        ${PROFILE_LOGOS.map(logo => `<div class="logo-option-item ${logo} ${data.profileLogo === logo ? 'selected' : ''}" data-logo="${logo}"></div>`).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Contact (at least one is required)</label>
                    <input type="text" id="edit-whatsapp" value="${data.whatsapp || ''}" placeholder="WhatsApp Number (e.g. +91...)" >
                    <input type="text" id="edit-instagram" value="${data.instagram || ''}" placeholder="Instagram ID (without @)" style="margin-top: 10px;">
                </div>
                <button type="submit" class="btn primary-btn">Save Profile</button>
            </form>
        `;
    }

    function attachProfileFormListeners(isEditing) {
        const form = document.getElementById('profile-form');
        const usernameInput = document.getElementById('edit-username');
        let usernameDebounce;
        
        usernameInput.addEventListener('input', () => {
            clearTimeout(usernameDebounce);
            const statusEl = document.getElementById('username-status');
            statusEl.className = 'status-indicator checking';
            usernameDebounce = setTimeout(() => checkUsernameAvailability(usernameInput.value, statusEl, isEditing ? currentUserData.username : null), 500);
        });
        
        document.querySelectorAll('.logo-option-item').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelector('.logo-option-item.selected')?.classList.remove('selected');
                el.classList.add('selected');
            });
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = usernameInput.value.trim();
            const selectedLogo = document.querySelector('.logo-option-item.selected')?.dataset.logo;
            const whatsapp = document.getElementById('edit-whatsapp').value.trim();
            const instagram = document.getElementById('edit-instagram').value.trim();

            if (!username || !selectedLogo || (!whatsapp && !instagram)) {
                return showToast('Please fill all required fields.', 'error');
            }
            
            const isAvailable = document.getElementById('username-status').classList.contains('available');
            if (!isAvailable && username !== currentUserData.username) {
                return showToast('Username is not available.', 'error');
            }
            
            const profileData = {
                username: username,
                profileLogo: selectedLogo,
                whatsapp: whatsapp,
                instagram: instagram,
                // Initialize fields if they don't exist
                postCount: currentUserData.postCount || 0,
                followersCount: currentUserData.followersCount || 0,
                followingCount: currentUserData.followingCount || 0,
                coins: currentUserData.coins ?? 100,
                credits: currentUserData.credits ?? 50,
                postLimit: currentUserData.postLimit ?? 5,
            };
            
            try {
                await db.collection('users').doc(currentUser.uid).set(profileData, { merge: true });
                // If username changed, create new unique doc and delete old one if exists
                if (isEditing && currentUserData.username !== username) {
                    await db.collection('usernames').doc(username).set({ uid: currentUser.uid });
                    await db.collection('usernames').doc(currentUserData.username).delete();
                } else if (!isEditing) {
                    await db.collection('usernames').doc(username).set({ uid: currentUser.uid });
                }
                
                showToast('Profile Saved!', 'success');
                closeModal();
                if (!isEditing) initializeApp(); // First time setup complete
                
            } catch (err) {
                console.error(err);
                showToast('Failed to save profile.', 'error');
            }
        });
    }

    async function checkUsernameAvailability(username, statusEl, currentUsername) {
        if (!username || username === currentUsername) {
            statusEl.className = 'status-indicator';
            return;
        }
        const doc = await db.collection('usernames').doc(username).get();
        statusEl.className = `status-indicator ${doc.exists ? 'taken' : 'available'}`;
    }

    // =================================================================================
    // --- UPLOAD ---
    // =================================================================================

    document.getElementById('post-image').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = document.getElementById('image-preview');
            preview.src = URL.createObjectURL(file);
            preview.classList.remove('hidden');
        }
    });

    document.getElementById('publish-post-btn').addEventListener('click', async (e) => {
        const btn = e.target;
        const content = document.getElementById('post-content').value.trim();
        const imageFile = document.getElementById('post-image').files[0];
        const boostValue = document.getElementById('post-boost').value;

        if (!content && !imageFile) return showToast('Post cannot be empty.', 'error');
        if (currentUserData.coins < 5 || currentUserData.postLimit < 1) {
            return showToast('You need 5 Coins and 1 Limit to post.', 'error');
        }
        
        let adsToWatch = 0;
        if (boostValue === '18') adsToWatch = 1;
        if (boostValue === '24') adsToWatch = 2;
        if (boostValue === '30') adsToWatch = 3;
        
        const watchedAds = parseInt(btn.dataset.watchedAds || '0', 10);

        if (watchedAds < adsToWatch) {
            showModal('ad', { purpose: `boost-${adsToWatch}` });
            return;
        }
        
        btn.disabled = true;
        btn.textContent = 'Publishing...';

        try {
            let imageUrl = '';
            if (imageFile) {
                const storageRef = storage.ref(`post_images/${currentUser.uid}/${Date.now()}`);
                const uploadTask = await storageRef.put(imageFile);
                imageUrl = await uploadTask.ref.getDownloadURL();
            }
            
            const expiryTime = new Date();
            expiryTime.setHours(expiryTime.getHours() + parseInt(boostValue, 10));

            const batch = db.batch();
            const postRef = db.collection('posts').doc();
            batch.set(postRef, {
                userId: currentUser.uid,
                username: currentUserData.username,
                userProfileLogo: currentUserData.profileLogo,
                content,
                imageUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                expiryTimestamp: firebase.firestore.Timestamp.fromDate(expiryTime),
                likes: 0, likedBy: [],
                views: 0,
                reactions: {}, userReactions: {}
            });
            
            const userRef = db.collection('users').doc(currentUser.uid);
            batch.update(userRef, {
                coins: firebase.firestore.FieldValue.increment(-5),
                postLimit: firebase.firestore.FieldValue.increment(-1),
                postCount: firebase.firestore.FieldValue.increment(1)
            });
            
            await batch.commit();
            showToast('Post published!', 'success');
            // Reset form
            document.getElementById('post-content').value = '';
            document.getElementById('post-image').value = '';
            document.getElementById('image-preview').classList.add('hidden');
            delete btn.dataset.watchedAds;
            switchScreen('home');
            document.getElementById('posts-feed').innerHTML = '';
            postCache = [];
            loadPosts();

        } catch (err) {
            console.error(err);
            showToast('Upload failed. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Publish Post';
        }
    });

});
