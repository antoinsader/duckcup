import styles from "./Layout.module.scss";

const NoTabOpen = () => {

  return (
    <div className={`${styles.content} ${styles.noTabOpened}`}>
        <h1> No tab opened </h1>
    </div>
  );
};

export default NoTabOpen;
