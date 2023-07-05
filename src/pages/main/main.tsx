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
  limit
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

export const Main = ({ home }: { home: boolean }) => {
  const [user, isLoading] = useAuthState(auth);

  const [postsList, setPostsList] = useState<Post[] | null>(null);
  const [followingList, setFollowingList] = useState<string[] | null>(null);

  // console.log(`goign home is ${home}`);
  
  const getPosts = async () => {
    const postsRef = collection(db, "posts");
    let data: any;
    console.log(`current user is ${user?.displayName} ID is ${user?.uid}`)

    if (!home) {
      console.log("looking for all posts");
      const postsQuery = query(postsRef, limit(10));
      data = await getDocs(postsQuery);
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
      // console.log(`following userID ${followingData.docs[0].data().FollowingUserId}`);
      const followingPromises = await followingSnapshot.docs.map(async (doc: any) => {
        console.log(`following userID ${doc.data().FollowingUserId}`);
        return doc.data().FollowingUserId;
      });

      const resolvedFollowingList = await Promise.all(followingPromises);
      setFollowingList(await followingPromises);

      console.log(`Following list is ${resolvedFollowingList}`);
      if (!resolvedFollowingList) return;
      const SubscribedPosts = query(postsRef, where("userId", "in", resolvedFollowingList));
      data = await getDocs(SubscribedPosts);
    }
    };
  
    setPostsList(
      data?.docs.map((doc: any) => ({ ...doc.data(), id: doc.id })) as Post[]
    );
  };
  
  useEffect(() => {
    if (user) getPosts();
  }, [home, user]);

  if (isLoading) {
    return <Loading/>
  }  
  return (
    <>
      {!postsList && home ? (
        <div className="color-scheme main full-height-border">
          <div className="button-link height-border">You follow no one</div>
        </div>
      ) : null}
      <div>
        {postsList?.map((post) => (
          <Post post={post} key={post.id} postsList={postsList} setPostsList={setPostsList} />
        ))
        }
      </div>
    </>
  );
}