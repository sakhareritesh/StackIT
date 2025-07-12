# Firebase Firestore Index Setup Guide

## Issue
The application requires composite indexes for complex queries involving multiple fields. When you see an error like:
```
FirebaseError: The query requires an index. You can create it here: [URL]
```

## Solution Options

### Option 1: Automatic Index Creation (Recommended)
1. When you encounter the error, Firebase provides a direct URL to create the index
2. Click the URL in the error message
3. It will take you to the Firebase Console with the index pre-configured
4. Click "Create Index" and wait for it to build

### Option 2: Manual Index Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database → Indexes
4. Click "Create Index"
5. Add the following indexes:

#### For Notifications
- Collection: `notifications`
- Fields:
  - `userId` (Ascending)
  - `createdAt` (Descending)

#### For Questions by Author
- Collection: `questions` 
- Fields:
  - `authorId` (Ascending)
  - `createdAt` (Descending)

#### For Answers by Author
- Collection: `answers`
- Fields:
  - `authorId` (Ascending)
  - `createdAt` (Descending)

### Option 3: Use Firebase CLI
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init firestore`
4. Deploy indexes: `firebase deploy --only firestore:indexes`

## Current Status
✅ **Fixed**: The application now handles missing indexes gracefully
- Notification creation won't block answer posting
- Answer fetching uses fallback queries when indexes are missing
- Queries fallback to client-side sorting when indexes are missing  
- Users can still post answers even if notifications fail
- Answer refresh operations are non-blocking to prevent UI interruption

## Recent Updates
- ✅ Enhanced `getAnswers()` function with fallback query strategy
- ✅ Made answer refresh operations non-blocking in question detail page
- ✅ Added graceful error handling for acceptance workflow
- ✅ Updated firestore.indexes.json with the specific index causing errors

## Index Configuration File
A `firestore.indexes.json` file has been created in the project root with all required indexes. Use this with Firebase CLI for easy deployment.

## Testing
After setting up indexes:
1. Try posting an answer to a question
2. Check if notifications are created successfully
3. Verify that answers appear immediately after posting

## Note
Index creation can take a few minutes to complete, especially for collections with existing data.
