$(function() {

});


function EnclosuresCtrl($scope, UrlService)
{
	$scope.enclosure_resource = new Resource('enclosure');

	$scope.enclosures = $scope.enclosure_resource.readAll();

	$scope.createEnclosure = function() {
		var data = {
			name : $scope.enclosure_name
		};

		$scope.enclosure_resource.create(data);

		$scope.enclosures = $scope.enclosure_resource.readAll();
		
		$scope.enclosure_name = '';
	};
}


function EnclosureCtrl($scope)
{
	$scope.editing = false;

	$scope.update = function() {
		if (!$scope.editing) {
			$scope.editing = true;
		} else {
			// Si ya se estaba editando cuando hemos invocado update() entonces
			// guardamos el nuevo nombre en la BD

			var data = {
				name : $scope.place_name
			}

			$scope.enclosure_resource.update(data, $scope.enclosure.id);

			$scope.editing = false;

			$scope.$parent.enclosure.name = $scope.enclosure_resource.read($scope.enclosure.id).name;
		}
	};

	$scope.del = function() {

		var confirm_msg = '¿Seguro que desea eliminar el recinto? (también se perderán todas sus plantas)';

		$scope.enclosure_resource.del($scope.enclosure.id, confirm_msg);

		// Al ir en un ng-include el botón que llama a esta función,
		// tenemos que subir dos niveles para cambiar la lista $scope.enclosures:
		//	- subir del $scope de la plantilla
		//	- del $scope del EnclosureCtrl (controlador hijo) al $scope de EnclosuresCtrl (padre)
		$scope.$parent.$parent.enclosures = $scope.enclosure_resource.readAll();

	};
}

function FloorsCtrl($scope, $element)
{
	$scope.sending_img = false;

    $scope.floor_resource = new Resource('floor');
	
	$scope.floors = $scope.floor_resource.readAllFiltered('?enclosure__id=' + $scope.enclosure.id);



	$scope.createFloor = function() {
		
		//
		// 1: Creamos el registro en B.D.
		var floor_data = {
			name : $scope.floor_name,
			enclosure : $scope.enclosure.resource_uri
		};
		
		var new_floor = $scope.floor_resource.create(floor_data);
		
		//
		// 2: Una vez creado subimos la imágen para el nuevo mapa creado	
		var img_form = $($element).find('form').first();
		
		$scope.sending_img = true;
		
		$scope.floor_resource.addImg(
			img_form, 
			new_floor.id,
			function(server_response){
				// Una vez se sube la imágen se limpia el formulario y se actualiza
				// la lista de mapas para el lugar
				$scope.floor_name = '';
				img_form.find('input[name="img"]').val('');
				$scope.floors =
					$scope.floor_resource.readAllFiltered('?place__id=' + $scope.enclosure.id);
				
				$scope.sending_img = false;
				
				$scope.$apply();
			}
		);
	};
}

function FloorCtrl($scope, $element)
{
	$scope.editing = false;
	
	$scope.update = function() {
		var img = $($element).find('input[name="img"]');
		var img_val = img.val();
		
		if (!$scope.editing)
        {
			$scope.editing = true;
			img.val('');
		}
        else
        {
			// Si ya se estaba editando cuando hemos invocado update() entonces
			// guardamos el nuevo nombre en la BD

			var floor_data = {
				name : $scope.floor_name
			}

			$scope.floor_resource.update(floor_data, $scope.floor.id);
			
			// Si se ha puesto una nueva imágen la subimos, eliminando la anterior
			if(img.val() !== '')
			{					
				var img_form = $($element).find('form');
				
				$scope.sending_img = true;
				
				$scope.floor_resource.addImg(
					img_form, 
					$scope.floor.id,
					function(server_response){
						// Una vez se sube la imágen se limpia el formulario y se actualiza
						// la lista de plantas para el recinto
						$scope.sending_img = false;						
					}
				);
			}

			$scope.editing = false;

			$scope.$parent.floor.name = $scope.floor_resource.read($scope.floor.id).name;
		}
	};

	$scope.del = function() {

		var confirm_msg = '¿Seguro que desea eliminar la planta? (también se perderá toda la información relativa a ella)';

		$scope.floor_resource.del($scope.floor.id, confirm_msg);

		$scope.$parent.$parent.floors =
			$scope.floor_resource.readAllFiltered('?enclosure__id=' + $scope.enclosure.id);
	};
}



//
// DIRECTIVAS PROPIAS
//

// myApp.directive('fadey', function() {
// return {
// restrict: 'A',
// link: function(scope, elm, attrs) {
// var duration = parseInt(attrs.fadey, 10);
// if (isNaN(duration)) {
// duration = 500;
// }
//
// scope.$watch('[createEnclosure]', function () {
// elm = $(elm);
// elm.hide();
// elm.fadeIn(duration);
// }, true);
//
// scope.del = function(complete) {
// elm.fadeOut(duration);
// };
// }
// };
// });