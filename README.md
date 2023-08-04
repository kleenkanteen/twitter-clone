# Overview

Started this site off of a react course on youtube. Excellent teaching from a guy the same age as me.

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

# Deploy Instructions

The course playlist has a video that shows how to create a Firebase project. The services you will use are: a Firestore database, authentication, and storage. The database security rules is this:

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
