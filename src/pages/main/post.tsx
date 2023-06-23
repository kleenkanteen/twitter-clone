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
}

interface Like {
  likeId: string;
  userId: string;
}

interface Comment {
  postId: string;
  comment: string;
  name: string;
}

export const Post = (props: Props) => {
  const { post } = props;
  console.log(post);
  const [user] = useAuthState(auth);

  const [likes, setLikes] = useState<Like[] | null>(null);

  const likesRef = collection(db, "likes");
  const likesDoc = query(likesRef, where("postId", "==", post.id));

  useEffect(() => {
    getLikes();
    getComments();
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
      console.log(`post id: ${post.id} user id: ${user?.uid}`)
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user?.uid)
      );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;
      console.log(likeToDeleteData.docs[0].data());
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

  const commentsRef = collection(db, "comments");
  const commentsDoc = query(commentsRef, where("postId", "==", post.id));

  const getComments = async () => {
    const commentsQuery = query(commentsRef, where("postId", "==", post.id));
    const commentsSnapshot = await getDocs(commentsQuery);
    const commentsData = commentsSnapshot.docs.map((doc) => doc.data());
    console.log(`full doc.data() object: ${commentsData[0]}`)
    const comments = commentsData.map((commentData) => ({
      postId: commentData.postId,
      comment: commentData.comment,
      name: commentData.name
    }));
    setComments(comments);
  };


  // add useeffect hook to rerender comments component
  // create separate comments component



  const addComment = async (postId: string, comment: string, name: string) => {
    // send a post request firebase to save comment in the comments collection
    try {
    await addDoc(commentsRef, {
      postId: postId,
      comment: comment,
      name: name
    });
    // add to comments state variable
    setComments((comments) => ([
      ...comments,
      {
        postId: postId,
        comment: comment,
        name: name
      }
    ]))
  }
  catch (err) {
    console.log(err)
  }
  };


  return (
    <div className="main">
      <div className="title">
        <h1> {post.title}</h1>
      </div>

      <div>
        <img className="image" src={post?.downloadURL} />
      </div>

      <div className="body">
        <p> {post.description} </p>
      </div>
      
      <div className="footer">
        <p> @{post.username} </p>
        <button onClick={hasUserLiked ? removeLike : addLike}>
          {hasUserLiked ? <>&#128078;</> : <>&#128077;</>}{" "}
        </button>
        {likes && <p> Likes: {likes?.length} </p>}
      </div>

      <div>
        {comments?.map((comment: Comment) => (
          <div>{`${comment.name}: ${comment.comment}`}</div>
        ))
        }
      </div>

      {auth &&
      <div className="comment">
        <textarea onChange={(e) => setComment(e.target.value)} placeholder="Comment..."></textarea>
        <button onClick={() => addComment(post.id, comment, auth?.currentUser?.displayName ?? "")}> Post </button>
      </div>
      }
    </div>
  );
};