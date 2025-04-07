// Layouts
import routesConfig from '~/config/routes';
import { HeaderOnly } from '~/components/Layouts';

// Pages
import Home from '~/pages/Home';
import Search from '~/pages/Search';
import Upload from '~/pages/Upload';
import Profile from '~/pages/Profile';
import Following from '~/pages/Following';

// Không cần đăng nhập vẫn vào được
const publicRoutes = [
  { path: routesConfig.home, component: Home },
  // @ là dấu cố định, :nickname là pattern nên nó có thể thay đổi
  { path: routesConfig.profile, component: Profile },
  { path: routesConfig.following, component: Following },
  { path: routesConfig.search, component: Search, layout: null },
  { path: routesConfig.upload, component: Upload, layout: HeaderOnly },
];

// Phải đăng nhập mới vào được
const privateRoutes = [];

export { publicRoutes, privateRoutes };
