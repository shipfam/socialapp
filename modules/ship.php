<div id="ship">
<?php
	# I can't remember why this is here...
	# Probably so Deck 5 is 'active'
	# Refactor later...
	#
	# !-Todo-!
	# Make site actually AJAX and not FakeAJAX (FAJAX?)
	# Should just require limiting the deck based on the url
	# then use JS to load contents into div#ship. My only
	# concern is duplicating event handlers on page load
	# and having to re-init on every load...
	# maybe it's not worth it. Might be best to just 
	# throw the app at the client and let it handle all
	# the info...negligible difference in load times
	# and saves our server from a lot of grunt work.
	$count = 0;
	foreach ( $decks as $deck ):
		$visible_deck = ( $count === 0 ) ? "visible-deck" : "";
?>
	
	<div id="<?php echo "deck-" . $deck; ?>" class="deck <?php echo $visible_deck; ?>" data-deck="<?php echo $deck; ?>">
		<h1 class="deck-label">Deck <?php echo $deck; ?></h1>
	<?php
		foreach ( $rooms as $room ):
			
			$room_deck = $room[deck];
			$room_number = $room[room];
			$room_adjacent = $room[adjacent];
			$room_points = $room[points];
			
			if ( $room_deck === $deck ):
	?>
			<div id="<?php echo "room-" . $room_number; ?>" class="room-container" data-room="<?php echo $room_number; ?>" data-deck="<?php echo $room_deck; ?>" data-adjacent="<?php echo $room_adjacent; ?>">
				<svg xmlns="http://www.w3.org/2000/svg" title="Click for more info	">
					<polygon class="room" points="<?php echo $room_points; ?>"></polygon>
				</svg>
				<label><?php echo $room_number; ?></label>
			</div>
	<?php
			endif;
			$count++;
		endforeach;
	?>
	</div>
	<!-- .deck -->
<?php
	endforeach;
?>
</div>
<!-- #ship -->