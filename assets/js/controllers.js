graf.controller('HomeCtrl', function($scope, GrafApi) {
	GrafApi.getSupportedLanguages()
		.then(function(langs) {
			$scope.supportedLanguages = langs;
		})
		.catch(function(err) {
			console.log(err);
		});

	$scope.dependencyGraph = {};
	$scope.buildStatus = 1;

	$scope.buildGraph = function(isValid) {
		if (isValid) {
			$scope.buildStatus = 0;
			GrafApi.parseRepo($scope.selectedLang, $scope.repoUrl)
				.then(function(res) {
					$scope.dependencyGraph = res;
					$scope.buildStatus = 1;
				})
				.catch(function(err) {
					console.log(err);
					$scope.buildStatus = -1;
				});
		}
	};
});