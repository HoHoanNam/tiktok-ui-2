import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Upload.module.scss';
import { routes } from '~/config';
import { FFmpeg } from '@ffmpeg/ffmpeg'; // Import FFmpeg class

const cx = classNames.bind(styles);

// Khởi tạo FFmpeg instance
const ffmpeg = new FFmpeg();

function Upload() {
  // Khởi tạo state
  const [selectedFile, setSelectedFile] = useState(null); // File video được chọn
  const [processedFile, setProcessedFile] = useState(null); // File video đã xử lý (9:16)
  const [title, setTitle] = useState(''); // Tiêu đề video
  const [error, setError] = useState(''); // Thông báo lỗi
  const [isUploading, setIsUploading] = useState(false); // Trạng thái đang upload
  const [isProcessing, setIsProcessing] = useState(false); // Trạng thái đang xử lý
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false); // FFmpeg đã load chưa
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(true); // FFmpeg đang tải
  const [progress, setProgress] = useState(0); // Tiến độ xử lý (%)
  const videoRef = useRef(null); // Ref cho thẻ <video>
  const navigate = useNavigate(); // Hook điều hướng

  // Tải FFmpeg khi component mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setIsFFmpegLoading(true);
        if (!ffmpeg.loaded) {
          // Dùng local (single-thread)
          await ffmpeg.load({ coreURL: '/ffmpeg/dist/umd/ffmpeg-core.js' });
          // Nếu lỗi, dùng CDN:
          // await ffmpeg.load({ coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js' });
          setIsFFmpegLoaded(true);
          console.log('FFmpeg loaded successfully');
        }
      } catch (err) {
        setError(`Failed to load FFmpeg: ${err.message}. Please refresh the page.`);
        console.error('FFmpeg load error:', err);
      } finally {
        setIsFFmpegLoading(false);
      }
    };
    loadFFmpeg();
  }, []);

  // Hàm xử lý chọn file video
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng
    const allowedFormats = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedFormats.includes(file.type)) {
      setError('Only MP4, WebM, and OGG formats are supported.');
      return;
    }

    // Kiểm tra kích thước
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('File size must be less than 500MB.');
      return;
    }

    // Kiểm tra FFmpeg
    if (!isFFmpegLoaded) {
      setError('Loading FFmpeg, please wait.');
      return;
    }

    // Kiểm tra metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;

      // Kiểm tra thời lượng
      if (duration < 1 || duration > 180) {
        setError('Video duration must be between 1 second and 3 minutes.');
        return;
      }

      setSelectedFile(file);
      setError('');
      setIsProcessing(true);
      setProgress(0); // Reset tiến độ

      try {
        // Đọc file video
        const fileReader = new FileReader();
        const fileData = await new Promise((resolve) => {
          fileReader.onload = () => resolve(fileReader.result);
          fileReader.readAsArrayBuffer(file);
        });

        // Ghi file vào FFmpeg FS
        ffmpeg.writeFile('input.mp4', new Uint8Array(fileData));

        // Theo dõi tiến độ
        ffmpeg.on('progress', ({ progress }) => {
          setProgress(Math.round(progress * 100)); // Cập nhật % (0-100)
        });

        // Tính toán kích thước 9:16
        const targetAspectRatio = 9 / 16;
        let newWidth = width;
        let newHeight = height;
        let padX = 0;
        let padY = 0;

        const currentAspectRatio = width / height;
        if (Math.abs(currentAspectRatio - targetAspectRatio) > 0.01) {
          if (currentAspectRatio > targetAspectRatio) {
            newHeight = Math.round(width / targetAspectRatio);
            padY = (newHeight - height) / 2;
          } else {
            newWidth = Math.round(height * targetAspectRatio);
            padX = (newWidth - width) / 2;
          }
        }

        // Chạy FFmpeg
        await ffmpeg.exec([
          '-i',
          'input.mp4',
          '-vf',
          `pad=${newWidth}:${newHeight}:${padX}:${padY}:black`,
          '-c:a',
          'copy',
          '-q:v',
          '10', // Giảm chất lượng để tăng tốc
          'output.mp4',
        ]);

        // Lấy file xử lý
        const data = await ffmpeg.readFile('output.mp4');
        const processedBlob = new Blob([data.buffer], { type: 'video/mp4' });
        const processedFileObj = new File([processedBlob], `processed_${file.name}`, {
          type: 'video/mp4',
        });

        // Kiểm tra kích thước file xử lý
        if (processedFileObj.size > maxSize) {
          setError('Processed video size must be less than 500MB.');
          setIsProcessing(false);
          return;
        }

        setProcessedFile(processedFileObj);

        // Hiển thị preview
        if (videoRef.current) {
          videoRef.current.src = URL.createObjectURL(processedFileObj);
        }
      } catch (err) {
        setError('Failed to process video: ' + err.message);
      } finally {
        setIsProcessing(false);
        setProgress(0); // Reset tiến độ
        await ffmpeg.deleteFile('input.mp4');
        await ffmpeg.deleteFile('output.mp4');
      }
    };
    video.src = URL.createObjectURL(file);
  };

  // Hàm xử lý upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!processedFile || !title) {
      setError('Please select a video and enter a title.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('video', processedFile);

    try {
      const response = await fetch('http://localhost:5000/api/videos/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        navigate(routes.home);
      } else {
        setError(data.message || 'Upload failed.');
      }
    } catch (err) {
      setError('Something went wrong: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Render giao diện
  return (
    <div className={cx('wrapper')}>
      {/* Sidebar */}
      <div className={cx('sidebar')}>
        <ul className={cx('menu')}>
          <li>Home</li>
          <li className={cx('active')}>Posts</li>
          <li>Analytics</li>
          <li>Comments</li>
          <li>Tools</li>
          <li>Inspirations</li>
          <li>Creator Academy</li>
          <li>Untitled Sounds</li>
          <li>Effects</li>
          <li>Feedback</li>
        </ul>
        <a href="/" className={cx('back-link')}>
          Back to TikTok
        </a>
      </div>
      {/* Content */}
      <div className={cx('content')}>
        <h2>Upload Video</h2>
        <div className={cx('upload-area')}>
          {isFFmpegLoading ? (
            <p>Loading FFmpeg, please wait...</p>
          ) : selectedFile ? (
            isProcessing ? (
              <div>
                <p>Processing video...</p>
                <div className={cx('progress-bar')}>
                  <div className={cx('progress-bar-fill')} style={{ width: `${progress}%` }} />
                </div>
                <p>{progress}%</p> {/* Giữ text % để dễ theo dõi */}
              </div>
            ) : (
              <video ref={videoRef} controls className={cx('preview')} />
            )
          ) : (
            <>
              <p>Select video to upload</p>
              <p>Or drag and drop here</p>
              <button className={cx('select-btn')} disabled={!isFFmpegLoaded}>
                Select video
                <input type="file" accept="video/*" onChange={handleFileChange} />
              </button>
            </>
          )}
        </div>
        {error && <p className={cx('error')}>{error}</p>}
        {selectedFile && !isProcessing && (
          <form onSubmit={handleUpload} className={cx('form')}>
            <div className={cx('form-group')}>
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <button type="submit" className={cx('submit-btn')} disabled={isUploading || isProcessing}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        )}
        {/* Thông tin hướng dẫn */}
        <div className={cx('info')}>
          <div>
            <h4>Size and duration</h4>
            <p>Maximum size: 500MB, duration: 1 second-3 minutes.</p>
          </div>
          <div>
            <h4>File formats</h4>
            <p>MP4, WebM, OGG formats are supported.</p>
          </div>
          <div>
            <h4>Video resolutions</h4>
            <p>High resolution recommended: 1080p, 720p, 480p.</p>
          </div>
          <div>
            <h4>Aspect ratios</h4>
            <p>Any aspect ratio will be formatted to 9:16 with black bars.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
