// function get()
// {
// 	myApp.run(function getData($http)
// 	{
// 		return $http.get('/api/v1/enclosure/').then(function(response){
// 			return response;
// 		});
// 	});
// }



// var resource = function(name){

// 	this.getAll = function(){
// 		myApp.run(function($http)
// 		{
// 			return $http.get('/api/v1/enclosure/').then(function(response){
// 				return response;
// 			});
// 		});
// 	};
// };




// enclosure_resource.readAll();




$(function(){

	var place_resource = new resource('enclosure');

	// enclosure_resource.read(80, function(response){
	// 	enclosure = response.data;
	// 	var j = 1;
	// });

	// enclosure_resource.update(80, {name: 'matashawerXXX'}, function(){
	// 	var x = response;
	// 	var i = 1;
	// });

	// ajaxPutJSON(
 //        '/api/v1/enclosure/80/',
 //        // {name: 'matashawerXXX'},
 //        '{"name": "matashawerXXX"}',
 //        function(){
	// 		var i = 1;
 //        }
 //    );

	// curl --dump-header - -H "Content-Type: application/json" -X PUT --data '{"name": "matashawerXXX"}' http://mnopi:1aragon1@localhost:8000/api/v1/enclosure/80/

	$.ajax({
        url: '/api/v1/enclosure/80/',
        type: 'PUT',
        data: '{"name": "mataXYY"}',
        headers: {'Content-Type': 'application/json'},
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: function(data){
			var j = 1;
        },
        error: function (respuesta) {
            var i = 4;
        }
    });

});







