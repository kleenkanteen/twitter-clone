import { useEffect, useState, useRef, useCallback } from "react";
import { auth, db } from "../../config/firebase";
import { Post } from "./post";
import { Loading } from "./loading";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  orderBy
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

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
  
  // console.log("home feed only");

  let followingSnapshot: any;

  const getFollowingUsers = async () => {
    const followingRef = collection(db, "following");
    const followerQuery = query(followingRef, where("FollowerUserId", "==", user?.uid));
    followingSnapshot = await getDocs(followerQuery);

    if (!followingSnapshot.empty) {
      const resolvedFollowingList = followingSnapshot.docs.map((doc: any) => {
        // console.log(`following userID ${doc.data().FollowingUserId}`);
        return doc.data().FollowingUserId;
      });
  
      setFollowingList(() => resolvedFollowingList);
    }
  }

  const getSubscribedUsersPosts = async () => {
    // console.log("subbing");
    if (!followingList || followingList.length === 0) return;
    let SubscribedPosts = query(postsRef, orderBy('createdAt', 'desc'), where("userId", "in", followingList), limit(3))
    if (lastDocPagination.current) SubscribedPosts = query(postsRef, orderBy('createdAt', 'desc'), where("userId", "in", followingList), limit(2), startAfter(lastDocPagination.current));
    snapshot = await getDocs(SubscribedPosts);
    
    if (snapshot.docs.length === 0) {
      hasMore.current = false;
    } else {
      // console.dir(snapshot.docs[0].data());
      lastDocPagination.current = snapshot.docs[snapshot.docs.length - 1];
      hasMore.current = true;
    }
  
    let newPosts = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id })) as Post[];
    // console.log('prevPostsList:', postsList);
    
    setPostsList(prevPostsList => {
      const updatedPostsList = [...(prevPostsList || []), ...newPosts];
      // console.log('updatedPostsList:', updatedPostsList);
      return updatedPostsList;
    });
    return;
  }
  
  const observerTarget: any = useRef(null);

  useEffect(() => {
    if (user) {
      getFollowingUsers(); 
  }
  }, [user]);

  useEffect(() => {
    if (followingList) {
    const observer = new IntersectionObserver(
      entries => {
        // If the target element is in view and there are more posts to load
        if (entries[0].isIntersecting && hasMore.current) {
          // console.log("intersecting");
          getSubscribedUsersPosts();
        }
      },
      { threshold: 0 } // Call the callback when the target element is fully in view
    );
  
    if (observerTarget.current) {
      observer.observe(observerTarget.current); // Start observing the target element
    }

    return () => observer.disconnect(); // Clean up the observer when the component unmounts
  }
  }, [followingList])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="posts full-height-border">
      {!postsList || (postsList.length === 0) ? 
      <div className="color-scheme main full-height-border">
        <div className="button-link height-border">
          You follow no one
        </div>
      </div>
      : null}
        {postsList && postsList?.length > 0 && postsList?.map((post) => (
          <Post post={post} key={post.id} setPostsList={setPostsList} />
        ))}
      {isLoading && <p>Loading...</p>}
      <div className="footer" id="intersect" ref={observerTarget}></div>
    </div>
  );
}