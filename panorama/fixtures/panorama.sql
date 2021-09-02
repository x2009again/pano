/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50715
Source Host           : localhost:3306
Source Database       : panorama

Target Server Type    : MYSQL
Target Server Version : 50715
File Encoding         : 65001

Date: 2017-03-07 16:59:22
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for auth_group
-- ----------------------------
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_group
-- ----------------------------

-- ----------------------------
-- Table structure for auth_group_permissions
-- ----------------------------
DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE `auth_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissi_permission_id_84c5c92e_fk_auth_permission_id` (`permission_id`),
  CONSTRAINT `auth_group_permissi_permission_id_84c5c92e_fk_auth_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_group_permissions
-- ----------------------------

-- ----------------------------
-- Table structure for auth_permission
-- ----------------------------
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permissi_content_type_id_2f476e4b_fk_django_content_type_id` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_permission
-- ----------------------------
INSERT INTO `auth_permission` VALUES ('1', 'Can add log entry', '1', 'add_logentry');
INSERT INTO `auth_permission` VALUES ('2', 'Can change log entry', '1', 'change_logentry');
INSERT INTO `auth_permission` VALUES ('3', 'Can delete log entry', '1', 'delete_logentry');
INSERT INTO `auth_permission` VALUES ('4', 'Can add permission', '2', 'add_permission');
INSERT INTO `auth_permission` VALUES ('5', 'Can change permission', '2', 'change_permission');
INSERT INTO `auth_permission` VALUES ('6', 'Can delete permission', '2', 'delete_permission');
INSERT INTO `auth_permission` VALUES ('7', 'Can add user', '3', 'add_user');
INSERT INTO `auth_permission` VALUES ('8', 'Can change user', '3', 'change_user');
INSERT INTO `auth_permission` VALUES ('9', 'Can delete user', '3', 'delete_user');
INSERT INTO `auth_permission` VALUES ('10', 'Can add group', '4', 'add_group');
INSERT INTO `auth_permission` VALUES ('11', 'Can change group', '4', 'change_group');
INSERT INTO `auth_permission` VALUES ('12', 'Can delete group', '4', 'delete_group');
INSERT INTO `auth_permission` VALUES ('13', 'Can add content type', '5', 'add_contenttype');
INSERT INTO `auth_permission` VALUES ('14', 'Can change content type', '5', 'change_contenttype');
INSERT INTO `auth_permission` VALUES ('15', 'Can delete content type', '5', 'delete_contenttype');
INSERT INTO `auth_permission` VALUES ('16', 'Can add session', '6', 'add_session');
INSERT INTO `auth_permission` VALUES ('17', 'Can change session', '6', 'change_session');
INSERT INTO `auth_permission` VALUES ('18', 'Can delete session', '6', 'delete_session');
INSERT INTO `auth_permission` VALUES ('19', 'Can add texture', '7', 'add_texture');
INSERT INTO `auth_permission` VALUES ('20', 'Can change texture', '7', 'change_texture');
INSERT INTO `auth_permission` VALUES ('21', 'Can delete texture', '7', 'delete_texture');
INSERT INTO `auth_permission` VALUES ('22', 'Can add texture group', '8', 'add_texturegroup');
INSERT INTO `auth_permission` VALUES ('23', 'Can change texture group', '8', 'change_texturegroup');
INSERT INTO `auth_permission` VALUES ('24', 'Can delete texture group', '8', 'delete_texturegroup');
INSERT INTO `auth_permission` VALUES ('25', 'Can add scene', '9', 'add_scene');
INSERT INTO `auth_permission` VALUES ('26', 'Can change scene', '9', 'change_scene');
INSERT INTO `auth_permission` VALUES ('27', 'Can delete scene', '9', 'delete_scene');
INSERT INTO `auth_permission` VALUES ('28', 'Can add seller', '10', 'add_seller');
INSERT INTO `auth_permission` VALUES ('29', 'Can change seller', '10', 'change_seller');
INSERT INTO `auth_permission` VALUES ('30', 'Can delete seller', '10', 'delete_seller');
INSERT INTO `auth_permission` VALUES ('31', 'Can add scene space', '11', 'add_scenespace');
INSERT INTO `auth_permission` VALUES ('32', 'Can change scene space', '11', 'change_scenespace');
INSERT INTO `auth_permission` VALUES ('33', 'Can delete scene space', '11', 'delete_scenespace');
INSERT INTO `auth_permission` VALUES ('34', 'Can add hot', '12', 'add_hot');
INSERT INTO `auth_permission` VALUES ('35', 'Can change hot', '12', 'change_hot');
INSERT INTO `auth_permission` VALUES ('36', 'Can delete hot', '12', 'delete_hot');
INSERT INTO `auth_permission` VALUES ('37', 'Can add space', '13', 'add_space');
INSERT INTO `auth_permission` VALUES ('38', 'Can change space', '13', 'change_space');
INSERT INTO `auth_permission` VALUES ('39', 'Can delete space', '13', 'delete_space');

-- ----------------------------
-- Table structure for auth_user
-- ----------------------------
DROP TABLE IF EXISTS `auth_user`;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user
-- ----------------------------

-- ----------------------------
-- Table structure for auth_user_groups
-- ----------------------------
DROP TABLE IF EXISTS `auth_user_groups`;
CREATE TABLE `auth_user_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user_groups
-- ----------------------------

-- ----------------------------
-- Table structure for auth_user_user_permissions
-- ----------------------------
DROP TABLE IF EXISTS `auth_user_user_permissions`;
CREATE TABLE `auth_user_user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_perm_permission_id_1fbb5f2c_fk_auth_permission_id` (`permission_id`),
  CONSTRAINT `auth_user_user_perm_permission_id_1fbb5f2c_fk_auth_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of auth_user_user_permissions
-- ----------------------------

-- ----------------------------
-- Table structure for django_admin_log
-- ----------------------------
DROP TABLE IF EXISTS `django_admin_log`;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin__content_type_id_c4bce8eb_fk_django_content_type_id` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin__content_type_id_c4bce8eb_fk_django_content_type_id` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_admin_log
-- ----------------------------

-- ----------------------------
-- Table structure for django_content_type
-- ----------------------------
DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_content_type
-- ----------------------------
INSERT INTO `django_content_type` VALUES ('1', 'admin', 'logentry');
INSERT INTO `django_content_type` VALUES ('4', 'auth', 'group');
INSERT INTO `django_content_type` VALUES ('2', 'auth', 'permission');
INSERT INTO `django_content_type` VALUES ('3', 'auth', 'user');
INSERT INTO `django_content_type` VALUES ('5', 'contenttypes', 'contenttype');
INSERT INTO `django_content_type` VALUES ('12', 'panorama', 'hot');
INSERT INTO `django_content_type` VALUES ('9', 'panorama', 'scene');
INSERT INTO `django_content_type` VALUES ('11', 'panorama', 'scenespace');
INSERT INTO `django_content_type` VALUES ('10', 'panorama', 'seller');
INSERT INTO `django_content_type` VALUES ('13', 'panorama', 'space');
INSERT INTO `django_content_type` VALUES ('7', 'panorama', 'texture');
INSERT INTO `django_content_type` VALUES ('8', 'panorama', 'texturegroup');
INSERT INTO `django_content_type` VALUES ('6', 'sessions', 'session');

-- ----------------------------
-- Table structure for django_migrations
-- ----------------------------
DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_migrations
-- ----------------------------
INSERT INTO `django_migrations` VALUES ('1', 'contenttypes', '0001_initial', '2017-03-07 08:58:19.677000');
INSERT INTO `django_migrations` VALUES ('2', 'auth', '0001_initial', '2017-03-07 08:58:24.262000');
INSERT INTO `django_migrations` VALUES ('3', 'admin', '0001_initial', '2017-03-07 08:58:25.240000');
INSERT INTO `django_migrations` VALUES ('4', 'admin', '0002_logentry_remove_auto_add', '2017-03-07 08:58:25.273000');
INSERT INTO `django_migrations` VALUES ('5', 'contenttypes', '0002_remove_content_type_name', '2017-03-07 08:58:26.098000');
INSERT INTO `django_migrations` VALUES ('6', 'auth', '0002_alter_permission_name_max_length', '2017-03-07 08:58:26.536000');
INSERT INTO `django_migrations` VALUES ('7', 'auth', '0003_alter_user_email_max_length', '2017-03-07 08:58:26.932000');
INSERT INTO `django_migrations` VALUES ('8', 'auth', '0004_alter_user_username_opts', '2017-03-07 08:58:26.951000');
INSERT INTO `django_migrations` VALUES ('9', 'auth', '0005_alter_user_last_login_null', '2017-03-07 08:58:27.144000');
INSERT INTO `django_migrations` VALUES ('10', 'auth', '0006_require_contenttypes_0002', '2017-03-07 08:58:27.179000');
INSERT INTO `django_migrations` VALUES ('11', 'auth', '0007_alter_validators_add_error_messages', '2017-03-07 08:58:27.223000');
INSERT INTO `django_migrations` VALUES ('12', 'auth', '0008_alter_user_username_max_length', '2017-03-07 08:58:27.643000');
INSERT INTO `django_migrations` VALUES ('13', 'panorama', '0001_initial', '2017-03-07 08:58:32.979000');
INSERT INTO `django_migrations` VALUES ('14', 'sessions', '0001_initial', '2017-03-07 08:58:33.570000');

-- ----------------------------
-- Table structure for django_session
-- ----------------------------
DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_de54fa62` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of django_session
-- ----------------------------

-- ----------------------------
-- Table structure for panorama_hot
-- ----------------------------
DROP TABLE IF EXISTS `panorama_hot`;
CREATE TABLE `panorama_hot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(20) DEFAULT NULL,
  `vector` varchar(100) DEFAULT NULL,
  `transition` varchar(300) DEFAULT NULL,
  `scene_space_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `panorama_hot_scene_space_id_0a6b2308_fk_panorama_scenespace_id` (`scene_space_id`),
  CONSTRAINT `panorama_hot_scene_space_id_0a6b2308_fk_panorama_scenespace_id` FOREIGN KEY (`scene_space_id`) REFERENCES `panorama_scenespace` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of panorama_hot
-- ----------------------------
INSERT INTO `panorama_hot` VALUES ('1', '这里是热点的描述', '{\"vx\":-29.4561,\"vz\":7.0743,\"vy\":-18.9069}', '{\"pz\": -11.0588, \"py\": 0.1294, \"to\": \"1\", \"px\": 88.523}', '1');
INSERT INTO `panorama_hot` VALUES ('2', '跳至13', '{\"vz\":23.5366,\"vy\":-19.1917,\"vx\":-18.7445}', '{\"pz\": -68.1908, \"py\": 0.4336, \"to\": \"13\", \"px\": 61.2799}', '2');
INSERT INTO `panorama_hot` VALUES ('3', 'to 1', '{\"vz\":-25.9423,\"vy\":-24.4605,\"vx\":1.8903}', '{\"pz\": 121.7136, \"py\": -0.2672, \"to\": \"1\", \"px\": 0.1808}', '3');
INSERT INTO `panorama_hot` VALUES ('4', '进入空间2', '{\"vz\":27.4568,\"vy\":-22.648,\"vx\":-2.7069}', '{\"pz\": -55.9621, \"py\": -0.2834, \"to\": \"2\", \"px\": -0.6951}', '2');
INSERT INTO `panorama_hot` VALUES ('5', '回到空间0', '{\"vz\":-4.2313,\"vy\":-19.3082,\"vx\":29.7224}', '{\"pz\": 13.0599, \"py\": -1.0107, \"to\": \"0\", \"px\": -111.6612}', '2');
INSERT INTO `panorama_hot` VALUES ('6', 'to 5', '{\"vz\":30.2801,\"vy\":-18.879,\"vx\":-0.8039}', '{\"pz\": -34.8491, \"py\": -3.1483, \"to\": \"5\", \"px\": -1.7957}', '3');
INSERT INTO `panorama_hot` VALUES ('13', '继续', '{\"vz\": 4.6865, \"vx\": 43.0916, \"vy\": -12.0892}', '{\"to\": \"15\", \"px\": -96.5802, \"pz\": -23.0257, \"py\": -1.3156}', '18');
INSERT INTO `panorama_hot` VALUES ('16', '下一个', '{\"vy\": -15.874, \"vz\": 32.384, \"vx\": -26.9127}', '{\"to\": \"18\", \"px\": 57.5058, \"pz\": -45.3132, \"py\": -0.5988}', '15');
INSERT INTO `panorama_hot` VALUES ('17', '下一个', '{\"vy\": -20.3823, \"vz\": 37.65, \"vx\": -13.8578}', '{\"pz\": -53.9248, \"to\": \"19\", \"px\": 6.252, \"py\": -2.4775}', '17');
INSERT INTO `panorama_hot` VALUES ('18', '下一个', '{\"vy\": -6.9236, \"vz\": 31.6381, \"vx\": -31.2425}', '{\"to\": \"21\", \"px\": 105.6778, \"pz\": -103.861, \"py\": -3.1311}', '18');
INSERT INTO `panorama_hot` VALUES ('19', '下一个', '{\"vy\": -12.3058, \"vz\": 17.1798, \"vx\": -39.7293}', '{\"pz\": -49.8329, \"to\": \"20\", \"px\": 152.1104, \"py\": 2.1948}', '18');
INSERT INTO `panorama_hot` VALUES ('21', '回', '{\"vy\": -13.2993, \"vz\": -29.6898, \"vx\": 31.0909}', '{\"to\": \"19\", \"px\": -73.0554, \"pz\": 102.1447, \"py\": 16.3846}', '20');
INSERT INTO `panorama_hot` VALUES ('22', '回', '{\"vy\": -24.4735, \"vz\": -37.543, \"vx\": 4.0707}', '{\"to\": \"18\", \"px\": -31.1109, \"pz\": 95.0819, \"py\": 9.699}', '18');
INSERT INTO `panorama_hot` VALUES ('23', '回', '{\"vy\": -14.2603, \"vz\": -28.7216, \"vx\": 31.5708}', '{\"to\": \"16\", \"px\": -86.6388, \"pz\": 92.6371, \"py\": -0.3267}', '17');
INSERT INTO `panorama_hot` VALUES ('24', '回', '{\"vy\": -12.9634, \"vz\": -41.3248, \"vx\": -12.2152}', '{\"to\": \"17\", \"px\": 25.4356, \"pz\": 81.9081, \"py\": -0.0924}', '15');
INSERT INTO `panorama_hot` VALUES ('26', '666666666', '{\"vy\": -16.1409, \"vz\": -13.6867, \"vx\": -39.7133}', '{\"pz\": 2.4649, \"to\": \"19\", \"px\": 109.6682, \"py\": -35.8354}', '14');
INSERT INTO `panorama_hot` VALUES ('27', '回', '{\"vy\": -32.346, \"vz\": -31.1592, \"vx\": 2.8}', '{\"pz\": 61.6089, \"px\": -6.8872, \"py\": -0.0785, \"to\": \"22\"}', '16');
INSERT INTO `panorama_hot` VALUES ('28', '进入3空间', '{\"vy\": -29.3776, \"vz\": 32.0874, \"vx\": -11.5046}', '{\"pz\": -52.5228, \"to\": \"17\", \"px\": 5.4951, \"py\": 0.7566}', '21');
INSERT INTO `panorama_hot` VALUES ('29', '下一个场景', '{\"vy\": -16.4163, \"vz\": 41.4268, \"vx\": 6.2707}', '{\"pz\": -93.2197, \"to\": \"16\", \"px\": -35.8875, \"py\": -3.1537}', '16');
INSERT INTO `panorama_hot` VALUES ('30', '回', '{\"vy\": -24.2249, \"vx\": 36.8816, \"vz\": -8.8262}', '{\"to\": \"19\", \"px\": -77.223, \"pz\": 27.2996, \"py\": -0.7059}', '19');
INSERT INTO `panorama_hot` VALUES ('31', '66666', '{\"vy\": -10.1101, \"vz\": 43.7982, \"vx\": -2.1221}', '{\"pz\": -53.7258, \"py\": -2.3455, \"to\": \"6\", \"px\": -2.1335}', '4');
INSERT INTO `panorama_hot` VALUES ('32', '2222', '{\"vy\": -6.021, \"vz\": -44.5154, \"vx\": 2.6698}', '{\"pz\": 72.0, \"py\": -0.7, \"to\": \"2\", \"px\": 0.6}', '5');
INSERT INTO `panorama_hot` VALUES ('33', '22222', '{\"vy\": -17.1622, \"vz\": -33.5865, \"vx\": 24.5439}', '{\"pz\": 65.8568, \"py\": 0.3357, \"to\": \"2\", \"px\": -59.9455}', '11');
INSERT INTO `panorama_hot` VALUES ('34', '进入空间2', '{\"vx\": 2.4612, \"vy\": -11.9136, \"vz\": 43.3245}', '{\"pz\": -115.7217, \"to\": \"16\", \"px\": -22.9009, \"py\": -1.3234}', '21');

-- ----------------------------
-- Table structure for panorama_scene
-- ----------------------------
DROP TABLE IF EXISTS `panorama_scene`;
CREATE TABLE `panorama_scene` (
  `id` varchar(50) NOT NULL,
  `title` varchar(20) NOT NULL,
  `entry_id` varchar(50) NOT NULL,
  `seller_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `panorama_scene_entry_id_823916c5_fk_panorama_space_id` (`entry_id`),
  KEY `panorama_scene_seller_id_a368a092_fk_panorama_seller_id` (`seller_id`),
  CONSTRAINT `panorama_scene_entry_id_823916c5_fk_panorama_space_id` FOREIGN KEY (`entry_id`) REFERENCES `panorama_space` (`id`),
  CONSTRAINT `panorama_scene_seller_id_a368a092_fk_panorama_seller_id` FOREIGN KEY (`seller_id`) REFERENCES `panorama_seller` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of panorama_scene
-- ----------------------------
INSERT INTO `panorama_scene` VALUES ('first', '测试场景', '0', '1');
INSERT INTO `panorama_scene` VALUES ('second', '新场景', '22', '3');

-- ----------------------------
-- Table structure for panorama_scenespace
-- ----------------------------
DROP TABLE IF EXISTS `panorama_scenespace`;
CREATE TABLE `panorama_scenespace` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `space_name` varchar(20) DEFAULT NULL,
  `ordinal` smallint(5) unsigned NOT NULL,
  `scene_id` varchar(50) NOT NULL,
  `space_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `panorama_scenespace_scene_id_dea0da87_fk_panorama_scene_id` (`scene_id`),
  KEY `panorama_scenespace_space_id_e0034e56_fk_panorama_space_id` (`space_id`),
  CONSTRAINT `panorama_scenespace_scene_id_dea0da87_fk_panorama_scene_id` FOREIGN KEY (`scene_id`) REFERENCES `panorama_scene` (`id`),
  CONSTRAINT `panorama_scenespace_space_id_e0034e56_fk_panorama_space_id` FOREIGN KEY (`space_id`) REFERENCES `panorama_space` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of panorama_scenespace
-- ----------------------------
INSERT INTO `panorama_scenespace` VALUES ('1', null, '1', 'first', '0');
INSERT INTO `panorama_scenespace` VALUES ('2', null, '2', 'first', '1');
INSERT INTO `panorama_scenespace` VALUES ('3', null, '3', 'first', '2');
INSERT INTO `panorama_scenespace` VALUES ('4', null, '4', 'first', '5');
INSERT INTO `panorama_scenespace` VALUES ('5', null, '5', 'first', '6');
INSERT INTO `panorama_scenespace` VALUES ('6', null, '6', 'first', '7');
INSERT INTO `panorama_scenespace` VALUES ('7', null, '7', 'first', '8');
INSERT INTO `panorama_scenespace` VALUES ('8', null, '8', 'first', '9');
INSERT INTO `panorama_scenespace` VALUES ('9', null, '9', 'first', '10');
INSERT INTO `panorama_scenespace` VALUES ('10', null, '10', 'first', '11');
INSERT INTO `panorama_scenespace` VALUES ('11', null, '11', 'first', '12');
INSERT INTO `panorama_scenespace` VALUES ('12', null, '12', 'first', '13');
INSERT INTO `panorama_scenespace` VALUES ('13', null, '13', 'first', '14');
INSERT INTO `panorama_scenespace` VALUES ('14', null, '6', 'second', '15');
INSERT INTO `panorama_scenespace` VALUES ('15', null, '3', 'second', '16');
INSERT INTO `panorama_scenespace` VALUES ('16', null, '2', 'second', '17');
INSERT INTO `panorama_scenespace` VALUES ('17', null, '4', 'second', '18');
INSERT INTO `panorama_scenespace` VALUES ('18', null, '5', 'second', '19');
INSERT INTO `panorama_scenespace` VALUES ('19', null, '8', 'second', '20');
INSERT INTO `panorama_scenespace` VALUES ('20', null, '7', 'second', '21');
INSERT INTO `panorama_scenespace` VALUES ('21', null, '1', 'second', '22');

-- ----------------------------
-- Table structure for panorama_seller
-- ----------------------------
DROP TABLE IF EXISTS `panorama_seller`;
CREATE TABLE `panorama_seller` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `logo` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `desc` varchar(300) DEFAULT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of panorama_seller
-- ----------------------------
INSERT INTO `panorama_seller` VALUES ('1', '测试1', 'seller-logo/pants.jpg', '1111', '地址1', '描述1\r\n111', '2016-10-05 06:48:05.472000');
INSERT INTO `panorama_seller` VALUES ('2', '测试2', 'seller-logo/finger.jpg', '2222', '地址2', '描述2\r\n222', '2016-10-05 06:48:05.474000');
INSERT INTO `panorama_seller` VALUES ('3', '测试3', 'seller-logo/huaji.png', '3333', '地址3', '描述3\r\n333', '2016-10-05 06:48:05.472000');

-- ----------------------------
-- Table structure for panorama_space
-- ----------------------------
DROP TABLE IF EXISTS `panorama_space`;
CREATE TABLE `panorama_space` (
  `id` varchar(50) NOT NULL,
  `name` varchar(20) NOT NULL,
  `url` varchar(100) NOT NULL,
  `thumb_url` varchar(100) DEFAULT NULL,
  `create_time` datetime NOT NULL,
  `creator_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `panorama_space_creator_id_731ae96f_fk_panorama_seller_id` (`creator_id`),
  CONSTRAINT `panorama_space_creator_id_731ae96f_fk_panorama_seller_id` FOREIGN KEY (`creator_id`) REFERENCES `panorama_seller` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of panorama_space
-- ----------------------------
INSERT INTO `panorama_space` VALUES ('0', '空间名称：0', 'img/real/0.jpg', 'img/thumb/0.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('1', '空间名称：1', 'img/real/1.jpg', 'img/thumb/1.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('10', '空间名称：10', 'img/real/10.jpg', 'img/thumb/10.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('11', '空间名称：11', 'img/real/11.jpg', 'img/thumb/11.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('12', '空间名称：12', 'img/real/12.jpg', 'img/thumb/12.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('13', '空间名称：13', 'img/real/13.jpg', 'img/thumb/13.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('14', '空间名称：14', 'img/real/14.jpg', 'img/thumb/14.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('15', '空间1', 'img/real/new_1.jpg', 'img/thumb/new_1.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('16', '空间2', 'img/real/new_2.jpg', 'img/thumb/new_2.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('17', '空间3', 'img/real/new_3.jpg', 'img/thumb/new_3.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('18', '空间4', 'img/real/new_4.jpg', 'img/thumb/new_4.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('19', '空间5', 'img/real/new_5.jpg', 'img/thumb/new_5.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('2', '空间名称：2', 'img/real/2.jpg', 'img/thumb/2.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('20', '空间6', 'img/real/new_6.jpg', 'img/thumb/new_6.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('21', '空间7', 'img/real/new_7.jpg', 'img/thumb/new_7.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('22', '空间8', 'img/real/new_8.jpg', 'img/thumb/new_8.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('23', '工业·灵感源地(HTC版)', 'img/real/23.jpg', 'img/thumb/23.jpg', '2017-02-20 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('24', '一品VR全景更换材质案例', 'img/real/24.jpg', 'img/thumb/24.jpg', '2016-10-05 06:48:05.472000', '1');
INSERT INTO `panorama_space` VALUES ('25', '一品VR全景更换材质案例', 'img/real/25.jpg', 'img/thumb/25.jpg', '2016-10-05 06:48:05.472000', '1');
INSERT INTO `panorama_space` VALUES ('5', '空间名称：5', 'img/real/5.jpg', 'img/thumb/5.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('6', '空间名称：6', 'img/real/6.jpg', 'img/thumb/6.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('7', '空间名称：7', 'img/real/7.jpg', 'img/thumb/7.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('8', '空间名称：8', 'img/real/8.jpg', 'img/thumb/8.jpg', '2016-10-05 06:48:05.472000', '3');
INSERT INTO `panorama_space` VALUES ('9', '空间名称：9', 'img/real/9.jpg', 'img/thumb/9.jpg', '2016-10-05 06:48:05.472000', '3');

-- ----------------------------
-- Table structure for panorama_texture
-- ----------------------------
DROP TABLE IF EXISTS `panorama_texture`;
CREATE TABLE `panorama_texture` (
  `code` int(10) unsigned NOT NULL,
  `area` smallint(6) DEFAULT NULL,
  `label` varchar(20) NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of panorama_texture
-- ----------------------------
INSERT INTO `panorama_texture` VALUES ('1', '1', '蓝色暗纹壁纸');
INSERT INTO `panorama_texture` VALUES ('2', '1', '蓝色简欧壁纸');
INSERT INTO `panorama_texture` VALUES ('3', '1', '蓝色条纹壁纸');
INSERT INTO `panorama_texture` VALUES ('4', '1', '暖色壁纸');
INSERT INTO `panorama_texture` VALUES ('5', '1', '花壁纸');
INSERT INTO `panorama_texture` VALUES ('6', '1', '素咖色壁纸');
INSERT INTO `panorama_texture` VALUES ('7', '1', '素蓝色壁纸');
INSERT INTO `panorama_texture` VALUES ('8', '1', '素色壁纸');
INSERT INTO `panorama_texture` VALUES ('9', '2', '爵士白地砖');
INSERT INTO `panorama_texture` VALUES ('10', '2', '米色地砖');
INSERT INTO `panorama_texture` VALUES ('11', '2', '木地板');
INSERT INTO `panorama_texture` VALUES ('12', '2', '玉石地砖');
INSERT INTO `panorama_texture` VALUES ('13', '2', '仿古砖');
INSERT INTO `panorama_texture` VALUES ('14', '1', '花色壁纸');
INSERT INTO `panorama_texture` VALUES ('15', '1', '素蓝色壁纸');

-- ----------------------------
-- Table structure for panorama_texturegroup
-- ----------------------------
DROP TABLE IF EXISTS `panorama_texturegroup`;
CREATE TABLE `panorama_texturegroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codes` varchar(50) DEFAULT NULL,
  `url` varchar(100) NOT NULL,
  `entry` tinyint(1) NOT NULL,
  `space_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `panorama_texturegroup_space_id_a6eb2dec_fk_panorama_space_id` (`space_id`),
  CONSTRAINT `panorama_texturegroup_space_id_a6eb2dec_fk_panorama_space_id` FOREIGN KEY (`space_id`) REFERENCES `panorama_space` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of panorama_texturegroup
-- ----------------------------
INSERT INTO `panorama_texturegroup` VALUES ('1', '1,9', 'img/real/24_1.jpg', '1', '24');
INSERT INTO `panorama_texturegroup` VALUES ('2', '2,9', 'img/real/24_2.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('3', '3,9', 'img/real/24_3.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('4', '4,9', 'img/real/24_4.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('5', '1,10', 'img/real/24_5.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('6', '2,10', 'img/real/24_6.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('7', '3,10', 'img/real/24_7.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('8', '4,10', 'img/real/24_8.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('9', '1,11', 'img/real/24_9.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('10', '2,11', 'img/real/24_10.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('11', '3,11', 'img/real/24_11.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('12', '4,11', 'img/real/24_12.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('13', '1,12', 'img/real/24_13.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('14', '2,12', 'img/real/24_14.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('15', '3,12', 'img/real/24_15.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('16', '4,12', 'img/real/24_16.jpg', '0', '24');
INSERT INTO `panorama_texturegroup` VALUES ('17', '13,14', 'img/real/25_1.jpg', '1', '25');
INSERT INTO `panorama_texturegroup` VALUES ('18', '13,6', 'img/real/25_2.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('19', '13,15', 'img/real/25_3.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('20', '13,8', 'img/real/25_4.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('21', '10,14', 'img/real/25_5.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('22', '10,6', 'img/real/25_6.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('23', '10,15', 'img/real/25_7.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('24', '10,8', 'img/real/25_8.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('25', '11,14', 'img/real/25_9.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('26', '11,6', 'img/real/25_10.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('27', '11,15', 'img/real/25_11.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('28', '11,8', 'img/real/25_12.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('29', '12,14', 'img/real/25_13.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('30', '12,6', 'img/real/25_14.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('31', '12,15', 'img/real/25_15.jpg', '0', '25');
INSERT INTO `panorama_texturegroup` VALUES ('32', '12,8', 'img/real/25_16.jpg', '0', '25');
