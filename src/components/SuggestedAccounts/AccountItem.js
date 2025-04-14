import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Tippy from '@tippyjs/react/headless';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import Image from '~/components/Image';
import AccountPreview from './AccountPreview';
import styles from './SuggestedAccounts.module.scss';
import { Wrapper as PopperWrapper } from '~/components/Popper';

const cx = classNames.bind(styles);

function AccountItem() {
  const renderPreview = (props) => {
    // tabIndex là thứ tự khi chúng ta bấm phím tab
    // trên bàn phím thì nó focus vào, -1 thì nó không tab vào được
    return (
      <div tabIndex="-1" {...props}>
        <PopperWrapper>
          <AccountPreview />
        </PopperWrapper>
      </div>
    );
  };

  return (
    <Tippy
      interactive
      offset={[0, 0]}
      delay={[800, 0]}
      placement="bottom-start"
      appendTo={() => document.body}
      render={renderPreview}
    >
      <div className={cx('account-item')}>
        <Image
          className={cx('avatar')}
          src="https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/63de0a0a40f5ff17c23d861bbcd8c157~tplv-tiktokx-cropcenter:100:100.jpeg?dr=14579&refresh_token=63fc03bb&x-expires=1744477200&x-signature=5a%2F18T7pO9vuF0FJK55JC0bVW8U%3D&t=4d5b0474&ps=13740610&shp=30310797&shcp=c1333099&idc=my"
          alt="IVE"
        />
        <div className={cx('item-info')}>
          <p className={cx('nickname')}>
            <strong>ive.official</strong>
            <FontAwesomeIcon className={cx('check')} icon={faCheckCircle} />
          </p>
          <p className={cx('name')}>IVE.official</p>
        </div>
      </div>
    </Tippy>
  );
}

AccountItem.propTypes = {};

export default AccountItem;
