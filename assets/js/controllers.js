graf.controller('HomeCtrl', function($scope, GrafApi) {
	GrafApi.getSupportedLanguages()
		.then(function(langs) {
			$scope.supportedLanguages = langs;
		})
		.catch(function(err) {
			console.log(err);
		});

	$scope.repoUrl = '';
	$scope.selectedLang = '';
	$scope.dependencyGraph = {};

	$scope.buildGraph = function(isValid) {
		if (isValid) {
			GrafApi.parseRepo($scope.selectedLang, $scope.repoUrl)
				.then(function(res) {
					$scope.dependencyGraph = res;
					console.log('done');
				})
				.catch(function(err) {
					console.log(err);
				});
		}
	};
});