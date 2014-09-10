<div id="ship">
<?php
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
			<div id="<?php echo "room-" . $room_number; ?>" class="room-container" data-room="<?php echo $room_number; ?>" data-deck="<?php echo $room_deck; ?>" data-adjacent="<?php echo $room_adjacent; ?>" title="Click for more information">
				<svg xmlns="http://www.w3.org/2000/svg">
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