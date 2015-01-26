graf.factory('GrafApi', function($http) {
	var GrafApi = {
		parseRepo: function(language, repoUrl) {
			return $http.get('/parse/' + language, {
					params: {
						repo_url: repoUrl
					}
				})
				.then(function(res) {
					return res.data;
				});
		},

		getSupportedLanguages: function() {
			return $http.get('/supported_langs')
				.then(function(res) {
					return res.data;
				});
		}
	};

	return GrafApi;
});