import { useEffect, useState, useRef, useCallback } from "react";
import { auth, db } from "../../config/firebase";
import { Post } from "./post";
import { Loading } from "./loading";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  orderBy
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import InfiniteScroll from 'react-infinite-scroller';

export interface Post {
  id: string;
  userId: string;
  title: string;
  username: string;
  description: string;
  downloadURL?: string;
}

export interface Follow {
  followingUserId: string;
}

export const HomeFeed = () => {
  const [user, isLoading] = useAuthState(auth);

  const [postsList, setPostsList] = useState<Post[] | null>(null);
  const [followingList, setFollowingList] = useState<string[] | null>(null);

  const postsRef = collection(db, "posts");
  let snapshot: any;
  const hasMore = useRef(true);
  const lastDocPagination = useRef<any>();
  
  const getFollowingList = async () => {
    console.log("home feed only");
    const followingRef = collection(db, "following");
    // console.log(`current user ID is ${user?.uid}`);
    const followerQuery = query(followingRef, where("FollowerUserId", "==", user?.uid));
    const followingSnapshot: any = await getDocs(followerQuery);

    if (!followingSnapshot.empty) {
    // console.log(`following userID ${followingsnapshot.docs[0].data().FollowingUserId}`);
      const followingPromises = await followingSnapshot.docs.map(async (doc: any) => {
      console.log(`following userID ${doc.data().FollowingUserId}`);
      return doc.data().FollowingUserId;
    });

    const resolvedFollowingList = await Promise.all(followingPromises);
    setFollowingList(await followingPromises);

    console.log(`Following list is ${resolvedFollowingList}`);
    if (!resolvedFollowingList) return;
    const SubscribedPosts = query(postsRef, orderBy('createdAt', 'desc'), where("userId", "in", resolvedFollowingList));
    snapshot = await getDocs(SubscribedPosts);
    }
  }

  const getPosts = async () => {
    console.log(`current user is ${user?.displayName} ID is ${user?.uid}`)

    if (!user) {
      console.log("home feed cannot show if not logged in");
      return;
    }

    if (snapshot?.docs) {
      if (snapshot.docs.length === 0) hasMore.current = false;
      else hasMore.current = true;
    }
    else {
      setPostsList([]);
      hasMore.current = false;
    }

    let newPosts = snapshot?.docs.map((doc: any) => ({ ...doc.data(), id: doc.id })) as Post[]

    if (!postsList) setPostsList(newPosts)
    else {
      if (newPosts) setPostsList(prevPostsList => prevPostsList && [...prevPostsList, ...newPosts])
    }
  }
  
  // const observerTarget: any = useRef(null);

  useEffect(() => {
    if (user) getFollowingList()
  }, [user]);

  useEffect(() => {
    if (followingList) getPosts()
  }, [followingList]);

  if (isLoading) {
    return <Loading />
  }

  if (!postsList || (postsList.length === 0)) {
    return (
      <div className="color-scheme main full-height-border">
        <div className="button-link height-border">
          You follow no one
        </div>
      </div>
    )
  }
 
  return (
    <div className="posts full-height-border">
      <div>hello</div>
        {postsList?.map((post) => (
          <Post post={post} key={post.id} postsList={postsList} setPostsList={setPostsList} />
        ))}
      {isLoading && <p>Loading...</p>}
      <div className="footer"></div>
    </div>
  );
}



// export const HomeFeed = () => {
//   const [user, isLoading] = useAuthState(auth);

//   const [postsList, setPostsList] = useState<Post[] | null>(null);
//   const hasMore = useRef(true);
//   const [followingList, setFollowingList] = useState<string[] | null>(null);

//   // console.log(`goign home is ${home}`);

//   const postsRef = collection(db, "posts");
//   let postsQuery: any;
//   let snapshot: any;
//   const lastDocPagination = useRef<any>();
  
//   const getPosts = async () => {
//     console.log(`current user is ${user?.displayName} ID is ${user?.uid}`)
//     if (!hasMore.current) return;

//     if (!user) {
//       console.log("home feed cannot show if not logged in");
//       return;
//     }

//     console.log("home feed only");
//     const followingRef = collection(db, "following");
//     // console.log(`current user ID is ${user?.uid}`);
//     const followerQuery = query(followingRef, where("FollowerUserId", "==", user?.uid));
//     const followingSnapshot: any = await getDocs(followerQuery);

//     if (!followingSnapshot.empty) {
//     // console.log(`following userID ${followingsnapshot.docs[0].data().FollowingUserId}`);
//       const followingPromises = await followingSnapshot.docs.map(async (doc: any) => {
//       console.log(`following userID ${doc.data().FollowingUserId}`);
//       return doc.data().FollowingUserId;
//     });

//     const resolvedFollowingList = await Promise.all(followingPromises);
//     setFollowingList(await followingPromises);

//     console.log(`Following list is ${resolvedFollowingList}`);
//     if (!resolvedFollowingList) return;
//     const SubscribedPosts = query(postsRef, where("userId", "in", resolvedFollowingList));
//     snapshot = await getDocs(SubscribedPosts);

//     }

//     };
//     if (snapshot?.docs) {
//       if (snapshot.docs.length === 0) hasMore.current = false;
//       else hasMore.current = true;
//     }
//     else {
//       setPostsList([]);
//       hasMore.current = false;
//     }

//     let newPosts = snapshot?.docs.map((doc: any) => ({ ...doc.data(), id: doc.id })) as Post[]

//     if (!postsList) setPostsList(newPosts)
//     else {
//       if (newPosts) setPostsList(prevPostsList => prevPostsList && [...prevPostsList, ...newPosts])
//     }
  
//   const observerTarget: any = useRef(null);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       if (user && hasMore.current) {
//         await getPosts();
//       }
//     };
//     fetchPosts();
//   }, [user]);

//   const [isIntersecting, setIsIntersecting] = useState(false);

//   useEffect(() => {
//     let observer: any;
//     if (postsList) {
//       observer = new IntersectionObserver(
//         ([entry]) => {
//           setIsIntersecting(entry.isIntersecting);
//         }
//       , { threshold: 0 });
  
//       // Initialize observerTarget.current with an empty div element if it's not set
//       if (!observerTarget.current) {
//         observerTarget.current = document.createElement('div');
//       }
  
//       observer.observe(observerTarget.current);
//     }
//     return () => {
//       if (observer) return observer.disconnect();
//     };
//   }, [postsList]);

//   useEffect(() => {
//     let intervalId: any;
//     if (isIntersecting && hasMore.current) {
//       console.log("intersecting")
//       intervalId = setInterval(getPosts, 750); 
//     } else {
//       clearInterval(intervalId);
//     }
//     return () => clearInterval(intervalId);
//   }, [isIntersecting, hasMore.current]);

//   if (isLoading) {
//     return <Loading />
//   }

//   if (!postsList || (postsList.length === 0)) {
//     return (
//       <div className="color-scheme main full-height-border">
//         <div className="button-link height-border">
//           You follow no one
//         </div>
//         <div className="footer" id="intersect" ref={observerTarget}></div>
//       </div>
//     )
//   }
 
//   return (
//     <div className="posts full-height-border">
//         {postsList?.map((post) => (
//           <Post post={post} key={post.id} postsList={postsList} setPostsList={setPostsList} />
//         ))}
//       {isLoading && <p>Loading...</p>}
//       <div className="footer" id="intersect" ref={observerTarget}></div>
//     </div>
//   );
// }