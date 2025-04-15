import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Upload.module.scss';
import { routes } from '~/config';

const cx = classNames.bind(styles);

function Upload() {
  // Khởi tạo state để lưu file video được chọn, tiêu đề, lỗi, và trạng thái uploading
  const [selectedFile, setSelectedFile] = useState(null); // Lưu file video được chọn
  const [title, setTitle] = useState(''); // Lưu tiêu đề video
  const [error, setError] = useState(''); // Lưu thông báo lỗi (nếu có)
  const [isUploading, setIsUploading] = useState(false); // Trạng thái đang upload hay không
  const videoRef = useRef(null); // Ref để gắn vào thẻ <video> hiển thị preview
  const navigate = useNavigate(); // Hook để điều hướng sau khi upload thành công

  // Hàm xử lý khi người dùng chọn file video
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Lấy file đầu tiên từ input
    if (!file) return; // Nếu không có file, thoát

    // Kiểm tra định dạng file (chỉ cho phép MP4, WebM, OGG)
    const allowedFormats = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedFormats.includes(file.type)) {
      setError('Only MP4, WebM, and OGG formats are supported.');
      return;
    }

    // Kiểm tra kích thước file (giới hạn 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('File size must be less than 500MB.');
      return;
    }

    // Tạo một thẻ <video> tạm để kiểm tra metadata (thời lượng, tỷ lệ khung hình)
    const video = document.createElement('video');
    video.preload = 'metadata'; // Chỉ tải metadata để kiểm tra, không tải toàn bộ video
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src); // Giải phóng URL tạm sau khi dùng xong
      const duration = video.duration; // Lấy thời lượng video (giây)
      const width = video.videoWidth; // Lấy chiều rộng video
      const height = video.videoHeight; // Lấy chiều cao video

      // Kiểm tra thời lượng video (phải từ 1 giây đến 3 phút)
      if (duration < 1 || duration > 180) {
        setError('Video duration must be between 1 and 3 minutes.');
        return;
      }

      // Kiểm tra tỷ lệ khung hình (phải gần 9:16 - dọc)
      const aspectRatio = width / height;
      if (Math.abs(aspectRatio - 9 / 16) > 0.1) {
        setError('Video aspect ratio must be approximately 9:16.');
        return;
      }

      // Nếu tất cả kiểm tra đều pass, lưu file và hiển thị preview
      setSelectedFile(file); // Lưu file vào state
      setError(''); // Xóa thông báo lỗi
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file); // Hiển thị preview video
      }
    };
    video.src = URL.createObjectURL(file); // Tạo URL tạm để đọc metadata
  };

  // Hàm xử lý khi người dùng click nút Upload
  const handleUpload = async (e) => {
    e.preventDefault(); // Ngăn form submit mặc định
    if (!selectedFile || !title) {
      setError('Please select a video and enter a title.'); // Kiểm tra xem đã chọn file và nhập title chưa
      return;
    }

    setIsUploading(true); // Bật trạng thái đang upload (vô hiệu hóa nút Upload)
    const formData = new FormData(); // Tạo FormData để gửi dữ liệu lên backend
    formData.append('title', title); // Thêm field title
    formData.append('video', selectedFile); // Thêm field video (file thật)

    try {
      // Gửi request POST đến backend để upload video
      const response = await fetch('http://localhost:5000/api/videos/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Gửi token để xác thực
        },
        body: formData, // Gửi FormData (chứa title và video file)
      });

      const data = await response.json(); // Parse response từ backend
      if (response.ok) {
        navigate(routes.home); // Nếu upload thành công, điều hướng về trang chủ
      } else {
        setError(data.message || 'Upload failed.'); // Nếu lỗi, hiển thị thông báo từ backend
      }
    } catch (err) {
      setError('Something went wrong: ' + err.message); // Nếu có lỗi mạng hoặc khác, hiển thị thông báo
    } finally {
      setIsUploading(false); // Tắt trạng thái uploading (bật lại nút Upload)
    }
  };

  // Render giao diện
  return (
    <div className={cx('wrapper')}>
      {/* Sidebar bên trái */}
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
      {/* Khu vực chính (upload video) */}
      <div className={cx('content')}>
        <h2>Upload Video</h2>
        <div className={cx('upload-area')}>
          {selectedFile ? (
            <video ref={videoRef} controls className={cx('preview')} /> // Hiển thị preview video nếu đã chọn file
          ) : (
            <>
              <p>Select video to upload</p>
              <p>Or drag and drop here</p>
              <button className={cx('select-btn')}>
                Select video
                <input type="file" accept="video/*" onChange={handleFileChange} /> {/* Input để chọn file */}
              </button>
            </>
          )}
        </div>
        {error && <p className={cx('error')}>{error}</p>} {/* Hiển thị thông báo lỗi nếu có */}
        {selectedFile && ( // Hiển thị form nhập tiêu đề và nút Upload nếu đã chọn file
          <form onSubmit={handleUpload} className={cx('form')}>
            <div className={cx('form-group')}>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)} // Cập nhật tiêu đề
                required
              />
            </div>
            <button type="submit" className={cx('submit-btn')} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'} {/* Nút Upload, thay đổi text khi đang upload */}
            </button>
          </form>
        )}
        {/* Thông tin hướng dẫn */}
        <div className={cx('info')}>
          <div>
            <h4>Size and duration</h4>
            <p>Maximum size: 500MB, duration: 1-3 minutes.</p>
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
            <p>16:9 for landscape, 9:16 for vertical.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
