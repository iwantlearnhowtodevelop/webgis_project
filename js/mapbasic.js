// require(["esri/Map",
// 		 "esri/views/MapView",
// 		"esri/layers/FeatureLayer",
// 		 "esri/widgets/Legend"
// 		],
// 		function(Map,
// 				MapView,
// 				FeatureLayer,
// 				Legend
// 				)
// 				{
// 					var map = new Map({basemap: "dark-gray-vector"});
// 					var view = new MapView({container: "map",
// 											map: map,
// 											center: [112.863359,34.023961],
// 											zoom: 7})
// 					var pop =new FeatureLayer({url: "https://trail.arcgisonline.cn/server/rest/services/地图5_MIL1/MapServer/0",})
// 					map.add(pop);
// 					const legend = new Legend({view: view,
// 												layerInfos: [{
// 										      layer: pop,
// 										      title: ""
// 										    }]
// 										});
// 					view.ui.add(legend, "bottom-left");
// 				});
//测试代码
 require([
      "esri/Map",
      "esri/views/MapView"
    ], function(Map, MapView) {

      var map = new Map({
        basemap: "topo-vector"
      });

      var view = new MapView({
        container: "map",
        map: map,
        center: [-118.71511,34.09042],
        zoom: 11
      });

    });