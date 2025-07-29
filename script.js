 // Firebase Configuration (from your input)
const firebaseConfig = {
    apiKey: "AIzaSyDlZA4grzF3fx95-11E4s7ASXwkIij1k1w",
    authDomain: "addmint-7ab6b.firebaseapp.com",
    databaseURL: "https://addmint-7ab6b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "addmint-7ab6b",
    storageBucket: "addmint-7ab6b.firebasestorage.app",
    messagingSenderId: "504015450137",
    appId: "1:504015450137:web:694b176313582cce1e7a88",
    measurementId: "G-H7J7M23Z82"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// --- DOM Elements ---
const splashScreen = document.getElementById('splash-screen');
const appContainer = document.getElementById('app-container');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const mainContent = document.querySelector('.main-content');
const bottomNavItems = document.querySelectorAll('.app-bottom-nav .nav-item');
const screenSections = document.querySelectorAll('.app-screen');
const headerCoins = document.getElementById('header-coins');
const headerCredits = document.getElementById('header-credits');
const headerLimit = document.getElementById('header-limit');
const giftClaimBtn = document.getElementById('gift-claim-btn');
const adModal = document.getElementById('ad-modal');
const closeAdModalBtn = document.getElementById('close-ad-modal');
const rewardPopup = document.getElementById('reward-popup');
const rewardMessage = document.getElementById('reward-message');
const closeRewardPopupBtn = document.getElementById('close-reward-popup');
const toastNotification = document.getElementById('toast-notification');
const refreshPostsBtn = document.getElementById('refresh-posts-btn');
const postsFeed = document.getElementById('posts-feed');
const loadingSpinner = document.getElementById('loading-spinner');

// Post Upload Screen
const uploadScreen = document.getElementById('upload-screen');
const postContentInput = document.getElementById('post-content');
const postImageInput = document.getElementById('post-image');
const postBoostSelect = document.getElementById('post-boost');
const publishPostBtn = document.getElementById('publish-post-btn');
const uploadStatus = document.getElementById('upload-status');

// Profile Screen
const profileScreen = document.getElementById('profile-screen');
const myProfileAvatar = document.getElementById('my-profile-avatar');
const myProfileUsername = document.getElementById('my-profile-username');
const myPostsCount = document.getElementById('my-posts-count');
const myFollowersCount = document.getElementById('my-followers-count');
const myFollowingCount = document.getElementById('my-following-count');
const editProfileBtn = document.getElementById('edit-profile-btn');
const followUserBtn = document.getElementById('follow-user-btn');
const unfollowUserBtn = document.getElementById('unfollow-user-btn');
const messageUserBtn = document.getElementById('message-user-btn');
const profileWhatsappLink = document.getElementById('profile-whatsapp-link');
const profileInstagramLink = document.getElementById('profile-instagram-link');
const currentProfileUsernamePosts = document.getElementById('current-profile-username-posts');
const profilePostsFeed = document.getElementById('profile-posts-feed');

const editProfileModal = document.getElementById('edit-profile-modal');
const editUsernameInput = document.getElementById('edit-username');
const usernameAvailability = document.getElementById('username-availability');
const editWhatsappInput = document.getElementById('edit-whatsapp');
const editInstagramInput = document.getElementById('edit-instagram');
const profileLogoOptions = document.getElementById('profile-logo-options');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelEditProfileBtn = document.getElementById('cancel-edit-profile-btn');

const followListModal = document.getElementById('follow-list-modal');
const followListTitle = document.getElementById('follow-list-title');
const followListContent = document.getElementById('follow-list-content');
const closeFollowListModalBtn = document.getElementById('close-follow-list-modal');

// Messaging Screen
const messagesScreen = document.getElementById('messages-screen');
const messageListContainer = document.getElementById('message-list-container');
const recentChatsList = document.getElementById('recent-chats-list');
const chatWindowContainer = document.getElementById('chat-window-container');
const chatPartnerUsername = document.getElementById('chat-partner-username');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const backToChatsBtn = document.getElementById('back-to-chats-btn');

// Search Screen
const searchScreen = document.getElementById('search-screen');
const searchQueryInput = document.getElementById('search-query');
const searchBtn = document.getElementById('search-btn');
const searchUserList = document.getElementById('search-user-list');
const searchPostList = document.getElementById('search-post-list');
const noSearchResults = document.getElementById('no-search-results');

// --- Global Variables ---
let currentUser = null;
let currentUserData = {}; // To cache current user's profile data
let currentProfileViewingId = null; // To differentiate between viewing own profile vs. other's
let currentChatPartnerId = null;
let lastVisiblePost = null; // For infinite scrolling pagination
let fetchingPosts = false;
let postsToLoadPerScroll = 5;
let dataSaverEnabled = false; // For data saver feature
let a_user_has_liked = false;

const PROFILE_LOGOS = [
    { class: 'logo-1', emoji: '🧑', color: '#ff6347' }, { class: 'logo-2', emoji: '👩', color: '#6a5acd' },
    { class: 'logo-3', emoji: '🚀', color: '#32cd32' }, { class: 'logo-4', emoji: '💡', color: '#ff8c00' },
    { class: 'logo-5', emoji: '🌟', color: '#ffd700' }, { class: 'logo-6', emoji: '🌈', color: '#9932cc' },
    { class: 'logo-7', emoji: '🦊', color: '#d2691e' }, { class: 'logo-8', emoji: '🐼', color: '#6495ed' },
    { class: 'logo-9', emoji: '🦋', color: '#dda0dd' }, { class: 'logo-10', emoji: '🐢', color: '#20b2aa' },
    { class: 'logo-11', emoji: '🤖', color: '#87ceeb' }, { class: 'logo-12', emoji: '👽', color: '#7cfc00' },
    { class: 'logo-13', emoji: '🦄', color: '#ee82ee' }, { class: 'logo-14', emoji: '🐉', color: '#48d1cc' },
    { class: 'logo-15', emoji: '🌊', color: '#4682b4' }, { class: 'logo-16', emoji: '🔥', color: '#dc143c' },
    { class: 'logo-17', emoji: '👑', color: '#f0e68c' }, { class: 'logo-18', emoji: '💎', color: '#00ced1' },
    { class: 'logo-19', emoji: '🔑', color: '#b0e0e6' }, { class: 'logo-20', emoji: '⚡', color: '#ffff00' },
    { class: 'logo-21', emoji: '🎵', color: '#ff69b4' }, { class: 'logo-22', emoji: '🎨', color: '#7b68ee' },
    { class: 'logo-23', emoji: '🧩', color: '#ffa07a' }, { class: 'logo-24', emoji: '🍔', color: '#cd853f' },
    { class: 'logo-25', emoji: '🍕', color: '#f08080' }, { class: 'logo-26', emoji: '🎮', color: '#c0c0c0' },
    { class: 'logo-27', emoji: '✈️', color: '#afeeee' }, { class: 'logo-28', emoji: '🌳', color: '#228b22' },
    { class: 'logo-29', emoji: '🌸', color: '#ffb6c1' }, { class: 'logo-30', emoji: '⚽', color: '#b0c4de' },
    { class: 'logo-31', emoji: '🎸', color: '#8b4513' }, { class: 'logo-32', emoji: '🚲', color: '#00fa9a' },
    { class: 'logo-33', emoji: '📚', color: '#deb887' }, { class: 'logo-34', emoji: '☕', color: '#d2b48c' },
    { class: 'logo-35', emoji: '🎁', color: '#f4a460' }, { class: 'logo-36', emoji: '🎉', color: '#ba55d3' },
    { class: 'logo-37', emoji: '🌍', color: '#87cefa' }, { class: 'logo-38', emoji: '🔬', color: '#778899' },
    { class: 'logo-39', emoji: '🔭', color: '#696969' }, { class: 'logo-40', emoji: '🛠️', color: '#d3d3d3' },
    { class: 'logo-41', emoji: '⚖️', color: '#add8e6' }, { class: 'logo-42', emoji: '💰', color: '#b8860b' },
    { class: 'logo-43', emoji: '🛡️', color: '#5f9ea0' }, { class: 'logo-44', emoji: '🔔', color: '#f0f8ff' },
    { class: 'logo-45', emoji: '⏳', color: '#fa8072' }, { class: 'logo-46', emoji: '💾', color: '#3cb371' },
    { class: 'logo-47', emoji: '⚙️', color: '#4682b4' }, { class: 'logo-48', emoji: '📡', color: '#2e8b57' },
    { class: 'logo-49', emoji: '🌐', color: '#a52a2a' }, { class: 'logo-50', emoji: '📈', color: '#c71585' }
];

// Inject logo styles into the head
function injectLogoStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.classList.add('dynamic-logo-styles');
    let styles = '';
    PROFILE_LOGOS.forEach(logo => {
        // For general use (e.g., post headers, search results)
        styles += `
            .profile-avatar.user-logo-${logo.class} { background-color: ${logo.color}; }
            .profile-avatar.user-logo-${logo.class}::before { content: '${logo.emoji}'; font-size: 24px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        `;
        // For the large profile avatar
        styles += `
            .profile-avatar-large.user-logo-${logo.class} { background-color: ${logo.color}; }
            .profile-avatar-large.user-logo-${logo.class}::before { content: '${logo.emoji}'; font-size: 60px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        `;
        // For logo selection options
        styles += `
            .logo-option-item.user-logo-${logo.class} { background-color: ${logo.color}; }
            .logo-option-item.user-logo-${logo.class}::before { content: '${logo.emoji}'; font-size: 28px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        `;
    });
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
injectLogoStyles();


// --- Utility Functions ---

function showToast(message, type = 'info', duration = 3000) {
    toastNotification.textContent = message;
    toastNotification.className = `toast-notification show ${type}`;
    setTimeout(() => {
        toastNotification.className = 'toast-notification';
    }, duration);
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num;
}

function showScreen(screenId) {
    screenSections.forEach(screen => {
        screen.classList.remove('active');
    });
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
      activeScreen.classList.add('active');
    }

    bottomNavItems.forEach(item => {
        item.classList.toggle('active', item.dataset.screen === screenId.replace('-screen', ''));
    });

    sidebar.classList.remove('open');
}

function getLogoCssClass(logoName) {
    const logo = PROFILE_LOGOS.find(l => l.class === logoName);
    return logo ? `user-logo-${logo.class}` : 'user-logo-logo-1'; // Default
}

// --- Firebase Authentication ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        const userDocRef = db.collection('users').doc(currentUser.uid);
        
        // Use a real-time listener for user data to keep it fresh
        userDocRef.onSnapshot(async (doc) => {
            if (!doc.exists || !doc.data().username) {
                // New user or incomplete profile
                if (!appContainer.classList.contains('hidden')) {
                    showScreen('profile-screen');
                    editProfileModal.classList.remove('hidden');
                    showToast("Welcome! Please complete your profile.", 'info', 5000);
                    myProfileUsername.textContent = "@NewUser"; // Placeholder
                    populateProfileLogoOptions(null);
                }
                 hideSplashScreen();
            } else {
                // Existing user
                currentUserData = { uid: doc.id, ...doc.data() };
                updateHeaderStats(currentUserData);
                checkDailyRewardStatus(currentUserData.lastRewardClaim || 0);

                // If splash is visible, hide it and show home
                 if (!appContainer.classList.contains('hidden')) {
                    // Already loaded, just update data
                } else {
                    await loadUserProfile(currentUser.uid); // Load initial profile data
                    showScreen('home-screen');
                    postsFeed.innerHTML = '';
                    lastVisiblePost = null;
                    loadPosts();
                    hideSplashScreen();
                }
            }
        }, err => {
            console.error("Error listening to user document:", err);
            showToast("Connection error.", "error");
        });

    } else {
        currentUser = null;
        currentUserData = {};
        showDummyLogin(); // In a real app, show a login form
    }
});

function showDummyLogin() {
    splashScreen.classList.remove('hidden');
    appContainer.classList.add('hidden');
    auth.signInAnonymously().catch((error) => {
        console.error("Error signing in anonymously:", error);
        splashScreen.innerHTML = `<p style="color:red;">Login Failed: ${error.message}</p>`;
    });
}

function hideSplashScreen() {
    if (splashScreen.classList.contains('hidden')) return;
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
        }, 500);
    }, 1500);
}

// --- Header and Rewards ---
function updateHeaderStats(data) {
    headerCoins.textContent = `${formatNumber(data.coins || 0)} C`;
    headerCredits.textContent = `${formatNumber(data.credits || 0)} Cr`;
    headerLimit.textContent = `${formatNumber(data.postLimit || 0)} L`;
}

headerCoins.addEventListener('click', () => showAdModal('earn-coins'));
headerCredits.addEventListener('click', () => showAdModal('earn-credits'));
headerLimit.addEventListener('click', () => showAdModal('earn-limit'));

const DAILY_REWARD_INTERVAL = 24 * 60 * 60 * 1000;
const DAILY_REWARD = { limit: 2, coins: 10, credits: 10 };

function checkDailyRewardStatus(lastClaimTimestamp) {
    const now = Date.now();
    giftClaimBtn.classList.toggle('neon-glow', (now - lastClaimTimestamp >= DAILY_REWARD_INTERVAL));
}

giftClaimBtn.addEventListener('click', async () => {
    if (!currentUser) return showToast("Please log in to claim rewards.", 'info');

    const lastClaimTime = currentUserData.lastRewardClaim || 0;
    const now = Date.now();

    if (now - lastClaimTime >= DAILY_REWARD_INTERVAL) {
        try {
            const userDocRef = db.collection('users').doc(currentUser.uid);
            await userDocRef.update({
                coins: firebase.firestore.FieldValue.increment(DAILY_REWARD.coins),
                credits: firebase.firestore.FieldValue.increment(DAILY_REWARD.credits),
                postLimit: firebase.firestore.FieldValue.increment(DAILY_REWARD.limit),
                lastRewardClaim: now
            });
            showRewardPopup(`You claimed your daily reward!\n+${DAILY_REWARD.coins} Coins, +${DAILY_REWARD.credits} Credits, +${DAILY_REWARD.limit} Limits.`);
        } catch (error) {
            console.error("Error claiming daily reward:", error);
            showToast("Failed to claim reward.", 'error');
        }
    } else {
        const timeRemaining = DAILY_REWARD_INTERVAL - (now - lastClaimTime);
        showToast(`Next reward in: ${new Date(timeRemaining).toISOString().substr(11, 8)}`, 'info');
    }
});

function showRewardPopup(message) {
    rewardMessage.innerHTML = message.replace(/\n/g, '<br>');
    rewardPopup.classList.remove('hidden');
}

closeRewardPopupBtn.addEventListener('click', () => rewardPopup.classList.add('hidden'));

// --- Navigation ---
function setupNavListeners() {
    const navLinks = [...document.querySelectorAll('#sidebar ul li a'), ...bottomNavItems];
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screenId = e.currentTarget.dataset.screen;
            if (screenId) {
                showScreen(`${screenId}-screen`);
                if (screenId === 'profile' && currentProfileViewingId !== currentUser.uid) {
                    loadUserProfile(currentUser.uid);
                } else if (screenId === 'home') {
                    if (postsFeed.innerHTML === '') loadPosts();
                } else if (screenId === 'messages') {
                    loadRecentChats();
                    messageListContainer.classList.remove('hidden');
                    chatWindowContainer.classList.add('hidden');
                }
            }
        });
    });

    menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    mainContent.addEventListener('click', () => sidebar.classList.remove('open'));
    
    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
}
setupNavListeners();


// --- Post Loading and Infinite Scrolling (with looping) ---
async function loadPosts() {
    if (fetchingPosts || !currentUser) return;

    fetchingPosts = true;
    loadingSpinner.classList.remove('hidden');

    try {
        let postsRef = db.collection('posts')
                         .orderBy('timestamp', 'desc')
                         .limit(postsToLoadPerScroll);

        if (lastVisiblePost) {
            postsRef = postsRef.startAfter(lastVisiblePost);
        }

        const snapshot = await postsRef.get();
        
        // **MODIFIED: If feed ends, restart from the beginning**
        if (snapshot.empty && postsFeed.children.length > 0) {
            showToast("You've seen all posts! Looping back to the top.", 'info');
            lastVisiblePost = null; // Reset pagination
            fetchingPosts = false;
            loadingSpinner.classList.add('hidden');
            loadPosts(); // Recall to load from start
            return;
        } else if (snapshot.empty) {
             postsFeed.innerHTML = '<p style="text-align: center; color: #ccc;">No posts found. Be the first to post!</p>';
        }

        lastVisiblePost = snapshot.docs[snapshot.docs.length - 1];

        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPostBatch(postsData);

    } catch (error) {
        console.error("Error loading posts:", error);
        showToast("Error loading posts.", 'error');
    } finally {
        fetchingPosts = false;
        loadingSpinner.classList.remove('hidden');
    }
}

// Render posts with mixed layouts
function renderPostBatch(posts) {
    while (posts.length > 0) {
        const randomLayout = Math.random();
        if (randomLayout < 0.5 || posts.length < 2) { // Vertical (50% chance)
            renderPost(posts.shift(), 'vertical-post');
        } else if (randomLayout < 0.75 && posts.length >= 2) { // Horizontal (25% chance)
            const numHorizontal = Math.min(posts.length, 2);
            const container = document.createElement('div');
            container.className = 'horizontal-post-container';
            for (let i = 0; i < numHorizontal; i++) {
                container.appendChild(createPostElement(posts.shift(), 'horizontal-post'));
            }
            postsFeed.appendChild(container);
        } else if (posts.length >= 2) { // Table (25% chance)
            const numTable = Math.min(posts.length, 2);
            const container = document.createElement('div');
            container.className = 'table-post-container';
            for (let i = 0; i < numTable; i++) {
                container.appendChild(createPostElement(posts.shift(), 'table-post'));
            }
            postsFeed.appendChild(container);
        }
    }
}


function createPostElement(postData, layoutClass = 'vertical-post') {
    const postCard = document.createElement('div');
    postCard.className = `post-card ${layoutClass}`;
    postCard.dataset.postId = postData.id;

    const userProfileClass = getLogoCssClass(postData.userProfileLogo);
    const isLiked = postData.likedBy && postData.likedBy.includes(currentUser.uid);

    postCard.innerHTML = `
        <div class="post-header">
            <div class="profile-avatar ${userProfileClass}" data-user-id="${postData.userId}"></div>
            <div class="post-user-info">
                 <span class="username" data-user-id="${postData.userId}">@${postData.username}</span>
                 <span class="post-timestamp">${postData.timestamp ? new Date(postData.timestamp.seconds * 1000).toLocaleString() : 'Just now'}</span>
            </div>
            <div class="post-options">
                <i class="fas fa-ellipsis-v"></i>
                <div class="options-dropdown hidden">
                    <span class="report-btn">Report</span>
                    ${postData.userId === currentUser.uid ? `<span class="delete-btn">Delete</span>` : ''}
                </div>
            </div>
        </div>
        <div class="post-content">
            <p class="post-text">${formatPostContent(postData.content)}</p>
            ${postData.imageUrl ? `<img src="${dataSaverEnabled ? '' : postData.imageUrl}" ${dataSaverEnabled ? 'data-src="'+postData.imageUrl+'"' : ''} alt="Post Image">` : ''}
        </div>
        <div class="post-footer">
            <div class="post-actions">
                <span class="like-button"><i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> <span class="like-count">${formatNumber(postData.likes || 0)}</span></span>
                <span class="views-count"><i class="fas fa-eye"></i> <span class="view-count-num">${formatNumber(postData.views || 0)}</span></span>
                <span class="translate-button"><i class="fas fa-language"></i></span>
            </div>
            <div class="post-reactions" data-post-id="${postData.id}">
                <div class="emoji-reaction-display">${renderEmojiReactions(postData.reactions)}</div>
                <span class="total-reactions">${formatNumber(Object.values(postData.reactions || {}).reduce((a, b) => a + b, 0))} reactions</span>
            </div>
        </div>
        <div class="emoji-picker hidden">
            <span class="emoji-option" data-emoji="👍">👍</span><span class="emoji-option" data-emoji="❤️">❤️</span><span class="emoji-option" data-emoji="😂">😂</span><span class="emoji-option" data-emoji="😢">😢</span><span class="emoji-option" data-emoji="🔥">🔥</span>
        </div>
    `;

    addPostEventListeners(postCard, postData);
    incrementViewCount(postData.id); // Increment view count when element is created
    return postCard;
}


function renderPost(postData, layoutClass) {
    postsFeed.appendChild(createPostElement(postData, layoutClass));
}

function formatPostContent(content) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
}

function renderEmojiReactions(reactions) {
    if (!reactions) return '';
    return Object.entries(reactions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([emoji, count]) => `<span class="emoji">${emoji}<span class="count">${formatNumber(count)}</span></span>`)
        .join('');
}


// --- Post Event Listeners ---
let lastClickTime = 0;
let longPressTimer;
let currentNeonPost = null;

function addPostEventListeners(postElement, postData) {
    const postId = postData.id;
    const emojiPicker = postElement.querySelector('.emoji-picker');

    // Double-click and long-press logic
    postElement.addEventListener('click', (e) => {
        // Prevent event from firing if a child element was the target
        if (e.target.closest('.like-button, .translate-button, .post-options, .username, .profile-avatar, .emoji-picker, a')) {
            return;
        }
        
        const currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 300) { // Double click
            clearTimeout(longPressTimer);
            handleLike(postId, postElement);
            lastClickTime = 0;
        } else { // Single click
            lastClickTime = currentTime;
            longPressTimer = setTimeout(() => { // Long press
                emojiPicker.classList.remove('hidden');
            }, 500);
        }
    });
    
    postElement.addEventListener('contextmenu', e => e.preventDefault()); // Prevent right click menu

    postElement.addEventListener('mouseup', () => clearTimeout(longPressTimer));
    postElement.addEventListener('mouseleave', () => clearTimeout(longPressTimer));
    postElement.addEventListener('touchend', () => clearTimeout(longPressTimer));


    // Specific element listeners
    postElement.querySelector('.like-button').addEventListener('click', () => handleLike(postId, postElement));
    postElement.querySelector('.username').addEventListener('click', () => openUserProfile(postData.userId));
    postElement.querySelector('.profile-avatar').addEventListener('click', () => openUserProfile(postData.userId));
    postElement.querySelector('.translate-button').addEventListener('click', (e) => handleTranslate(e, postElement));
    
    postElement.querySelector('.post-options .fa-ellipsis-v').addEventListener('click', (e) => {
        e.stopPropagation();
        postElement.querySelector('.options-dropdown').classList.toggle('hidden');
    });
    
    const deleteBtn = postElement.querySelector('.delete-btn');
    if(deleteBtn) deleteBtn.addEventListener('click', () => handleDeletePost(postId, postElement));
    
    postElement.querySelector('.report-btn').addEventListener('click', () => handleReportPost(postId));

    emojiPicker.querySelectorAll('.emoji-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            handleEmojiReaction(postId, e.currentTarget.dataset.emoji, postElement);
            emojiPicker.classList.add('hidden');
        });
    });
}

function handleTranslate(event, postElement) {
    event.stopPropagation();
    const postTextElement = postElement.querySelector('.post-text');
    if (postTextElement) {
        if (postTextElement.dataset.originalText) {
            postTextElement.textContent = postTextElement.dataset.originalText;
            delete postTextElement.dataset.originalText;
            showToast("Switched back to original language.", "info");
        } else {
            postTextElement.dataset.originalText = postTextElement.textContent;
            postTextElement.textContent = "[Translated] " + postTextElement.textContent.split('').reverse().join(''); // Simple mock translation
            showToast("Post translated (mock).", "success");
        }
    }
}


async function handleLike(postId, postElement) {
    if (!currentUser) return showToast("Please log in to like posts.", 'info');

    const likeButton = postElement.querySelector('.like-button');
    const likeIcon = likeButton.querySelector('i');
    const likeCountSpan = likeButton.querySelector('.like-count');
    const postRef = db.collection('posts').doc(postId);

    // Optimistic UI update
    const isCurrentlyLiked = likeIcon.classList.contains('fas');
    likeIcon.classList.toggle('far', isCurrentlyLiked);
    likeIcon.classList.toggle('fas', !isCurrentlyLiked);
    if (!isCurrentlyLiked) likeIcon.classList.add('bounceIn');
    
    let currentCount = parseInt(likeCountSpan.textContent.replace(/k|M/,'')) || 0;
    likeCountSpan.textContent = formatNumber(isCurrentlyLiked ? currentCount - 1 : currentCount + 1);
    
    // Firebase update
    try {
        await postRef.update({
            likedBy: isCurrentlyLiked 
                ? firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                : firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
            likes: firebase.firestore.FieldValue.increment(isCurrentlyLiked ? -1 : 1)
        });
    } catch (error) {
        console.error("Error liking post:", error);
        showToast("Failed to update like.", 'error');
        // Revert UI on error
        likeIcon.classList.toggle('far', !isCurrentlyLiked);
        likeIcon.classList.toggle('fas', isCurrentlyLiked);
        likeCountSpan.textContent = formatNumber(currentCount);
    }
}

async function handleEmojiReaction(postId, emoji, postElement) {
    if (!currentUser) return showToast("Please log in to react.", 'info');

    const postRef = db.collection('posts').doc(postId);
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(postRef);
            if (!doc.exists) throw "Post does not exist!";
            
            const postData = doc.data();
            const reactions = postData.reactions || {};
            const userReactions = postData.userReactions || {};
            const userPreviousReaction = userReactions[currentUser.uid];

            // Start with a clean copy for updates
            const newReactions = { ...reactions };
            
            // If user reacted before, decrement the old one
            if (userPreviousReaction) {
                newReactions[userPreviousReaction] = (newReactions[userPreviousReaction] || 1) - 1;
                if (newReactions[userPreviousReaction] <= 0) {
                    delete newReactions[userPreviousReaction];
                }
            }
            
            // If user is un-reacting (clicking same emoji)
            if (userPreviousReaction === emoji) {
                delete userReactions[currentUser.uid];
            } else { // If new reaction or changing reaction
                newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                userReactions[currentUser.uid] = emoji;
            }

            transaction.update(postRef, { reactions: newReactions, userReactions: userReactions });
        });

        // Update UI after successful transaction
        const updatedDoc = await postRef.get();
        const updatedData = updatedDoc.data();
        const reactionDisplay = postElement.querySelector('.emoji-reaction-display');
        const totalReactions = postElement.querySelector('.total-reactions');
        reactionDisplay.innerHTML = renderEmojiReactions(updatedData.reactions);
        totalReactions.textContent = `${formatNumber(Object.values(updatedData.reactions || {}).reduce((a, b) => a + b, 0))} reactions`;
        showToast("Reaction sent!", 'success');

    } catch (error) {
        console.error("Error sending reaction:", error);
        showToast("Failed to send reaction.", 'error');
    }
}

async function incrementViewCount(postId) {
    // This is a simplified client-side view counter. For accuracy, use Cloud Functions.
    if (!currentUser) return;
    const postRef = db.collection('posts').doc(postId);
    await postRef.update({ views: firebase.firestore.FieldValue.increment(1) });
}

refreshPostsBtn.addEventListener('click', () => {
    postsFeed.innerHTML = '';
    lastVisiblePost = null;
    loadPosts();
    showToast("Feed refreshed!", 'info');
});

mainContent.addEventListener('scroll', () => {
    if (mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 200 &&
        document.getElementById('home-screen').classList.contains('active')) {
        loadPosts();
    }
});

// --- Post Upload Functionality ---
publishPostBtn.addEventListener('click', async () => {
    if (!currentUser) return showToast("Please log in to upload posts.", 'error');

    const content = postContentInput.value.trim();
    const imageFile = postImageInput.files[0];
    if (!content && !imageFile) return showToast("Post cannot be empty.", 'error');
    
    if (currentUserData.coins < 5 || currentUserData.postLimit < 1) {
        showToast("You need 5 coins and 1 limit to post. Watch an ad to earn.", 'error');
        return showAdModal('earn-coins');
    }
    
    publishPostBtn.disabled = true;
    uploadStatus.textContent = "Uploading...";

    try {
        let imageUrl = '';
        if (imageFile) {
            const storageRef = storage.ref(`post_images/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
            const uploadTask = await storageRef.put(imageFile);
            imageUrl = await uploadTask.ref.getDownloadURL();
        }

        const userDocRef = db.collection('users').doc(currentUser.uid);
        const newPostRef = db.collection('posts').doc();
        
        const batch = db.batch();
        batch.set(newPostRef, {
            userId: currentUser.uid,
            username: currentUserData.username,
            userProfileLogo: currentUserData.profileLogo,
            content: content,
            imageUrl: imageUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            views: 0,
            reactions: {},
            likedBy: [],
            userReactions: {}
        });
        batch.update(userDocRef, {
            postCount: firebase.firestore.FieldValue.increment(1),
            coins: firebase.firestore.FieldValue.increment(-5),
            postLimit: firebase.firestore.FieldValue.increment(-1)
        });
        await batch.commit();

        uploadStatus.textContent = "";
        showToast("Post published!", 'success');
        postContentInput.value = '';
        postImageInput.value = '';
        showScreen('home-screen');
        postsFeed.innerHTML = '';
        lastVisiblePost = null;
        loadPosts();

    } catch (error) {
        console.error("Error publishing post:", error);
        showToast("Upload failed.", 'error');
        uploadStatus.textContent = `Error: ${error.message}`;
    } finally {
        publishPostBtn.disabled = false;
    }
});


// --- Ad Modal Logic ---
let currentAdPurpose = '';
function showAdModal(purpose) {
    currentAdPurpose = purpose;
    adModal.classList.remove('hidden');
    closeAdModalBtn.disabled = true;

    const adPlaceholder = document.getElementById('ad-placeholder');
    adPlaceholder.innerHTML = '<p>Simulating Ad (5 seconds)...</p><div class="loader"></div>';
    
    setTimeout(() => {
        adPlaceholder.innerHTML = '<p>Ad Complete! You can close this window.</p>';
        closeAdModalBtn.disabled = false;
        showToast("Ad finished! Claim your reward.", 'success');
    }, 5000); // 5-second ad simulation
}

closeAdModalBtn.addEventListener('click', async () => {
    adModal.classList.add('hidden');
    if (currentUser && currentAdPurpose) {
        await processAdReward();
    }
});

async function processAdReward() {
    const userDocRef = db.collection('users').doc(currentUser.uid);
    let updates = {};
    let rewardMessageText = "You earned:";

    if (currentAdPurpose === 'earn-coins') {
        updates.coins = firebase.firestore.FieldValue.increment(10);
        rewardMessageText += "\n+10 Coins";
    } else if (currentAdPurpose === 'earn-credits') {
        updates.credits = firebase.firestore.FieldValue.increment(10);
        rewardMessageText += "\n+10 Credits";
    } else if (currentAdPurpose === 'earn-limit') {
        updates.postLimit = firebase.firestore.FieldValue.increment(1);
        rewardMessageText += "\n+1 Post Limit";
    }

    try {
        await userDocRef.update(updates);
        showRewardPopup(rewardMessageText);
    } catch (error) {
        console.error("Error processing ad reward:", error);
        showToast("Failed to process reward.", 'error');
    } finally {
        currentAdPurpose = '';
    }
}


// --- Profile Management ---
async function loadUserProfile(userId) {
    if (!userId) return;
    currentProfileViewingId = userId;
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            updateProfileDisplay(userDoc.data());
            loadProfilePosts(userId);
            
            const isOwnProfile = userId === currentUser.uid;
            editProfileBtn.classList.toggle('hidden', !isOwnProfile);
            messageUserBtn.classList.toggle('hidden', isOwnProfile);

            if (!isOwnProfile) {
                const isFollowing = currentUserData.following && currentUserData.following.includes(userId);
                followUserBtn.classList.toggle('hidden', isFollowing);
                unfollowUserBtn.classList.toggle('hidden', !isFollowing);
            } else {
                followUserBtn.classList.add('hidden');
                unfollowUserBtn.classList.add('hidden');
            }

        } else {
            showToast("User profile not found.", 'error');
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

function updateProfileDisplay(userData) {
    const isOwnProfile = userData.uid === currentUser.uid;
    myProfileUsername.textContent = `@${userData.username || 'N/A'}`;
    currentProfileUsernamePosts.textContent = isOwnProfile ? 'Me' : userData.username;

    const profileLogoClass = getLogoCssClass(userData.profileLogo);
    myProfileAvatar.className = `profile-avatar-large ${profileLogoClass}`;
    
    myPostsCount.textContent = formatNumber(userData.postCount || 0);
    myFollowersCount.textContent = formatNumber(userData.followersCount || 0);
    myFollowingCount.textContent = formatNumber(userData.followingCount || 0);

    profileWhatsappLink.classList.toggle('hidden', !userData.whatsapp || isOwnProfile);
    if(userData.whatsapp) profileWhatsappLink.href = `https://wa.me/${userData.whatsapp.replace(/\D/g, '')}`;
    
    profileInstagramLink.classList.toggle('hidden', !userData.instagram || isOwnProfile);
    if(userData.instagram) profileInstagramLink.href = `https://www.instagram.com/${userData.instagram}`;

    if (isOwnProfile) {
        editUsernameInput.value = userData.username || '';
        editWhatsappInput.value = userData.whatsapp || '';
        editInstagramInput.value = userData.instagram || '';
        populateProfileLogoOptions(userData.profileLogo);
    }
}

async function loadProfilePosts(userId) {
    profilePostsFeed.innerHTML = '<div class="loader"></div>';
    try {
        const snapshot = await db.collection('posts').where('userId', '==', userId).orderBy('timestamp', 'desc').get();
        profilePostsFeed.innerHTML = '';
        if (snapshot.empty) {
            profilePostsFeed.innerHTML = '<p style="text-align: center;">No posts yet.</p>';
        } else {
            snapshot.docs.forEach(doc => {
                profilePostsFeed.appendChild(createPostElement({ id: doc.id, ...doc.data() }));
            });
        }
    } catch (error) {
        console.error("Error loading profile posts:", error);
        profilePostsFeed.innerHTML = '<p style="text-align: center; color: red;">Error loading posts.</p>';
    }
}


// Edit Profile Modal
editProfileBtn.addEventListener('click', () => {
    populateProfileLogoOptions(currentUserData.profileLogo);
    editProfileModal.classList.remove('hidden');
});
cancelEditProfileBtn.addEventListener('click', () => editProfileModal.classList.add('hidden'));

function populateProfileLogoOptions(currentLogo) {
    profileLogoOptions.innerHTML = '';
    PROFILE_LOGOS.forEach(logo => {
        const logoItem = document.createElement('div');
        logoItem.className = `logo-option-item user-logo-${logo.class}`;
        logoItem.dataset.logoClass = logo.class;
        logoItem.classList.toggle('selected', currentLogo === logo.class);
        logoItem.addEventListener('click', () => {
            profileLogoOptions.querySelector('.selected')?.classList.remove('selected');
            logoItem.classList.add('selected');
        });
        profileLogoOptions.appendChild(logoItem);
    });
}

saveProfileBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const newUsername = editUsernameInput.value.trim();
    const selectedLogo = profileLogoOptions.querySelector('.selected')?.dataset.logoClass;

    if (!newUsername) return showToast("Username cannot be empty.", 'error');
    if (!selectedLogo) return showToast("Please select a profile logo.", 'error');
    
    const userDocRef = db.collection('users').doc(currentUser.uid);
    const updates = {
        username: newUsername,
        whatsapp: editWhatsappInput.value.trim(),
        instagram: editInstagramInput.value.trim(),
        profileLogo: selectedLogo,
        // Initialize fields if they don't exist
        followersCount: currentUserData.followersCount || 0,
        followingCount: currentUserData.followingCount || 0,
        postCount: currentUserData.postCount || 0,
        coins: currentUserData.coins ?? 100,
        credits: currentUserData.credits ?? 50,
        postLimit: currentUserData.postLimit ?? 5
    };
    
    saveProfileBtn.disabled = true;
    try {
        await userDocRef.set(updates, { merge: true }); // Use set with merge to create or update
        editProfileModal.classList.add('hidden');
        showToast("Profile updated successfully!", 'success');
        // The real-time listener will automatically update the UI
    } catch (error) {
        console.error("Error saving profile:", error);
        showToast("Failed to save profile.", 'error');
    } finally {
        saveProfileBtn.disabled = false;
    }
});

// --- Follow/Unfollow Logic ---
followUserBtn.addEventListener('click', () => handleFollow(currentProfileViewingId));
unfollowUserBtn.addEventListener('click', () => handleUnfollow(currentProfileViewingId));

async function handleFollow(targetUserId) {
    if (!currentUser || !targetUserId) return;
    const currentUserRef = db.collection('users').doc(currentUser.uid);
    const targetUserRef = db.collection('users').doc(targetUserId);

    const batch = db.batch();
    batch.update(currentUserRef, {
        following: firebase.firestore.FieldValue.arrayUnion(targetUserId),
        followingCount: firebase.firestore.FieldValue.increment(1)
    });
    batch.update(targetUserRef, {
        followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
        followersCount: firebase.firestore.FieldValue.increment(1)
    });

    try {
        await batch.commit();
        showToast("User followed!", 'success');
        followUserBtn.classList.add('hidden');
        unfollowUserBtn.classList.remove('hidden');
    } catch (error) {
        console.error("Follow error:", error);
    }
}

async function handleUnfollow(targetUserId) {
    if (!currentUser || !targetUserId) return;
    const currentUserRef = db.collection('users').doc(currentUser.uid);
    const targetUserRef = db.collection('users').doc(targetUserId);

    const batch = db.batch();
    batch.update(currentUserRef, {
        following: firebase.firestore.FieldValue.arrayRemove(targetUserId),
        followingCount: firebase.firestore.FieldValue.increment(-1)
    });
    batch.update(targetUserRef, {
        followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
        followersCount: firebase.firestore.FieldValue.increment(-1)
    });

    try {
        await batch.commit();
        showToast("User unfollowed.", 'info');
        followUserBtn.classList.remove('hidden');
unfollowUserBtn.classList.add('hidden');
    } catch (error) {
        console.error("Unfollow error:", error);
    }
}


function openUserProfile(userId) {
    if (!userId) return;
    showScreen('profile-screen');
    loadUserProfile(userId);
}

// --- Initial Document Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Other initializations can go here
});
