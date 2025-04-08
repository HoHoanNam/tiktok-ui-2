import { Fragment } from 'react';
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from '~/routes';
import DefaultLayout from '~/layouts';
import './App.css'; // Hoặc dùng CSS module nếu bạn muốn

function App() {
  const contentRef = useRef(null);
  const thumbRef = useRef(null);

  // Cập nhật thanh cuộn
  const updateScrollbar = () => {
    const content = contentRef.current;
    const thumb = thumbRef.current;
    if (!content || !thumb) return;

    const contentHeight = content.scrollHeight;
    const viewportHeight = content.clientHeight;
    const thumbHeight = (viewportHeight / contentHeight) * viewportHeight;
    thumb.style.height = `${thumbHeight}px`;

    const scrollTop = content.scrollTop;
    const maxScroll = contentHeight - viewportHeight;
    const thumbTop = (scrollTop / maxScroll) * (viewportHeight - thumbHeight);
    thumb.style.top = `${thumbTop}px`;
  };

  // Xử lý kéo thanh cuộn
  const handleMouseDown = (e) => {
    const thumb = thumbRef.current;
    const content = contentRef.current;
    let startY = e.clientY;
    let startTop = parseFloat(thumb.style.top) || 0;

    const onMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      const viewportHeight = content.clientHeight;
      const thumbHeight = thumb.offsetHeight;
      const maxTop = viewportHeight - thumbHeight;
      let newTop = startTop + deltaY;
      newTop = Math.max(0, Math.min(newTop, maxTop));

      thumb.style.top = `${newTop}px`;

      const contentHeight = content.scrollHeight;
      const maxScroll = contentHeight - viewportHeight;
      const scrollRatio = newTop / (viewportHeight - thumbHeight);
      content.scrollTop = scrollRatio * maxScroll;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    e.preventDefault();
  };

  // Đồng bộ khi cuộn hoặc resize
  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', updateScrollbar);
      window.addEventListener('resize', updateScrollbar);
      updateScrollbar(); // Cập nhật lần đầu

      return () => {
        content.removeEventListener('scroll', updateScrollbar);
        window.removeEventListener('resize', updateScrollbar);
      };
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <div className="content-wrapper" ref={contentRef}>
          <Routes>
            {publicRoutes.map((route, index) => {
              const Page = route.component;

              let Layout = DefaultLayout;
              if (route.layout) {
                Layout = route.layout;
              } else if (route.layout === null) {
                Layout = Fragment;
              }

              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}
          </Routes>
        </div>
        <div className="custom-scrollbar">
          <div className="scrollbar-thumb" ref={thumbRef} onMouseDown={handleMouseDown} />
        </div>
      </div>
    </Router>
  );
}

export default App;
