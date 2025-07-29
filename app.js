// --- Firebase Configuration & Initialization ---
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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const functions = firebase.functions(); // Initialize Cloud Functions

// Ensure Firebase emulator is not used in production
// if (location.hostname === "localhost") {
//     functions.useEmulator("localhost", 5001);
//     db.useEmulator("localhost", 8080);
//     auth.useEmulator("http://localhost:9099");
//     storage.useEmulator("localhost", 9199);
// }


// --- DOM Elements ---
const splashScreen = document.getElementById('splash-screen');
const appContainer = document.getElementById('app-container');

// Auth/Profile Setup
const authSection = document.getElementById('auth-section');
const loginFormContainer = document.getElementById('login-form'); // Assumed existing from HTML (corrected to form-container)
const signupFormContainer = document.getElementById('signup-form-container');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const profileSetupSection = document.getElementById('profile-setup-section');
const completeProfileBtn = document.getElementById('complete-profile-btn');
const setupUsernameInput = document.getElementById('setup-username');
const usernameStatusSpan = document.getElementById('username-status');
const logoOptionsContainer = document.getElementById('logo-options');

// Header & Side Menu
const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const logoutButton = document.getElementById('logout-button');
const dataSaverToggle = document.getElementById('data-saver-toggle');
const menuInstagramLink = document.getElementById('menu-instagram');
const menuYoutubeLink = document.getElementById('menu-youtube');
const giftButton = document.getElementById('gift-button');
const refreshPostsButton = document.getElementById('refresh-posts-button');

// Bottom Nav
const bottomNavButtons = document.querySelectorAll('.bottom-nav .nav-button');

// Feed
const feedSection = document.getElementById('feed-section');
const postsContainer = document.getElementById('posts-container');
const loadingSpinner = document.getElementById('loading-spinner');

// User Profile
const userProfileSection = document.getElementById('user-profile-section');
const profileAvatar = userProfileSection.querySelector('.profile-avatar');
const profileDisplayName = document.getElementById('profile-display-name');
const profileDisplayUsername = document.getElementById('profile-display-username');
const profileFollowers = document.getElementById('profile-followers');
const profileFollowing = document.getElementById('profile-following');
const followButton = document.getElementById('follow-button');
const messageButton = document.getElementById('message-button');
const profileWhatsappButton = document.getElementById('profile-whatsapp-button');
const profileInstagramButton = document.getElementById('profile-instagram-button');
const userPostsContainer = document.getElementById('user-posts-container');
const editProfileButton = document.getElementById('edit-profile-button'); // Added for edit profile

// Search
const searchSection = document.getElementById('search-section');
const searchInput = document.getElementById('search-input');
const userSearchResults = document.getElementById('user-search-results');
const postSearchResults = document.getElementById('post-search-results');

// Messages
const messagesSection = document.getElementById('messages-section');
const chatListContainer = document.getElementById('chat-list-container');
const chatList = document.getElementById('chat-list');
const chatWindow = document.getElementById('chat-window');
const backToChatListButton = document.querySelector('.back-to-chat-list');
const messagesDisplay = document.getElementById('messages-display');
const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-button');
const messageEmojiReactionButton = document.getElementById('message-emoji-reaction-button');

// Post Upload
const uploadSection = document.getElementById('upload-section');
const uploadPostButton = document.getElementById('upload-post-button');
const postImageInput = document.getElementById('post-image-input');
const postCaptionInput = document.getElementById('post-caption-input');

// Rewards/Ads
const rewardPopup = document.getElementById('reward-popup');
const claimRewardButton = document.getElementById('claim-reward-button');
const closeRewardPopup = document.getElementById('close-reward-popup');
const adViewer = document.getElementById('ad-viewer');
const adProgressBarFill = document.querySelector('.ad-progress-fill');
const skipAdButton = document.getElementById('skip-ad-button'); // For testing

// Follow List Modal
const followListModal = document.getElementById('follow-list-modal');
const followListTitle = document.getElementById('follow-list-title');
const followListContainer = document.getElementById('follow-list-container');
const closeFollowListModalButton = document.querySelector('.follow-list-modal .close-modal-button');

// --- Global Variables ---
let currentUser = null;
let lastVisiblePost = null; // For infinite scrolling
const POSTS_PER_LOAD = 8; // Adjust for more frequent horizontal/table inserts
const dailyReward = { limit: 2, coins: 10, credit: 10 };
const DAILY_REWARD_KEY = 'lastClaimedDailyReward'; // Stored in user's Firestore doc
const USERNAME_CHECK_DEBOUNCE_TIME = 500;
let usernameCheckTimeout;
let currentActiveNeonPost = null; // Track the currently 'neon' post
let currentChatPartnerId = null; // Track the ID of the user in the active chat window

// --- Utility Functions ---

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');

    // Update active state in bottom nav
    bottomNavButtons.forEach(button => button.classList.remove('active'));
    // Map section IDs to button IDs
    const sectionToNavMap = {
        'feed-section': 'nav-home',
        'search-section': 'nav-search',
        'upload-section': 'nav-add-post',
        'messages-section': 'nav-messages',
        'user-profile-section': 'nav-profile', // Profile section can be dynamic, so map to profile button
        'auth-section': null, // No bottom nav for auth
        'profile-setup-section': null // No bottom nav for profile setup
    };
    const navButtonId = sectionToNavMap[sectionId];
    if (navButtonId) {
        const navButton = document.getElementById(navButtonId);
        if (navButton) navButton.classList.add('active');
    }

    // Close side menu if open
    sideMenu.classList.remove('open');
    overlay.style.display = 'none';
}

function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, 3000); // Matches CSS animation duration
}

function linkifyText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" class="post-link">${url}</a>`;
    });
}

// Simple debounce function for input fields (e.g., search, username check)
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// --- Code-Generated Profile Logos (50 unique) ---
const profileLogoSvgs = [];
function generateProfileLogos() {
    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF',
        '#FF8F33', '#33FF8F', '#338FFF', '#FF33F5', '#F533FF',
        '#E6B800', '#00B8E6', '#B800E6', '#E600B8', '#00E6B8',
        '#8B0000', '#008B00', '#00008B', '#8B008B', '#008B8B',
        '#FFA07A', '#7FFFD4', '#ADD8E6', '#F08080', '#DA70D6',
        '#FFD700', '#C0C0C0', '#F5DEB3', '#9ACD32', '#6A5ACD',
        '#B22222', '#228B22', '#4169E1', '#8A2BE2', '#FF6347',
        '#9932CC', '#8B008B', '#6A5ACD', '#4682B4', '#D2B48C',
        '#DEB887', '#A9A9A9', '#BDB76B', '#8FBC8F', '#483D8B',
        '#E9967A', '#8FBC8F', '#BC8F8F', '#DAA520', '#B0C4DE'
    ];

    const shapes = [
        (color) => `<circle cx="25" cy="25" r="20" fill="${color}" />`,
        (color) => `<rect x="10" y="10" width="30" height="30" fill="${color}" rx="5" ry="5" />`,
        (color) => `<polygon points="25,5 45,45 5,45" fill="${color}" />`,
        (color) => `<polygon points="25,5 40,20 35,45 15,45 10,20" fill="${color}" />`, // Star-like
        (color) => `<path d="M10 25 C 10 10, 40 10, 40 25 S 10 40, 10 25" fill="${color}" />`, // Leaf-like
        (color) => `<rect x="5" y="15" width="40" height="20" fill="${color}" rx="10" ry="10" />`, // Rounded rectangle
        (color) => `<polygon points="25,5 40,15 40,35 25,45 10,35 10,15" fill="${color}" />`, // Hexagon
        (color) => `<path d="M25 5 L45 25 L25 45 L5 25 Z" fill="${color}" />`, // Diamond
        // You would add many more unique and creative SVG paths/shapes here
    ];

    for (let i = 0; i < 50; i++) {
        const randomColor = colors[i % colors.length]; // Cycle through colors
        const randomShapeFunc = shapes[i % shapes.length]; // Cycle through shapes
        const svgContent = `<svg width="50" height="50" viewBox="0 0 50 50">${randomShapeFunc(randomColor)}</svg>`;
        profileLogoSvgs.push(`data:image/svg+xml;base64,${btoa(svgContent)}`);
    }

    // Populate the logo selection grid
    logoOptionsContainer.innerHTML = '';
    profileLogoSvgs.forEach((svgDataUrl, index) => {
        const logoOption = document.createElement('div');
        logoOption.classList.add('logo-option');
        logoOption.dataset.logoId = index;
        logoOption.innerHTML = `<img src="${svgDataUrl}" alt="Profile Logo ${index + 1}">`;
        if (index === 0) logoOption.classList.add('selected'); // Select first by default
        logoOption.addEventListener('click', () => {
            document.querySelectorAll('.logo-option').forEach(opt => opt.classList.remove('selected'));
            logoOption.classList.add('selected');
        });
        logoOptionsContainer.appendChild(logoOption);
    });
}


// --- Authentication ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        // Check if user has completed profile
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists && doc.data().username) {
                // User is logged in and profile completed
                splashScreen.style.opacity = '0';
                setTimeout(() => splashScreen.classList.add('hidden'), 500); // Fade out then hide
                appContainer.classList.remove('hidden'); // Show main app
                showSection('feed-section');
                loadPosts(); // Start loading posts
                checkAndAwardDailyReward();
            } else {
                // User is logged in but profile not completed
                splashScreen.style.opacity = '0';
                setTimeout(() => splashScreen.classList.add('hidden'), 500);
                appContainer.classList.remove('hidden');
                showSection('profile-setup-section');
                generateProfileLogos(); // Generate logos for selection
            }
        }).catch(error => {
            console.error("Error fetching user profile:", error);
            showToast("Error loading user data. Please try again.", "error");
            auth.signOut(); // Force re-login if profile data is problematic
        });
    } else {
        // No user is logged in
        splashScreen.style.opacity = '0';
        setTimeout(() => splashScreen.classList.add('hidden'), 500);
        appContainer.classList.remove('hidden');
        showSection('auth-section'); // Show login/signup
    }
});

// Auth form toggling
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.classList.add('hidden');
    signupFormContainer.classList.remove('hidden');
});
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
});


loginBtn.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => showToast("Logged in successfully!", "success"))
        .catch(error => showToast(`Login Error: ${error.message}`, "error"));
});

signupBtn.addEventListener('click', () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => showToast("Account created! Please complete your profile.", "success"))
        .catch(error => showToast(`Signup Error: ${error.message}`, "error"));
});

completeProfileBtn.addEventListener('click', async () => {
    const name = document.getElementById('setup-name').value.trim();
    const username = document.getElementById('setup-username').value.trim();
    const whatsapp = document.getElementById('setup-whatsapp').value.trim();
    const instagram = document.getElementById('setup-instagram').value.trim();
    const selectedLogoElement = document.querySelector('.logo-option.selected');
    const profileLogo = selectedLogoElement ? profileLogoSvgs[selectedLogoElement.dataset.logoId] : generateRandomUserLogo(); // Fallback

    if (!name) {
        showToast("Full Name is required.", "error");
        return;
    }
    if (!username) {
        showToast("Unique Username is required.", "error");
        return;
    }
    if (!whatsapp && !instagram) {
        showToast("Please provide at least one of WhatsApp or Instagram.", "error");
        return;
    }

    // Check username availability again (for robustness, though debounce does client-side)
    const usernameExistsSnapshot = await db.collection('users').where('username', '==', username).get();
    if (!usernameExistsSnapshot.empty) {
        showToast("This username is already taken. Please choose another.", "error");
        return;
    }

    try {
        await db.collection('users').doc(currentUser.uid).set({
            name: name,
            username: username,
            email: currentUser.email,
            whatsapp: whatsapp,
            instagram: instagram,
            profileLogo: profileLogo,
            followers: 0,
            following: 0,
            coins: 100, // Initial coins (example)
            limits: 5,  // Initial limits (example)
            credits: 50 // Initial credits (example)
        }, { merge: true }); // Use merge to avoid overwriting existing user data if any
        showToast("Profile completed successfully!", "success");
        showSection('feed-section');
        loadPosts();
        checkAndAwardDailyReward();
    } catch (error) {
        showToast(`Error completing profile: ${error.message}`, "error");
        console.error("Profile setup error:", error);
    }
});

// Username availability check with debounce
setupUsernameInput.addEventListener('input', debounce(async (e) => {
    const username = e.target.value.trim();
    if (username.length === 0) {
        usernameStatusSpan.textContent = '';
        usernameStatusSpan.classList.remove('success', 'error');
        return;
    }
    usernameStatusSpan.textContent = 'Checking...';
    usernameStatusSpan.classList.remove('success', 'error');

    try {
        const snapshot = await db.collection('users').where('username', '==', username).get();
        if (snapshot.empty || (currentUser && snapshot.docs[0].id === currentUser.uid)) { // Allow current user's own username
            usernameStatusSpan.textContent = 'Available ✅';
            usernameStatusSpan.classList.add('success');
            usernameStatusSpan.classList.remove('error');
        } else {
            usernameStatusSpan.textContent = 'Not Available ❌';
            usernameStatusSpan.classList.add('error');
            usernameStatusSpan.classList.remove('success');
        }
    } catch (error) {
        console.error("Error checking username:", error);
        usernameStatusSpan.textContent = 'Error checking.';
        usernameStatusSpan.classList.add('error');
        usernameStatusSpan.classList.remove('success');
    }
}, USERNAME_CHECK_DEBOUNCE_TIME));


// --- Navigation ---
menuToggle.addEventListener('click', () => {
    sideMenu.classList.toggle('open');
    overlay.style.display = sideMenu.classList.contains('open') ? 'block' : 'none';
});

overlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.style.display = 'none';
});

logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => showToast("Logged out.", "info"))
        .catch(error => showToast(`Logout Error: ${error.message}`, "error"));
});

// Bottom navigation logic
bottomNavButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!currentUser) {
            showToast("Please log in to use this feature.", "info");
            return;
        }
        const sectionId = button.id.replace('nav-', '') + '-section';
        if (button.id === 'nav-home') showSection('feed-section');
        else if (button.id === 'nav-add-post') showSection('upload-section');
        else if (button.id === 'nav-profile') loadUserProfile(currentUser.uid); // Load own profile
        else if (button.id === 'nav-search') showSection('search-section');
        else if (button.id === 'nav-messages') {
            showSection('messages-section');
            loadChatList();
        }
    });
});

// Side menu item actions
document.getElementById('menu-profile').addEventListener('click', () => {
    if (currentUser) loadUserProfile(currentUser.uid);
    else showToast("Please log in.", "info");
});
document.getElementById('menu-search').addEventListener('click', () => {
    if (currentUser) showSection('search-section');
    else showToast("Please log in.", "info");
});
document.getElementById('menu-messages').addEventListener('click', () => {
    if (currentUser) {
        showSection('messages-section');
        loadChatList();
    } else {
        showToast("Please log in.", "info");
    }
});
document.getElementById('menu-upload').addEventListener('click', () => {
    if (currentUser) showSection('upload-section');
    else showToast("Please log in.", "info");
});
menuInstagramLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://www.instagram.com/addmint__', '_blank');
});
menuYoutubeLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Your YouTube channel ID is @add_mint. The URL structure is often:
    // https://www.youtube.com/@yourchannelname or https://www.youtube.com/channel/YOUR_CHANNEL_ID
    // Since you provided @add_mint, using the @handle format is best.
    window.open('https://www.youtube.com/@add_mint', '_blank');
});
// Implement data saver, about us, privacy policy navigations as needed (simple showSection calls or external links)
document.getElementById('menu-about').addEventListener('click', () => {
    // Example: show a simple modal or dedicated section
    showToast("About Us: Add Mint is a professional social media app.", "info");
});
document.getElementById('menu-privacy-policy').addEventListener('click', () => {
    showToast("Privacy Policy: Your data is secure with us. (Full policy needed)", "info");
});


// --- Post Feed & Infinite Scrolling with Mixed Layout ---
let currentPostLayoutState = {
    type: 'vertical', // 'vertical', 'horizontal', 'table'
    verticalCount: 0,
    horizontalCount: 0,
    tableCount: 0,
    consecutiveVertical: 0 // How many vertical blocks in a row
};

async function loadPosts(isRefresh = false) {
    if (loadingSpinner.classList.contains('hidden') === false && !isRefresh) return; // Prevent multiple loads if already loading
    loadingSpinner.classList.remove('hidden');

    let query = db.collection('posts')
                    .orderBy('timestamp', 'desc')
                    .limit(POSTS_PER_LOAD);

    if (lastVisiblePost && !isRefresh) {
        query = query.startAfter(lastVisiblePost);
    }

    try {
        const snapshot = await query.get();
        let newPosts = [];
        snapshot.docs.forEach(doc => {
            newPosts.push({ id: doc.id, ...doc.data() });
        });

        if (isRefresh) {
            postsContainer.innerHTML = ''; // Clear existing posts on refresh
            lastVisiblePost = null; // Reset for fresh load
            currentPostLayoutState = { type: 'vertical', verticalCount: 0, horizontalCount: 0, tableCount: 0, consecutiveVertical: 0 }; // Reset layout
        }

        // Store last visible post for next load
        if (newPosts.length > 0) {
            lastVisiblePost = snapshot.docs[snapshot.docs.length - 1];
        }

        // If no more *new* unique posts, or if initial load is small, start generating duplicates randomly
        if (newPosts.length < POSTS_PER_LOAD && snapshot.empty && !isRefresh || (isRefresh && newPosts.length < POSTS_PER_LOAD)) {
            const allFetchedPostsDocs = await db.collection('posts').orderBy('timestamp', 'desc').limit(50).get(); // Fetch a pool of recent posts for duplication
            const availablePostsForDuplication = allFetchedPostsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (availablePostsForDuplication.length > 0) {
                const duplicatesToAdd = POSTS_PER_LOAD - newPosts.length; // How many more posts needed
                for (let i = 0; i < duplicatesToAdd; i++) {
                    const randomIndex = Math.floor(Math.random() * availablePostsForDuplication.length);
                    newPosts.push(availablePostsForDuplication[randomIndex]);
                }
            }
        }

        await displayPosts(newPosts); // Await displayPosts to ensure images are loaded
        loadingSpinner.classList.add('hidden');

    } catch (error) {
        showToast(`Error loading posts: ${error.message}`, "error");
        console.error("Error loading posts:", error);
        loadingSpinner.classList.add('hidden');
    }
}

async function displayPosts(posts) {
    for (const post of posts) {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.dataset.postId = post.id;
        postElement.dataset.postData = JSON.stringify(post); // Store full post data

        // Fetch user data for each post
        const userDoc = await db.collection('users').doc(post.userId).get();
        const userData = userDoc.exists ? userDoc.data() : { username: 'Unknown User', profileLogo: generateRandomUserLogo() };

        let imageUrl = post.imageUrl || '';
        if (imageUrl.startsWith('gs://')) {
             try {
                imageUrl = await storage.refFromURL(imageUrl).getDownloadURL();
            } catch (error) {
                console.warn("Failed to get download URL for image:", error);
                imageUrl = ''; // Fallback
            }
        }

        // Determine if current user liked this post
        const likedByUser = currentUser && (post.likedBy || []).includes(currentUser.uid) ? 'liked' : '';
        const userReactions = post.userReactions || {};
        const currentUsersEmoji = userReactions[currentUser ? currentUser.uid : ''] || '';

        let postContentHtml = `
            <div class="post-header">
                <div class="post-user-avatar" style="background-image: url('${userData.profileLogo}'); background-size: cover;"></div>
                <span class="post-username" data-user-id="${userData.uid}">${userData.username}</span>
            </div>
            ${imageUrl ? `<img src="${imageUrl}" alt="Post Image" class="post-image">` : ''}
            <div class="post-caption">
                <p>${linkifyText(post.caption || '')}</p>
            </div>
            <div class="post-actions">
                <button class="like-button ${likedByUser}" data-post-id="${post.id}"></button>
                <span class="like-count" data-post-id="${post.id}">${formatNumber(post.likes || 0)} Likes</span>
                <span class="view-count" data-post-id="${post.id}">${formatNumber(post.views || 0)} Views</span>
                <div class="reaction-container" data-post-id="${post.id}" data-current-emoji="${currentUsersEmoji}">
                    <span class="reaction-count">(${formatNumber(Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0))})</span>
                </div>
                <div class="post-options-button" data-post-id="${post.id}">...</div>
            </div>
        `;
        postElement.innerHTML = postContentHtml;

        // Add event listeners
        postElement.querySelector('.post-username').addEventListener('click', (e) => {
            loadUserProfile(post.userId);
        });

        const likeButton = postElement.querySelector('.like-button');
        if (likeButton) {
            // Double click to like
            let lastClickTime = 0;
            postElement.addEventListener('dblclick', (e) => { // Use dblclick on the whole post
                handleLikePost(post.id, postElement);
            });
            // Also allow single click on the button itself
            likeButton.addEventListener('click', () => handleLikePost(post.id, postElement));
        }

        // Long press for emoji reactions
        const reactionContainer = postElement.querySelector('.reaction-container');
        let touchStartTimer;
        reactionContainer.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default browser actions
            touchStartTimer = setTimeout(() => {
                showEmojiPicker(post.id, reactionContainer); // Pass container as target element
            }, 300); // 300ms long press
        });
        reactionContainer.addEventListener('touchend', () => {
            clearTimeout(touchStartTimer);
        });
        reactionContainer.addEventListener('click', () => { // For desktop clicks or short mobile taps
            // If it's a short tap, don't show picker unless explicitly asked
            if (!touchStartTimer) showEmojiPicker(post.id, reactionContainer);
        });


        // Handle neon effect (single click on the whole post)
        postElement.addEventListener('click', () => {
            handlePostClick(postElement);
            recordPostView(post.id); // Record view on click
        });

        // Update initial reaction display
        updateReactionDisplay(reactionContainer, post.reactions || {});

        // Post options (report, delete)
        const postOptionsButton = postElement.querySelector('.post-options-button');
        if (postOptionsButton) {
            postOptionsButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent post click event
                showPostOptions(post.id, post.userId);
            });
        }


        // Mixed Layout Logic
        if (currentPostLayoutState.type === 'vertical') {
            postsContainer.appendChild(postElement);
            currentPostLayoutState.verticalCount++;
            currentPostLayoutState.consecutiveVertical++;

            if (currentPostLayoutState.consecutiveVertical >= 5 && Math.random() < 0.4) { // 40% chance to switch after 5+ vertical
                currentPostLayoutState.type = Math.random() < 0.5 ? 'horizontal' : 'table';
                currentPostLayoutState.consecutiveVertical = 0;
                currentPostLayoutState.horizontalCount = 0;
                currentPostLayoutState.tableCount = 0;

                if (currentPostLayoutState.type === 'horizontal') {
                    postsContainer.appendChild(createHorizontalContainer());
                } else { // 'table'
                    postsContainer.appendChild(createTableContainer());
                }
            }
        } else if (currentPostLayoutState.type === 'horizontal') {
            const horizontalContainer = postsContainer.lastElementChild;
            if (!horizontalContainer || !horizontalContainer.classList.contains('horizontal-posts-container')) {
                // Fallback: if somehow container is wrong, create new and switch
                horizontalContainer = createHorizontalContainer();
                postsContainer.appendChild(horizontalContainer);
            }
            const horizontalItem = document.createElement('div');
            horizontalItem.classList.add('horizontal-post-item');
            horizontalItem.innerHTML = postContentHtml; // Reuse content
            horizontalItem.dataset.postId = post.id; // Ensure data attributes are copied
            horizontalItem.dataset.postData = JSON.stringify(post);
            horizontalItem.addEventListener('click', () => {
                handlePostClick(horizontalItem);
                recordPostView(post.id);
            });
            horizontalContainer.appendChild(horizontalItem);
            currentPostLayoutState.horizontalCount++;

            if (currentPostLayoutState.horizontalCount >= 4 && Math.random() < 0.5 || currentPostLayoutState.horizontalCount >= 10) { // Switch back after 4-10 horizontal
                currentPostLayoutState.type = 'vertical';
                currentPostLayoutState.verticalCount = 0;
            }
        } else if (currentPostLayoutState.type === 'table') {
            const tableContainer = postsContainer.lastElementChild;
            if (!tableContainer || !tableContainer.classList.contains('table-posts-container')) {
                 tableContainer = createTableContainer();
                 postsContainer.appendChild(tableContainer);
            }
            const tableItem = document.createElement('div');
            tableItem.classList.add('table-post-item');
            tableItem.innerHTML = postContentHtml; // Reuse content
            tableItem.dataset.postId = post.id;
            tableItem.dataset.postData = JSON.stringify(post);
            tableItem.addEventListener('click', () => {
                handlePostClick(tableItem);
                recordPostView(post.id);
            });
            tableContainer.appendChild(tableItem);
            currentPostLayoutState.tableCount++;

            if (currentPostLayoutState.tableCount >= 4 && Math.random() < 0.5 || currentPostLayoutState.tableCount >= 6) { // Switch back after 4-6 table
                currentPostLayoutState.type = 'vertical';
                currentPostLayoutState.verticalCount = 0;
            }
        }
    }
}

function createHorizontalContainer() {
    const div = document.createElement('div');
    div.classList.add('horizontal-posts-container');
    return div;
}

function createTableContainer() {
    const div = document.createElement('div');
    div.classList.add('table-posts-container');
    return div;
}

// Infinite scroll event listener
feedSection.addEventListener('scroll', () => {
    if (feedSection.scrollTop + feedSection.clientHeight >= feedSection.scrollHeight - 200) { // 200px from bottom
        loadPosts();
    }
});

refreshPostsButton.addEventListener('click', () => {
    showToast("Refreshing posts...", "info");
    loadPosts(true); // Load fresh posts
});

// Neon effect
function handlePostClick(postElement) {
    // Remove neon from previously active post
    if (currentActiveNeonPost && currentActiveNeonPost !== postElement) {
        currentActiveNeonPost.classList.remove('neon-effect');
    }

    // Add neon to current post
    postElement.classList.add('neon-effect');
    currentActiveNeonPost = postElement;

    // Remove neon effect after 3-4 seconds
    setTimeout(() => {
        if (currentActiveNeonPost === postElement) {
            postElement.classList.remove('neon-effect');
            currentActiveNeonPost = null;
        }
    }, 3500); // 3.5 seconds
}


async function handleLikePost(postId, postElement) {
    if (!currentUser) {
        showToast("Please log in to like posts.", "info");
        return;
    }

    const likeRef = db.collection('posts').doc(postId);
    const likeButton = postElement.querySelector('.like-button');
    const likeCountSpan = postElement.querySelector('.like-count');

    try {
        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(likeRef);
            if (!postDoc.exists) {
                throw "Post does not exist!";
            }

            const currentLikes = postDoc.data().likes || 0;
            const likedBy = postDoc.data().likedBy || [];
            let newLikes = currentLikes;
            let newLikedBy = [...likedBy];

            if (likedBy.includes(currentUser.uid)) {
                // User already liked, so unlike
                newLikes = Math.max(0, newLikes - 1);
                newLikedBy = newLikedBy.filter(id => id !== currentUser.uid);
                likeButton.classList.remove('liked');
            } else {
                // User has not liked, so like
                newLikes += 1;
                newLikedBy.push(currentUser.uid);
                likeButton.classList.add('liked');
            }

            transaction.update(likeRef, {
                likes: newLikes,
                likedBy: newLikedBy
            });
            likeCountSpan.textContent = `${formatNumber(newLikes)} Likes`;
        });
        // Add animation for like button
        likeButton.classList.add('liked-animation');
        setTimeout(() => likeButton.classList.remove('liked-animation'), 500);
    } catch (error) {
        showToast(`Error liking post: ${error.message}`, "error");
        console.error("Error liking post:", error);
    }
}


async function recordPostView(postId) {
    if (!currentUser) return;

    const postRef = db.collection('posts').doc(postId);
    const viewTrackerRef = db.collection('userViews').doc(`${currentUser.uid}_${postId}`);

    try {
        const viewTrackerDoc = await viewTrackerRef.get();

        if (!viewTrackerDoc.exists) {
            // First view by this user for this post
            await db.runTransaction(async (transaction) => {
                const postDoc = await transaction.get(postRef);
                const currentViews = postDoc.data().views || 0;
                transaction.update(postRef, { views: currentViews + 1 });
                transaction.set(viewTrackerRef, { userId: currentUser.uid, postId: postId, count: 1, lastViewed: firebase.firestore.FieldValue.serverTimestamp() });
            });
            const viewCountSpan = document.querySelector(`.view-count[data-post-id="${postId}"]`);
            if (viewCountSpan) {
                let currentViewsVal = parseInt(viewCountSpan.textContent.split(' ')[0].replace('K', '000').replace('M', '000000')) || 0;
                viewCountSpan.textContent = `${formatNumber(currentViewsVal + 1)} Views`;
            }
        } else {
            const viewData = viewTrackerDoc.data();
            // Count views up to 3 per user per post
            if (viewData.count < 3) {
                await db.runTransaction(async (transaction) => {
                    const postDoc = await transaction.get(postRef);
                    const currentViews = postDoc.data().views || 0;
                    transaction.update(postRef, { views: currentViews + 1 });
                    transaction.update(viewTrackerRef, { count: firebase.firestore.FieldValue.increment(1), lastViewed: firebase.firestore.FieldValue.serverTimestamp() });
                });
                const viewCountSpan = document.querySelector(`.view-count[data-post-id="${postId}"]`);
                if (viewCountSpan) {
                    let currentViewsVal = parseInt(viewCountSpan.textContent.split(' ')[0].replace('K', '000').replace('M', '000000')) || 0;
                    viewCountSpan.textContent = `${formatNumber(currentViewsVal + 1)} Views`;
                }
            }
        }
    } catch (error) {
        console.error("Error recording post view:", error);
    }
}

// Post options (report, delete)
function showPostOptions(postId, postUserId) {
    const options = [];
    if (currentUser && currentUser.uid === postUserId) {
        options.push({ label: 'Delete Post', action: () => deletePost(postId) });
    }
    options.push({ label: 'Report Post', action: () => reportPost(postId) });

    if (options.length === 0) return;

    const optionsHtml = options.map(opt => `<button class="option-item" data-action="${opt.label}">${opt.label}</button>`).join('');
    const modal = document.createElement('div');
    modal.classList.add('post-options-modal');
    modal.innerHTML = `
        <div class="modal-content">
            ${optionsHtml}
            <button class="option-item close-options">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('.option-item').forEach(button => {
        button.addEventListener('click', (e) => {
            modal.remove();
            const action = e.target.dataset.action;
            const chosenOption = options.find(opt => opt.label === action);
            if (chosenOption) chosenOption.action();
        });
    });

    modal.addEventListener('click', (e) => { // Close if click outside content
        if (e.target.classList.contains('post-options-modal')) {
            modal.remove();
        }
    });
}

async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
        await db.collection('posts').doc(postId).delete();
        showToast("Post deleted successfully!", "success");
        loadPosts(true); // Refresh feed
    } catch (error) {
        showToast(`Error deleting post: ${error.message}`, "error");
        console.error("Error deleting post:", error);
    }
}

function reportPost(postId) {
    // In a real app, this would send a report to an admin dashboard
    showToast(`Post ${postId} reported. Thank you!`, "info");
    console.log(`Reported post: ${postId}`);
}


// --- Search Functionality ---
searchInput.addEventListener('input', debounce(async (e) => {
    const queryText = e.target.value.toLowerCase().trim();
    userSearchResults.innerHTML = '';
    postSearchResults.innerHTML = '';

    if (queryText.length < 1) { // Allow single character search for better UX
        userSearchResults.innerHTML = '';
        postSearchResults.innerHTML = '';
        return;
    }

    // Search users by username (starts with) and full name (contains)
    const userSnapshot = await db.collection('users')
        .orderBy('username')
        .startAt(queryText)
        .endAt(queryText + '\uf8ff')
        .limit(10)
        .get();

    if (!userSnapshot.empty) {
        for (const doc of userSnapshot.docs) {
            const userData = doc.data();
            // Filter to ensure exact match on first part or contains
            if (userData.username.toLowerCase().includes(queryText) || userData.name.toLowerCase().includes(queryText)) {
                const isFollowing = currentUser ? (await db.collection('userFollows').doc(`${currentUser.uid}_${doc.id}`).get()).exists : false;

                const userResultItem = document.createElement('div');
                userResultItem.classList.add('user-search-result-item');
                userResultItem.dataset.userId = doc.id;
                userResultItem.innerHTML = `
                    <div class="user-search-avatar" style="background-image: url('${userData.profileLogo}'); background-size: cover;"></div>
                    <span class="username-display">${userData.username}</span>
                    ${currentUser && currentUser.uid !== doc.id ? `
                        <button class="search-follow-button ${isFollowing ? 'unfollow' : ''}" data-target-uid="${doc.id}">
                            ${isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    ` : ''}
                `;
                const followBtn = userResultItem.querySelector('.search-follow-button');
                if (followBtn) {
                    followBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent opening profile when clicking follow
                        toggleFollow(doc.id, followBtn);
                    });
                }
                userResultItem.addEventListener('click', () => {
                    showSection('user-profile-section');
                    loadUserProfile(doc.id);
                });
                userSearchResults.appendChild(userResultItem);
            }
        }
    }
    if (userSearchResults.children.length === 0) {
        userSearchResults.innerHTML = '<p>No matching users found.</p>';
    }

    // Search posts by caption (simplified - for large scale, use dedicated search service)
    const postSnapshot = await db.collection('posts')
        .orderBy('caption')
        .startAt(queryText)
        .endAt(queryText + '\uf8ff')
        .limit(5)
        .get();

    if (!postSnapshot.empty) {
        for (const doc of postSnapshot.docs) {
            const postData = doc.data();
            if (postData.caption.toLowerCase().includes(queryText)) { // Client-side filter for `contains`
                const postPreviewItem = document.createElement('div');
                postPreviewItem.classList.add('post-search-preview');
                postPreviewItem.innerHTML = `
                    <img src="${postData.imageUrl || ''}" alt="Post Preview" class="post-preview-image">
                    <p class="post-preview-caption">${postData.caption.substring(0, 50)}...</p>
                `;
                postPreviewItem.addEventListener('click', () => {
                    // Navigate to a specific post view, or open in feed context
                    showToast(`Clicked post: ${doc.id}`, "info"); // Placeholder
                });
                postSearchResults.appendChild(postPreviewItem);
            }
        }
    }
    if (postSearchResults.children.length === 0) {
        postSearchResults.innerHTML += '<p>No matching posts found.</p>';
    }
}, 300));


// --- User Profile ---
async function loadUserProfile(userId) {
    showSection('user-profile-section');
    userPostsContainer.innerHTML = ''; // Clear existing posts

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            showToast("User not found.", "error");
            return;
        }
        const userData = userDoc.data();

        profileAvatar.style.backgroundImage = `url('${userData.profileLogo}')`;
        profileDisplayName.textContent = userData.name || userData.username;
        profileDisplayUsername.textContent = `@${userData.username}`;

        // Fetch and display real follower/following counts
        const followersCount = (await db.collection('userFollows').where('followedId', '==', userId).get()).size;
        const followingCount = (await db.collection('userFollows').where('followerId', '==', userId).get()).size;
        profileFollowers.textContent = `${formatNumber(followersCount)} Followers`;
        profileFollowing.textContent = `${formatNumber(followingCount)} Following`;

        // Follow/Message buttons
        if (currentUser && currentUser.uid !== userId) {
            followButton.classList.remove('hidden');
            messageButton.classList.remove('hidden');
            editProfileButton.classList.add('hidden'); // Hide edit on other's profile

            const followDoc = await db.collection('userFollows').doc(`${currentUser.uid}_${userId}`).get();
            if (followDoc.exists) {
                followButton.textContent = 'Unfollow';
                followButton.classList.add('unfollow');
            } else {
                followButton.textContent = 'Follow';
                followButton.classList.remove('unfollow');
            }
        } else { // Current user's own profile
            followButton.classList.add('hidden');
            messageButton.classList.add('hidden');
            editProfileButton.classList.remove('hidden'); // Show edit on own profile
        }

        followButton.onclick = () => toggleFollow(userId, followButton);
        messageButton.onclick = () => startNewChat(userId, userData.username);
        editProfileButton.onclick = () => showEditProfileModal(userData);


        // WhatsApp and Instagram buttons
        profileWhatsappButton.classList.add('hidden');
        if (userData.whatsapp) {
            profileWhatsappButton.classList.remove('hidden');
            profileWhatsappButton.onclick = () => window.open(`https://wa.me/${userData.whatsapp}`, '_blank');
        }
        profileInstagramButton.classList.add('hidden');
        if (userData.instagram) {
            profileInstagramButton.classList.remove('hidden');
            profileInstagramButton.onclick = () => window.open(`https://www.instagram.com/${userData.instagram}`, '_blank');
        }

        // Load user's posts
        const userPostsSnapshot = await db.collection('posts').where('userId', '==', userId).orderBy('timestamp', 'desc').get();
        if (!userPostsSnapshot.empty) {
            for (const postDoc of userPostsSnapshot.docs) {
                const postData = postDoc.data();
                const postElement = document.createElement('div');
                postElement.classList.add('post'); // Reuse post styling
                postElement.dataset.postId = postDoc.id;
                let imageUrl = postData.imageUrl || '';
                 if (imageUrl.startsWith('gs://')) {
                     try {
                        imageUrl = await storage.refFromURL(imageUrl).getDownloadURL();
                    } catch (err) {
                        console.warn("Failed to get download URL for image:", err);
                        imageUrl = '';
                    }
                 }
                postElement.innerHTML = `
                    <img src="${imageUrl}" alt="Post Image" class="post-image">
                    <div class="post-caption">${linkifyText(postData.caption || '')}</div>
                    <div class="post-actions">
                        <span class="like-count">${formatNumber(postData.likes || 0)} Likes</span>
                        <span class="view-count">${formatNumber(postData.views || 0)} Views</span>
                    </div>
                `;
                // Add event listener for neon effect on profile posts too
                postElement.addEventListener('click', () => {
                    handlePostClick(postElement);
                    recordPostView(postDoc.id);
                });
                userPostsContainer.appendChild(postElement);
            }
        } else {
            userPostsContainer.innerHTML = '<p style="text-align: center; color: #777;">No posts by this user yet.</p>';
        }

        // Add event listeners to followers/following counts to show lists
        profileFollowers.onclick = () => showFollowList(userId, 'followers');
        profileFollowing.onclick = () => showFollowList(userId, 'following');

    } catch (error) {
        showToast(`Error loading user profile: ${error.message}`, "error");
        console.error("Error loading user profile:", error);
    }
}

async function toggleFollow(targetUserId, buttonElement) {
    if (!currentUser) {
        showToast("Please log in to follow users.", "info");
        return;
    }
    if (currentUser.uid === targetUserId) {
        showToast("You cannot follow yourself.", "info");
        return;
    }

    const followDocRef = db.collection('userFollows').doc(`${currentUser.uid}_${targetUserId}`);
    const currentUserRef = db.collection('users').doc(currentUser.uid);
    const targetUserRef = db.collection('users').doc(targetUserId);

    try {
        await db.runTransaction(async (transaction) => {
            const followDoc = await transaction.get(followDocRef);
            const currentUserDoc = await transaction.get(currentUserRef);
            const targetUserDoc = await transaction.get(targetUserRef);

            if (!currentUserDoc.exists || !targetUserDoc.exists) {
                throw new Error("User data missing. Cannot follow/unfollow.");
            }

            // Fetch actual current counts from the documents
            const currentFollowingCount = (currentUserDoc.data().following || 0);
            const targetFollowersCount = (targetUserDoc.data().followers || 0);

            if (followDoc.exists) {
                // Unfollow
                transaction.delete(followDocRef);
                transaction.update(currentUserRef, { following: Math.max(0, currentFollowingCount - 1) });
                transaction.update(targetUserRef, { followers: Math.max(0, targetFollowersCount - 1) });
                buttonElement.textContent = 'Follow';
                buttonElement.classList.remove('unfollow');
                showToast(`Unfollowed ${targetUserDoc.data().username}.`, "info");
            } else {
                // Follow
                transaction.set(followDocRef, { followerId: currentUser.uid, followedId: targetUserId, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                transaction.update(currentUserRef, { following: currentFollowingCount + 1 });
                transaction.update(targetUserRef, { followers: targetFollowersCount + 1 });
                buttonElement.textContent = 'Unfollow';
                buttonElement.classList.add('unfollow');
                showToast(`Following ${targetUserDoc.data().username}!`, "success");
            }
        });
        // Refresh the profile stats if the current view is affected
        if (userProfileSection.classList.contains('active-section')) {
            loadUserProfile(targetUserId); // Re-load the profile to update counts
        }

    } catch (error) {
        showToast(`An error occurred: ${error.message}. Please try again.`, "error");
        console.error("Follow/Unfollow Error:", error);
    }
}

// Function to show followers/following list
async function showFollowList(userId, type) {
    followListModal.classList.remove('hidden');
    followListContainer.innerHTML = '<p style="text-align: center; color: #777;">Loading...</p>';

    followListTitle.textContent = type === 'followers' ? 'Followers' : 'Following';

    let query;
    if (type === 'followers') {
        query = db.collection('userFollows').where('followedId', '==', userId);
    } else {
        query = db.collection('userFollows').where('followerId', '==', userId);
    }

    try {
        const snapshot = await query.get();
        followListContainer.innerHTML = ''; // Clear loading message

        if (snapshot.empty) {
            followListContainer.innerHTML = `<p style="text-align: center; color: #777;">No ${type} found.</p>`;
            return;
        }

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const targetId = type === 'followers' ? data.followerId : data.followedId;
            const userDoc = await db.collection('users').doc(targetId).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const listItem = document.createElement('div');
                listItem.classList.add('follow-list-item');
                listItem.innerHTML = `
                    <div class="user-search-avatar" style="background-image: url('${userData.profileLogo}'); background-size: cover;"></div>
                    <span class="username-display">${userData.username}</span>
                `;
                listItem.addEventListener('click', () => {
                    followListModal.classList.add('hidden');
                    loadUserProfile(targetId);
                });
                followListContainer.appendChild(listItem);
            }
        }
    } catch (error) {
        showToast(`Error loading ${type}: ${error.message}`, "error");
        console.error(`Error loading ${type}:`, error);
        followListContainer.innerHTML = `<p style="text-align: center; color: #dc3545;">Error loading list.</p>`;
    }
}
closeFollowListModalButton.addEventListener('click', () => {
    followListModal.classList.add('hidden');
});

// Edit Profile Modal (Conceptual)
function showEditProfileModal(userData) {
    // This would ideally open a modal similar to profile setup, pre-filling data.
    showToast("Edit Profile functionality (UI/Logic to be implemented).", "info");
    console.log("Edit user data:", userData);
    // You'd create a modal with inputs for name, username, whatsapp, instagram, and logo selection.
    // Ensure username edit still checks for uniqueness (excluding current user's own username).
    // On save, update `db.collection('users').doc(currentUser.uid)`.
}


// --- Messaging ---
async function loadChatList() {
    if (!currentUser) {
        showToast("Please log in to view messages.", "info");
        return;
    }
    chatList.innerHTML = '<p style="text-align: center; color: #777;">Loading chats...</p>';

    try {
        // Get all messages where current user is involved
        const allMessagesSnapshot = await db.collection('messages')
            .where('participants', 'array-contains', currentUser.uid) // Assuming 'participants' array in messages
            .orderBy('timestamp', 'desc')
            .get();

        const conversations = new Map(); // Map to store unique conversations by partner ID
                                        // Value: { lastMessage: doc.data(), docId: doc.id }

        allMessagesSnapshot.forEach(doc => {
            const data = doc.data();
            const partnerId = data.senderId === currentUser.uid ? data.receiverId : data.senderId;

            // Only add if not already present or if current message is newer
            if (!conversations.has(partnerId) || conversations.get(partnerId).lastMessage.timestamp.toMillis() < data.timestamp.toMillis()) {
                conversations.set(partnerId, { lastMessage: data, docId: doc.id });
            }
        });

        const chatPartners = Array.from(conversations.values()).sort((a, b) => b.lastMessage.timestamp.toMillis() - a.lastMessage.timestamp.toMillis());

        if (chatPartners.length === 0) {
            chatList.innerHTML = '<p style="text-align: center; color: #777;">No conversations yet.</p>';
            return;
        }

        chatList.innerHTML = ''; // Clear loading message

        for (const chatEntry of chatPartners) {
            const partnerId = chatEntry.lastMessage.senderId === currentUser.uid ? chatEntry.lastMessage.receiverId : chatEntry.lastMessage.senderId;
            const partnerDoc = await db.collection('users').doc(partnerId).get();

            if (partnerDoc.exists) {
                const partnerData = partnerDoc.data();
                const chatItem = document.createElement('div');
                chatItem.classList.add('chat-list-item');
                chatItem.innerHTML = `
                    <div class="user-search-avatar" style="background-image: url('${partnerData.profileLogo}'); background-size: cover;"></div>
                    <div class="chat-info">
                        <span class="chat-partner-name">${partnerData.username}</span>
                        <p class="last-message">${chatEntry.lastMessage.message}</p>
                    </div>
                `;
                chatItem.addEventListener('click', () => openChatWindow(partnerId, partnerData.username));
                chatList.appendChild(chatItem);
            }
        }

    } catch (error) {
        showToast(`Error loading chat list: ${error.message}`, "error");
        console.error("Error loading chat list:", error);
    }
}

function openChatWindow(partnerId, partnerName) {
    chatListContainer.classList.add('hidden');
    chatWindow.classList.remove('hidden');
    document.getElementById('chat-partner-name').textContent = partnerName;
    document.getElementById('chat-partner-name').dataset.partnerId = partnerId; // Store partner ID
    messagesDisplay.innerHTML = ''; // Clear previous messages
    currentChatPartnerId = partnerId; // Set current chat partner

    // Real-time listener for messages in this specific chat
    // Order by timestamp, filter for messages between these two users
    db.collection('messages')
        .where('participants', 'array-contains-any', [currentUser.uid, partnerId]) // For bidirectional query
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            messagesDisplay.innerHTML = ''; // Clear for full re-render (or optimize for new messages if needed)
            const twelveHoursAgo = firebase.firestore.Timestamp.fromMillis(Date.now() - 12 * 60 * 60 * 1000);

            snapshot.forEach(doc => {
                const message = doc.data();
                // Filter messages to only show those between currentUser and currentChatPartnerId
                const isBetweenCurrentUsers =
                    (message.senderId === currentUser.uid && message.receiverId === currentChatPartnerId) ||
                    (message.senderId === currentChatPartnerId && message.receiverId === currentUser.uid);

                if (isBetweenCurrentUsers && message.timestamp.toMillis() > twelveHoursAgo.toMillis()) {
                    const messageBubble = document.createElement('div');
                    messageBubble.classList.add('message-bubble');
                    if (message.senderId === currentUser.uid) {
                        messageBubble.classList.add('sent');
                    } else {
                        messageBubble.classList.add('received');
                    }
                    messageBubble.textContent = message.message;
                    messagesDisplay.appendChild(messageBubble);
                    messagesDisplay.scrollTop = messagesDisplay.scrollHeight; // Scroll to bottom
                }
            });
        }, error => {
            console.error("Error listening to messages:", error);
            showToast("Error loading messages.", "error");
        });
}

backToChatListButton.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
    chatListContainer.classList.remove('hidden');
    currentChatPartnerId = null; // Reset chat partner
    loadChatList(); // Refresh chat list
});

sendMessageButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const messageText = messageInput.value.trim();
    const targetUserId = document.getElementById('chat-partner-name').dataset.partnerId;

    if (!messageText || !currentUser || !targetUserId) {
        showToast("Cannot send empty message or missing recipient/sender.", "error");
        return;
    }

    try {
        // --- Use Cloud Function for secure credit deduction ---
        const sendMessageCallable = functions.httpsCallable('sendMessageSecurely');
        const result = await sendMessageCallable({
            receiverId: targetUserId,
            message: messageText
        });

        if (result.data.success) {
            messageInput.value = ''; // Clear input
            showToast("Message sent!", "success");
        } else {
            showToast(result.data.message || "Failed to send message.", "error");
        }
    } catch (error) {
        showToast(`Error sending message: ${error.message}`, "error");
        console.error("Error sending message:", error);
    }
}

// Function to handle emoji reactions (similar to Instagram/WhatsApp) for posts and messages
const emojiOptions = ['👍', '❤️', '😂', '😢', '🔥', '🎉'];
function showEmojiPicker(targetId, targetElement, isMessage = false) {
    // targetId: postId or messageId
    // targetElement: the element to append the picker to (e.g., .reaction-container or .message-bubble)
    const picker = document.createElement('div');
    picker.classList.add('emoji-picker-container');

    emojiOptions.forEach(emoji => {
        const option = document.createElement('span');
        option.classList.add('emoji-option');
        option.textContent = emoji;
        option.dataset.emoji = emoji;
        option.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent parent element's click
            sendEmojiReaction(targetId, emoji, isMessage, targetElement);
            picker.remove();
        });
        picker.appendChild(option);
    });

    targetElement.appendChild(picker);

    // Position the picker intelligently
    const rect = targetElement.getBoundingClientRect();
    // Try to position above, if not enough space, position below
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceAbove > 100 || spaceAbove > spaceBelow) { // Enough space above
        picker.style.bottom = `${targetElement.offsetHeight + 10}px`; // 10px above element
        picker.style.top = 'auto';
    } else { // Position below
        picker.style.top = `${targetElement.offsetHeight + 10}px`; // 10px below element
        picker.style.bottom = 'auto';
    }
    picker.style.left = '50%';
    picker.style.transform = 'translateX(-50%)';
    picker.style.position = 'absolute'; // Ensure it's positioned relative to parent

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!picker.contains(e.target) && !targetElement.contains(e.target)) {
            picker.remove();
        }
    }, { once: true });
}

async function sendEmojiReaction(targetId, emoji, isMessage, targetElement) {
    if (!currentUser) {
        showToast("Please log in to react.", "info");
        return;
    }

    const collectionRef = isMessage ? db.collection('messages') : db.collection('posts');
    const docRef = collectionRef.doc(targetId);

    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) {
                throw new Error("Target does not exist!");
            }

            const currentReactions = doc.data().reactions || {}; // { emoji: count }
            const userReactions = doc.data().userReactions || {}; // { userId: emoji }

            const existingReaction = userReactions[currentUser.uid];

            let newReactions = { ...currentReactions };
            let newUserReactions = { ...userReactions };

            if (existingReaction && existingReaction !== emoji) {
                // User changed reaction: decrement old, increment new
                newReactions[existingReaction] = Math.max(0, (newReactions[existingReaction] || 0) - 1);
                newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                newUserReactions[currentUser.uid] = emoji;
            } else if (!existingReaction) {
                // New reaction
                newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                newUserReactions[currentUser.uid] = emoji;
            } else if (existingReaction === emoji) {
                // Same reaction clicked again, remove it
                newReactions[emoji] = Math.max(0, (newReactions[emoji] || 0) - 1);
                delete newUserReactions[currentUser.uid];
            }

            // Remove emojis with 0 count
            for (const key in newReactions) {
                if (newReactions[key] === 0) {
                    delete newReactions[key];
                }
            }

            transaction.update(docRef, {
                reactions: newReactions,
                userReactions: newUserReactions
            });

            // Update UI immediately
            if (!isMessage) {
                updateReactionDisplay(targetElement, newReactions);
            } else {
                // For messages, you might re-render the message bubble if needed,
                // or just rely on the real-time listener to update the chat.
                showToast(`Reacted to message with ${emoji}!`, "success");
            }
        });
        showToast(`Reacted with ${emoji}!`, "success");
    } catch (error) {
        showToast(`Error sending reaction: ${error.message}`, "error");
        console.error("Error sending reaction:", error);
    }
}

function updateReactionDisplay(postElement, reactions) {
    const reactionContainer = postElement.querySelector('.reaction-container');
    if (!reactionContainer) return;

    const topEmojis = Object.entries(reactions)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3); // Get top 3 emojis

    let emojiHtml = '';
    topEmojis.forEach(([emoji, count]) => {
        if (count > 0) {
            emojiHtml += `<span class="emoji-reaction-icon">${emoji}</span>`;
        }
    });

    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
    reactionContainer.innerHTML = `${emojiHtml} <span class="reaction-count">(${formatNumber(totalReactions)})</span>`;
}


// --- Post Upload ---
uploadPostButton.addEventListener('click', async () => {
    if (!currentUser) {
        showToast("Please log in to upload posts.", "info");
        return;
    }

    const imageFile = postImageInput.files[0];
    const caption = postCaptionInput.value.trim();
    const boostHours = document.querySelector('input[name="boost-hours"]:checked').value;

    if (!imageFile || !caption) {
        showToast("Please select an image and write a caption.", "error");
        return;
    }

    try {
        // Upload image to storage first
        showToast("Uploading image...", "info");
        const postId = db.collection('posts').doc().id; // Generate a new ID for the post
        const imageRef = storage.ref(`post_images/${postId}_${imageFile.name}`);
        const snapshot = await imageRef.put(imageFile);
        const imageUrl = await snapshot.ref.getDownloadURL();

        // --- Use Cloud Function for secure post upload and credit deduction ---
        const uploadPostCallable = functions.httpsCallable('uploadPostSecurely');
        const result = await uploadPostCallable({
            caption: caption,
            imageUrl: imageUrl,
            boostHours: parseInt(boostHours)
        });

        if (result.data.success) {
            showToast("Post uploaded successfully!", "success");
            postImageInput.value = '';
            postCaptionInput.value = '';
            showSection('feed-section');
            loadPosts(true); // Refresh feed to show new post
        } else {
            showToast(result.data.message || "Failed to upload post.", "error");
        }

    } catch (error) {
        showToast(`Error publishing post: ${error.message}`, "error");
        console.error("Post upload process error:", error);
    }
});


// --- Daily Reward System & Ads ---
let rewardCountdownInterval;

async function checkAndAwardDailyReward() {
    if (!currentUser) return;

    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const lastClaimedTimestamp = userData.lastClaimedDailyReward ? userData.lastClaimedDailyReward.toDate() : null;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    if (!lastClaimedTimestamp || lastClaimedTimestamp < twentyFourHoursAgo) {
        // Reward is ready
        giftButton.classList.add('gift-ready');
        giftButton.style.animation = 'pulse 1s infinite alternate';
        giftButton.textContent = 'Claim Reward'; // Or use a gift icon
        showToast("Your daily reward is ready! Click the gift icon.", "info");
    } else {
        // Set countdown for next reward
        const nextClaimTime = new Date(lastClaimedTimestamp.getTime() + (24 * 60 * 60 * 1000));
        const timeLeft = nextClaimTime.getTime() - now.getTime(); // in ms
        startRewardCountdown(timeLeft);
    }
}

giftButton.addEventListener('click', async () => {
    if (!currentUser) {
        showToast("Please log in to claim rewards.", "info");
        return;
    }

    // If reward is ready, claim it
    if (giftButton.classList.contains('gift-ready')) {
        try {
            // Use Cloud Function for secure reward claiming
            const claimRewardCallable = functions.httpsCallable('claimDailyRewardSecurely');
            const result = await claimRewardCallable();

            if (result.data.success) {
                showRewardPopup("Daily Reward!", `Congratulations! You received ${dailyReward.limit} Limit, ${dailyReward.coins} Coins, and ${dailyReward.credit} Credits.`, () => {
                    // Nothing more to do here, as Cloud Function handled it.
                });
                giftButton.classList.remove('gift-ready');
                giftButton.style.animation = 'none';
                checkAndAwardDailyReward(); // Restart countdown
            } else {
                showToast(result.data.message || "Failed to claim reward.", "error");
            }
        } catch (error) {
            showToast(`Error claiming reward: ${error.message}`, "error");
            console.error("Error claiming daily reward callable:", error);
        }
    } else {
        showToast("Daily reward not ready yet. Check back later.", "info");
    }
});


function showRewardPopup(title, message, claimCallback) {
    document.getElementById('reward-title').textContent = title;
    document.getElementById('reward-message').textContent = message;
    rewardPopup.classList.remove('hidden');
    rewardPopup.querySelector('.reward-content').style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';

    claimRewardButton.onclick = () => {
        claimCallback(); // Execute callback (e.g., confirm reward claimed)
        rewardPopup.classList.add('hidden');
        rewardPopup.querySelector('.reward-content').style.animation = '';
    };
    closeRewardPopup.onclick = () => {
        rewardPopup.classList.add('hidden');
        rewardPopup.querySelector('.reward-content').style.animation = '';
    };
}

function startRewardCountdown(timeLeft) {
    clearInterval(rewardCountdownInterval);
    const giftButton = document.getElementById('gift-button');
    giftButton.classList.remove('gift-ready');
    giftButton.style.animation = 'none';

    rewardCountdownInterval = setInterval(() => {
        timeLeft -= 1000;

        if (timeLeft <= 0) {
            clearInterval(rewardCountdownInterval);
            giftButton.classList.add('gift-ready');
            giftButton.style.animation = 'pulse 1s infinite alternate';
            giftButton.textContent = 'Claim Reward';
            // Trigger a browser notification (requires user permission)
            if (Notification.permission === 'granted') {
                new Notification('Add Mint', { body: 'Your daily reward is ready!' });
            }
            showToast("Your daily reward is ready!", "info");
        } else {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            giftButton.textContent = `${hours}h ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

// Ad Viewing Simulation
let adCompletionCallback = null; // Store callback for after ad is watched

function viewAd(callback) {
    if (!currentUser) {
        showToast("Please log in to view ads.", "info");
        return;
    }
    adCompletionCallback = callback; // Store the function to call after ad
    adViewer.classList.remove('hidden');
    adProgressBarFill.style.width = '0%';
    adProgressBarFill.style.transition = 'width 10s linear'; // 10-second ad

    setTimeout(() => {
        adProgressBarFill.style.width = '100%';
    }, 100); // Start animation shortly after display

    setTimeout(async () => {
        adViewer.classList.add('hidden');
        adProgressBarFill.style.transition = 'none'; // Reset for next time

        try {
            // Securely grant reward via Cloud Function after ad completion
            const grantAdRewardCallable = functions.httpsCallable('grantAdRewardSecurely');
            const result = await grantAdRewardCallable({ type: 'common' }); // Type: 'common', 'limit', 'credit', 'coin'

            if (result.data.success) {
                showToast("Ad viewed successfully! Reward granted.", "success");
                if (adCompletionCallback) adCompletionCallback();
            } else {
                showToast(result.data.message || "Failed to grant ad reward.", "error");
            }
        } catch (error) {
            showToast(`Error granting ad reward: ${error.message}`, "error");
            console.error("Error with ad reward callable:", error);
        }

    }, 10000); // Simulate 10-second ad
}
// For testing, if you uncomment this, it will skip the ad. KEEP COMMENTED IN PRODUCTION.
// skipAdButton.addEventListener('click', () => {
//     adViewer.classList.add('hidden');
//     adProgressBarFill.style.transition = 'none';
//     showToast("Ad skipped (for testing). Reward NOT granted.", "info");
//     // Do not call callback if ad is skipped, unless specifically for testing reward logic.
// });


// --- Initial Load & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Hide splash screen after a few seconds
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => splashScreen.classList.add('hidden'), 500); // Fade out then hide
    }, 2000); // 2 seconds splash

    // Ensure main app container is hidden until auth state is known
    appContainer.classList.add('hidden');

    // Request Notification Permission
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});

// Implement data saver toggle
dataSaverToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        showToast("Data Saver ON. Images may load at lower quality.", "info");
        // Implement logic to load smaller image versions or lazy load more aggressively
    } else {
        showToast("Data Saver OFF. Images will load at full quality.", "info");
    }
});
