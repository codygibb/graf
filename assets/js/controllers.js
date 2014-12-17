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

	$scope.buildGraph = function(isValid) {
		if (isValid) {
			GrafApi.parseRepo($scope.selectedLang, $scope.repoUrl)
				.then(function(res) {
					$scope.result = res;
				})
				.catch(function(err) {
					console.log(err);
				});
		}
	}
});