import { useEffect, useState } from "react";
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
  startAfter
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

// home prop means if only subscribing to followed users
export const Main = ({ home }: { home: boolean }) => {
  const [user, isLoading] = useAuthState(auth);

  const [postsList, setPostsList] = useState<Post[] | null>(null);
  const [followingList, setFollowingList] = useState<string[] | null>(null);

  // console.log(`goign home is ${home}`);

  const postsRef = collection(db, "posts");
  let postsQuery: any;
  let snapshot: any;
  let lastDocPagination: any;
  
  const getPosts = async () => {
    console.log(`current user is ${user?.displayName} ID is ${user?.uid}`)

    if (!home) {
      console.log("looking for all posts");
      if (!snapshot) {
        postsQuery = query(postsRef, limit(2));
      }
      else {
        postsQuery = query(postsRef, startAfter(lastDocPagination), limit(2));
      }
      snapshot = await getDocs(postsQuery);
      lastDocPagination = snapshot.docs[snapshot.docs.length-1];
    } 
    else {
      if (!user) {
        console.log("home feed cannot show if not logged in");
        return;
      }
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
      const SubscribedPosts = query(postsRef, where("userId", "in", resolvedFollowingList));
      snapshot = await getDocs(SubscribedPosts);
    }
    };
    
    // if (!postsList) setPostsList([]);
    // let newPosts: Post[] = snapshot?.docs.map((doc: any) => ({ ...doc.data(), id: doc.id })) as Post[];
    // const updatePostsList = (prev: Post[]) => {
    //   // Perform your logic to update the state variable
    //   const addPosts = [...prev, newPosts];
    //   return addPosts;
    // };
    
    let newPosts: Post[] = snapshot?.docs.map((doc: any) => ({ ...doc.data(), id: doc.id })) as Post[]

    if (!postsList) setPostsList(newPosts)

    else {
      setPostsList([...postsList, ...newPosts])
    }
  };

  const hasMorePosts = () => !snapshot.empty;
  
  useEffect(() => {
    if (user) getPosts();
  }, [home, user]);


  if (isLoading) {
    return <Loading />
  } 
  if (!postsList && home) {
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
      <InfiniteScroll
        pageStart={0}
        loadMore={getPosts}
        hasMore={snapshot ? hasMorePosts() : false}
        loader={<Loading />}
      >
          {postsList?.map((post) => (
            <Post post={post} key={post.id} postsList={postsList} setPostsList={setPostsList} />
          ))
          }
      </InfiniteScroll>
    </div>
  );
}