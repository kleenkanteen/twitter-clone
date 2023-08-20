# Overview

Started this project off of a react course on youtube. Excellent teaching from a guy the same age as me.

Course playlist: [https://www.youtube.com/watch?v=jUBc7K9XCcU&list=PLpPqplz6dKxW5ZfERUPoYTtNUNvrEebAR&index=1](https://www.youtube.com/watch?v=U2Wltnv-doo&list=PLpPqplz6dKxW5ZfERUPoYTtNUNvrEebAR&index=1)

Features the author created:
- Logging in with google
- Creating a post
- Viewing all posts

Features I added:
- Ability to add images to posts
- Commenting
- Ability to delete posts and comments
- Follow other users
- Home feed to see posts of followed users
- Loading sign on page load
- Infinite scroll using pagination 

Touch ups I did:
- Nice looking icons with react-icons
- Nice looking website with a blue and white theme
- Centered navbar

What I learned:
- That react state updates are asynchronous which can be a problem if you want to read a state right after updating it
- How much of a pain pagination is using the intersection observer api and how little info exist online on it for react + firebase
- SQL is better than noSQL for most data, which is probably relational

# Deploy Instructions

The course playlist has a video that shows how to create a Firebase project. The services you will use are: a Firestore database, authentication, and storage. After setting up these services in the firebase console, in the terminal run `npm run build` then `firebase deploy` to upload the project to firebase hosting.


Database security rules:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write, update: if request != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /comments/{commentId} {
      allow write, update: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /following/{followingId} {
      allow write: if request.auth != null && request.resource.data.FollowerUserId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.FollowerUserId == request.auth.uid;
    }
  }
}
```

Storage security rules:

```
rules_version = '2';

// Craft rules based on data in your Firestore database
// allow write: if firestore.get(
//    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow write: if request.resource.size < 5 * 1024 * 1024 && request.auth != null;
    }
  }
}
```
