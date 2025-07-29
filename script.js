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
let currentProfileViewingId = null; // To differentiate between viewing own profile vs. other's
let currentChatPartnerId = null;
let lastVisiblePost = null; // For infinite scrolling pagination
let fetchingPosts = false;
let postsToLoadPerScroll = 10;
let dataSaverEnabled = false; // For data saver feature

const PROFILE_LOGOS = [
    { class: 'logo-1', emoji: '🧑', color: '#ff6347' }, // Tomato
    { class: 'logo-2', emoji: '👩', color: '#6a5acd' }, // SlateBlue
    { class: 'logo-3', emoji: '🚀', color: '#32cd32' }, // LimeGreen
    { class: 'logo-4', emoji: '💡', color: '#ff8c00' }, // DarkOrange
    { class: 'logo-5', emoji: '🌟', color: '#ffd700' }, // Gold
    { class: 'logo-6', emoji: '🌈', color: '#9932cc' }, // DarkOrchid
    { class: 'logo-7', emoji: '🦊', color: '#d2691e' }, // Chocolate
    { class: 'logo-8', emoji: '🐼', color: '#6495ed' }, // CornflowerBlue
    { class: 'logo-9', emoji: '🦋', color: '#dda0dd' }, // Plum
    { class: 'logo-10', emoji: '🐢', color: '#20b2aa' }, // LightSeaGreen
    { class: 'logo-11', emoji: '🤖', color: '#87ceeb' }, // SkyBlue
    { class: 'logo-12', emoji: '👽', color: '#7cfc00' }, // LawnGreen
    { class: 'logo-13', emoji: '🦄', color: '#ee82ee' }, // Violet
    { class: 'logo-14', emoji: '🐉', color: '#48d1cc' }, // MediumTurquoise
    { class: 'logo-15', emoji: '🌊', color: '#4682b4' }, // SteelBlue
    { class: 'logo-16', emoji: '🔥', color: '#dc143c' }, // Crimson
    { class: 'logo-17', emoji: '👑', color: '#f0e68c' }, // Khaki
    { class: 'logo-18', emoji: '💎', color: '#00ced1' }, // DarkTurquoise
    { class: 'logo-19', emoji: '🔑', color: '#b0e0e6' }, // PowderBlue
    { class: 'logo-20', emoji: '⚡', color: '#ffff00' }, // Yellow
    { class: 'logo-21', emoji: '🎵', color: '#ff69b4' }, // HotPink
    { class: 'logo-22', emoji: '🎨', color: '#7b68ee' }, // MediumSlateBlue
    { class: 'logo-23', emoji: '🧩', color: '#ffa07a' }, // LightSalmon
    { class: 'logo-24', emoji: '🍔', color: '#cd853f' }, // Peru
    { class: 'logo-25', emoji: '🍕', color: '#f08080' }, // LightCoral
    { class: 'logo-26', emoji: '🎮', color: '#c0c0c0' }, // Silver
    { class: 'logo-27', emoji: '✈️', color: '#afeeee' }, // PaleTurquoise
    { class: 'logo-28', emoji: '🌳', color: '#228b22' }, // ForestGreen
    { class: 'logo-29', emoji: '🌸', color: '#ffb6c1' }, // LightPink
    { class: 'logo-30', emoji: '⚽', color: '#b0c4de' }, // LightSteelBlue
    { class: 'logo-31', emoji: '🎸', color: '#8b4513' }, // SaddleBrown
    { class: 'logo-32', emoji: '🚲', color: '#00fa9a' }, // MediumSpringGreen
    { class: 'logo-33', emoji: '📚', color: '#deb887' }, // BurlyWood
    { class: 'logo-34', emoji: '☕', color: '#d2b48c' }, // Tan
    { class: 'logo-35', emoji: '🎁', color: '#f4a460' }, // SandyBrown
    { class: 'logo-36', emoji: '🎉', color: '#ba55d3' }, // MediumOrchid
    { class: 'logo-37', emoji: '🌍', color: '#87cefa' }, // LightSkyBlue
    { class: 'logo-38', emoji: '🔬', color: '#778899' }, // LightSlateGray
    { class: 'logo-39', emoji: '🔭', color: '#696969' }, // DimGray
    { class: 'logo-40', emoji: '🛠️', color: '#d3d3d3' }, // LightGray
    { class: 'logo-41', emoji: '⚖️', color: '#add8e6' }, // LightBlue
    { class: 'logo-42', emoji: '💰', color: '#b8860b' }, // DarkGoldenRod
    { class: 'logo-43', emoji: '🛡️', color: '#5f9ea0' }, // CadetBlue
    { class: 'logo-44', emoji: '🔔', color: '#f0f8ff' }, // AliceBlue
    { class: 'logo-45', emoji: '⏳', color: '#fa8072' }, // Salmon
    { class: 'logo-46', emoji: '💾', color: '#3cb371' }, // MediumSeaGreen
    { class: 'logo-47', emoji: '⚙️', color: '#4682b4' }, // SteelBlue
    { class: 'logo-48', emoji: '📡', color: '#2e8b57' }, // SeaGreen
    { class: 'logo-49', emoji: '🌐', color: '#a52a2a' }, // Brown
    { class: 'logo-50', emoji: '📈', color: '#c71585' }  // MediumVioletRed
];


// --- Utility Functions ---

function showToast(message, type = 'info', duration = 3000) {
    toastNotification.textContent = message;
    toastNotification.className = `toast-notification show ${type}`; // Add type for styling (e.g., 'error', 'success')
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
    document.getElementById(screenId).classList.add('active');

    // Update bottom nav active state
    bottomNavItems.forEach(item => {
        if (item.dataset.screen === screenId.replace('-screen', '')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Close sidebar if open
    sidebar.classList.remove('open');
}

// Function to generate a random logo class (e.g., for new users, search results)
function getRandomLogoClass() {
    const randomIndex = Math.floor(Math.random() * PROFILE_LOGOS.length);
    return `user-${PROFILE_LOGOS[randomIndex].class}`; // Prefix with 'user-' for specific CSS
}

function getLogoCssClass(logoName) {
    const logo = PROFILE_LOGOS.find(l => l.class === logoName);
    return logo ? `user-${logo.class}` : 'user-logo-1'; // Default to logo-1 if not found
}

// --- Firebase Authentication ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        // Check if user's profile exists in Firestore
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (!userDoc.exists || !userDoc.data().username) {
            // New user or incomplete profile, redirect to profile setup
            showScreen('profile-screen'); // Show profile setup on first login/incomplete
            editProfileModal.classList.remove('hidden'); // Automatically open edit profile
            showToast("Welcome! Please complete your profile.", 'info', 5000);
            myProfileUsername.textContent = "@NewUser"; // Placeholder
        } else {
            // Existing user, load profile and show home feed
            loadUserProfile(currentUser.uid);
            loadUserCoinsCreditsLimits(currentUser.uid);
            showScreen('home-screen');
        }
        hideSplashScreen();
    } else {
        currentUser = null;
        // Redirect to login/signup page (You need to implement this)
        // For now, let's assume a dummy login for demonstration
        showDummyLogin();
    }
});

// --- Dummy Login/Signup (Replace 
            splashScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
        }, 500); // Wait for fade out to complete
    }, 1000); // Show splash for at least 1-3 seconds
}

// --- Header Coins/Credits/Limits Display ---
async function loadUserCoinsCreditsLimits(userId) {
    if (!userId) return;
    try {
        const userDocRef = db.collection('users').doc(userId);
        userDocRef.onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                headerCoins.textContent = `${formatNumber(data.coins || 0)} C`;
                headerCredits.textContent = `${formatNumber(data.credits || 0)} Cr`;
                headerLimit.textContent = `${formatNumber(data.postLimit || 0)} L`;
                checkDailyRewardStatus(data.lastRewardClaim || 0); // Check for reward
                checkPostNotifications(data.postLimits || {}); // Check for post limits, though post expiry is server-side
            }
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        showToast("Error loading user stats.", 'error');
    }
}

// --- Daily Reward Logic ---
const DAILY_REWARD_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DAILY_REWARD = { limit: 2, coins: 10, credits: 10 };

async function checkDailyRewardStatus(lastClaimTimestamp) {
    if (!currentUser) return;
    const now = Date.now();
    const lastClaimTime = lastClaimTimestamp; // Firestore timestamp to milliseconds

    if (now - lastClaimTime >= DAILY_REWARD_INTERVAL) {
        giftClaimBtn.classList.add('neon-glow'); // Visually indicate available reward
        // Optional: add a pulsing animation to giftClaimBtn
    } else {
        giftClaimBtn.classList.remove('neon-glow');
        // Optional: remove pulsing animation
        const timeRemaining = DAILY_REWARD_INTERVAL - (now - lastClaimTime);
        // You can display this countdown somewhere
        console.log(`Next reward in: ${new Date(timeRemaining).toISOString().substr(11, 8)}`);
    }
}

giftClaimBtn.addEventListener('click', async () => {
    if (!currentUser) {
        showToast("Please log in to claim rewards.", 'info');
        return;
    }

    try {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userDocRef.get();
        const userData = userDoc.data();
        const lastClaimTime = userData.lastRewardClaim || 0;
        const now = Date.now();

        if (now - lastClaimTime >= DAILY_REWARD_INTERVAL) {
            // Claim reward
            await userDocRef.update({
                coins: firebase.firestore.FieldValue.increment(DAILY_REWARD.coins),
                credits: firebase.firestore.FieldValue.increment(DAILY_REWARD.credits),
                postLimit: firebase.firestore.FieldValue.increment(DAILY_REWARD.limit),
                lastRewardClaim: now // Update last claim time
            });
            showRewardPopup(`You claimed your daily reward!\n+${DAILY_REWARD.coins} Coins, +${DAILY_REWARD.credits} Credits, +${DAILY_REWARD.limit} Limits.`);
            showToast("Daily reward claimed!", 'success');
        } else {
            const timeRemaining = DAILY_REWARD_INTERVAL - (now - lastClaimTime);
            showToast(`Next reward available in: ${new Date(timeRemaining).toISOString().substr(11, 8)}`, 'info', 5000);
        }
    } catch (error) {
        console.error("Error claiming daily reward:", error);
        showToast("Failed to claim reward. Please try again.", 'error');
    }
});

function showRewardPopup(message) {
    rewardMessage.textContent = message;
    rewardPopup.classList.remove('hidden');
    // Optional: Add an animation to the popup
}

closeRewardPopupBtn.addEventListener('click', () => {
    rewardPopup.classList.add('hidden');
});


// --- Data Saver Toggle ---
document.getElementById('data-saver-checkbox').addEventListener('change', (e) => {
    dataSaverEnabled = e.target.checked;
    showToast(`Data Saver ${dataSaverEnabled ? 'Enabled' : 'Disabled'}`, 'info');
    // Implement logic to reduce image quality or lazy load more aggressively
    // when dataSaverEnabled is true during post loading.
});


// --- Sidebar Navigation ---
menuToggle.addEventListener('click', () => {
    sidebar.classList.add('open');
});

closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
});

sidebar.querySelectorAll('ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const screenId = e.currentTarget.dataset.screen;
        if (screenId) {
            showScreen(`${screenId}-screen`);
            // Specific actions for screens
            if (screenId === 'profile') {
                loadUserProfile(currentUser.uid); // Load own profile
                currentProfileViewingId = currentUser.uid;
                updateProfileDisplay(currentUser.uid);
            } else if (screenId === 'messages') {
                loadRecentChats();
                messageListContainer.classList.remove('hidden');
                chatWindowContainer.classList.add('hidden');
            } else if (screenId === 'home') {
                 // Reset feed if navigating back to home
                 postsFeed.innerHTML = '';
                 lastVisiblePost = null;
                 loadPosts();
            }
        }
        sidebar.classList.remove('open');
    });
});

// Logout Button
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        showToast("Logged out successfully.", 'info');
        // Redirect to login page or show login UI
        showDummyLogin(); // Back to dummy login for this demo
    } catch (error) {
        console.error("Error logging out:", error);
        showToast("Failed to log out.", 'error');
    }
});

// --- Bottom Navigation ---
bottomNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const screenId = e.currentTarget.dataset.screen;
        showScreen(`${screenId}-screen`);
        // Specific actions for screens
        if (screenId === 'profile') {
            loadUserProfile(currentUser.uid); // Load own profile
            currentProfileViewingId = currentUser.uid;
            updateProfileDisplay(currentUser.uid);
        } else if (screenId === 'messages') {
            loadRecentChats();
            messageListContainer.classList.remove('hidden');
            chatWindowContainer.classList.add('hidden');
        } else if (screenId === 'home') {
            postsFeed.innerHTML = ''; // Clear existing posts
            lastVisiblePost = null; // Reset pagination
            loadPosts(); // Reload posts
        } else if (screenId === 'search') {
            searchUserList.innerHTML = '';
            searchPostList.innerHTML = '';
            noSearchResults.classList.add('hidden');
            searchQueryInput.value = '';
        }
    });
});


// --- Post Loading and Infinite Scrolling ---
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
        if (snapshot.empty) {
            showToast("No more posts to load.", 'info');
            loadingSpinner.classList.add('hidden');
            fetchingPosts = false;
            return;
        }

        lastVisiblePost = snapshot.docs[snapshot.docs.length - 1];

        // Group posts for mixed layout
        let currentBatch = [];
        snapshot.docs.forEach(doc => {
            currentBatch.push({ id: doc.id, ...doc.data() });
        });

        // Apply random layout logic
        // This is a simplified example. You'd build more robust logic here.
        let tempPosts = [...currentBatch];
        while (tempPosts.length > 0) {
            const randomLayout = Math.floor(Math.random() * 3); // 0: vertical, 1: horizontal, 2: table

            if (randomLayout === 0 || tempPosts.length < 4) { // Vertical or not enough for other layouts
                const post = tempPosts.shift();
                renderPost(post, 'vertical-post');
            } else if (randomLayout === 1 && tempPosts.length >= 2) { // Horizontal (2-3 posts)
                const numHorizontal = Math.min(tempPosts.length, Math.floor(Math.random() * 2) + 2); // 2 or 3
                const horizontalContainer = document.createElement('div');
                horizontalContainer.className = 'horizontal-post-container';
                for (let i = 0; i < numHorizontal; i++) {
                    const post = tempPosts.shift();
                    horizontalContainer.appendChild(createPostElement(post, 'horizontal-post'));
                }
                postsFeed.appendChild(horizontalContainer);
            } else if (randomLayout === 2 && tempPosts.length >= 4) { // Table (4-6 posts)
                const numTable = Math.min(tempPosts.length, Math.floor(Math.random() * 3) + 4); // 4, 5, or 6
                const tableContainer = document.createElement('div');
                tableContainer.className = 'table-post-container';
                for (let i = 0; i < numTable; i++) {
                    const post = tempPosts.shift();
                    tableContainer.appendChild(createPostElement(post, 'table-post'));
                }
                postsFeed.appendChild(tableContainer);
            } else { // Fallback to vertical if conditions not met
                const post = tempPosts.shift();
                renderPost(post, 'vertical-post');
            }
        }
        
        // Ensure posts never end: If snapshot is empty, or after certain loads,
        // you might want to restart from the beginning or fetch random older posts.
        // For "vaar vaar hi aati raha," you'd need more sophisticated backend logic
        // to re-fetch older posts or a curated list if the feed runs out.
        // For now, if no new posts, it will show "no more posts".
        // To truly repeat, you could reset `lastVisiblePost = null;` after X loads.
        if (snapshot.docs.length < postsToLoadPerScroll) {
             console.log("End of posts reached, will loop if needed.");
             // For simple looping of existing posts if less than full batch
             // If you want actual infinite loop of available posts, you'd need to
             // fetch all post IDs once and then randomly pick from them.
             // For the scope of this HTML/CSS/JS, we'll keep it as standard pagination.
             // To make it truly "never end" with duplicates as you requested,
             // you'd typically have a backend endpoint that always returns some posts,
             // even if it means re-sending older ones or generating mock ones.
             // On client side, a simple way is:
             // lastVisiblePost = null; // To restart from beginning if feed ends.
             // But this leads to very predictable repetition.
        }

    } catch (error) {
        console.error("Error loading posts:", error);
        showToast("Error loading posts. Please refresh.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden');
        fetchingPosts = false;
    }
}

function createPostElement(postData, layoutClass = 'vertical-post') {
    const postCard = document.createElement('div');
    postCard.className = `post-card ${layoutClass}`;
    postCard.dataset.postId = postData.id;

    const userProfileClass = getLogoCssClass(postData.userProfileLogo || getRandomLogoClass());

    postCard.innerHTML = `
        <div class="post-header">
            <div class="profile-avatar ${userProfileClass}" data-user-id="${postData.userId}"></div>
            <span class="username" data-user-id="${postData.userId}">@${postData.username}</span>
            <div class="post-options">
                <i class="fas fa-ellipsis-v"></i>
                <div class="options-dropdown hidden">
                    <span class="report-btn">Report</span>
                    ${postData.userId === currentUser.uid ? `<span class="delete-btn">Delete</span>` : ''}
                </div>
            </div>
        </div>
        <div class="post-content">
            <p>${formatPostContent(postData.content)}</p>
            ${postData.imageUrl ? `<img src="${postData.imageUrl}" alt="Post Image">` : ''}
        </div>
        <div class="post-footer">
            <div class="post-actions">
                <span class="like-button"><i class="far fa-heart"></i> <span class="like-count">${formatNumber(postData.likes || 0)}</span></span>
                <span class="views-count"><i class="fas fa-eye"></i> <span class="view-count-num">${formatNumber(postData.views || 0)}</span></span>
                <span class="translate-button"><i class="fas fa-language"></i></span>
            </div>
            <div class="post-reactions" data-post-id="${postData.id}">
                ${renderEmojiReactions(postData.reactions)}
                <span class="total-reactions">${formatNumber(Object.values(postData.reactions || {}).reduce((a, b) => a + b, 0))} reactions</span>
            </div>
        </div>
        <div class="emoji-picker hidden">
            <span class="emoji-option" data-emoji="👍">👍</span>
            <span class="emoji-option" data-emoji="❤️">❤️</span>
            <span class="emoji-option" data-emoji="😂">😂</span>
            <span class="emoji-option" data-emoji="😢">😢</span>
            <span class="emoji-option" data-emoji="🔥">🔥</span>
        </div>
    `;

    addPostEventListeners(postCard, postData);
    return postCard;
}

function renderPost(postData, layoutClass = 'vertical-post') {
    const postElement = createPostElement(postData, layoutClass);
    postsFeed.appendChild(postElement);
}

function formatPostContent(content) {
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, (url) => `<a href="${url}" target="_blank" style="color: #00ffff; text-decoration: underline;">${url}</a>`);
}

function renderEmojiReactions(reactions) {
    if (!reactions) return '';
    const topEmojis = Object.entries(reactions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3); // Get top 3
    
    let html = '<span class="emoji-reaction-display">';
    topEmojis.forEach(([emoji, count]) => {
        html += `<span class="emoji">${emoji}</span><span class="count">${formatNumber(count)}</span>`;
    });
    html += '</span>';
    return html;
}

// Add event listeners for post elements
let lastClickTime = 0;
let clickTimer;
let longPressTimer;
let currentNeonPost = null;

function addPostEventListeners(postElement, postData) {
    const postId = postData.id;
    const likeButton = postElement.querySelector('.like-button');
    const postOptionsBtn = postElement.querySelector('.post-options .fa-ellipsis-v');
    const optionsDropdown = postElement.querySelector('.options-dropdown');
    const reportBtn = postElement.querySelector('.report-btn');
    const deleteBtn = postElement.querySelector('.delete-btn');
    const translateBtn = postElement.querySelector('.translate-button');
    const profileAvatar = postElement.querySelector('.profile-avatar');
    const usernameSpan = postElement.querySelector('.username');
    const emojiPicker = postElement.querySelector('.emoji-picker');

    // Profile Click
    if (profileAvatar) {
        profileAvatar.addEventListener('click', () => openUserProfile(postData.userId));
    }
    if (usernameSpan) {
        usernameSpan.addEventListener('click', () => openUserProfile(postData.userId));
    }

    // Double-click for Like
    postElement.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;

        if (timeDiff < 300 && timeDiff > 0) { // Double click detected (within 300ms)
            clearTimeout(clickTimer);
            handleLike(postId, postElement);
            lastClickTime = 0; // Reset for next double click
        } else {
            // Single click for neon effect
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                handleNeonEffect(postElement);
            }, 300); // Wait to see if it's a double click
        }
        lastClickTime = currentTime;
    });

    // Long press for emoji reactions
    postElement.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior like scrolling
        clearTimeout(clickTimer); // Clear potential single/double click
        longPressTimer = setTimeout(() => {
            emojiPicker.classList.remove('hidden');
        }, 800); // 800ms for long press (adjust as needed)
    });

    postElement.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
        // If not hidden, might mean it was a long press. Keep it open until user picks.
        // If hidden, means it was a tap or short press.
    });

    // Hide emoji picker if clicking outside (simple example)
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && !postElement.contains(e.target)) {
            emojiPicker.classList.add('hidden');
        }
    });


    // Emoji selection
    emojiPicker.querySelectorAll('.emoji-option').forEach(emojiOption => {
        emojiOption.addEventListener('click', (e) => {
            const selectedEmoji = e.target.dataset.emoji;
            handleEmojiReaction(postId, selectedEmoji, postElement);
            emojiPicker.classList.add('hidden');
        });
    });

    // Post Options (Report/Delete)
    if (postOptionsBtn) {
        postOptionsBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent post click/neon effect
            optionsDropdown.classList.toggle('hidden');
        });

        // Close dropdown if clicking outside
        document.addEventListener('click', (e) => {
            if (!postOptionsBtn.contains(e.target) && !optionsDropdown.contains(e.target)) {
                optionsDropdown.classList.add('hidden');
            }
        });
    }

    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            handleReportPost(postId);
            optionsDropdown.classList.add('hidden');
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            handleDeletePost(postId, postElement);
            optionsDropdown.classList.add('hidden');
        });
    }

    if (translateBtn) {
        translateBtn.addEventListener('click', () => {
            showToast("Translate feature coming soon!", 'info');
            // Implement translation API integration here
        });
    }

    // Views count - increment on first unique view per user (simplified client-side)
    incrementViewCount(postId);
}

// Function to handle the neon effect
function handleNeonEffect(postElement) {
    // Remove neon from previously highlighted post
    if (currentNeonPost && currentNeonPost !== postElement) {
        currentNeonPost.classList.remove('neon-glow');
    }
    // Add neon to current post
    postElement.classList.add('neon-glow');
    currentNeonPost = postElement;

    // Remove neon after 3-4 seconds
    setTimeout(() => {
        postElement.classList.remove('neon-glow');
        if (currentNeonPost === postElement) {
            currentNeonPost = null;
        }
    }, 3500); // 3.5 seconds
}

// Like functionality
async function handleLike(postId, postElement) {
    if (!currentUser) {
        showToast("Please log in to like posts.", 'info');
        return;
    }

    const likeButtonIcon = postElement.querySelector('.like-button i');
    const likeCountSpan = postElement.querySelector('.like-button .like-count');

    try {
        const postRef = db.collection('posts').doc(postId);
        const userRef = db.collection('users').doc(currentUser.uid);

        const postDoc = await postRef.get();
        if (!postDoc.exists) return;

        const postData = postDoc.data();
        const currentLikes = postData.likes || 0;
        const likedBy = postData.likedBy || [];

        let newLikes = currentLikes;
        let action = '';

        if (likedBy.includes(currentUser.uid)) {
            // Unlike
            newLikes--;
            likeButtonIcon.classList.remove('fas');
            likeButtonIcon.classList.add('far');
            action = 'remove';
        } else {
            // Like
            newLikes++;
            likeButtonIcon.classList.remove('far');
            likeButtonIcon.classList.add('fas');
            action = 'add';
        }

        await db.runTransaction(async (transaction) => {
            const updatedLikedBy = action === 'add'
                ? firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                : firebase.firestore.FieldValue.arrayRemove(currentUser.uid);

            transaction.update(postRef, {
                likes: newLikes,
                likedBy: updatedLikedBy
            });
        });

        likeCountSpan.textContent = formatNumber(newLikes);
        showToast(action === 'add' ? "Post liked!" : "Post unliked.", 'success');

    } catch (error) {
        console.error("Error liking post:", error);
        showToast("Failed to like/unlike post. Try again.", 'error');
    }
}

// Emoji Reaction functionality
async function handleEmojiReaction(postId, emoji, postElement) {
    if (!currentUser) {
        showToast("Please log in to react to posts.", 'info');
        return;
    }

    try {
        const postRef = db.collection('posts').doc(postId);
        const userRef = db.collection('users').doc(currentUser.uid);

        const postDoc = await postRef.get();
        if (!postDoc.exists) {
            showToast("Post not found.", 'error');
            return;
        }

        const postData = postDoc.data();
        const currentReactions = postData.reactions || {};
        const userReactions = postData.userReactions || {}; // Tracks what each user reacted with

        const existingReaction = userReactions[currentUser.uid];

        await db.runTransaction(async (transaction) => {
            // Update user's specific reaction on the post
            let updatedUserReactions = { ...userReactions };
            let updatedReactionsCount = { ...currentReactions };

            if (existingReaction) {
                // If user already reacted, decrement count of old emoji
                updatedReactionsCount[existingReaction] = (updatedReactionsCount[existingReaction] || 1) - 1;
                if (updatedReactionsCount[existingReaction] <= 0) {
                    delete updatedReactionsCount[existingReaction];
                }
            }

            if (existingReaction === emoji) {
                // User clicked the same emoji again, un-react
                delete updatedUserReactions[currentUser.uid];
            } else {
                // New reaction, or changing reaction
                updatedReactionsCount[emoji] = (updatedReactionsCount[emoji] || 0) + 1;
                updatedUserReactions[currentUser.uid] = emoji;
            }

            transaction.update(postRef, {
                reactions: updatedReactionsCount,
                userReactions: updatedUserReactions // Store user specific reaction
            });
        });

        // Update UI immediately (optimistic update)
        const totalReactionsElement = postElement.querySelector('.total-reactions');
        const emojiReactionDisplayElement = postElement.querySelector('.emoji-reaction-display');

        // Re-render reaction display
        const updatedPostDoc = await postRef.get();
        const updatedPostData = updatedPostDoc.data();
        emojiReactionDisplayElement.innerHTML = renderEmojiReactions(updatedPostData.reactions);
        totalReactionsElement.textContent = `${formatNumber(Object.values(updatedPostData.reactions || {}).reduce((a, b) => a + b, 0))} reactions`;

        showToast("Emoji reaction sent!", 'success');

    } catch (error) {
        console.error("Error sending emoji reaction:", error);
        showToast("Failed to send reaction. Try again.", 'error');
    }
}


// View Count functionality
async function incrementViewCount(postId) {
    if (!currentUser) return; // Only count views from logged-in users

    const viewsRef = db.collection('postViews').doc(postId);
    const viewCountSpan = document.querySelector(`.post-card[data-post-id="${postId}"] .view-count-num`);

    try {
        await db.runTransaction(async (transaction) => {
            const viewsDoc = await transaction.get(viewsRef);
            let viewsData = viewsDoc.exists ? viewsDoc.data() : { totalViews: 0, viewedBy: {} };
            const viewedBy = viewsData.viewedBy || {};

            let currentViews = viewsData.totalViews;
            let userViewCount = viewedBy[currentUser.uid] || 0;

            if (userViewCount < 3) { // Max 3 views per user per post
                currentViews++;
                userViewCount++;
                viewedBy[currentUser.uid] = userViewCount;

                transaction.set(viewsRef, {
                    totalViews: currentViews,
                    viewedBy: viewedBy
                }, { merge: true }); // Use merge to avoid overwriting other fields

                // Update the post's main view count for display efficiency
                const postRef = db.collection('posts').doc(postId);
                transaction.update(postRef, {
                    views: firebase.firestore.FieldValue.increment(1)
                });
            }

            if (viewCountSpan) {
                // Update UI optimistically or after transaction, if data is not real-time via listener
                // For simplicity, we assume the main post.views will eventually update via listener if any.
                // Or you can fetch and update like this:
                const updatedPostDoc = await db.collection('posts').doc(postId).get();
                if (updatedPostDoc.exists) {
                    viewCountSpan.textContent = formatNumber(updatedPostDoc.data().views || 0);
                }
            }
        });
    } catch (error) {
        console.error("Error incrementing view count:", error);
    }
}

// Refresh Posts Button
refreshPostsBtn.addEventListener('click', () => {
    postsFeed.innerHTML = ''; // Clear current posts
    lastVisiblePost = null; // Reset pagination
    loadPosts(); // Reload posts from the beginning
    showToast("Posts feed refreshed!", 'info');
});

// Infinite Scroll Listener
mainContent.addEventListener('scroll', () => {
    if (mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 100 &&
        document.getElementById('home-screen').classList.contains('active')) {
        loadPosts();
    }
});


// --- Post Upload Functionality ---
publishPostBtn.addEventListener('click', async () => {
    if (!currentUser) {
        showToast("Please log in to upload posts.", 'error');
        return;
    }

    const content = postContentInput.value.trim();
    const imageFile = postImageInput.files[0];
    const boostHours = parseInt(postBoostSelect.value);

    if (!content && !imageFile) {
        showToast("Please enter some content or upload an image.", 'error');
        return;
    }

    // Check coins and limits
    const userDocRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    const currentCoins = userData.coins || 0;
    const currentLimit = userData.postLimit || 0;

    const requiredCoins = 5;
    const requiredLimit = 1;
    let adsRequired = 0;

    if (boostHours === 18) adsRequired = 1;
    else if (boostHours === 24) adsRequired = 2;
    else if (boostHours === 30) adsRequired = 3;

    if (currentCoins < requiredCoins || currentLimit < requiredLimit) {
        showToast("You need 5 coins and 1 post limit to upload. Watch an ad to earn.", 'error', 5000);
        // Prompt for ad if needed
        showAdModal('post-upload', { coins: requiredCoins - currentCoins, limit: requiredLimit - currentLimit, boostAds: adsRequired });
        return;
    }

    // Deduct coins and limit
    try {
        await userDocRef.update({
            coins: firebase.firestore.FieldValue.increment(-requiredCoins),
            postLimit: firebase.firestore.FieldValue.increment(-requiredLimit)
        });
    } catch (error) {
        console.error("Error deducting coins/limit:", error);
        showToast("Failed to deduct coins/limit. Please try again.", 'error');
        return;
    }

    uploadStatus.textContent = "Uploading post...";
    publishPostBtn.disabled = true;

    try {
        let imageUrl = '';
        if (imageFile) {
            const storageRef = storage.ref(`post_images/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
            const uploadTask = await storageRef.put(imageFile);
            imageUrl = await uploadTask.ref.getDownloadURL();
        }

        const newPostRef = db.collection('posts').doc(); // Auto-generated ID
        await newPostRef.set({
            userId: currentUser.uid,
            username: userData.username, // Use user's current username
            userProfileLogo: userData.profileLogo || getRandomLogoClass(), // User's chosen logo
            content: content,
            imageUrl: imageUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            views: 0,
            reactions: {},
            userReactions: {},
            boostHours: boostHours, // Store boost hours for backend deletion
            expiryTime: firebase.firestore.Timestamp.fromMillis(Date.now() + (boostHours * 60 * 60 * 1000)) // Client-side tracking
        });

        uploadStatus.textContent = "Post uploaded successfully!";
        showToast("Post uploaded successfully!", 'success');
        postContentInput.value = '';
        postImageInput.value = '';
        postBoostSelect.value = '12';
        showScreen('home-screen'); // Navigate back to home feed
        postsFeed.innerHTML = ''; // Clear and reload posts
        lastVisiblePost = null;
        loadPosts();

    } catch (error) {
        console.error("Error publishing post:", error);
        if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
            uploadStatus.textContent = "Error: Permission denied. Check Firebase rules.";
            showToast("Error publishing post: Missing or insufficient permissions. Contact admin.", 'error', 5000);
        } else {
            uploadStatus.textContent = `Error: ${error.message}`;
            showToast("Failed to upload post. Try again.", 'error');
        }
        // Revert coins/limit if upload failed after deduction (complex, usually handled by server)
        await userDocRef.update({
            coins: firebase.firestore.FieldValue.increment(requiredCoins),
            postLimit: firebase.firestore.FieldValue.increment(requiredLimit)
        });
    } finally {
        publishPostBtn.disabled = false;
    }
});

// Ad Modal Logic
let currentAdPurpose = ''; // 'post-upload', 'message-credit', 'limit', 'coins'
let adRewardDetails = {};

function showAdModal(purpose, details = {}) {
    currentAdPurpose = purpose;
    adRewardDetails = details;
    adModal.classList.remove('hidden');
    closeAdModalBtn.disabled = true; // Disable close until ad "finishes"

    // Simulate ad playback
    const adPlaceholder = document.getElementById('ad-placeholder');
    adPlaceholder.innerHTML = '<p>Simulating Ad (5 seconds)...</p><div class="loader"></div>';
    
    setTimeout(() => {
        adPlaceholder.innerHTML = '<p>Ad Complete!</p>';
        closeAdModalBtn.disabled = false;
        showToast("Ad completed! You can now claim your reward.", 'success');
    }, 5000); // Simulate 5-second ad
}

closeAdModalBtn.addEventListener('click', async () => {
    adModal.classList.add('hidden');
    // Reward logic based on currentAdPurpose and adRewardDetails
    await processAdReward();
});

async function processAdReward() {
    if (!currentUser) return;

    try {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        let rewardMessageText = "Reward:";

        if (currentAdPurpose === 'post-upload') {
            await userDocRef.update({
                coins: firebase.firestore.FieldValue.increment(10), // Example: 1 ad gives 10 coins
                postLimit: firebase.firestore.FieldValue.increment(1) // Example: 1 ad gives 1 limit
            });
            rewardMessageText += "+10 Coins, +1 Limit";
            showToast("Post upload resources gained!", 'success');
        } else if (currentAdPurpose === 'message-credit') {
            await userDocRef.update({
                credits: firebase.firestore.FieldValue.increment(10) // 1 ad gives 10 credits
            });
            rewardMessageText += "+10 Credits";
            showToast("Messaging credits gained!", 'success');
        } else if (currentAdPurpose === 'limit') {
            await userDocRef.update({
                postLimit: firebase.firestore.FieldValue.increment(1)
            });
            rewardMessageText += "+1 Post Limit";
            showToast("Post limit gained!", 'success');
        } else if (currentAdPurpose === 'coins') {
            await userDocRef.update({
                coins: firebase.firestore.FieldValue.increment(10)
            });
            rewardMessageText += "+10 Coins";
            showToast("Coins gained!", 'success');
        }

        showRewardPopup(rewardMessageText);

    } catch (error) {
        console.error("Error processing ad reward:", error);
        showToast("Failed to process ad reward. Try again.", 'error');
    } finally {
        currentAdPurpose = ''; // Reset
        adRewardDetails = {}; // Reset
    }
}


// --- Profile Management ---
async function loadUserProfile(userId) {
    if (!userId) return;
    currentProfileViewingId = userId; // Set the ID of the profile currently being viewed

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            updateProfileDisplay(userData);
            loadProfilePosts(userId);

            // Show/hide follow/message buttons based on whose profile it is
            if (userId === currentUser.uid) {
                editProfileBtn.classList.remove('hidden');
                followUserBtn.classList.add('hidden');
                unfollowUserBtn.classList.add('hidden');
                messageUserBtn.classList.add('hidden');
                profileWhatsappLink.classList.add('hidden');
                profileInstagramLink.classList.add('hidden');
            } else {
                editProfileBtn.classList.add('hidden');
                messageUserBtn.classList.remove('hidden'); // Always allow messaging
                // Check follow status
                const currentUserDoc = await db.collection('users').doc(currentUser.uid).get();
                const currentUserData = currentUserDoc.data();
                if (currentUserData.following && currentUserData.following.includes(userId)) {
                    followUserBtn.classList.add('hidden');
                    unfollowUserBtn.classList.remove('hidden');
                } else {
                    followUserBtn.classList.remove('hidden');
                    unfollowUserBtn.classList.add('hidden');
                }

                // Show social links if available
                if (userData.whatsapp) profileWhatsappLink.classList.remove('hidden'); else profileWhatsappLink.classList.add('hidden');
                if (userData.instagram) profileInstagramLink.classList.remove('hidden'); else profileInstagramLink.classList.add('hidden');
            }
        } else {
            showToast("User profile not found.", 'error');
        }
    } catch (error) {
        console.error("Error loading user profile:", error);
        showToast("Error loading profile. Try again.", 'error');
    }
}

function updateProfileDisplay(userData) {
    // Determine which user's profile is being displayed
    const isCurrentUserProfile = userData.uid === currentUser.uid;

    myProfileUsername.textContent = `@${userData.username || 'NewUser'}`;
    currentProfileUsernamePosts.textContent = userData.username || 'Me';

    // Set dynamic profile logo
    const profileLogoClass = getLogoCssClass(userData.profileLogo || getRandomLogoClass());
    myProfileAvatar.className = `profile-avatar-large ${profileLogoClass}`;

    myPostsCount.textContent = formatNumber(userData.postCount || 0);
    myFollowersCount.textContent = formatNumber(userData.followersCount || 0);
    myFollowingCount.textContent = formatNumber(userData.followingCount || 0);

    // Set social links
    if (userData.whatsapp) {
        profileWhatsappLink.href = `https://wa.me/${userData.whatsapp.replace(/\D/g, '')}`; // Remove non-digits
        profileWhatsappLink.target = '_blank';
    } else {
        profileWhatsappLink.removeAttribute('href');
    }
    if (userData.instagram) {
        profileInstagramLink.href = `https://www.instagram.com/${userData.instagram}`;
        profileInstagramLink.target = '_blank';
    } else {
        profileInstagramLink.removeAttribute('href');
    }

    // Set edit profile modal inputs if it's the current user's profile
    if (isCurrentUserProfile) {
        editUsernameInput.value = userData.username || '';
        editWhatsappInput.value = userData.whatsapp || '';
        editInstagramInput.value = userData.instagram || '';
        populateProfileLogoOptions(userData.profileLogo);
    }
}

async function loadProfilePosts(userId) {
    profilePostsFeed.innerHTML = ''; // Clear existing posts
    try {
        const querySnapshot = await db.collection('posts')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(10) // Initial load limit for profile posts
            .get();

        if (querySnapshot.empty) {
            profilePostsFeed.innerHTML = '<p style="text-align: center; color: #ccc;">No posts yet.</p>';
            return;
        }

        querySnapshot.docs.forEach(doc => {
            profilePostsFeed.appendChild(createPostElement({ id: doc.id, ...doc.data() }));
        });
        // Implement infinite scroll for profile posts similarly if needed
    } catch (error) {
        console.error("Error loading profile posts:", error);
        profilePostsFeed.innerHTML = '<p style="text-align: center; color: red;">Error loading posts.</p>';
    }
}

// Edit Profile Modal
editProfileBtn.addEventListener('click', () => {
    editProfileModal.classList.remove('hidden');
    // Pre-populate fields from current user data (already done by updateProfileDisplay)
});

cancelEditProfileBtn.addEventListener('click', () => {
    editProfileModal.classList.add('hidden');
});

// Username Availability Check
let usernameCheckTimeout;
editUsernameInput.addEventListener('input', () => {
    clearTimeout(usernameCheckTimeout);
    usernameAvailability.textContent = ''; // Clear previous status
    usernameAvailability.className = '';

    const newUsername = editUsernameInput.value.trim();
    if (newUsername === '') return;

    if (newUsername === currentUser.username) { // If username hasn't changed
        usernameAvailability.textContent = 'Username is available.';
        usernameAvailability.classList.add('success-text');
        return;
    }

    usernameCheckTimeout = setTimeout(async () => {
        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('username', '==', newUsername).get();

            if (snapshot.empty) {
                usernameAvailability.textContent = 'Username is available.';
                usernameAvailability.classList.add('success-text');
            } else {
                usernameAvailability.textContent = 'Username already taken.';
                usernameAvailability.classList.add('error-text');
            }
        } catch (error) {
            console.error("Error checking username availability:", error);
            usernameAvailability.textContent = 'Error checking username.';
            usernameAvailability.classList.add('error-text');
        }
    }, 500); // Debounce
});

// Populate Profile Logo Options
function populateProfileLogoOptions(currentLogoClass) {
    profileLogoOptions.innerHTML = '';
    PROFILE_LOGOS.forEach(logo => {
        const logoItem = document.createElement('div');
        logoItem.className = `logo-option-item profile-avatar user-${logo.class}`;
        logoItem.dataset.logoClass = logo.class;
        
        // Dynamically add pseudo-element content
        const style = document.createElement('style');
        style.innerHTML = `
            .profile-avatar.user-${logo.class} { background-color: ${logo.color}; }
            .profile-avatar.user-${logo.class}::before { content: '${logo.emoji}'; font-size: 28px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        `;
        document.head.appendChild(style); // Append to head for global application

        if (currentLogoClass === logo.class) {
            logoItem.classList.add('selected');
        }

        logoItem.addEventListener('click', () => {
            profileLogoOptions.querySelectorAll('.logo-option-item').forEach(item => item.classList.remove('selected'));
            logoItem.classList.add('selected');
        });
        profileLogoOptions.appendChild(logoItem);
    });
}

// Save Profile Changes
saveProfileBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const newUsername = editUsernameInput.value.trim();
    const newWhatsapp = editWhatsappInput.value.trim();
    const newInstagram = editInstagramInput.value.trim();
    const selectedLogoElement = profileLogoOptions.querySelector('.logo-option-item.selected');
    const newProfileLogo = selectedLogoElement ? selectedLogoElement.dataset.logoClass : null;

    if (newUsername === '') {
        showToast("Username cannot be empty.", 'error');
        return;
    }

    // Ensure at least one contact method is provided
    if (newWhatsapp === '' && newInstagram === '') {
        showToast("Please provide at least a WhatsApp number or Instagram ID.", 'error');
        return;
    }

    try {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userDocRef.get();
        const currentData = userDoc.data();

        // Check username uniqueness again before saving
        if (newUsername !== currentData.username) {
            const usernameSnapshot = await db.collection('users').where('username', '==', newUsername).get();
            if (!usernameSnapshot.empty) {
                showToast("Username already taken. Please choose another.", 'error');
                return;
            }
        }

        await userDocRef.update({
            username: newUsername,
            whatsapp: newWhatsapp,
            instagram: newInstagram,
            profileLogo: newProfileLogo,
            // Initialize follower/following counts if they don't exist
            followersCount: currentData.followersCount || 0,
            followingCount: currentData.followingCount || 0,
            postCount: currentData.postCount || 0,
            // Initialize coins, credits, limit if new user
            coins: currentData.coins || 100, // Starting bonus
            credits: currentData.credits || 50,
            postLimit: currentData.postLimit || 5,
            lastRewardClaim: currentData.lastRewardClaim || 0
        });

        // Update username in existing posts if it changed
        if (newUsername !== currentData.username) {
            const postsSnapshot = await db.collection('posts').where('userId', '==', currentUser.uid).get();
            const batch = db.batch();
            postsSnapshot.docs.forEach(doc => {
                const postRef = db.collection('posts').doc(doc.id);
                batch.update(postRef, { username: newUsername });
            });
            await batch.commit();
        }

        editProfileModal.classList.add('hidden');
        showToast("Profile updated successfully!", 'success');
        loadUserProfile(currentUser.uid); // Reload profile display
    } catch (error) {
        console.error("Error saving profile:", error);
        showToast("Failed to save profile. Please try again.", 'error');
    }
});

// Follow/Unfollow Logic
followUserBtn.addEventListener('click', () => handleFollow(currentProfileViewingId));
unfollowUserBtn.addEventListener('click', () => handleUnfollow(currentProfileViewingId));

async function handleFollow(targetUserId) {
    if (!currentUser || currentUser.uid === targetUserId) {
        showToast("Cannot follow yourself or not logged in.", 'info');
        return;
    }

    try {
        const currentUserRef = db.collection('users').doc(currentUser.uid);
        const targetUserRef = db.collection('users').doc(targetUserId);

        await db.runTransaction(async (transaction) => {
            const currentUserDoc = await transaction.get(currentUserRef);
            const targetUserDoc = await transaction.get(targetUserRef);

            if (!currentUserDoc.exists || !targetUserDoc.exists) {
                throw "User not found.";
            }

            const currentUserData = currentUserDoc.data();
            const targetUserData = targetUserDoc.data();

            if (currentUserData.following && currentUserData.following.includes(targetUserId)) {
                showToast("Already following.", 'info');
                return; // Already following, no action needed
            }

            // Update current user's following list and count
            transaction.update(currentUserRef, {
                following: firebase.firestore.FieldValue.arrayUnion(targetUserId),
                followingCount: firebase.firestore.FieldValue.increment(1)
            });

            // Update target user's followers list and count
            transaction.update(targetUserRef, {
                followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
                followersCount: firebase.firestore.FieldValue.increment(1)
            });
        });

        showToast("Followed user!", 'success');
        followUserBtn.classList.add('hidden');
        unfollowUserBtn.classList.remove('hidden');
        loadUserProfile(currentProfileViewingId); // Refresh counts
    } catch (error) {
        console.error("Error following user:", error);
        showToast(`Failed to follow: ${error}`, 'error');
    }
}

async function handleUnfollow(targetUserId) {
    if (!currentUser || currentUser.uid === targetUserId) {
        showToast("Cannot unfollow yourself or not logged in.", 'info');
        return;
    }

    try {
        const currentUserRef = db.collection('users').doc(currentUser.uid);
        const targetUserRef = db.collection('users').doc(targetUserId);

        await db.runTransaction(async (transaction) => {
            const currentUserDoc = await transaction.get(currentUserRef);
            const targetUserDoc = await transaction.get(targetUserRef);

            if (!currentUserDoc.exists || !targetUserDoc.exists) {
                throw "User not found.";
            }

            const currentUserData = currentUserDoc.data();
            if (!currentUserData.following || !currentUserData.following.includes(targetUserId)) {
                showToast("Not currently following.", 'info');
                return; // Not following, no action needed
            }

            // Update current user's following list and count
            transaction.update(currentUserRef, {
                following: firebase.firestore.FieldValue.arrayRemove(targetUserId),
                followingCount: firebase.firestore.FieldValue.increment(-1)
            });

            // Update target user's followers list and count
            transaction.update(targetUserRef, {
                followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
                followersCount: firebase.firestore.FieldValue.increment(-1)
            });
        });

        showToast("Unfollowed user.", 'info');
        followUserBtn.classList.remove('hidden');
        unfollowUserBtn.classList.add('hidden');
        loadUserProfile(currentProfileViewingId); // Refresh counts
    } catch (error) {
        console.error("Error unfollowing user:", error);
        showToast(`Failed to unfollow: ${error}`, 'error');
    }
}

// View Followers/Following Lists
document.querySelectorAll('.clickable-stat').forEach(stat => {
    stat.addEventListener('click', (e) => {
        const statType = e.currentTarget.dataset.stat; // 'followers' or 'following'
        const userId = currentProfileViewingId; // The user whose profile is currently open
        if (userId) {
            showFollowList(userId, statType);
        }
    });
});

async function showFollowList(userId, type) {
    followListContent.innerHTML = '<div class="loader" style="margin: 20px auto;"></div>';
    followListTitle.textContent = type === 'followers' ? 'Followers' : 'Following';
    followListModal.classList.remove('hidden');

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            followListContent.innerHTML = '<p style="text-align: center;">User not found.</p>';
            return;
        }

        const userRefs = userDoc.data()[type] || []; // Array of UIDs
        if (userRefs.length === 0) {
            followListContent.innerHTML = `<p style="text-align: center;">No ${type} found.</p>`;
            return;
        }

        const usersData = [];
        // Fetch details for each user in the list (can be slow for many users)
        for (const uid of userRefs) {
            const refDoc = await db.collection('users').doc(uid).get();
            if (refDoc.exists) {
                usersData.push({ id: refDoc.id, ...refDoc.data() });
            }
        }

        followListContent.innerHTML = '';
        usersData.forEach(user => {
            const userItem = document.createElement('li');
            userItem.className = 'search-user-item';
            userItem.dataset.userId = user.id; // Store user ID

            const userLogoClass = getLogoCssClass(user.profileLogo || getRandomLogoClass());

            userItem.innerHTML = `
                <div class="profile-avatar small ${userLogoClass}"></div>
                <span class="search-username">@${user.username}</span>
                <button class="btn small primary-btn follow-btn" data-target-id="${user.id}">Follow</button>
            `;
            followListContent.appendChild(userItem);

            const followBtn = userItem.querySelector('.follow-btn');
            // Check current user's following status for each user in the list
            if (currentUser.uid === user.id) { // If it's the current user themselves
                followBtn.classList.add('hidden');
            } else if (userDoc.data().following && userDoc.data().following.includes(user.id)) {
                followBtn.textContent = 'Following';
                followBtn.classList.add('secondary-btn');
                followBtn.classList.remove('primary-btn');
            } else {
                followBtn.textContent = 'Follow';
                followBtn.classList.add('primary-btn');
                followBtn.classList.remove('secondary-btn');
            }

            followBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent opening profile
                const targetId = e.target.dataset.targetId;
                if (e.target.textContent === 'Follow') {
                    await handleFollow(targetId);
                    e.target.textContent = 'Following';
                    e.target.classList.add('secondary-btn');
                    e.target.classList.remove('primary-btn');
                } else {
                    await handleUnfollow(targetId);
                    e.target.textContent = 'Follow';
                    e.target.classList.add('primary-btn');
                    e.target.classList.remove('secondary-btn');
                }
            });

            // Make the entire list item clickable to open profile
            userItem.addEventListener('click', () => {
                followListModal.classList.add('hidden'); // Close modal
                openUserProfile(user.id); // Open clicked user's profile
            });
        });
    } catch (error) {
        console.error("Error loading follow list:", error);
        followListContent.innerHTML = '<p style="text-align: center; color: red;">Error loading list.</p>';
        showToast("Error loading follow list.", 'error');
    }
}

closeFollowListModalBtn.addEventListener('click', () => {
    followListModal.classList.add('hidden');
});

// Navigate to another user's profile
function openUserProfile(userId) {
    if (userId === currentUser.uid) {
        showScreen('profile-screen'); // If clicking on own profile, just navigate
        loadUserProfile(currentUser.uid);
    } else {
        showScreen('profile-screen');
        loadUserProfile(userId); // Load specific user's profile
    }
}

// --- Messaging ---
messageUserBtn.addEventListener('click', () => {
    if (!currentProfileViewingId) return;
    openChatWindow(currentProfileViewingId);
});

async function loadRecentChats() {
    if (!currentUser) return;
    recentChatsList.innerHTML = '<div class="loader" style="margin: 20px auto;"></div>';

    try {
        // Fetch unique chat partners from 'messages' collection where current user is sender or receiver
        const chats = {};

        // Messages where current user is sender
        const sentMessagesSnapshot = await db.collection('messages')
            .where('senderId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .get();

        sentMessagesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const partnerId = data.receiverId;
            if (!chats[partnerId] || data.timestamp.toMillis() > chats[partnerId].timestamp) {
                chats[partnerId] = {
                    partnerId: partnerId,
                    lastMessage: data.content,
                    timestamp: data.timestamp.toMillis(),
                    isSender: true
                };
            }
        });

        // Messages where current user is receiver
        const receivedMessagesSnapshot = await db.collection('messages')
            .where('receiverId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .get();

        receivedMessagesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const partnerId = data.senderId;
            if (!chats[partnerId] || data.timestamp.toMillis() > chats[partnerId].timestamp) {
                chats[partnerId] = {
                    partnerId: partnerId,
                    lastMessage: data.content,
                    timestamp: data.timestamp.toMillis(),
                    isSender: false
                };
            }
        });

        const chatPartners = Object.values(chats).sort((a, b) => b.timestamp - a.timestamp);

        if (chatPartners.length === 0) {
            recentChatsList.innerHTML = '<p style="text-align: center; color: #ccc;">No recent chats.</p>';
            return;
        }

        recentChatsList.innerHTML = '';
        for (const chat of chatPartners) {
            const partnerDoc = await db.collection('users').doc(chat.partnerId).get();
            if (partnerDoc.exists) {
                const partnerData = partnerDoc.data();
                const chatItem = document.createElement('li');
                chatItem.className = 'chat-item';
                chatItem.dataset.userId = partnerData.uid;

                const partnerLogoClass = getLogoCssClass(partnerData.profileLogo || getRandomLogoClass());

                chatItem.innerHTML = `
                    <div class="profile-avatar small ${partnerLogoClass}"></div>
                    <div class="chat-info">
                        <span class="chat-username">@${partnerData.username}</span>
                        <span class="last-message">${chat.lastMessage}</span>
                    </div>
                `;
                chatItem.addEventListener('click', () => openChatWindow(partnerData.uid));
                recentChatsList.appendChild(chatItem);
            }
        }
    } catch (error) {
        console.error("Error loading recent chats:", error);
        showToast("Error loading chats.", 'error');
        recentChatsList.innerHTML = '<p style="text-align: center; color: red;">Error loading chats.</p>';
    }
}

async function openChatWindow(partnerId) {
    if (!currentUser) return;
    currentChatPartnerId = partnerId;
    messageListContainer.classList.add('hidden');
    chatWindowContainer.classList.remove('hidden');
    chatMessages.innerHTML = '<div class="loader" style="margin: 20px auto;"></div>';

    try {
        const partnerDoc = await db.collection('users').doc(partnerId).get();
        if (partnerDoc.exists) {
            chatPartnerUsername.textContent = `@${partnerDoc.data().username}`;
            // Set partner avatar
            const partnerAvatar = chatWindowContainer.querySelector('.profile-avatar.small');
            const partnerLogoClass = getLogoCssClass(partnerDoc.data().profileLogo || getRandomLogoClass());
            partnerAvatar.className = `profile-avatar small ${partnerLogoClass}`;
        } else {
            chatPartnerUsername.textContent = "@UnknownUser";
        }

        // Real-time listener for messages
        db.collection('messages')
            .where('participants', 'array-contains', currentUser.uid) // Optimize query to check both sender/receiver
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                chatMessages.innerHTML = ''; // Clear existing messages
                snapshot.docs.forEach(doc => {
                    const message = doc.data();
                    // Filter messages relevant to the current chat partner and within 12 hours
                    const isRelevant = (message.senderId === currentUser.uid && message.receiverId === partnerId) ||
                                       (message.senderId === partnerId && message.receiverId === currentUser.uid);
                    const isWithin12Hours = (Date.now() - message.timestamp.toMillis()) < (12 * 60 * 60 * 1000);

                    if (isRelevant && isWithin12Hours) {
                        const messageBubble = document.createElement('div');
                        messageBubble.className = `message-bubble ${message.senderId === currentUser.uid ? 'right' : 'left'}`;
                        messageBubble.textContent = message.content;
                        chatMessages.appendChild(messageBubble);
                    }
                });
                chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
            }, error => {
                console.error("Error getting messages:", error);
                chatMessages.innerHTML = '<p style="text-align: center; color: red;">Error loading messages.</p>';
                showToast("Error loading messages.", 'error');
            });

        // Long press emoji picker for chat messages (similar to posts)
        const emojiPickerChat = chatWindowContainer.querySelector('.emoji-picker-chat');
        messageInput.addEventListener('touchstart', (e) => {
            clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                emojiPickerChat.classList.remove('hidden');
            }, 800);
        });
        messageInput.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
        document.addEventListener('click', (e) => {
            if (!emojiPickerChat.contains(e.target) && !messageInput.contains(e.target)) {
                emojiPickerChat.classList.add('hidden');
            }
        });
        emojiPickerChat.querySelectorAll('.emoji-option').forEach(emojiOption => {
            emojiOption.addEventListener('click', (e) => {
                const selectedEmoji = e.target.dataset.emoji;
                // You might want to send emojis as part of text or as separate message type
                messageInput.value += ` ${selectedEmoji} `; // Append emoji to input
                emojiPickerChat.classList.add('hidden');
            });
        });


    } catch (error) {
        console.error("Error opening chat window:", error);
        showToast("Failed to open chat. Try again.", 'error');
    }
}

backToChatsBtn.addEventListener('click', () => {
    messageListContainer.classList.remove('hidden');
    chatWindowContainer.classList.add('hidden');
    currentChatPartnerId = null;
    // Detach message listener if possible to prevent memory leaks (more advanced)
});

sendMessageBtn.addEventListener('click', async () => {
    if (!currentUser || !currentChatPartnerId) return;

    const messageContent = messageInput.value.trim();
    if (messageContent === '') return;

    // Check credits
    const userDocRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    const currentCredits = userData.credits || 0;

    if (currentCredits < 1) {
        showToast("You need 1 credit to send a message. Watch an ad to earn.", 'error', 5000);
        showAdModal('message-credit', { requiredCredits: 1 });
        return;
    }

    try {
        await userDocRef.update({
            credits: firebase.firestore.FieldValue.increment(-1)
        });

        await db.collection('messages').add({
            senderId: currentUser.uid,
            receiverId: currentChatPartnerId,
            content: messageContent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            participants: [currentUser.uid, currentChatPartnerId], // For easier querying
            read: false // Can be used for read receipts
        });

        messageInput.value = ''; // Clear input
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
        showToast("Message sent!", 'success');

    } catch (error) {
        console.error("Error sending message:", error);
        if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
            showToast("Error sending message: Missing or insufficient permissions. Check Firebase rules.", 'error', 5000);
        } else {
            showToast("Failed to send message. Try again.", 'error');
        }
        // Revert credit if failed
        await userDocRef.update({
            credits: firebase.firestore.FieldValue.increment(1)
        });
    }
});


// --- Search Functionality ---
searchBtn.addEventListener('click', () => performSearch());
searchQueryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

async function performSearch() {
    const query = searchQueryInput.value.trim().toLowerCase();
    searchUserList.innerHTML = '';
    searchPostList.innerHTML = '';
    noSearchResults.classList.add('hidden');

    if (query === '') {
        showToast("Please enter a search query.", 'info');
        return;
    }

    let foundResults = false;

    // Search Users
    try {
        // This is a basic prefix search. For more robust search, consider Algolia or client-side indexing.
        const userSnapshot = await db.collection('users')
            .where('username', '>=', query)
            .where('username', '<=', query + '\uf8ff')
            .limit(10) // Limit search results
            .get();

        if (!userSnapshot.empty) {
            foundResults = true;
            userSnapshot.docs.forEach(doc => {
                const userData = { id: doc.id, ...doc.data() };
                const userItem = document.createElement('li');
                userItem.className = 'search-user-item';
                userItem.dataset.userId = userData.id;

                const userLogoClass = getLogoCssClass(userData.profileLogo || getRandomLogoClass());

                userItem.innerHTML = `
                    <div class="profile-avatar small ${userLogoClass}"></div>
                    <span class="search-username">@${userData.username}</span>
                    <button class="btn small primary-btn follow-btn" data-target-id="${userData.id}">Follow</button>
                `;
                searchUserList.appendChild(userItem);

                const followBtn = userItem.querySelector('.follow-btn');
                if (currentUser.uid === userData.id) {
                    followBtn.classList.add('hidden'); // Hide follow button for self
                } else {
                    // Check if current user is already following this user
                    db.collection('users').doc(currentUser.uid).get().then(doc => {
                        const followingList = doc.data().following || [];
                        if (followingList.includes(userData.id)) {
                            followBtn.textContent = 'Following';
                            followBtn.classList.add('secondary-btn');
                            followBtn.classList.remove('primary-btn');
                        } else {
                            followBtn.textContent = 'Follow';
                            followBtn.classList.add('primary-btn');
                            followBtn.classList.remove('secondary-btn');
                        }
                    });
                }


                followBtn.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Prevent opening profile
                    const targetId = e.target.dataset.targetId;
                    if (e.target.textContent === 'Follow') {
                        await handleFollow(targetId);
                        e.target.textContent = 'Following';
                        e.target.classList.add('secondary-btn');
                        e.target.classList.remove('primary-btn');
                    } else {
                        await handleUnfollow(targetId);
                        e.target.textContent = 'Follow';
                        e.target.classList.add('primary-btn');
                        e.target.classList.remove('secondary-btn');
                    }
                });
                userItem.addEventListener('click', () => openUserProfile(userData.id));
            });
        }
    } catch (error) {
        console.error("Error searching users:", error);
        showToast("Error searching users.", 'error');
    }

    // Search Posts (by content, basic matching)
    try {
        // This is highly inefficient for large datasets. Full-text search solutions like Algolia are better.
        const postSnapshot = await db.collection('posts')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        postSnapshot.docs.forEach(doc => {
            const postData = { id: doc.id, ...doc.data() };
            // Simple client-side check if content includes query (case-insensitive)
            if (postData.content && postData.content.toLowerCase().includes(query)) {
                foundResults = true;
                searchPostList.appendChild(createPostElement(postData));
            }
        });
    } catch (error) {
        console.error("Error searching posts:", error);
        showToast("Error searching posts.", 'error');
    }

    if (!foundResults) {
        noSearchResults.classList.remove('hidden');
    }
}

// --- Post Options (Report/Delete) ---
async function handleReportPost(postId) {
    if (!currentUser) {
        showToast("Please log in to report posts.", 'info');
        return;
    }
    // Implement reporting logic (e.g., add to a 'reports' collection)
    try {
        await db.collection('reports').add({
            postId: postId,
            reportedBy: currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });
        showToast("Post reported successfully. We will review it.", 'info');
    } catch (error) {
        console.error("Error reporting post:", error);
        showToast("Failed to report post.", 'error');
    }
}

async function handleDeletePost(postId, postElement) {
    if (!currentUser) return;

    // Verify ownership before deleting
    try {
        const postRef = db.collection('posts').doc(postId);
        const postDoc = await postRef.get();

        if (postDoc.exists && postDoc.data().userId === currentUser.uid) {
            if (confirm("Are you sure you want to delete this post?")) {
                await postRef.delete();
                // Also delete related likes, reactions, views (requires more complex logic, e.g., cloud functions)
                // For simplicity, we only delete the post document here.
                postElement.remove(); // Remove from UI
                showToast("Post deleted successfully.", 'success');

                // Decrement user's post count
                await db.collection('users').doc(currentUser.uid).update({
                    postCount: firebase.firestore.FieldValue.increment(-1)
                });
            }
        } else {
            showToast("You can only delete your own posts.", 'error');
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        showToast("Failed to delete post. Try again.", 'error');
    }
}


// --- Initial Loads ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial screen setup if user is already authenticated (handled by onAuthStateChanged)
    // If not authenticated, login/signup flow will handle initial screen.
    // Ensure the splash screen is visible initially
    splashScreen.classList.remove('hidden');
    appContainer.classList.add('hidden'); // Hide app container initially
});

// Start loading posts when the home screen is active and user is logged in
// This will be called by onAuthStateChanged after successful login
// or by bottom nav / sidebar click for 'home'.
// loadPosts(); // Don't call here, let onAuthStateChanged or nav handle it.
                    
