import { useNavigate } from "react-router-dom";
import Button from "../reusable/Button/Button";
import styles from "./Layout.module.scss";

const NeedToLoginPage = () => {
  const navigate = useNavigate();
  const go_login = () => {
    navigate("/login");
  };

  return (
    <div className={`${styles.need_to_login} ${styles.content} `}>
      <h1> You need to login to access this page </h1>
      <Button variant="secondary" onClick={go_login}>
        Login{" "}
      </Button>
    </div>
  );
};

export default NeedToLoginPage;
