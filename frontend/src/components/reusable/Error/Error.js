import "./Error.scss";


export default function ErrorComp({error}) {
  return error && error !== '' && (
    <div className="error_root error_note">
        <p> {error} </p>
    </div>
  );
}

