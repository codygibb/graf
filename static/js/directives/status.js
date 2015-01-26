// directive for displaying text status of an operation - "animates" the
// "..." portion of the in-progress status
graf.directive('status', function() {
	return {
		restrict: 'EA',
		scope: {
			// status is a ternary integer: 
			// -1 for failure, 0 for in-progress, 1 for success
			status: '='
		},
		link: function(scope, elem, attrs) {
			var inProgressMsg = attrs.inProgress;
			var failureMsg = attrs.failure;

			scope.$watch('status', function() {
				if (scope.status === -1) {
					elem.text(failureMsg);
				} else if (scope.status === 0) {
					elem.text(inProgressMsg);
				} else if (scope.status === 1) {
					elem.text('');
				}
			});
		}
	};
});