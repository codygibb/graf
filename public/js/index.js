$(document).ready(function() {
	// $('#status').hide();
	$('#visualizeBtn').on('click', function(event) {
		event.preventDefault();
		var repo = $('#repoInput').val();
		$('#status').text('thinking about it...');
		// $('#status').show();
		$.ajax({
			url: '/parse',
			type: 'POST',
			data: { url: repo },
			success: function(data) {
				// console.log(data);
				localStorage.removeItem('GRAF');
				localStorage.setItem('GRAF', JSON.stringify(data));
				window.location = '/visualize';
			},
			error: function(res) {
				$('#status').text('something went wrong. maybe give it another try?');
			}
		});
	});
});