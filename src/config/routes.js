// Layouts
import { HeaderOnly } from '~/layouts';

// Pages
import Home from '~/pages/Home';
import Live from '~/pages/Live';
import Search from '~/pages/Search';
import Upload from '~/pages/Upload';
import Profile from '~/pages/Profile';
import Following from '~/pages/Following';
import Login from '~/pages/Login';
import Register from '~/pages/Register';

// Định nghĩa routes
export const routes = {
  home: '/',
  live: '/live',
  search: '/search',
  upload: '/upload',
  following: '/following',
  profile: '/@:nickname',
  login: '/login',
  register: '/register',
};

// Không cần đăng nhập vẫn vào được
export const publicRoutes = [
  { path: routes.home, component: Home },
  { path: routes.live, component: Live },
  { path: routes.profile, component: Profile },
  { path: routes.following, component: Following },
  { path: routes.search, component: Search, layout: null },
  { path: routes.login, component: Login, layout: null },
  { path: routes.register, component: Register, layout: null },
];

// Phải đăng nhập mới vào được
export const privateRoutes = [
  { path: routes.upload, component: Upload, layout: null }, // Sửa layout thành null theo yêu cầu
];
