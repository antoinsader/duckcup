
import styles from "../../../components/page_components/RowDetailsPopup.module.scss"
const get_media_kind = (mime_type) => {
  const normalized_mime = String(mime_type || "").toLowerCase();
  if (!normalized_mime) return "unknown";
  if (normalized_mime.startsWith("image/")) return "image";
  if (normalized_mime.startsWith("video/")) return "video";
  if (normalized_mime.startsWith("audio/")) return "audio";
  return "unknown";
};

export default function MessageMediaPreview({
  is_loading,
  error_value,
  media_url,
  mime_type,
  file_name,
  has_attempted,
}) {
  const media_kind = get_media_kind(mime_type);

  if (is_loading) {
    return (
      <div className={styles.media_section}>
        <span className={styles.meta_label}>Media</span>
        <div className={styles.media_empty}>Loading media...</div>
      </div>
    );
  }

  if (error_value) {
    return (
      <div className={styles.media_section}>
        <span className={styles.meta_label}>Media</span>
        <div className={styles.media_error}>{error_value}</div>
      </div>
    );
  }

  if (!has_attempted) return null;

  if (!media_url) {
    return (
      <div className={styles.media_section}>
        <span className={styles.meta_label}>Media</span>
        <div className={styles.media_empty}>No media found for this message.</div>
      </div>
    );
  }

  return (
    <div className={styles.media_section}>
      <span className={styles.meta_label}>Media</span>
      <div className={styles.media_container}>
        {media_kind === "image" && (
          <img src={media_url} alt={file_name || "message media"} className={styles.media_image} />
        )}

        {media_kind === "video" && (
          <video controls className={styles.media_video}>
            <source src={media_url} type={mime_type} />
            Your browser cannot play this video.
          </video>
        )}

        {media_kind === "audio" && (
          <audio controls className={styles.media_audio}>
            <source src={media_url} type={mime_type} />
            Your browser cannot play this audio.
          </audio>
        )}

        {media_kind === "unknown" && (
          <div className={styles.media_empty}>
            Unsupported media type: {mime_type || "unknown"}
          </div>
        )}
      </div>
    </div>
  );
}