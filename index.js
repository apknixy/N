// In your Cloud Functions index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.uploadPostSecurely = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to upload a post.');
    }

    const userId = context.auth.uid;
    const { caption, imageUrl, boostHours } = data; // imageUrl would be a pre-uploaded public URL from Storage, or you handle upload in CF
    const requiredCoins = 5;
    const requiredLimit = 1;

    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    const userData = userDoc.data();
    if (userData.coins < requiredCoins || userData.limits < requiredLimit) {
        throw new functions.https.HttpsError('failed-precondition', 'Insufficient coins or post limit.');
    }

    // Deduct coins and limit
    await userRef.update({
        coins: admin.firestore.FieldValue.increment(-requiredCoins),
        limits: admin.firestore.FieldValue.increment(-requiredLimit),
    });

    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + parseInt(boostHours));

    // Create the post
    await admin.firestore().collection('posts').add({
        userId: userId,
        caption: caption,
        imageUrl: imageUrl, // Assumes imageUrl is already a public URL or handled here
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        likes: 0,
        views: 0,
        reactions: {},
        userReactions: {},
        expirationTime: expirationTime,
        boostHours: parseInt(boostHours)
    });

    return { success: true, message: 'Post uploaded successfully!' };
});

// Similar functions for `sendMessageSecurely`, `claimDailyRewardSecurely`, `grantAdRewardSecurely` etc.
// For auto-deletion of posts/messages, use scheduled functions (Cloud Scheduler)
exports.deleteExpiredPosts = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expiredPosts = await admin.firestore().collection('posts')
        .where('expirationTime', '<=', now)
        .get();

    const batch = admin.firestore().batch();
    expiredPosts.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Deleted ${expiredPosts.size} expired posts.`);
});

// Add similar scheduled function for deleting 12-hour old messages.
