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

export const AllFeed = () => {
  const [user, isLoading] = useAuthState(auth);

  const [postsList, setPostsList] = useState<Post[] | null>(null);
  const hasMore = useRef(true);
  const [followingList, setFollowingList] = useState<string[] | null>(null);

  // console.log(`goign home is ${home}`);

  const postsRef = collection(db, "posts");
  let postsQuery: any;
  let snapshot: any;
  const lastDocPagination = useRef<any>();
  
  const getPosts = async () => {
    console.log(`current user is ${user?.displayName} ID is ${user?.uid}`)
    console.log("looking for all posts");
    if (!lastDocPagination.current) {
      console.log("snapshot empty, initial page load")
      postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(3));
    }
    else {
      console.log("get next 3 elements")
      postsQuery = query(postsRef, orderBy('createdAt', 'desc'), startAfter(lastDocPagination.current), limit(3));
    }
    snapshot = await getDocs(postsQuery);
    lastDocPagination.current = snapshot.docs[snapshot.docs.length-1];
  
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
  
  const observerTarget: any = useRef(null);

  useEffect(() => {
    hasMore.current = true;
    const fetchPosts = async () => {
      if (user && hasMore.current) {
        await getPosts();
      }
    };
  
    fetchPosts();
  }, [user]);

  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (postsList) {
      let observer: any;
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);
        }
      , { threshold: 0 });
  
      // Initialize observerTarget.current with an empty div element if it's not set
      if (!observerTarget.current) {
        observerTarget.current = document.createElement('div');
      }
  
      observer.observe(observerTarget.current);
      return () => {
        if (observer) return observer.disconnect();
      };
    }
  }, [postsList]);

  useEffect(() => {
    if (isIntersecting && hasMore.current) {
      getPosts();
    }
  }, [isIntersecting, hasMore.current]);

  if (isLoading) {
    return <Loading />
  }
 
  return (
    <div className="posts full-height-border">
        {postsList?.map((post) => (
          <Post post={post} key={post.id} postsList={postsList} setPostsList={setPostsList} />
        ))}
      {isLoading && <p>Loading...</p>}
      <div className="footer" id="intersect" ref={observerTarget}></div>
    </div>
  );
}