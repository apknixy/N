// Initialize Firebase (replace with your actual config)
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

// --- DOM Elements ---
const splashScreen = document.getElementById('splash-screen');
const appContainer = document.getElementById('app-container');
const authSection = document.getElementById('auth-section');
const profileSetupSection = document.getElementById('profile-setup-section');
const feedSection = document.getElementById('feed-section');
const userProfileSection = document.getElementById('user-profile-section');
const searchSection = document.getElementById('search-section');
const messagesSection = document.getElementById('messages-section');
const uploadSection = document.getElementById('upload-section');

const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const completeProfileBtn = document.getElementById('complete-profile-btn');

const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const bottomNavButtons = document.querySelectorAll('.bottom-nav .nav-button');
const postsContainer = document.getElementById('posts-container');
const loadingSpinner = document.getElementById('loading-spinner');
const searchInput = document.getElementById('search-input');
const userSearchResults = document.getElementById('user-search-results');
const postSearchResults = document.getElementById('post-search-results');

const chatList = document.getElementById('chat-list');
const chatWindow = document.getElementById('chat-window');
const messagesDisplay = document.getElementById('messages-display');
const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-button');
const emojiReactionButton = document.getElementById('emoji-reaction-button');

const uploadPostButton = document.getElementById('upload-post-button');
const postImageInput = document.getElementById('post-image-input');
const postCaptionInput = document.getElementById('post-caption-input');

const giftButton = document.getElementById('gift-button');
const refreshPostsButton = document.getElementById('refresh-posts-button');
const rewardPopup = document.getElementById('reward-popup');
const claimRewardButton = document.getElementById('claim-reward-button');
const closeRewardPopup = document.getElementById('close-reward-popup');
const adViewer = document.getElementById('ad-viewer');
const skipAdButton = document.getElementById('skip-ad-button');


// --- Global Variables ---
let currentUser = null;
let lastVisiblePost = null; // For infinite scrolling
const POSTS_PER_LOAD = 10;
const dailyReward = { limit: 2, coins: 10, credit: 10 };
const DAILY_REWARD_KEY = 'lastClaimedDailyReward';
const USERNAME_CHECK_DEBOUNCE_TIME = 500;
let usernameCheckTimeout;

// --- Utility Functions ---
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');

    // Update active state in bottom nav
    bottomNavButtons.forEach(button => button.classList.remove('active'));
    // Find the button corresponding to the section and add 'active' class
    if (sectionId === 'feed-section') document.getElementById('nav-home').classList.add('active');
    else if (sectionId === 'search-section') document.getElementById('nav-search').classList.add('active');
    else if (sectionId === 'upload-section') document.getElementById('nav-add-post').classList.add('active');
    else if (sectionId === 'messages-section') document.getElementById('nav-messages').classList.add('active');
    else if (sectionId === 'user-profile-section') document.getElementById('nav-profile').classList.add('active');
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function generateRandomUserLogo() {
    // Generate a simple SVG or canvas-based logo
    // This is a placeholder, you'd have more sophisticated logic
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];
    const shapes = ['circle', 'square', 'triangle'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

    let svgContent = `<svg width="50" height="50" viewBox="0 0 50 50">`;
    if (randomShape === 'circle') {
        svgContent += `<circle cx="25" cy="25" r="20" fill="${randomColor}" />`;
    } else if (randomShape === 'square') {
        svgContent += `<rect x="5" y="5" width="40" height="40" fill="${randomColor}" />`;
    } else if (randomShape === 'triangle') {
        svgContent += `<polygon points="25,5 45,45 5,45" fill="${randomColor}" />`;
    }
    svgContent += `</svg>`;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

// Function to handle ad viewing
function viewAd(callback) {
    adViewer.classList.remove('hidden');
    // Simulate ad viewing for 10 seconds
    const progressBar = adViewer.querySelector('.ad-progress-bar::after'); // This won't work directly on pseudo-elements, use a div inside
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        // In a real scenario, you'd control an inner div's width
        // For simulation, we'll just wait.
        if (progress >= 10) { // 10 seconds
            clearInterval(interval);
            adViewer.classList.add('hidden');
            showToast("Ad viewed successfully! Reward granted.", "success");
            if (callback) callback();
        }
    }, 1000);
}

// --- Authentication ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        // Check if user has completed profile
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists && doc.data().username) {
                splashScreen.classList.add('hidden'); // Hide splash screen
                appContainer.classList.remove('hidden'); // Show main app
                showSection('feed-section');
                loadPosts(); // Start loading posts
                checkAndAwardDailyReward();
            } else {
                splashScreen.classList.add('hidden'); // Hide splash screen
                appContainer.classList.remove('hidden'); // Show main app
                showSection('profile-setup-section');
            }
        });
    } else {
        splashScreen.classList.add('hidden'); // Hide splash screen
        appContainer.classList.remove('hidden'); // Show main app
        showSection('auth-section'); // Show login/signup
    }
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
    const name = document.getElementById('setup-name').value;
    const username = document.getElementById('setup-username').value;
    const whatsapp = document.getElementById('setup-whatsapp').value;
    const instagram = document.getElementById('setup-instagram').value;
    // Get selected logo (implement logo selection UI)
    const profileLogo = generateRandomUserLogo(); // For now, use a random one

    if (!name || !username || (!whatsapp && !instagram)) {
        showToast("Please fill in Name, Unique Username, and at least one of WhatsApp/Instagram.", "error");
        return;
    }

    // Check username availability again (client-side and server-side via rules)
    const usernameExists = (await db.collection('users').where('username', '==', username).get()).docs.length > 0;
    if (usernameExists) {
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
            profileLogo: profileLogo, // Store the generated SVG data URL
            followers: 0,
            following: 0,
            coins: 0, // Initial coins
            limits: 0, // Initial limits
            credits: 0 // Initial credits
        }, { merge: true });
        showToast("Profile completed successfully!", "success");
        showSection('feed-section');
        loadPosts();
        checkAndAwardDailyReward();
    } catch (error) {
        showToast(`Error completing profile: ${error.message}`, "error");
    }
});

// Username availability check
document.getElementById('setup-username').addEventListener('input', (e) => {
    clearTimeout(usernameCheckTimeout);
    const username = e.target.value;
    const usernameStatus = document.getElementById('username-status');
    usernameStatus.textContent = 'Checking...';

    usernameCheckTimeout = setTimeout(async () => {
        if (username.length > 0) {
            const snapshot = await db.collection('users').where('username', '==', username).get();
            if (snapshot.empty) {
                usernameStatus.textContent = 'Available ✅';
                usernameStatus.style.color = 'green';
            } else {
                usernameStatus.textContent = 'Not Available ❌';
                usernameStatus.style.color = 'red';
            }
        } else {
            usernameStatus.textContent = '';
        }
    }, USERNAME_CHECK_DEBOUNCE_TIME);
});


// --- Navigation ---
menuToggle.addEventListener('click', () => {
    sideMenu.classList.toggle('open');
    overlay.style.display = sideMenu.classList.contains('open') ? 'block' : 'none';
});

overlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.style.display = 'none';
});

document.getElementById('logout-button').addEventListener('click', () => {
    auth.signOut()
        .then(() => showToast("Logged out.", "info"))
        .catch(error => showToast(`Logout Error: ${error.message}`, "error"));
});

// Bottom navigation logic
bottomNavButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSectionId = button.id.replace('nav-', '') + '-section';
        if (button.id === 'nav-home') showSection('feed-section');
        else if (button.id === 'nav-add-post') showSection('upload-section');
        else if (button.id === 'nav-profile') showSection('user-profile-section');
        else if (button.id === 'nav-search') showSection('search-section');
        else if (button.id === 'nav-messages') showSection('messages-section');
        // Handle 'My Profile' specifically to load current user's profile
        if (button.id === 'nav-profile' && currentUser) {
            loadUserProfile(currentUser.uid); // Load own profile
        }
    });
});

// Side menu item actions
document.getElementById('menu-profile').addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.style.display = 'none';
    if (currentUser) loadUserProfile(currentUser.uid);
});
document.getElementById('menu-search').addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.style.display = 'none';
    showSection('search-section');
});
document.getElementById('menu-messages').addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.style.display = 'none';
    showSection('messages-section');
    loadChatList();
});
document.getElementById('menu-upload').addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.style.display = 'none';
    showSection('upload-section');
});
document.getElementById('menu-instagram').addEventListener('click', () => {
    window.open('https://www.instagram.com/addmint__', '_blank');
});
document.getElementById('menu-youtube').addEventListener('click', () => {
    window.open('https://www.youtube.com/@add_mintmint', '_blank');
});
// Implement data saver, about us, privacy policy navigations as needed


// --- Post Feed & Infinite Scrolling ---
async function loadPosts(isRefresh = false) {
    if (loadingSpinner.classList.contains('hidden') === false && !isRefresh) return; // Prevent multiple loads
    loadingSpinner.classList.remove('hidden');

    let query = db.collection('posts')
                    .orderBy('timestamp', 'desc')
                    .limit(POSTS_PER_LOAD);

    if (lastVisiblePost && !isRefresh) {
        query = query.startAfter(lastVisiblePost);
    }

    try {
        const snapshot = await query.get();
        if (snapshot.empty && !isRefresh) {
            showToast("No more posts to load.", "info");
            loadingSpinner.classList.add('hidden');
            // If no more new posts, start showing duplicates randomly
            loadRandomOldPosts();
            return;
        }

        if (isRefresh) {
            postsContainer.innerHTML = ''; // Clear existing posts on refresh
            lastVisiblePost = null; // Reset for fresh load
        }

        const newPosts = [];
        snapshot.docs.forEach(doc => {
            newPosts.push({ id: doc.id, ...doc.data() });
        });

        // Store last visible post for next load
        if (newPosts.length > 0) {
            lastVisiblePost = snapshot.docs[snapshot.docs.length - 1];
        }

        // If there are very few posts, or after all unique posts are loaded,
        // start generating duplicates to create an infinite scroll effect.
        if (newPosts.length < POSTS_PER_LOAD && snapshot.empty && !isRefresh) {
            // This is where you would intelligently mix in duplicates.
            // For a robust solution, you'd fetch a set of older posts and
            // randomly pick from them, ensuring variety.
            const allFetchedPosts = Array.from(postsContainer.children).map(el => JSON.parse(el.dataset.postData));
            const availablePostsForDuplication = newPosts.concat(allFetchedPosts);
            if (availablePostsForDuplication.length > 0) {
                const duplicatesToAdd = POSTS_PER_LOAD - newPosts.length;
                for (let i = 0; i < duplicatesToAdd; i++) {
                    const randomIndex = Math.floor(Math.random() * availablePostsForDuplication.length);
                    newPosts.push(availablePostsForDuplication[randomIndex]);
                }
            }
        }

        displayPosts(newPosts);
        loadingSpinner.classList.add('hidden');

    } catch (error) {
        showToast(`Error loading posts: ${error.message}`, "error");
        console.error("Error loading posts:", error);
        loadingSpinner.classList.add('hidden');
    }
}

async function loadRandomOldPosts() {
    // Fallback when unique posts run out. Fetch a small random set from all posts.
    try {
        const totalPostsSnapshot = await db.collection('posts').get();
        if (totalPostsSnapshot.empty) return;

        const allPosts = totalPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const postsToDisplay = [];
        for (let i = 0; i < POSTS_PER_LOAD; i++) {
            const randomIndex = Math.floor(Math.random() * allPosts.length);
            postsToDisplay.push(allPosts[randomIndex]);
        }
        displayPosts(postsToDisplay);
    } catch (error) {
        console.error("Error loading random old posts:", error);
    }
}


function displayPosts(posts) {
    let currentLayoutType = 'vertical'; // Start with vertical
    let verticalCount = 0;

    posts.forEach(async post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.dataset.postId = post.id; // Store post ID
        postElement.dataset.postData = JSON.stringify(post); // Store full post data

        // Fetch user data for each post
        const userDoc = await db.collection('users').doc(post.userId).get();
        const userData = userDoc.exists ? userDoc.data() : { username: 'Unknown User', profileLogo: generateRandomUserLogo() };

        let imageUrl = post.imageUrl || ''; // Ensure imageUrl exists
        if (imageUrl.startsWith('gs://')) { // Handle Firebase Storage GS URLs
             try {
                imageUrl = await storage.refFromURL(imageUrl).getDownloadURL();
            } catch (error) {
                console.warn("Failed to get download URL for image:", error);
                imageUrl = ''; // Fallback
            }
        }


        let postContentHtml = `
            <div class="post-header">
                <div class="post-user-avatar" style="background-image: url('${userData.profileLogo}'); background-size: cover;"></div>
                <span class="post-username">${userData.username}</span>
            </div>
            ${imageUrl ? `<img src="${imageUrl}" alt="Post Image" class="post-image">` : ''}
            <div class="post-caption">
                <p>${linkifyText(post.caption || '')}</p>
            </div>
            <div class="post-actions">
                <button class="like-button" data-post-id="${post.id}"></button>
                <span class="like-count" data-post-id="${post.id}">${formatNumber(post.likes || 0)} Likes</span>
                <span class="view-count" data-post-id="${post.id}">${formatNumber(post.views || 0)} Views</span>
                <div class="reaction-container" data-post-id="${post.id}">
                    <span class="reaction-count">(${formatNumber(Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0))})</span>
                </div>
            </div>
        `;
        postElement.innerHTML = postContentHtml;

        // Add event listeners for like and long press for reactions
        const likeButton = postElement.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', () => handleLikePost(post.id, postElement));
        }

        // Handle emoji reactions (long press)
        postElement.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default browser touch behavior
            this.touchTimeout = setTimeout(() => {
                showEmojiPicker(post.id, postElement);
            }, 500); // 500ms for long press
        });
        postElement.addEventListener('touchend', () => {
            clearTimeout(this.touchTimeout);
        });
        postElement.addEventListener('click', () => {
            // Handle single click (neon effect)
            handlePostClick(postElement);
            // Also handle view count for single click
            recordPostView(post.id);
        });


        // Add post to container based on mixed layout logic
        if (currentLayoutType === 'vertical') {
            postsContainer.appendChild(postElement);
            verticalCount++;
            if (verticalCount >= 5 && verticalCount <= 10 && Math.random() < 0.3) { // Randomly switch to horizontal
                currentLayoutType = 'horizontal';
                postsContainer.appendChild(createHorizontalContainer());
            } else if (verticalCount >= 4 && verticalCount <= 6 && Math.random() < 0.2) { // Randomly switch to table
                currentLayoutType = 'table';
                postsContainer.appendChild(createTableContainer());
            }
        } else if (currentLayoutType === 'horizontal') {
            const horizontalContainer = postsContainer.lastChild; // Get the last horizontal container
            const horizontalItem = document.createElement('div');
            horizontalItem.classList.add('horizontal-post-item');
            horizontalItem.innerHTML = postContentHtml; // Reuse post content
            horizontalContainer.appendChild(horizontalItem);
            if (horizontalContainer.children.length >= 4 && horizontalContainer.children.length <= 10 && Math.random() < 0.4) {
                currentLayoutType = 'vertical'; // Switch back to vertical
                verticalCount = 0;
            }
        } else if (currentLayoutType === 'table') {
            const tableContainer = postsContainer.lastChild; // Get the last table container
            const tableItem = document.createElement('div');
            tableItem.classList.add('table-post-item');
            tableItem.innerHTML = postContentHtml; // Reuse post content
            tableContainer.appendChild(tableItem);
            if (tableContainer.children.length >= 4 && tableContainer.children.length <= 6 && Math.random() < 0.4) {
                currentLayoutType = 'vertical'; // Switch back to vertical
                verticalCount = 0;
            }
        }
    });
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


function linkifyText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" class="post-link">${url}</a>`;
    });
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

let activeNeonPost = null;
function handlePostClick(postElement) {
    // Remove neon from previously active post
    if (activeNeonPost && activeNeonPost !== postElement) {
        activeNeonPost.classList.remove('neon-effect');
    }

    // Add neon to current post
    postElement.classList.add('neon-effect');
    activeNeonPost = postElement;

    // Remove neon effect after 3-4 seconds
    setTimeout(() => {
        if (activeNeonPost === postElement) {
            postElement.classList.remove('neon-effect');
            activeNeonPost = null;
        }
    }, 3500); // 3.5 seconds
}

async function recordPostView(postId) {
    if (!currentUser) return; // Only count views for logged-in users

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
                const currentViews = parseInt(viewCountSpan.textContent.replace(' Views', '')) || 0;
                viewCountSpan.textContent = `${formatNumber(currentViews + 1)} Views`;
            }
        } else {
            const viewData = viewTrackerDoc.data();
            // Count views up to 3 per user per post (you specified 1-3 views)
            if (viewData.count < 3) {
                await db.runTransaction(async (transaction) => {
                    const postDoc = await transaction.get(postRef);
                    const currentViews = postDoc.data().views || 0;
                    transaction.update(postRef, { views: currentViews + 1 });
                    transaction.update(viewTrackerRef, { count: firebase.firestore.FieldValue.increment(1), lastViewed: firebase.firestore.FieldValue.serverTimestamp() });
                });
                const viewCountSpan = document.querySelector(`.view-count[data-post-id="${postId}"]`);
                if (viewCountSpan) {
                    const currentViews = parseInt(viewCountSpan.textContent.replace(' Views', '')) || 0;
                    viewCountSpan.textContent = `${formatNumber(currentViews + 1)} Views`;
                }
            }
        }
    } catch (error) {
        console.error("Error recording post view:", error);
    }
}


// Infinite scroll event listener
feedSection.addEventListener('scroll', () => {
    if (feedSection.scrollTop + feedSection.clientHeight >= feedSection.scrollHeight - 100) { // 100px from bottom
        loadPosts();
    }
});

refreshPostsButton.addEventListener('click', () => {
    postsContainer.innerHTML = ''; // Clear current posts
    lastVisiblePost = null; // Reset for fresh load
    loadPosts(true); // Load fresh posts
    showToast("Posts refreshed!", "info");
});


// --- Search Functionality ---
searchInput.addEventListener('input', debounce(async (e) => {
    const queryText = e.target.value.toLowerCase();
    userSearchResults.innerHTML = '';
    postSearchResults.innerHTML = '';

    if (queryText.length < 2) return; // Require at least 2 characters for search

    // Search users by username
    const userSnapshot = await db.collection('users')
        .where('username', '>=', queryText)
        .where('username', '<=', queryText + '\uf8ff')
        .limit(10)
        .get();

    if (!userSnapshot.empty) {
        userSnapshot.forEach(async doc => {
            const userData = doc.data();
            const isFollowing = currentUser ? (await db.collection('userFollows').doc(`${currentUser.uid}_${userData.uid}`).get()).exists : false;

            const userResultItem = document.createElement('div');
            userResultItem.classList.add('user-search-result-item');
            userResultItem.dataset.userId = doc.id;
            userResultItem.innerHTML = `
                <div class="user-search-avatar" style="background-image: url('${userData.profileLogo}'); background-size: cover;"></div>
                <span class="username-display">${userData.username}</span>
                <button class="search-follow-button ${isFollowing ? 'unfollow' : ''}" data-target-uid="${doc.id}">
                    ${isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            `;
            userResultItem.querySelector('.search-follow-button').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening profile when clicking follow
                toggleFollow(doc.id, userResultItem.querySelector('.search-follow-button'));
            });
            userResultItem.addEventListener('click', () => {
                showSection('user-profile-section');
                loadUserProfile(doc.id);
            });
            userSearchResults.appendChild(userResultItem);
        });
    } else {
        userSearchResults.innerHTML = '<p>No matching users found.</p>';
    }

    // You can also add post search here (e.g., by caption)
    // This would require text indexing solutions for large datasets (e.g., Algolia, ElasticSearch)
    // For small scale, you might do a client-side filter or simple Firestore query.
}, 300)); // Debounce search input

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}


// --- User Profile ---
async function loadUserProfile(userId) {
    showSection('user-profile-section');
    const profileHeader = userProfileSection.querySelector('.profile-header');
    const profileAvatar = profileHeader.querySelector('.profile-avatar');
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileDisplayUsername = document.getElementById('profile-display-username');
    const profileFollowers = document.getElementById('profile-followers');
    const profileFollowing = document.getElementById('profile-following');
    const followButton = document.getElementById('follow-button');
    const messageButton = document.getElementById('message-button');
    const profileWhatsappButton = document.getElementById('profile-whatsapp-button');
    const profileInstagramButton = document.getElementById('profile-instagram-button');
    const userPostsContainer = document.getElementById('user-posts-container');

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
        profileFollowers.textContent = `${formatNumber(userData.followers || 0)} Followers`;
        profileFollowing.textContent = `${formatNumber(userData.following || 0)} Following`;

        // Follow button logic
        if (currentUser && currentUser.uid !== userId) {
            followButton.classList.remove('hidden');
            messageButton.classList.remove('hidden');
            const followDoc = await db.collection('userFollows').doc(`${currentUser.uid}_${userId}`).get();
            if (followDoc.exists) {
                followButton.textContent = 'Unfollow';
                followButton.classList.add('unfollow');
            } else {
                followButton.textContent = 'Follow';
                followButton.classList.remove('unfollow');
            }
        } else {
            followButton.classList.add('hidden'); // Hide follow/message on own profile
            messageButton.classList.add('hidden');
        }

        followButton.onclick = () => toggleFollow(userId, followButton);
        messageButton.onclick = () => startNewChat(userId, userData.username);

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
        userPostsContainer.innerHTML = ''; // Clear previous posts
        const userPostsSnapshot = await db.collection('posts').where('userId', '==', userId).orderBy('timestamp', 'desc').get();
        if (!userPostsSnapshot.empty) {
            userPostsSnapshot.forEach(postDoc => {
                const postData = postDoc.data();
                const postElement = document.createElement('div');
                postElement.classList.add('post'); // Reuse post styling
                postElement.dataset.postId = postDoc.id;
                // Simplified display for user's profile posts
                let imageUrl = postData.imageUrl || '';
                // Resolve GS URL if needed, similar to feed displayPosts
                 if (imageUrl.startsWith('gs://')) {
                     storage.refFromURL(imageUrl).getDownloadURL().then(url => {
                         postElement.querySelector('.post-image').src = url;
                     }).catch(err => console.warn("Failed to get download URL:", err));
                 }
                postElement.innerHTML = `
                    <img src="${imageUrl}" alt="Post Image" class="post-image">
                    <div class="post-caption">${linkifyText(postData.caption || '')}</div>
                    <div class="post-actions">
                        <span class="like-count">${formatNumber(postData.likes || 0)} Likes</span>
                        <span class="view-count">${formatNumber(postData.views || 0)} Views</span>
                    </div>
                `;
                userPostsContainer.appendChild(postElement);
            });
        } else {
            userPostsContainer.innerHTML = '<p>No posts by this user yet.</p>';
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
                throw "User data missing. Cannot follow/unfollow.";
            }

            const currentFollowing = currentUserDoc.data().following || 0;
            const targetFollowers = targetUserDoc.data().followers || 0;

            if (followDoc.exists) {
                // Unfollow
                transaction.delete(followDocRef);
                transaction.update(currentUserRef, { following: Math.max(0, currentFollowing - 1) });
                transaction.update(targetUserRef, { followers: Math.max(0, targetFollowers - 1) });
                buttonElement.textContent = 'Follow';
                buttonElement.classList.remove('unfollow');
                showToast(`Unfollowed ${targetUserDoc.data().username}.`, "info");
            } else {
                // Follow
                transaction.set(followDocRef, { followerId: currentUser.uid, followedId: targetUserId, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                transaction.update(currentUserRef, { following: currentFollowing + 1 });
                transaction.update(targetUserRef, { followers: targetFollowers + 1 });
                buttonElement.textContent = 'Unfollow';
                buttonElement.classList.add('unfollow');
                showToast(`Following ${targetUserDoc.data().username}!`, "success");
            }
        });
        // Update profile stats if on own profile or target profile is visible
        if (document.getElementById('profile-display-name').textContent.includes(targetUserDoc.data().username)) {
            loadUserProfile(targetUserId); // Refresh target profile
        }
        if (currentUser && document.getElementById('profile-display-name').textContent.includes(currentUser.displayName)) {
             loadUserProfile(currentUser.uid); // Refresh own profile
        }

    } catch (error) {
        showToast(`An error occurred: ${error.message}`, "error");
        console.error("Follow/Unfollow Error:", error);
    }
}

async function showFollowList(userId, type) {
    // This would open a new modal or section
    showToast(`Displaying ${type} for user ${userId}. (Implementation needed)`, "info");
    // You would fetch:
    // If 'followers': db.collection('userFollows').where('followedId', '==', userId)
    // If 'following': db.collection('userFollows').where('followerId', '==', userId)
    // Then iterate through the results and fetch user data for each ID, displaying them in a scrollable list.
}


// --- Messaging ---
async function loadChatList() {
    if (!currentUser) {
        showToast("Please log in to view messages.", "info");
        return;
    }
    chatList.innerHTML = '<h4>Your Chats</h4>';
    try {
        // Fetch conversations where current user is sender or receiver
        const sentChatsSnapshot = await db.collection('messages')
            .where('senderId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .get();

        const receivedChatsSnapshot = await db.collection('messages')
            .where('receiverId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .get();

        const conversations = new Map(); // Use Map to store unique conversations

        sentChatsSnapshot.forEach(doc => {
            const data = doc.data();
            const partnerId = data.receiverId;
            if (!conversations.has(partnerId)) {
                conversations.set(partnerId, { lastMessage: data.message, timestamp: data.timestamp, partnerId: partnerId });
            }
        });
        receivedChatsSnapshot.forEach(doc => {
            const data = doc.data();
            const partnerId = data.senderId;
             if (!conversations.has(partnerId)) {
                conversations.set(partnerId, { lastMessage: data.message, timestamp: data.timestamp, partnerId: partnerId });
            }
        });

        const chatPartners = Array.from(conversations.values()).sort((a, b) => b.timestamp - a.timestamp);

        if (chatPartners.length === 0) {
            chatList.innerHTML += '<p>No conversations yet.</p>';
            return;
        }

        for (const chat of chatPartners) {
            const partnerDoc = await db.collection('users').doc(chat.partnerId).get();
            if (partnerDoc.exists) {
                const partnerData = partnerDoc.data();
                const chatItem = document.createElement('div');
                chatItem.classList.add('chat-list-item');
                chatItem.innerHTML = `
                    <div class="user-search-avatar" style="background-image: url('${partnerData.profileLogo}'); background-size: cover;"></div>
                    <div class="chat-info">
                        <span class="chat-partner-name">${partnerData.username}</span>
                        <p class="last-message">${chat.lastMessage}</p>
                    </div>
                `;
                chatItem.addEventListener('click', () => openChatWindow(chat.partnerId, partnerData.username));
                chatList.appendChild(chatItem);
            }
        }

    } catch (error) {
        showToast(`Error loading chat list: ${error.message}`, "error");
        console.error("Error loading chat list:", error);
    }
}

function openChatWindow(partnerId, partnerName) {
    chatList.classList.add('hidden');
    chatWindow.classList.remove('hidden');
    document.getElementById('chat-partner-name').textContent = partnerName;
    messagesDisplay.innerHTML = ''; // Clear previous messages

    // Real-time listener for messages
    db.collection('messages')
        .where('senderId', 'in', [currentUser.uid, partnerId])
        .where('receiverId', 'in', [currentUser.uid, partnerId])
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            messagesDisplay.innerHTML = ''; // Clear for full re-render (or optimize for new messages)
            snapshot.forEach(doc => {
                const message = doc.data();
                const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
                if (message.timestamp.toDate() > twelveHoursAgo) {
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

document.querySelector('.back-to-chat-list').addEventListener('click', () => {
    chatWindow.classList.add('hidden');
    chatList.classList.remove('hidden');
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
    const chatPartnerId = document.getElementById('chat-partner-name').dataset.partnerId; // Assuming you set this data attribute

    if (!messageText || !currentUser || !chatPartnerId) {
        showToast("Cannot send empty message or missing recipient/sender.", "error");
        return;
    }

    // Check user credits (client-side - highly recommend server-side Cloud Function)
    const userCreditsDoc = await db.collection('userCredits').doc(currentUser.uid).get();
    const currentCredits = userCreditsDoc.exists ? userCreditsDoc.data().credits : 0;

    if (currentCredits < 1) { // 1 credit per message
        showToast("You need 1 credit to send a message. Please view an ad.", "info");
        // Trigger ad viewing flow, then retry send message
        viewAd(() => {
            // After ad, grant credit (this part also needs Cloud Function for security)
            db.collection('userCredits').doc(currentUser.uid).update({ credits: firebase.firestore.FieldValue.increment(10) }) // 10 credits for 1 ad
                .then(() => showToast("10 credits added!", "success"))
                .catch(err => console.error("Error adding credits:", err));
        });
        return;
    }

    try {
        await db.collection('messages').add({
            senderId: currentUser.uid,
            receiverId: chatPartnerId,
            message: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageInput.value = ''; // Clear input
        // Deduct credit (again, ideally Cloud Function)
        await db.collection('userCredits').doc(currentUser.uid).update({ credits: firebase.firestore.FieldValue.increment(-1) });
    } catch (error) {
        showToast(`Error sending message: ${error.message}`, "error");
        console.error("Error sending message:", error);
    }
}

// Function to handle emoji reactions (similar to Instagram/WhatsApp)
function showEmojiPicker(targetId, targetElement) {
    // TargetId could be postId or messageId
    const emojis = ['👍', '❤️', '😂', '😢', '🔥', '🎉']; // Example emojis
    let pickerHtml = `<div class="emoji-picker">`;
    emojis.forEach(emoji => {
        pickerHtml += `<span class="emoji-option" data-emoji="${emoji}">${emoji}</span>`;
    });
    pickerHtml += `</div>`;

    const picker = document.createElement('div');
    picker.innerHTML = pickerHtml;
    picker.classList.add('emoji-picker-container');
    targetElement.appendChild(picker);

    // Position the picker
    const rect = targetElement.getBoundingClientRect();
    picker.style.position = 'absolute';
    picker.style.bottom = `${rect.height}px`; // Above the element
    picker.style.left = '50%';
    picker.style.transform = 'translateX(-50%)';
    picker.style.zIndex = '10';

    picker.querySelectorAll('.emoji-option').forEach(option => {
        option.addEventListener('click', () => {
            const selectedEmoji = option.dataset.emoji;
            sendEmojiReaction(targetId, targetElement, selectedEmoji);
            picker.remove();
        });
    });

    // Hide picker if clicked outside
    document.addEventListener('click', (e) => {
        if (!picker.contains(e.target) && !targetElement.contains(e.target)) {
            picker.remove();
        }
    }, { once: true }); // Remove listener after first click outside
}

async function sendEmojiReaction(targetId, targetElement, emoji) {
    if (!currentUser) {
        showToast("Please log in to react.", "info");
        return;
    }

    const postRef = db.collection('posts').doc(targetId); // Assuming targetId is postId

    try {
        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists) {
                throw "Post does not exist!";
            }

            const currentReactions = postDoc.data().reactions || {}; // { emoji: count }
            const userReactions = postDoc.data().userReactions || {}; // { userId: emoji }

            // Check if user already reacted
            const existingReaction = userReactions[currentUser.uid];

            if (existingReaction && existingReaction !== emoji) {
                // User changed reaction: decrement old, increment new
                currentReactions[existingReaction] = Math.max(0, (currentReactions[existingReaction] || 0) - 1);
                currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
                userReactions[currentUser.uid] = emoji;
            } else if (!existingReaction) {
                // New reaction
                currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
                userReactions[currentUser.uid] = emoji;
            } else if (existingReaction === emoji) {
                // Same reaction clicked again, remove it
                currentReactions[emoji] = Math.max(0, (currentReactions[emoji] || 0) - 1);
                delete userReactions[currentUser.uid];
            }


            transaction.update(postRef, {
                reactions: currentReactions,
                userReactions: userReactions
            });

            updateReactionDisplay(targetElement, currentReactions);
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

    // Check user limits and coins (client-side, requires Cloud Function for security)
    const userCreditsDoc = await db.collection('userCredits').doc(currentUser.uid).get();
    const userData = userCreditsDoc.exists ? userCreditsDoc.data() : { limits: 0, coins: 0 };
    const currentLimits = userData.limits;
    const currentCoins = userData.coins;

    let requiredAds = 0;
    if (boostHours === '18') requiredAds = 1;
    if (boostHours === '24') requiredAds = 2;
    if (boostHours === '30') requiredAds = 3;

    if (currentLimits < 1 || currentCoins < 5) {
        showToast("You need 1 limit and 5 coins to upload a post. Please view ads for more.", "info");
        // Offer ad viewing for limits/coins
        viewAd(() => {
            // After ad, grant reward (Cloud Function is best)
            db.collection('userCredits').doc(currentUser.uid).update({ limits: firebase.firestore.FieldValue.increment(1), coins: firebase.firestore.FieldValue.increment(10) }) // Example: 1 limit, 10 coins for 1 ad
                .then(() => showToast("1 Limit & 10 Coins added!", "success"))
                .catch(err => console.error("Error adding rewards after ad:", err));
        });
        return;
    }

    if (requiredAds > 0) {
        showToast(`You need to view ${requiredAds} ad(s) for this boost option.`, "info");
        // Trigger ad viewing for boost, then proceed with upload
        let adsViewed = 0;
        const watchAdForBoost = () => {
            viewAd(async () => {
                adsViewed++;
                if (adsViewed < requiredAds) {
                    showToast(`View ${requiredAds - adsViewed} more ad(s).`, "info");
                    watchAdForBoost();
                } else {
                    await proceedPostUpload(imageFile, caption, boostHours);
                }
            });
        };
        watchAdForBoost();
    } else {
        await proceedPostUpload(imageFile, caption, boostHours);
    }
});

async function proceedPostUpload(imageFile, caption, boostHours) {
    try {
        showToast("Uploading post...", "info");
        const postId = db.collection('posts').doc().id;
        const imageRef = storage.ref(`post_images/${postId}_${imageFile.name}`);
        const uploadTask = imageRef.put(imageFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // Update UI with progress bar
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                showToast(`Image upload error: ${error.message}`, "error");
                console.error("Image upload error:", error);
            },
            async () => {
                const imageUrl = await imageRef.getDownloadURL();
                const expirationTime = new Date();
                expirationTime.setHours(expirationTime.getHours() + parseInt(boostHours));

                await db.collection('posts').doc(postId).set({
                    userId: currentUser.uid,
                    caption: caption,
                    imageUrl: imageUrl,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    likes: 0,
                    views: 0,
                    reactions: {}, // { emoji: count }
                    userReactions: {}, // { userId: emoji }
                    expirationTime: expirationTime, // For automatic deletion
                    boostHours: parseInt(boostHours)
                });

                // Deduct limit and coins (client-side, needs Cloud Function)
                await db.collection('userCredits').doc(currentUser.uid).update({
                    limits: firebase.firestore.FieldValue.increment(-1),
                    coins: firebase.firestore.FieldValue.increment(-5)
                });

                showToast("Post uploaded successfully!", "success");
                postImageInput.value = '';
                postCaptionInput.value = '';
                showSection('feed-section');
                loadPosts(true); // Refresh feed
            }
        );
    } catch (error) {
        showToast(`Error publishing post: ${error.message}`, "error");
        console.error("Post upload process error:", error);
    }
}


// --- Daily Reward System ---
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
        // Award daily reward
        const rewardTitle = "Daily Reward!";
        const rewardMessage = `Congratulations! You received ${dailyReward.limit} Limit, ${dailyReward.coins} Coins, and ${dailyReward.credit} Credits.`;
        showRewardPopup(rewardTitle, rewardMessage, async () => {
            try {
                // Update user's credits, limits, coins and last claimed timestamp
                await userRef.update({
                    limits: firebase.firestore.FieldValue.increment(dailyReward.limit),
                    coins: firebase.firestore.FieldValue.increment(dailyReward.coins),
                    credits: firebase.firestore.FieldValue.increment(dailyReward.credit),
                    lastClaimedDailyReward: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast("Daily reward claimed!", "success");
            } catch (error) {
                showToast(`Error claiming reward: ${error.message}`, "error");
                console.error("Error claiming daily reward:", error);
            }
        });
    } else {
        // Set countdown for next reward
        const nextClaimTime = new Date(lastClaimedTimestamp.getTime() + (24 * 60 * 60 * 1000));
        const timeLeft = nextClaimTime.getTime() - now.getTime(); // in ms
        startRewardCountdown(timeLeft);
    }
}

function showRewardPopup(title, message, claimCallback) {
    document.getElementById('reward-title').textContent = title;
    document.getElementById('reward-message').textContent = message;
    rewardPopup.classList.remove('hidden');
    rewardPopup.querySelector('.reward-content').style.animation = 'bounceIn 0.5s ease-out'; // Apply bounce animation

    claimRewardButton.onclick = () => {
        claimCallback();
        rewardPopup.classList.add('hidden');
        rewardPopup.querySelector('.reward-content').style.animation = ''; // Remove animation for next time
    };
    closeRewardPopup.onclick = () => {
        rewardPopup.classList.add('hidden');
        rewardPopup.querySelector('.reward-content').style.animation = '';
    };
}

let rewardCountdownInterval;
function startRewardCountdown(timeLeft) {
    clearInterval(rewardCountdownInterval); // Clear any existing countdown
    const giftButton = document.getElementById('gift-button');

    rewardCountdownInterval = setInterval(() => {
        timeLeft -= 1000; // Decrement by 1 second

        if (timeLeft <= 0) {
            clearInterval(rewardCountdownInterval);
            giftButton.style.animation = 'pulse 1s infinite alternate'; // Pulse animation
            giftButton.classList.add('gift-ready'); // Add class for styling
            // Optionally, trigger a notification if app is in background (requires service worker)
            if (Notification.permission === 'granted') {
                new Notification('Add Mint', { body: 'Your daily reward is ready!' });
            }
            showToast("Your daily reward is ready!", "info");
        } else {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            giftButton.textContent = `${hours}h ${minutes}m ${seconds}s`; // Display countdown
            giftButton.style.animation = 'none';
            giftButton.classList.remove('gift-ready');
        }
    }, 1000); // Update every second
}

giftButton.addEventListener('click', () => {
    // If reward is ready, claim it
    if (giftButton.classList.contains('gift-ready')) {
        checkAndAwardDailyReward(); // Re-run check to award and reset countdown
    } else {
        showToast("Daily reward not ready yet. Check back later.", "info");
    }
});


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Hide splash screen after a few seconds
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => splashScreen.classList.add('hidden'), 500); // Fade out then hide
    }, 2000); // 2-3 seconds splash

    // Ensure main app container is hidden until auth state is known
    appContainer.classList.add('hidden');
});

// For demonstration purposes, you might want to uncomment this to start without login immediately
// setTimeout(() => {
//     splashScreen.classList.add('hidden');
//     appContainer.classList.remove('hidden');
//     showSection('auth-section'); // or 'feed-section' if you mock a logged-in user
// }, 2000);
