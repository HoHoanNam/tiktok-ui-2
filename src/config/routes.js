const routes = {
  home: '/',
  live: '/live',
  search: '/search',
  upload: '/upload',
  following: '/following',
  // @ là dấu cố định, :nickname là pattern nên nó có thể thay đổi
  profile: '/profile/:nickname',
  login: '/login',
  register: '/register',
};

export default routes;
