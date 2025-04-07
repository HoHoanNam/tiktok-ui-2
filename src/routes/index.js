// Layouts
import { HeaderOnly } from '~/components/Layouts';

// Pages
import Home from '~/pages/Home';
import Search from '~/pages/Search';
import Upload from '~/pages/Upload';
import Profile from '~/pages/Profile';
import Following from '~/pages/Following';

// Không cần đăng nhập vẫn vào được
const publicRoutes = [
  { path: '/', component: Home },
  // @ là dấu cố định, :nickname là pattern nên nó có thể thay đổi
  { path: '/profile/:nickname', component: Profile },
  { path: '/following', component: Following },
  { path: '/search', component: Search, layout: null },
  { path: '/upload', component: Upload, layout: HeaderOnly },
];

// Phải đăng nhập mới vào được
const privateRoutes = [];

export { publicRoutes, privateRoutes };
