import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { doc, addDoc, collection, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, getDownloadURL, uploadBytesResumable} from "firebase/storage"

interface CreateFormData {
  title: string;
  description: string;
  file: FileList;
}

export const CreateForm = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const schema = yup.object().shape({
    title: yup.string().required("You must add a title."),
    description: yup.string().required("You must add a description."),
    file: yup.mixed().test('fileSize', 'The file is over 5MB', (value) => {
      if (!value?.length) return true; // file is optional
      return value[0].size <= 5000000; // maximum file size is 2MB
    })
    .test('fileType', 'The file must be an image.', (value) => {
      if (!value?.length) return true; // file is optional
      const fileType = value[0].type;
      return fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/jpg' || fileType === 'image/webp';
    })
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: yupResolver(schema),
  });

  const postsRef = collection(db, "posts");

  const uploadFileToStorage = async (file: File) => {
    const storage = getStorage();
  
    const today = new Date();
    const dateTime = today.getDate() + "-" + today.getHours() + ":" + today.getMinutes();
  
    const storageRef = ref(storage, `files/${file.name} ${dateTime}`);
    const metadata = {
      contentType: file.type,
    };
  
    await uploadBytesResumable(storageRef, file, metadata);
  
    return await getDownloadURL(storageRef);
  };

  const onCreatePost = async (data: CreateFormData) => {
    const {file, ...rest } = data;
    let url = "";
  
    if (file?.length > 0) {
      url = await uploadFileToStorage(file[0]);
    }
  
    const postSnapshot = await addDoc(postsRef, {
      ...rest,
      downloadURL: url,
      username: user?.displayName,
      userId: user?.uid,
    });

    const postId = postSnapshot.id;
    const postDocRef = doc(postsRef, postId);
    await updateDoc(postDocRef, { postId: postId });
  
    navigate("/");
  };
  

  return (
    <div className="main color-scheme full-height-border flexbox-centered">
      <form onSubmit={handleSubmit(onCreatePost)}>
        <input placeholder="Title..." {...register("title")} />
        <p style={{ color: "red" }}> {errors.title?.message}</p>
        <textarea placeholder="Description..." {...register("description")} />
        <p style={{ color: "red" }}> {errors.description?.message}</p>
        <span className="label">Add image (optional):</span>
        <label htmlFor="file-input" className="button-link">Choose File</label>
        <input type="file" id="file-input" {...register("file")} />
        <p style={{ color: "red" }}> {errors.file?.message}</p>
        <input type="submit" className="submitForm button-link" />
      </form>
    </div>
  );
};
