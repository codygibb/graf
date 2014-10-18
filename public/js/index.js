$(document).ready(function() {
	$('#thinking').hide();
	$('#visualizeBtn').on('click', function(event) {
		event.preventDefault();
		var repo = $('#repoInput').val();
		$('#thinking').show();
		$.post('/parse', { url: repo }, function(data) {
			// console.log(data);
			localStorage.removeItem('GRAF');
			localStorage.setItem('GRAF', JSON.stringify(data));
			window.location = '/visualize';
		});
	});
});