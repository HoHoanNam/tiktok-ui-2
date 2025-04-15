import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Video.module.scss';

const cx = classNames.bind(styles);

function Video() {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);

  // Lấy danh sách video từ backend
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
          setVideos(data); // Lưu danh sách video (mới nhất ở đầu)
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      }
    };

    fetchVideos();
  }, []);

  // Xử lý cuộn lên/xuống
  const handleScroll = (direction) => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Xử lý xóa video
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

  // Xử lý chỉnh sửa tiêu đề
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

  if (!videos.length) {
    return <div>No videos available.</div>;
  }

  const currentVideo = videos[currentIndex];

  return (
    <div className={cx('wrapper')}>
      <div className={cx('video-container')}>
        <h3 className={cx('video-title')}>{currentVideo.title}</h3>
        <video
          ref={(el) => (videoRefs.current[currentIndex] = el)}
          src={currentVideo.videoUrl}
          className={cx('video')}
          controls
          controlsList="nodownload"
        />
        <div className={cx('custom-controls')}>
          <button onClick={() => handleScroll('up')} disabled={currentIndex === 0}>
            Previous
          </button>
          <button onClick={() => handleScroll('down')} disabled={currentIndex === videos.length - 1}>
            Next
          </button>
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
