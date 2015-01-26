var graf = angular.module('graf', [
	'ui.router'
]);

graf.config(function($stateProvider) {
	$stateProvider
		.state('home', {
			templateUrl: '/views/partials/home.html',
			controller: 'HomeCtrl'
		});
});

graf.run(function($state) {
	$state.go('home');
});