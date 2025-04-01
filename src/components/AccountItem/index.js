import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './AccountItem.module.scss';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function AccountItem() {
  return (
    <div className={cx('wrapper')}>
      <img
        className={cx('avatar')}
        src="https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/a6449a4fec1201724b9d66026f98ac5d~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=c1e88d5a&x-expires=1743688800&x-signature=jvN9VutcvnrGOJDfK7z2j2agAk8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my"
        alt=""
      />
      <div className={cx('info')}>
        <h4 className={cx('name')}>
          <span>Lakers</span>
          <FontAwesomeIcon className={cx('check')} icon={faCircleCheck} />
        </h4>
        <span className={cx('username')}>lakers</span>
      </div>
    </div>
  );
}

export default AccountItem;
