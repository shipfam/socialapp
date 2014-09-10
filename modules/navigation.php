<div id="navigation">
	<h1>Control Panel</h1>
	<form id="select-date">
		<div class="form-element">
			<div class="radio">
				<input id="select-date-jan" type="radio" name="select-date" value="jan" checked />
				<label for="select-date-jan">January 2015</label>
			</div>
			<div class="radio">
				<input id="select-date-feb" type="radio" name="select-date" value="feb" />
				<label for="select-date-feb">February 2015</label>
			</div>
		</div>
	</form>
	<nav id="select-deck">
		<ul>
		<?php 
			foreach ( $decks as $deck ):
		?>
			<li>
				<a href="#!deck-<?php echo $deck; ?>" id="nav-deck-<?php echo $deck; ?>" class="nav-deck">Deck <?php echo $deck; ?></a>
			</li>
		<?php
			endforeach;
		?>
		</ul>
	</nav>
	<a href="#" onclick="app.facebook.utils.login();" class="fb-login">Login here</a>
	<div id="legend">
		<h1>Legend</h1>
		<ul class="nav-legend">
			<li class="legend-unoccupied">
				<span></span>
				<label>Room unoccupied</label>
			</li>
			<li class="legend-occupied">
				<span></span>
				<label>Room occupied</label>
			</li>
		</ul>
	</div>
	
	<div id="debug" style="display:none;">
		<h1>Stats for nerds</h1>
		<pre id="debug-stats"></pre>
	</div>
	
</div>