<?php
	# Typical CORS stuff
	header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
	header("Access-Control-Allow-Methods: GET, POST");
	
	# Grab our connection info
	require_once("./dbconnection.php");
	
	# Error check
	if ( $mysqli->connect_errno ) {
		echo "Failed to connect to MySQL: (" . $db->connect_errno . ") " . $db->connect_error;
	}
	else {
		# Get/Post switch
		$request = $_SERVER["REQUEST_METHOD"];
		switch($request) {
			
			case "GET":
				# Sanitize the data to prevent XSS
				$_GET = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);
				
				$room = $_GET["room"];
				$date = $_GET["date"];
				
				# Select all occupants from the room and date that we've picked,
				$query = "SELECT * FROM `occupants` WHERE `room` = '$room' AND `date` = '$date'";
				
				$result = $mysqli->query($query);
				
				if ( !$result ) {
					echo "GET failed: (" . $mysqli->errno . ") " . $mysqli->error;
					return;
				}	
				
				# Push each occupant who is registered for this room and return it
				while ( $occupant = $result->fetch_array( MYSQLI_ASSOC ) ) {
					$occupants[] = $occupant;
				}
				
				$result->close();
				
				# Encode as JSON and send it back to be handled
				$json = json_encode($occupants);
				echo $json;
				
				break;
				
			case "POST":
				
				# !-Todo-!
				# Check to see if room is occupied and change the colouring if so...
				# Join below queries with multi_query for brevity and efficiency.
				# That's about it for now.
				
				# Get occupants WHERE room = room
				# if none, occupied = 0
				# if yes, occupied = 1
				
				
				# Sanitize
				$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
				
				$room = $_POST["room"];
				$deck = $_POST["deck"];
				$user = $_POST["user"];
				$date = $_POST["date"];
				
				$fname = $user[acct][first_name];
				$lname = $user[acct][last_name];
				$userid = $user[acct][id];
				
				# Next little bit checks to ensure user isn't assigned a room already.
				$query = "SELECT * FROM `occupants` WHERE `fbuser` = $userid AND `date` = '$date'";
				$result = $mysqli->query($query);
				
				# Push our returns into an array...
				while ( $occupant = $result->fetch_array( MYSQLI_ASSOC ) ) {
					$occupants[] = $occupant;
				}
				
				$result->close();
				
				# And delete them from the record.
				if ( sizeof($occupants) > 0 ) {
					foreach( $occupants as $occupant ) {
						$id = $occupant[id];
						$query = "DELETE FROM `occupants` WHERE `id` = $id";
						$mysqli->query($query);
					}
				}
				
				# Now we place the user into the database
				$query = "INSERT INTO `occupants` (`first name`, `last name`, `fbuser`, `room`, `deck`, `date`) VALUES ('$fname','$lname',$userid,$room, $deck, '$date')";
				
				# Throw back errors if any and complete db connection
				if ( !$mysqli->query($query) ) {
					echo "POST failed: (" . $mysqli->errno . ") " . $mysqli->error;
					return;
				}
								
				break;
		}
	}
	
	# Kill connection
	$mysqli->close();