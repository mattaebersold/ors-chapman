import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

// Import icon sets as needed
import {
  faHome,
  faSearch,
  faPlus,
  faUser,
  faUserPlus,
  faCar,
  faTimes,
  faHeart,
  faComment,
  faShare,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faEllipsisV,
  faUsers,
  faStore,
  faNewspaper,
  faCheck,
  faSpinner,
  faExclamation,
  faCalendar,
  faHistory,
  faMapMarker,
  faTag,
  faClock,
  faFilter,
  faEdit,
  faTrash,
  faCheckSquare,
  faCamera,
  faInfoCircle,
  faRss,
  faImages,
  faWrench,
  faPalette,
  faCogs,
  faTachometerAlt,
  faBolt,
  faRoad,
  faCheckCircle,
  faEnvelope,
  faEye,
  faSignOutAlt,
  faExclamationTriangle,
  faPaperPlane,
  faStar,
  faExpand,
  faBell,
  faBellSlash,
  faArchive
} from '@fortawesome/free-solid-svg-icons';

import {
  faUser as faUserRegular,
  faHeart as faHeartRegular,
  faComment as faCommentRegular,
  faStar as faStarRegular,
  faSquare as faSquareRegular
} from '@fortawesome/free-regular-svg-icons';

import {
  faGoogle
} from '@fortawesome/free-brands-svg-icons';

// Icon mapping for easy use
const iconMap = {
  home: faHome,
  'home-outline': faHome, // FontAwesome doesn't have outline versions, using solid
  search: faSearch,
  plus: faPlus,
  user: faUser,
  'user-outline': faUserRegular,
  'user-plus': faUserPlus,
  person: faUser,
  'person-outline': faUserRegular,
  car: faCar,  
  'car-outline': faCar, // FontAwesome doesn't have outline versions, using solid
  close: faTimes,
  times: faTimes,
  heart: faHeart,
  'heart-outline': faHeartRegular,
  'heart-o': faHeartRegular,
  comment: faComment,
  'comment-outline': faCommentRegular,
  share: faShare,
  'chevron-left': faChevronLeft,
  'chevron-right': faChevronRight,
  'chevron-up': faChevronUp,
  'chevron-down': faChevronDown,
  'ellipsis-v': faEllipsisV,
  filter: faFilter,
  users: faUsers,
  store: faStore,
  marketplace: faStore,
  society: faUsers,
  new: faPlus,
  news: faNewspaper,
  feed: faNewspaper,
  check: faCheck,
  spinner: faSpinner,
  exclamation: faExclamation,
  calendar: faCalendar,
  history: faHistory,
  'map-marker': faMapMarker,
  tag: faTag,
  clock: faClock,
  edit: faEdit,
  trash: faTrash,
  'check-square': faCheckSquare,
  square: faSquareRegular,
  camera: faCamera,
  'info-circle': faInfoCircle,
  rss: faRss,
  images: faImages,
  wrench: faWrench,
  palette: faPalette,
  cogs: faCogs,
  tachometer: faTachometerAlt,
  flash: faBolt,
  road: faRoad,
  google: faGoogle,
  // Fix missing icon mappings
  image: faImages, // Map "image" to faImages
  'check-circle': faCheckCircle, // Add check-circle mapping
  // Message system icons
  envelope: faEnvelope,
  eye: faEye,
  cog: faCogs,
  'sign-out': faSignOutAlt,
  'exclamation-triangle': faExclamationTriangle,
  'paper-plane': faPaperPlane,
  star: faStar,
  'star-outline': faStarRegular,
  expand: faExpand,
  bell: faBell,
  'bell-slash': faBellSlash,
  archive: faArchive,
  send: faPaperPlane,
};

const FAIcon = ({ name, size = 20, color = '#000', style, ...props }) => {
  const icon = iconMap[name];
  
  if (!icon) {
    console.warn(`FontAwesome icon "${name}" not found`);
    return null;
  }

  return (
    <FontAwesomeIcon 
      icon={icon} 
      size={size} 
      color={color} 
      style={style}
      {...props}
    />
  );
};

export default FAIcon;