import videos from '~/assets/videos';

function Video() {
  return <video src={videos.videoUrl} style={{ width: 400 }} controls />;
}

export default Video;
