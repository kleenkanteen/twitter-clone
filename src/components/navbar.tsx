import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

export const Navbar = () => {
  const [user] = useAuthState(auth);

  const signUserOut = async () => {
    await signOut(auth);
  };
  return (
    <div className="navbar">
      <div className="user"></div>
      <div className="links">
        {!user ? (
          <Link className="button-link" to="/login"> Login </Link>
        ) : (
          <>
          <Link className="button-link color-scheme" to="/homefeed"> Home Feed </Link>
          <Link className="button-link color-scheme" to="/"> All Posts </Link>
          <Link className="button-link color-scheme" to="/createpost"> Create Post </Link>
          </>
        )}
      </div>
      <div className="user">
        {user && (
          <>
            <img src={user?.photoURL || ""} width="30" height="30" />
            <p> {user?.displayName} </p>
            <button className="button-link color-scheme" onClick={signUserOut}> Log Out</button>
          </>
        )}
      </div>
    </div>
  );
};
