-- phpMyAdmin SQL Dump
-- version 3.4.11.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 28. Nov 2013 um 21:10
-- Server Version: 5.5.34
-- PHP-Version: 5.4.6-1ubuntu1.4

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `derunsichtbarefaden`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `articles`
--

CREATE TABLE IF NOT EXISTS `articles` (
  `articleid` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `text` text NOT NULL,
  PRIMARY KEY (`articleid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Daten für Tabelle `articles`
--

INSERT INTO `articles` (`articleid`, `name`, `text`) VALUES
(1, 'Das Leben ist schön', 'Das Leben ist schön, das Leben ist schön. Ich kann den Himmel sehn''.'),
(2, 'Wolken', '...und zieh''n auch mal dunkle Wolken auf - scheiß drauf!');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `links`
--

CREATE TABLE IF NOT EXISTS `links` (
  `source` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  PRIMARY KEY (`source`,`target`),
  KEY `target` (`target`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `links`
--

INSERT INTO `links` (`source`, `target`) VALUES
(3, 4),
(4, 8),
(4, 9),
(9, 10),
(4, 11),
(8, 11),
(10, 11),
(3, 12),
(12, 13);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `nodes`
--

CREATE TABLE IF NOT EXISTS `nodes` (
  `nodeid` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  PRIMARY KEY (`nodeid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=14 ;

--
-- Daten für Tabelle `nodes`
--

INSERT INTO `nodes` (`nodeid`, `name`) VALUES
(3, 'techno'),
(4, 'technikfreaks'),
(8, 'roboter'),
(9, 'technik'),
(10, 'drogen'),
(11, 'geeks'),
(12, 'liebe'),
(13, 'pflanzen');

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `links`
--
ALTER TABLE `links`
  ADD CONSTRAINT `links_ibfk_2` FOREIGN KEY (`target`) REFERENCES `nodes` (`nodeid`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `links_ibfk_1` FOREIGN KEY (`source`) REFERENCES `nodes` (`nodeid`) ON DELETE CASCADE ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
