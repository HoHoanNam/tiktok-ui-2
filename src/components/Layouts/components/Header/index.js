import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faSpinner, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import styles from './Header.module.scss';
import images from '~/assets/images';

const cx = classNames.bind(styles);

function Header() {
  return (
    <header className={cx('wrapper')}>
      <div className={cx('inner')}>
        {/* Logo */}
        <img src={images.logo} alt="Tiktok" />

        {/* Search bar */}
        <div className={cx('search')}>
          {/* Input */}
          <input placeholder="Search accounts and videos" spellCheck="false" />
          {/* Clear button */}
          <button className={cx('clear')}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
          {/* Loading */}
          <FontAwesomeIcon className={cx('loading')} icon={faSpinner} />
          {/* Search button */}
          <button className={cx('search-btn')}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        {/* Actions */}
        <div className={cx('actions')}></div>
      </div>
    </header>
  );
}

export default Header;
