<?php
	# Prevent access to all but this site
	header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
	header("Access-Control-Allow-Methods: GET, POST");
	
	require_once("./dbconnection.php");
	
	if ( $mysqli->connect_errno ) {
		echo "Failed to connect to MySQL: (" . $db->connect_errno . ") " . $db->connect_error;
	}
	else {
		$request = $_SERVER["REQUEST_METHOD"];
		switch($request) {
			case "GET":
				$_GET = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);
				$room = $_GET["room"];
				$deck = $_GET["deck"];
				$date = $_GET["date"];
				
				$query = "SELECT * FROM `occupants` WHERE `room` = '$room' AND `deck` = '$deck' AND `date` = '$date'";
				
				$result = $mysqli->query($query);
				if ( !$mysqli->query($query) ) {
					echo "POST failed: (" . $mysqli->errno . ") " . $mysqli->error;
				}
				while ( $occupant = $result->fetch_array( MYSQLI_ASSOC ) ) {
					$occupants[] = $occupant;
				}
				
				$json = json_encode($occupants);
				echo $json;
				
				break;
			case "POST":
				$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
				
				$room = $_POST["room"];
				$deck = $_POST["deck"];
				$user = $_POST["user"];
				$date = $_POST["date"];
				
				$fname = $user[acct][first_name];
				$lname = $user[acct][last_name];
				$userid = $user[acct][id];
				
				$query = "SELECT * FROM `occupants` WHERE `fbuser` = $userid AND `date` = '$date'";
				
				$result = $mysqli->query($query);
				
				while ( $occupant = $result->fetch_array( MYSQLI_ASSOC ) ) {
					$occupants[] = $occupant;
				}
				
				
				if ( sizeof($occupants) > 0 ) {
					foreach( $occupants as $occupant ) {
						$id = $occupant[id];
						$query = "DELETE FROM `occupants` WHERE `id` = $id";
						$mysqli->query($query);
					}
					
				}
				$query = "INSERT INTO `occupants` (`first name`, `last name`, `fbuser`, `room`, `deck`, `date`) VALUES ('$fname','$lname',$userid,$room, $deck, '$date')";
				
				if ( !$mysqli->query($query) ) {
					echo "POST failed: (" . $mysqli->errno . ") " . $mysqli->error;
				}
				break;
		}
	}
	
	$mysqli->close();