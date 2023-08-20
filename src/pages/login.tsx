import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, provider);
    navigate("/");
  };

  return (
    <div>
      <button onClick={signInWithGoogle} className="color-scheme button-link height-border cursor"> Sign In With Google To Continue </button>
    </div>
  );
};
