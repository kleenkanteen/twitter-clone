import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import { Post as IPost } from "./main";
import { set } from "react-hook-form";

interface Props {
  post: IPost;
  postsList: IPost[] | null;
  setPostsList: React.Dispatch<React.SetStateAction<IPost[] | null>>;
}

interface Like {
  likeId: string;
  userId: string;
}

interface Comment {
  commentId: string,
  postId: string;
  comment: string;
  name: string;
  userId: string;
}

export const Post = (props: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  const { post } = props;
  // console.log(post);
  const [postsList, setPostsList] = [props.postsList, props.setPostsList]
  const [user] = useAuthState(auth);

  const [likes, setLikes] = useState<Like[] | null>(null);

  const likesRef = collection(db, "likes");
  const likesDoc = query(likesRef, where("postId", "==", post.id));

  useEffect(() => {
    getLikes();
    getComments().then(() => setIsLoading(false));
    getFollowStatus();
  }, []);

  const getLikes = async () => {

    const data = await getDocs(likesDoc);
    setLikes(
      data.docs.map((doc) => ({ userId: doc.data().userId, likeId: doc.id }))
    );
  };
  const addLike = async () => {
    try {
      const newDoc = await addDoc(likesRef, {
        userId: user?.uid,
        postId: post.id,
      }); 
      if (user) {
        setLikes((prev) =>
          prev
            ? [...prev, { userId: user.uid, likeId: newDoc.id }]
            : [{ userId: user.uid, likeId: newDoc.id }]
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const removeLike = async () => {
    try {
      // console.log(`post id: ${post.id} user id: ${user?.uid}`)
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user?.uid)
      );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;
      // console.log(likeToDeleteData.docs[0].data());
      const likeToDelete = doc(db, "likes", likeId);
      await deleteDoc(likeToDelete);
      if (user) {
        setLikes(
          (prev) => prev && prev.filter((like) => like.likeId !== likeId)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const hasUserLiked = likes?.find((like) => like.userId === user?.uid);

  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState<string>("");


  const getComments = async () => {
    const commentsRef = collection(db, "comments");
    const commentsQuery = query(commentsRef, where("postId", "==", post.id));
    const commentsSnapshot = await getDocs(commentsQuery);
    const commentsData = commentsSnapshot.docs.map((doc) => doc.data());
    // console.log(`full doc.data() object: ${commentsData[0]}`)
    const comments = commentsData.map((commentData) => ({
      postId: commentData.postId,
      comment: commentData.comment,
      commentId: commentData.commentId,
      name: commentData.name,
      userId: commentData.userId,
    }));
    setComments(comments);
  };


  const addComment = async (postId: string, comment: string, name: string) => {
    // send a post request firebase to save comment in the comments collection
    const commentsRef = collection(db, "comments");
    try {
      const commentSnapshot = await addDoc(commentsRef, {
        postId: postId,
        comment: comment,
        name: name,
        userId: user?.uid
      });

      if (!user) return 
      // add to comments state variable
      setComments((comments) => ([
        ...comments,
        {
          postId: postId,
          comment: comment,
          commentId: commentSnapshot.id, 
          name: name,
          userId: user.uid
        }
      ]))
    }
    catch (err) {
      console.log(err)
    }
  };
  
  const deleteComment = (commentId: string) => {
    const commentsRef = collection(db, "comments");
    console.log(`db is ${db} and ${commentId}`)
    deleteDoc(doc(db, "comments", commentId));
    setComments((prev) => prev && prev.filter((thing) => thing.commentId !== commentId))
  }

  const [following, setFollowing] = useState(false);
  const followingRef = collection(db, "following");

  const getFollowStatus = async () => {
    try {
      const unfollowQuery = query(
          followingRef,
        where("FollowerUserId", "==", user?.uid),
        where("FollowingUserId", "==", post?.userId)
      );
      const unfollowSnapshot = await getDocs(unfollowQuery);
      setFollowing(!unfollowSnapshot.empty)
    }
    catch (err) {
      console.log(err)
    }
  }

  const follow = async () => {
    // get current user Id and Id of the author, send both to firebase
    try {
      // console.log(`${post.userId} AND ${user?.uid}`)
      await addDoc(followingRef,{
        FollowingUserId: post.userId,
        FollowerUserId: user?.uid
      }
      )
      setFollowing(true);
    }
    catch (err) {
      console.log(err)
    }
  }

  const unfollow = async () => {
    // get current user Id and Id of the author, send both to firebase
    try {
      const unfollowQuery = query(
        followingRef,
        where("FollowerUserId", "==", user?.uid),
        where("FollowingUserId", "==", post.userId)
      );

      const unfollowData = await getDocs(unfollowQuery);
      // console.log("UNFOLLOW DATA", unfollowData);
      const unfollowId = unfollowData.docs[0].id;
      const unfollowToDelete = doc(db, "following", unfollowId);
      await deleteDoc(unfollowToDelete);
    
      setFollowing(false);
    }

    catch (err) {
      console.log(err)
    }
  }

  const deletePost = () => {
    deleteDoc(doc(db, "posts", post.id));
    setPostsList((prev) => prev && prev.filter((thing) => thing.id !== post.id))
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main">
      <div className="title red">
        <h1> {post.title}</h1>
      </div>

      <div>
        <img className="image" src={post?.downloadURL} />
      </div>

      <div className="body">
        <p> {post.description} </p>
      </div>
      
      <div className="footer">
        <div>
          <span> @{post.username} </span>
          { post.userId !== user?.uid && <button onClick={following ? unfollow : follow}>{following ? <>Unfollow</> : <>Follow</> }</button>}
        </div>
        <div className="title likes red">
          <button onClick={hasUserLiked ? removeLike : addLike}>
            {hasUserLiked ? <>&#128078;</> : <>&#128077;</>}{" "}
          </button>
          {likes && <span> Likes: {likes?.length} </span>}
          {user?.uid === post.userId && <button onClick={deletePost}>Delete</button>}
        </div>
      </div>

      <div className="yellow">
        {comments.map((comment: Comment) => (
          <div>
            <span>{`${comment.name}: ${comment.comment}`}</span>
            <span>{comment.userId === user?.uid && <button onClick={() => deleteComment(comment.commentId)}>Delete</button>}</span>
          </div>
        ))
        }
      </div>

      {auth.currentUser &&
      <div className="comment">
        <textarea onChange={(e) => setComment(e.target.value)} placeholder="Comment..."></textarea>
        <button onClick={() => addComment(post.id, comment, auth?.currentUser?.displayName ?? "")}> Post </button>
      </div>
      }
    </div>
  );
};