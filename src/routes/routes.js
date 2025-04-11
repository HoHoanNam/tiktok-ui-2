// Layouts
import config from '~/config';
import { HeaderOnly } from '~/layouts';

// Pages
import Home from '~/pages/Home';
import Live from '~/pages/Live';
import Search from '~/pages/Search';
import Upload from '~/pages/Upload';
import Profile from '~/pages/Profile';
import Following from '~/pages/Following';

// Không cần đăng nhập vẫn vào được
const publicRoutes = [
  { path: config.routes.home, component: Home },
  { path: config.routes.live, component: Live },
  { path: config.routes.profile, component: Profile },
  { path: config.routes.following, component: Following },
  { path: config.routes.search, component: Search, layout: null },
  { path: config.routes.upload, component: Upload, layout: HeaderOnly },
];

// Phải đăng nhập mới vào được
const privateRoutes = [];

export { publicRoutes, privateRoutes };
