<?php

	header('Content-Type: text/html; charset=utf-8');
	require_once("./app/dbconnection.php");
	if ( $mysqli->connect_errno ) {
		echo "Failed to connect to MySQL: (" . $db->connect_errno . ") " . $db->connect_error;
	}
	else {
		$query = "SELECT * FROM `decks` ORDER BY `deck` ASC";
		$result = $mysqli->query($query);
		while ( $deck = $result->fetch_array( MYSQLI_ASSOC ) ) {
			$decks[] = $deck[deck];
		}
		$result->close();
		$query = "SELECT * FROM `rooms`";
		$result = $mysqli->query($query);
		while ( $room = $result->fetch_array( MYSQLI_ASSOC ) ) {
			$rooms[] =  [
				"room"=>$room[room],
				"deck"=>$room[deck],
				"adjacent"=>$room[adjacent],
				"points"=>$room[points]
			];
		}
		$result->close();
	}
	$mysqli->close();
	include("modules/header.php");
	include("modules/ship.php");
	include("modules/navigation.php");
	include("modules/footer.php");
