import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Video.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Video() {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const controlTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/videos', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setVideos(data);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY < 0 && currentIndex > 0) {
        // Dừng video hiện tại trước khi chuyển
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
          currentVideo.pause();
          setIsPlaying(false);
          setShowTitle(true);
        }
        setCurrentIndex(currentIndex - 1);
      } else if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        // Dừng video hiện tại trước khi chuyển
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
          currentVideo.pause();
          setIsPlaying(false);
          setShowTitle(true);
        }
        setCurrentIndex(currentIndex + 1);
      }
    };

    const container = containerRef.current;
    if (container && videos.length > 0) {
      container.addEventListener('wheel', handleWheel);
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [currentIndex, videos.length]);

  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.volume = isMuted ? 0 : 1;

      // Chỉ phát video nếu isPlaying là true và currentIndex không thay đổi giữa lúc này
      if (isPlaying) {
        currentVideo.play().catch((error) => {
          console.error('Failed to play video:', error);
        });
      } else {
        currentVideo.pause();
      }

      const updateProgress = () => {
        const progressValue = (currentVideo.currentTime / currentVideo.duration) * 100;
        setProgress(progressValue);
      };

      currentVideo.addEventListener('timeupdate', updateProgress);
      return () => {
        currentVideo.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [currentIndex, isPlaying, isMuted]);

  const handleScroll = (direction) => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.pause();
      setIsPlaying(false);
      setShowTitle(true);
    }

    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDelete = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setVideos(videos.filter((video) => video._id !== videoId));
        if (currentIndex >= videos.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const handleEdit = async (videoId, newTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
      if (response.ok) {
        setVideos(videos.map((video) => (video._id === videoId ? { ...video, title: newTitle } : video)));
      }
    } catch (error) {
      console.error('Failed to edit video:', error);
    }
  };

  const togglePlay = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (isPlaying) {
      currentVideo.pause();
      setShowTitle(true);
    } else {
      currentVideo.play().catch((error) => {
        console.error('Failed to play video:', error);
      });
      setShowTitle(false);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const showTemporaryControls = () => {
    setShowControls(true);
    if (controlTimeoutRef.current) {
      clearTimeout(controlTimeoutRef.current);
    }
    controlTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 1000);
  };

  if (!videos.length) {
    return <div>No videos available.</div>;
  }

  const currentVideo = videos[currentIndex];

  return (
    <div className={cx('wrapper')} ref={containerRef}>
      <div className={cx('video-container')}>
        <div className={cx('video-wrapper')}>
          <div className={cx('video-content')}>
            <h3 className={cx('video-title', { hidden: !showTitle })}>{currentVideo.title}</h3>
            <video
              ref={(el) => (videoRefs.current[currentIndex] = el)}
              src={currentVideo.videoUrl}
              className={cx('video')}
              onClick={() => {
                togglePlay();
                showTemporaryControls();
              }}
            />
            <div className={cx('controls', { hidden: isPlaying && !showControls })}>
              <button className={cx('volume-control')} onClick={toggleMute}>
                <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
              </button>
              <button className={cx('play-pause')} onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <div className={cx('timeline-control')}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  style={{
                    borderRadius: '8px',
                    background: `linear-gradient(to right, var(--primary-color) ${progress}%, rgba(255, 255, 255, 0.5) ${progress}%)`,
                  }}
                  onChange={(e) => {
                    const time = (e.target.value / 100) * videoRefs.current[currentIndex].duration;
                    videoRefs.current[currentIndex].currentTime = time;
                    setProgress(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <div className={cx('scroll-controls')}>
            <button onClick={() => handleScroll('up')} disabled={currentIndex === 0}>
              ↑
            </button>
            <button onClick={() => handleScroll('down')} disabled={currentIndex === videos.length - 1}>
              ↓
            </button>
          </div>
        </div>
        <div className={cx('custom-controls')}>
          <button onClick={() => handleEdit(currentVideo._id, prompt('Enter new title:', currentVideo.title))}>
            Edit Title
          </button>
          <button onClick={() => handleDelete(currentVideo._id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default Video;
