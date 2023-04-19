-- MariaDB dump 10.19  Distrib 10.6.12-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: lfup
-- ------------------------------------------------------
-- Server version	10.6.12-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `current_stats`
--

DROP TABLE IF EXISTS `current_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `current_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usersId` int(11) NOT NULL,
  `playedGames` int(11) DEFAULT NULL,
  `wonGames` int(11) DEFAULT NULL,
  `lostGames` int(11) DEFAULT NULL,
  `lostFigures` int(11) DEFAULT NULL,
  `knockedFigures` int(11) DEFAULT NULL,
  `timesRolled` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usersId` (`usersId`),
  CONSTRAINT `current_stats_ibfk_1` FOREIGN KEY (`usersId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `current_stats`
--

LOCK TABLES `current_stats` WRITE;
/*!40000 ALTER TABLE `current_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `current_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_data`
--

DROP TABLE IF EXISTS `login_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usersId` int(11) NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login_data_ibfk_1` (`usersId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_data`
--

LOCK TABLES `login_data` WRITE;
/*!40000 ALTER TABLE `login_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_games`
--

DROP TABLE IF EXISTS `user_games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gamesId` int(11) NOT NULL,
  `usersId` int(11) DEFAULT NULL,
  `playedGames` int(11) DEFAULT NULL,
  `wonGames` int(11) DEFAULT NULL,
  `lostGames` int(11) DEFAULT NULL,
  `lostFigures` int(11) DEFAULT NULL,
  `knockedFigures` int(11) DEFAULT NULL,
  `timesRolled` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `gamesId` (`gamesId`),
  KEY `usersId` (`usersId`),
  CONSTRAINT `user_games_ibfk_1` FOREIGN KEY (`gamesId`) REFERENCES `games` (`id`),
  CONSTRAINT `user_games_ibfk_2` FOREIGN KEY (`usersId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_games`
--

LOCK TABLES `user_games` WRITE;
/*!40000 ALTER TABLE `user_games` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` text NOT NULL,
  `authId` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (16,'Userv-ErXg','01634f56-dad4-40ff-b92a-192cc75edca1'),(17,'UserKHhtXR','04437564-18f1-47f9-9a93-a0bf08f47b2b'),(18,'UserXZRENq','04534bed-5cf2-4da1-9e26-4465e90c2829'),(19,'UseroOmima','05ae04ce-ba4e-4f42-af31-c56b62ddaa56'),(20,'UserdC_Tvt','08ea6f7a-88cf-4e05-a109-951cf87ea389'),(21,'User6wqnKE','0a382279-4ac5-4cac-871e-7cf201cf933f'),(22,'UserWEq8vC','0e22533b-f210-48d8-95fa-066865a37be4'),(23,'UsertXNG6W','0ec673f8-035d-4084-b322-5a6362c44f82'),(24,'Useru8Ij2V','10e14d6c-8ce4-4a86-a1f5-6c1d6344262f'),(25,'UserT0b-GE','12a31550-6a7f-4e28-80d3-7f4e0ee55379'),(26,'User9cXLMj','17903256-e916-4611-ad64-e1340cae7335'),(27,'UserlRU_sn','1c696e2b-5797-4d17-bbec-ba545b4b6cd6'),(28,'User0HMJbs','1da57c92-9d07-44b4-9011-a1ac3efa691e'),(29,'UserwSQf9R','201bf8a4-c14f-4a05-ad8a-bd65601d7a39'),(30,'UserQ_aQTZ','2399983e-d54c-43e2-889a-7a3c4904ffe6'),(31,'UserG8KwYn','252a48b8-7105-440c-acf0-30afc825ada0'),(32,'UserMbjhAQ','2818de82-405d-45d9-b14c-321d795f6872'),(33,'UserTVxkfg','343b5ecf-45ad-476e-8ee1-fd2f10a9b858'),(34,'UsermVBNlY','34616c9a-07b3-419e-934e-56c202e1d655'),(35,'UserjAFqv3','37126a45-1b0f-4293-89a8-77cab2eba37f'),(36,'UserAbyXGC','3765b3fc-466e-4173-af8d-199639586a49'),(37,'User1Fs3j1','3b4544e2-1dc4-4cdc-80b7-8fe3f2f5e269'),(38,'UservsBFfI','3d9bf673-24c3-4f3a-8f4c-da14ebed54db'),(39,'UserOFFkhR','433be314-330f-4340-a6f5-de906cd54929'),(40,'UsereyWsGB','465adf3a-7f36-4be0-9125-99c64f1962bc'),(41,'UserfMyz6m','47e8adf1-205c-4f30-88ac-c2873fdf4a55'),(42,'User_u_7i0','49568b9d-89af-4bc7-99cf-b47f2772316a'),(43,'UserMzzQG7','4c7a5261-b1c8-473c-9ff0-b62d7398ff03'),(44,'UserRYqW4x','53d01714-2649-4f5b-917c-4c76d6ae53f1'),(45,'UserngGGO4','5680c6d4-94b1-4811-8ccc-f428cb82d317'),(46,'UsermD3L-u','58d09719-757f-40b9-8670-db7cfd4911df'),(47,'UservfsJ5r','5f5153a6-f437-445e-bf1e-27f65a63321f'),(48,'UserZ6RT-b','690a05c1-64e9-4eaf-a13f-68fa55840a75'),(49,'UserRNu9ww','6b2a54cb-c6d7-4fc3-b68c-f5b27558c9e8'),(50,'User8gtMjQ','6faf9da4-234b-403d-9236-0164a1e66e84'),(51,'Userpcd5Fc','6fe08b63-a53a-40b5-92b7-679d459b2f80'),(52,'UserTzWykN','779d6e1a-8f4d-4d87-af4b-0e4bd5f3fc54'),(53,'UserMr5yUf','8336d4d1-3278-4885-acbd-157a94664a0a'),(54,'UserohmxR3','853676c1-94a2-4154-8da0-97ff9e1f9c45'),(55,'Userf3TTM8','856b3d76-2ec6-4784-82e4-39708d61de03'),(56,'UserzaiULk','85ba81b1-b938-483b-a2d7-52b7c85258a4'),(57,'User-IqUGE','89f2fcb7-de66-43e2-853a-949c9e52efe1'),(58,'UserkBnsw2','8eca6829-ded7-429a-9f86-fb5c842c23f6'),(59,'UseroFFSsV','9396383a-5ed8-45a2-a33c-9d7988227d13'),(60,'UserQtOUbW','97e10946-7caf-4f45-aa01-bebcac393f34'),(61,'UserZePFgc','9f7ac19d-e5fd-4783-9ad9-5a818b7d03e3'),(62,'UserC1QyFm','a14000f8-6abe-435c-9707-1d656795d0c8'),(63,'User9X39L6','a4208c1f-eab0-4e4e-83e2-dfdb62b19333'),(64,'User65JDnX','a568984f-04ed-4aa2-8444-02b27262d684'),(65,'UserQ6vyUI','a66aa8f0-48ed-4f67-a0d6-9cd1e56bd488'),(66,'UserExoswy','a7698cfa-b821-4ca6-b9a5-6b7b8265fcdb'),(67,'UsernKHHCQ','ac3225a5-480e-44d7-9b8f-3724ed1b344e'),(68,'UserNiFQ2m','ad36ef82-4c5b-4f54-9126-73e4489bb420'),(69,'UserwftcZq','ad5c836e-4189-4231-88f8-044bb884fc0f'),(70,'User-3MMMA','af5b942b-e2f5-4c93-b161-80b10561a5e7'),(71,'UsereQH2Dh','afc52f85-f6e2-4f0e-a44c-e84554e9b86c'),(72,'UseraL_Nij','b313d564-eed1-41cf-9fff-b6c1aaddc59f'),(73,'UserlMWplI','b347afbe-6385-4ff6-b58e-f0848675fcde'),(74,'UserkUiYU7','b4f6be5e-e05e-41f1-8fbf-36e47dd80372'),(75,'UserK7qmzN','ba79b5f3-f553-4d1f-b3b4-018d04c986f1'),(76,'UserfNAeS2','badaf6cd-9b77-4946-a623-48841cffeb58'),(77,'UserldAsZT','bc12404f-0f57-463b-aa96-9d10f5955935'),(78,'UserOWly15','c08ded29-fe2c-4a9e-ad10-0c7e68e59764'),(79,'UserYQl-Zx','c15ec071-c530-4636-8ec3-c2c2ab57dcac'),(80,'UserFiYVmG','c17fcbd3-2835-4d34-a4eb-8da33f81df2f'),(81,'UserR32TSE','c3cfdef9-b611-44b4-9928-f05ad9a0c191'),(82,'User8zTw70','ca52e960-0e73-4cb1-a732-77774f056921'),(83,'User-9OWpR','cdac0cf3-7f39-4d3c-982a-d16c4e928622'),(84,'User9E2164','cffc7196-702a-45af-8e9e-392487203e68'),(85,'User9WvFvK','d06b45c1-fce9-45de-8227-321362e0dd74'),(86,'UsergBDGAc','d2f20cf9-a868-4fb7-bbe7-31fb454ec986'),(87,'UserFBuRTc','d3576a8c-cd77-43c1-8be9-1a9a8f29f1ef'),(88,'UserDj1Ghs','d5a8c45c-1e18-4800-b182-f159ff5a1fcf'),(89,'UserW8EJSn','d7054806-1344-4799-b42b-4c8d5a4dd9b9'),(90,'UserM62XpI','d82acb7a-7ae9-49aa-961e-75699692703e'),(91,'UserA5txK6','ddcbf4bc-260b-4cfb-a001-8ba37f23ef83'),(92,'UserMPkFEi','e23ff4d2-a8b1-45b1-a582-6d0f5ce622c7'),(93,'testname','e3b1c551-7a9f-4f34-b902-da404f78b4f4'),(94,'User8hWh5S','e569a29a-48bc-475b-bad2-4a8a9371fbc4'),(95,'User9YfT4a','e9383196-8692-4ed4-9645-08d939bcc69a'),(96,'UseroDoOCV','ea8864e1-eb30-4281-9a5e-5a24f412468a'),(97,'Useru_oO_R','f1510e73-1956-4b65-9df0-031257dd60aa'),(98,'UseruPj5aP','f1a447fa-2871-41ad-b80f-f42e13570b72'),(99,'User0Y_9-j','f1b89ee0-38e4-4049-b0de-965f69908704'),(100,'UserDcCTrW','f52af8a3-a670-4a76-9a74-4e602e11399a');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

-- Dump completed on 2023-04-16 16:31:54
