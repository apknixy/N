// Initialize Firebase (Replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore(); // Firestore instance

// --- DOM Elements ---
const splashScreen = document.getElementById('splash-screen');
const mainContent = document.getElementById('main-content');
const header = document.querySelector('.app-header');
const refreshPostsIcon = document.getElementById('refresh-posts-icon');
const giftIcon = document.getElementById('gift-icon');
const giftCountdownText = document.getElementById('gift-countdown');
const rewardModal = document.getElementById('reward-modal');
const closeModalButtons = document.querySelectorAll('.close-button');
const claimRewardBtn = document.getElementById('claim-reward-btn');
const appNotification = document.getElementById('app-notification');
const notificationText = document.getElementById('notification-text');
const closeNotificationBtn = document.querySelector('.close-notification');

const footerItems = document.querySelectorAll('.app-footer .footer-item');
const contentSections = document.querySelectorAll('.content-section');

// Post elements
const uploadPostForm = document.getElementById('upload-post-form');
const postTitleInput = document.getElementById('post-title');
const postContentInput = document.getElementById('post-content');
const postImageInput = document.getElementById('post-image');
const uploadStatus = document.getElementById('upload-status');
const postsContainer = document.getElementById('posts-container');

// Message elements
const messageChatsList = document.getElementById('message-chats-list');
const chatInputArea = document.getElementById('chat-input-area');
const messageTextInput = document.getElementById('message-text');
const sendMessageBtn = document.getElementById('send-message-btn');
const messageStatus = document.getElementById('message-status');

let currentUserId = null; // Store the current authenticated user's ID
let currentChatPartnerId = null; // To keep track of who the user is currently chatting with

// --- Splash Screen Logic ---
window.addEventListener('load', () => {
    // Simulate loading time (e.g., fetching initial data, authenticating)
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        // After transition, hide it completely and show main content
        splashScreen.addEventListener('transitionend', () => {
            splashScreen.style.display = 'none';
            mainContent.style.display = 'flex'; // Show the main app
        }, { once: true });
    }, 2000); // 2 seconds delay, adjust as needed
});


// --- Firebase Authentication Listener ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUserId = user.uid;
        console.log("User is signed in:", user.email);
        // You can update UI elements here if needed (e.g., show user's name)
        fetchPosts(); // Fetch posts only if user is logged in
        checkDailyRewardStatus(); // Check reward status for logged-in user
    } else {
        currentUserId = null;
        console.log("No user is signed in.");
        // Redirect to login page or show login/signup UI
        // For this example, we'll assume a user is always logged in after splash
        // In a real app, you'd show a login screen first.
        // For testing, you might use anonymous auth or simple email/password for initial login
    }
});

// --- Navigation Logic (Footer Items) ---
footerItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetSectionId = item.dataset.section;

        // Deactivate all footer items and content sections
        footerItems.forEach(i => i.classList.remove('active'));
        contentSections.forEach(s => s.style.display = 'none');

        // Activate the clicked footer item and its corresponding section
        item.classList.add('active');
        const targetSection = document.getElementById(`${targetSectionId}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Handle header refresh icon visibility
        if (targetSectionId === 'feed') {
            refreshPostsIcon.style.display = 'block';
        } else {
            refreshPostsIcon.style.display = 'none';
        }

        // Special handling for 'messages' section
        if (targetSectionId === 'messages-list') {
            displayUserChatList();
            chatInputArea.style.display = 'none'; // Hide chat input when showing chat list
        } else if (targetSectionId === 'messages') { // If somehow directly navigated to messages
             // This might not be triggered if 'messages-list' is the main navigation point
            chatInputArea.style.display = 'flex'; // Show chat input
        }
    });
});

// Default to feed section on load
document.querySelector('.app-footer .footer-item[data-section="feed"]').click();

// --- Post Upload Logic ---
uploadPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUserId) {
        uploadStatus.classList.add('error');
        uploadStatus.textContent = 'Error: You must be logged in to upload a post.';
        return;
    }

    const title = postTitleInput.value;
    const content = postContentInput.value;
    const imageFile = postImageInput.files[0];

    uploadStatus.textContent = 'Uploading post...';
    uploadStatus.classList.remove('success', 'error');

    try {
        let imageUrl = '';
        if (imageFile) {
            // In a real app, you'd upload the image to Firebase Storage
            // For now, let's simulate a URL or skip image for simplicity
            // Example: const storageRef = firebase.storage().ref();
            // const imageRef = storageRef.child(`post_images/${imageFile.name}`);
            // await imageRef.put(imageFile);
            // imageUrl = await imageRef.getDownloadURL();
            imageUrl = 'https://via.placeholder.com/150'; // Placeholder for now
        }

        await db.collection('posts').add({
            userId: currentUserId,
            title,
            content,
            imageUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            // You can add 'adsHours' here if you want to store it with the post
            // For automatic deletion, you'd need a backend function (Cloud Function)
            // that triggers after a certain time based on this field.
            // But for now, we are skipping backend.
        });

        uploadStatus.classList.add('success');
        uploadStatus.textContent = 'Post uploaded successfully!';
        uploadPostForm.reset();
        fetchPosts(); // Refresh posts after upload
    } catch (error) {
        console.error("Error publishing post:", error);
        uploadStatus.classList.add('error');
        uploadStatus.textContent = `Error publishing post: ${error.message}`;
    }
});

// --- Fetch and Display Posts ---
async function fetchPosts() {
    postsContainer.innerHTML = '<p>Loading posts...</p>';
    try {
        // Order by timestamp to show newest first
        const snapshot = await db.collection('posts').orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            postsContainer.innerHTML = '<p>No posts available yet.</p>';
            return;
        }

        postsContainer.innerHTML = ''; // Clear previous posts
        snapshot.forEach(doc => {
            const post = doc.data();
            const postElement = document.createElement('div');
            postElement.classList.add('post-item'); // Add CSS for post-item
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" style="max-width: 100%; height: auto; border-radius: 8px;">` : ''}
                <small>Posted by ${post.userId} on ${post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'N/A'}</small>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        postsContainer.innerHTML = `<p class="error-message">Error loading posts: ${error.message}</p>`;
    }
}

// Refresh Posts button functionality
refreshPostsIcon.addEventListener('click', fetchPosts);


// --- Messaging Logic ---

// Function to display the list of users the current user has chatted with
async function displayUserChatList() {
    messageChatsList.innerHTML = '<p>Loading chats...</p>';
    if (!currentUserId) {
        messageChatsList.innerHTML = '<p>Please log in to see your messages.</p>';
        return;
    }

    try {
        // Fetch users who have sent messages to or received messages from the current user
        // This is a complex query in Firestore. A more robust solution might involve
        // a 'chats' collection where each document represents a chat between two users,
        // making it easier to query participants.
        // For simplicity, we'll fetch all messages involving the current user and
        // extract unique participants.

        const querySnapshot = await db.collection('messages')
            .where('participants', 'array-contains', currentUserId)
            .get();

        const chatPartners = new Set();
        querySnapshot.forEach(doc => {
            const message = doc.data();
            message.participants.forEach(participantId => {
                if (participantId !== currentUserId) {
                    chatPartners.add(participantId);
                }
            });
        });

        if (chatPartners.size === 0) {
            messageChatsList.innerHTML = '<p>No active chats. Start a new message!</p>';
            return;
        }

        messageChatsList.innerHTML = '';
        for (const partnerId of chatPartners) {
            // Fetch partner's profile information (e.g., name, profile picture)
            const partnerDoc = await db.collection('users').doc(partnerId).get();
            const partnerData = partnerDoc.exists ? partnerDoc.data() : { name: `User ${partnerId.substring(0, 5)}`, profilePic: 'https://via.placeholder.com/40' };

            const chatItem = document.createElement('div');
            chatItem.classList.add('message-user-item');
            chatItem.dataset.partnerId = partnerId;
            chatItem.innerHTML = `
                <img src="${partnerData.profilePic}" alt="${partnerData.name}'s profile">
                <span>${partnerData.name}</span>
            `;
            chatItem.addEventListener('click', () => {
                openChatWithUser(partnerId, partnerData.name);
            });
            messageChatsList.appendChild(chatItem);
        }

    } catch (error) {
        console.error("Error fetching chat list:", error);
        messageChatsList.innerHTML = `<p class="error-message">Error loading chats: ${error.message}</p>`;
    }
}

// Function to open a specific chat and display messages
async function openChatWithUser(partnerId, partnerName) {
    currentChatPartnerId = partnerId;
    const messagesSection = document.getElementById('messages-section');
    messagesSection.innerHTML = `
        <h3>Chat with ${partnerName}</h3>
        <div id="current-chat-messages" style="height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
            <p>Loading messages...</p>
        </div>
        <div id="chat-input-area" class="chat-input-area">
            <input type="text" id="message-text" placeholder="Type your message...">
            <button id="send-message-btn">Send</button>
        </div>
        <div id="message-status" class="status-message"></div>
    `;

    // Re-attach event listener to the new send button
    document.getElementById('send-message-btn').onclick = sendMessage;

    // Listen for real-time messages
    const chatMessagesContainer = document.getElementById('current-chat-messages');
    const participants = [currentUserId, partnerId].sort(); // Ensure consistent order for querying

    db.collection('messages')
        .where('participants', 'array-contains-any', participants) // This condition might need refinement if you only want messages between these two
        .orderBy('timestamp')
        .onSnapshot(snapshot => {
            chatMessagesContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const message = doc.data();
                // Filter messages to ensure they are specifically between the current user and the partner
                if ((message.senderId === currentUserId && message.receiverId === partnerId) ||
                    (message.senderId === partnerId && message.receiverId === currentUserId)) {
                    const messageElement = document.createElement('p');
                    messageElement.textContent = `${message.senderId === currentUserId ? 'You' : partnerName}: ${message.text}`;
                    messageElement.style.textAlign = message.senderId === currentUserId ? 'right' : 'left';
                    chatMessagesContainer.appendChild(messageElement);
                }
            });
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
        }, error => {
            console.error("Error getting real-time messages:", error);
            chatMessagesContainer.innerHTML = `<p class="error-message">Error loading messages: ${error.message}</p>`;
        });
}


// Function to send a message
async function sendMessage() {
    if (!currentUserId || !currentChatPartnerId) {
        messageStatus.classList.add('error');
        messageStatus.textContent = 'Error: Cannot send message. Select a chat or log in.';
        return;
    }

    const messageText = messageTextInput.value.trim();
    if (!messageText) {
        return; // Don't send empty messages
    }

    messageStatus.textContent = 'Sending message...';
    messageStatus.classList.remove('success', 'error');

    try {
        await db.collection('messages').add({
            senderId: currentUserId,
            receiverId: currentChatPartnerId,
            text: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            participants: [currentUserId, currentChatPartnerId].sort() // For easier querying
        });

        messageTextInput.value = ''; // Clear input
        messageStatus.classList.add('success');
        messageStatus.textContent = 'Message sent!';
        // The real-time listener will update the chat display
    } catch (error) {
        console.error("Error sending message:", error);
        messageStatus.classList.add('error');
        messageStatus.textContent = `Error sending message: ${error.message}`;
    }
}


// --- Daily Reward Logic ---
const DAILY_REWARD_KEY = 'lastDailyRewardClaim';
const REWARD_COINS = 10;
const REWARD_CREDITS = 10;
const REWARD_LIMITS = 2; // Assuming "limits" is a quantifiable reward

// Function to check daily reward status
async function checkDailyRewardStatus() {
    if (!currentUserId) return;

    try {
        const userRewardDocRef = db.collection('userRewards').doc(currentUserId);
        const doc = await userRewardDocRef.get();

        if (doc.exists) {
            const data = doc.data();
            const lastClaimTime = data.lastClaimTimestamp ? data.lastClaimTimestamp.toDate() : null;
            const now = new Date();

            if (lastClaimTime) {
                const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                const nextClaimTime = new Date(lastClaimTime.getTime() + twentyFourHours);

                if (now < nextClaimTime) {
                    // Still in cooldown
                    giftIcon.classList.remove('gift-pulsing'); // Stop pulsing
                    updateGiftCountdown(nextClaimTime);
                    setInterval(() => updateGiftCountdown(nextClaimTime), 1000); // Update every second
                } else {
                    // Ready to claim
                    giftIcon.classList.add('gift-pulsing'); // Start pulsing
                    giftCountdownText.style.display = 'none';
                    showNotification('Your daily reward is ready to claim!');
                    // Trigger animation on app open if gift is ready
                }
            } else {
                // Never claimed before
                giftIcon.classList.add('gift-pulsing');
                giftCountdownText.style.display = 'none';
                showNotification('Claim your first daily reward!');
            }
        } else {
            // No record, first time user or data missing
            await userRewardDocRef.set({ lastClaimTimestamp: null, coins: 0, credits: 0, limits: 0 }); // Initialize
            giftIcon.classList.add('gift-pulsing');
            giftCountdownText.style.display = 'none';
            showNotification('Claim your first daily reward!');
        }
    } catch (error) {
        console.error("Error checking daily reward status:", error);
    }
}

// Function to update countdown
function updateGiftCountdown(nextClaimTime) {
    const now = new Date();
    const timeLeft = nextClaimTime.getTime() - now.getTime();

    if (timeLeft <= 0) {
        giftCountdownText.style.display = 'none';
        giftIcon.classList.add('gift-pulsing');
        showNotification('Your daily reward is ready!');
        clearInterval(this); // Stop the interval
        return;
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    giftCountdownText.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    giftCountdownText.style.display = 'inline';
}

// Event listener for gift icon click
giftIcon.addEventListener('click', () => {
    // Only show modal if reward is available to claim (pulsing)
    if (giftIcon.classList.contains('gift-pulsing')) {
        rewardModal.style.display = 'flex';
    } else {
        showNotification('Daily reward is on cooldown. Check back later!', 'info');
    }
});

// Close modal functionality
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        rewardModal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target == rewardModal) {
        rewardModal.style.display = 'none';
    }
});

// Claim reward button functionality
claimRewardBtn.addEventListener('click', async () => {
    if (!currentUserId) {
        showNotification('Please log in to claim rewards.', 'error');
        rewardModal.style.display = 'none';
        return;
    }

    try {
        const userRewardDocRef = db.collection('userRewards').doc(currentUserId);
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(userRewardDocRef);
            let currentCoins = 0;
            let currentCredits = 0;
            let currentLimits = 0;
            let lastClaimTimestamp = null;

            if (doc.exists) {
                const data = doc.data();
                currentCoins = data.coins || 0;
                currentCredits = data.credits || 0;
                currentLimits = data.limits || 0;
                lastClaimTimestamp = data.lastClaimTimestamp ? data.lastClaimTimestamp.toDate() : null;
            }

            const now = new Date();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (lastClaimTimestamp && (now.getTime() - lastClaimTimestamp.getTime() < twentyFourHours)) {
                throw new Error('Daily reward already claimed. Come back in 24 hours!');
            }

            // Update rewards
            const newCoins = currentCoins + REWARD_COINS;
            const newCredits = currentCredits + REWARD_CREDITS;
            const newLimits = currentLimits + REWARD_LIMITS;

            transaction.set(userRewardDocRef, {
                lastClaimTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
                coins: newCoins,
                credits: newCredits,
                limits: newLimits
            }, { merge: true }); // Use merge to avoid overwriting other fields

            console.log('Reward claimed:', { coins: newCoins, credits: newCredits, limits: newLimits });
            showNotification('Reward claimed successfully! Check your profile.', 'success');
            rewardModal.style.display = 'none';
            checkDailyRewardStatus(); // Update UI after claiming
        });
    } catch (error) {
        console.error("Error claiming reward:", error);
        showNotification(`Error claiming reward: ${error.message}`, 'error');
        rewardModal.style.display = 'none';
    }
});

// --- Notification System ---
function showNotification(message, type = 'default', duration = 5000) {
    notificationText.textContent = message;
    appNotification.className = 'app-notification'; // Reset classes
    if (type === 'success') {
        appNotification.classList.add('success-notification');
    } else if (type === 'error') {
        appNotification.classList.add('error-notification');
    } else if (type === 'info') {
        appNotification.classList.add('info-notification');
    }
    appNotification.style.display = 'flex';

    setTimeout(() => {
        appNotification.style.display = 'none';
    }, duration);
}

closeNotificationBtn.addEventListener('click', () => {
    appNotification.style.display = 'none';
});


// --- Placeholder for User Profile (You'll need a 'users' collection in Firestore) ---
// When a user signs up, you'd create a document in 'users' collection for them
// db.collection('users').doc(user.uid).set({ name: user.displayName || 'New User', profilePic: 'default.png' });

// Simulated function for post expiry alert (requires backend for real-time check)
function checkPostExpiryAndAlert() {
    // This function would ideally run on a backend (e.g., Firebase Cloud Function)
    // that periodically checks post expiry dates from Firestore.
    // When a post is nearing expiry, it would trigger a notification (e.g., via FCM)
    // to the user.
    // For a frontend-only solution, you could fetch all user's posts on app load
    // and check their expiry dates, then show an alert if any are close.
    // This is less reliable as it depends on the user opening the app.

    // Example of a client-side alert (not robust for all users)
    const mockPostExpiryDate = new Date();
    mockPostExpiryDate.setMinutes(mockPostExpiryDate.getMinutes() + 5); // 5 minutes from now

    // If a post is about to expire, show alert
    if (currentUserId && new Date().getTime() > mockPostExpiryDate.getTime() - (10 * 60 * 1000)) { // If within 10 mins of expiry
        // showNotification('One of your posts is expiring soon!', 'info');
    }

    // New post notification (would also come from backend or real-time listener on posts)
    // showNotification('There are new posts available! Check your feed.', 'info');
}

// Call these check functions periodically or on relevant events
setInterval(checkPostExpiryAndAlert, 60 * 1000); // Check every minute (client-side)
