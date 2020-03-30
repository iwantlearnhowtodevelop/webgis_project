
$(function () {
    var lng = null;
    var lat = null;
    var poi_data = [];
    var user_poi_data = [];
    var ZOOM_LEVEL = 12;

    var user_poi_type = {
        1: "出现确诊病例",
        2: "出现疑似病例",
    };

    function generateInfoWindowContent (province, city, cityPatientCount, nearestAddress, nearestDistance, countIn1km, countIn3km, countIn5km, countIn10km, patientsIn1km, patientsIn3km, patientsIn5km, patientsIn10km) {
        return '<div class="info-title">周边疫情信息</div><div class="info-content">' +
            '你所在的' + (province != city ? province + city : city) + "目前已有<font color='red'><big><strong>" + cityPatientCount + "</big></strong></font>例新冠肺炎确诊病例。目前已知最近的涉疫情社区在<font color='red'><big><strong>" +
            nearestAddress + "</big></strong></font>，距离你<font color='red'><big><strong>" + nearestDistance.toFixed(3) + "公里</big></strong></font>。" +
            (countIn1km > 0 ? "1公里以内有<font color='red'><big><strong>" + countIn1km + "个</big></strong></font>涉疫情社区，" + (patientsIn1km > 0 ? "共有<font color='red'><big><strong>" + patientsIn1km + "个</big></strong></font>确诊病例。" : "病例数尚未公布。") : "") +
            (countIn3km > 0 ? "3公里以内有<font color='red'><big><strong>" + countIn3km + "个</big></strong></font>涉疫情社区，" + (patientsIn3km > 0 ? "共有<font color='red'><big><strong>" + patientsIn3km + "个</big></strong></font>确诊病例。" : "病例数尚未公布。") : "") +
            (countIn5km > 0 ? "5公里以内有<font color='red'><big><strong>" + countIn5km + "个</big></strong></font>涉疫情社区，" + (patientsIn5km > 0 ? "共有<font color='red'><big><strong>" + patientsIn5km + "个</big></strong></font>确诊病例。" : "病例数尚未公布。") : "") +
            (countIn10km > 0 ? "10公里以内有<font color='red'><big><strong>" + countIn10km + "个</big></strong></font>涉疫情社区，" + (patientsIn10km > 0 ? "共有<font color='red'><big><strong>" + patientsIn10km + "个</big></strong></font>确诊病例。" : "病例数尚未公布。") : "") +
            '确诊病例已收入定点医院救治，无需过度担心。</div>';
    }
    // function generateInfoWindowContent (province, city, cityPatientCount, nearestAddress, nearestDistance, countIn1km, countIn3km, countIn5km, countIn10km, patientsIn1km, patientsIn3km, patientsIn5km, patientsIn10km) {
    //     return '<div class="info-title">Communites with Confirmed Cases</div><div class="info-content">' +
    //             'There are currently '+'<big><strong style="color:red">456</strong></big>'+' confirmed cases of COVID-19 in your city of '+'<big><stong>Beijing</stong></big>'+'. It is currently known that the nearest community with confirmed cases is in the '+'<big><strong style="color:red">Software Community of Zhongguancun Street, Haidian District, Beijing</strong></big>'+', '+'<big><strong style="color: red">2.566</strong></big>'+' kilometers away from you. Within <big><strong style="color: red">5</strong></big> kilometers, there are <big><strong style="color: red"> 4 </strong></big> communities with confirmed cases.'
    //         ;
    // }

    function setMarker(lnglat, province, city) {
        marker.setPosition(lnglat)
        
        circle5km.setCenter(lnglat);
        map.add(circle5km);   // ?

        var countIn1km = 0;
        var countIn3km = 0;
        var countIn5km = 0;
        var countIn10km = 0;
        var patientsIn1km = -1;
        var patientsIn3km = -1;
        var patientsIn5km = -1;
        var patientsIn10km = -1;
        var nearestId = -1;
        var nearestDistance = 1e10;

        $.each(poi_data, function (idx, item) {
            var tmp_dis = AMap.GeometryUtil.distance(lnglat, item.lnglat) / 1000;
            if (tmp_dis <= 10.0) {
                countIn10km++;
                patientsIn10km = Math.max(patientsIn10km, 0) + Math.max(item.num, 0);
                if (tmp_dis <= 5.0) {
                    countIn5km++;
                    patientsIn5km = Math.max(patientsIn5km, 0) + Math.max(item.num, 0);
                    if (tmp_dis <= 3.0) {
                        countIn3km++;
                        patientsIn3km = Math.max(patientsIn3km, 0) + Math.max(item.num, 0);
                        if (tmp_dis <= 1.0) {
                            countIn1km++;
                            patientsIn1km = Math.max(patientsIn1km, 0) + Math.max(item.num, 0);
                        }
                    }
                }
            }
            if (tmp_dis < nearestDistance) {
                nearestId = idx;
                nearestDistance = tmp_dis;
            }
        });
        
        var city_patient_count = -1;
        $.ajax({
            type: "GET",
            url: "/community/get_confirm_data",
            data: { district: city },
            dataType: "json",
            success: function (data) {
                city_patient_count = data['value'];
                var infoWindowContent = generateInfoWindowContent(province, city, city_patient_count, poi_data[nearestId].full_address, nearestDistance, countIn1km, countIn3km, countIn5km, countIn10km, patientsIn1km, patientsIn3km, patientsIn5km, patientsIn10km);
                advancedInfoWindow.setContent(infoWindowContent);
                advancedInfoWindow.open(map, marker.getPosition());
            }
        });
        map.setCenter(lnglat);
        map.setZoom(ZOOM_LEVEL);
    }

    $("#btn_to_map").click(function () {
        $(".form-group").hide();
        $("#community_tables").hide();
        $("#list_head").hide();
        $('#search-box').show();
        $("#community_map").show();
        $("body").css("overflow", "overflow");
        $("html").css("overflow", "overflow");

    });

    $("#btn_to_list").click(function () {
        $("#list_head").show();
        $('#search-box').hide();
        $(".form-group").show();
        $("#community_tables").show();
        $("#community_map").hide();
        $("body").css("overflow", "scroll");
        $("html").css("overflow", "scroll");
    });

    $("#btn_to_submit").click(function () {
        $("#submitModal").modal();
    });



    $("#submit-address").on("input propertychange",function(){
        $("#submit-lat").val("");
        $("#submit-lng").val("");
        $("#submit-province").val("");
        $("submit-city").val("");
        $("#submit-district").val("");
        $("#submit-township").val("");
        $("#submit-full-address").val("");
    })

    $("#submit-type").change(function() {
        if ($(this).val() == "-1") {
            console.log("123");
            $("#submit-type-group").show();
        }
        else {
            $("#submit-type-group").hide();
        }
    });

    $("#btn-submit").click(function () {
        var form_address = $("#submit-address").val();
        var form_lat = $("#submit-lat").val();
        var form_lng = $("#submit-lng").val();
        var form_province = $("#submit-province").val();
        var form_city = $("#submit-city").val();
        var form_district = $("#submit-district").val();
        var form_township = $("#submit-township").val();
        var form_type = $("#submit-type").val();
        var form_typeinfo = $("#submit-type-info").val();
        var form_source = $("#submit-source").val();
        if (form_lng && form_lat) {
            $("#submit-fail").hide();
            $.post(
                "/community/submit_community",
                {
                    address: form_address,
                    lat: form_lat,
                    lng: form_lng,
                    province: form_province,
                    city: form_city,
                    district: form_district,
                    township: form_township,
                    type: form_type,
                    typeInfo: form_typeinfo,
                    source: form_source,
                },
                function () {
                    $("#submitModal").modal("hide");
                }
            );
        }
        else {
            $("#submit-fail").show();
        }
    });

    $.each(obj["community"], function (province, province_item) {
        $.each(province_item, function (city, city_item) {
            $.each(city_item, function (area, area_item) {
                $.each(area_item, function (idx, community_item) {
                    if ((community_item.lng && community_item.lat)) {
                        poi_data.push({
                            lnglat: [community_item.lng, community_item.lat],
                            lng: community_item.lng, // for heatmap
                            lat: community_item.lat, // for heatmap
                            address: community_item.show_address,
                            full_address: community_item.full_address,
                            num: community_item.cnt_sum_certain,
                            count: (community_item.cnt_sum_certain > 0 ? community_item.cnt_sum_certain: 1),  // for heatmap
                            style: 0,
                        });
                    }
                });
            });
        });
    });
    console.log(poi_data.length);
    var map = new AMap.Map('community_map', {
        resizeEnable: true,
        zoom: ZOOM_LEVEL,
        lang: "zh_en"
    });
    var marker = new AMap.Marker({
        map: map,
        clickable: true,
        zIndex: 300,
    });
    var circle5km = new AMap.Circle({
        zIndex: 1,
        radius: 5000,
        strokeColor: "#F33",
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: "#ee2200",
        fillOpacity: 0.35,
    });
    var autoComplete = new AMap.Autocomplete({
        datatype: "poi",
        input: 'search',
        output: 'search-result',    
    });
    
    AMap.event.addListener(autoComplete, 'select', function (e) {
        lnglat = e.poi.location;
        address = e.poi.address;
        // console.log(e);
        var geocoder = new AMap.Geocoder();
        if (lnglat) {
            geocoder.getAddress(lnglat, function (status, result) {
                if (status == "complete") {
                    console.log(result);
                    province = result.regeocode.addressComponent.province;
                    city = result.regeocode.addressComponent.city;
                    if (!city) {
                        city = province;
                    }
                    setMarker(lnglat, province, city);
                }
            });
        }
        else {
            geocoder.getLocation(address, function (status, result) {
                if (status == "complete") {
                    // console.log(result);
                    lnglat = result.geocodes[0].location;
                    province = result.geocodes[0].addressComponent.province;
                    city = result.geocodes[0].addressComponent.city;
                    if (!city) {
                        city = province;
                    }
                    setMarker(lnglat, province, city);
                }
            });
        }
    });

    var autoCompleteForSubmit = new AMap.Autocomplete({
        datatype: "poi",
        input: 'submit-address',
        output: 'submit-address-result',
    });

    AMap.event.addListener(autoCompleteForSubmit, 'select', function (e) {
        lnglat = e.poi.location;
        address = e.poi.address;
        $("#submit-lat").val(lnglat.lat);
        $("#submit-lng").val(lnglat.lng);
        var geocoder = new AMap.Geocoder();
        if (lnglat) {
            geocoder.getAddress(lnglat, function (status, result) {
                if (status == "complete") {
                    
                    province = result.regeocode.addressComponent.province;
                    city = result.regeocode.addressComponent.city;
                    district = result.regeocode.addressComponent.district;
                    township = result.regeocode.addressComponent.township;
                    fullAddress = result.regeocode.formattedAddress;

                    $("#submit-province").val(province);
                    $("#submit-city").val(city);
                    $("#submit-district").val(district);
                    $("#submit-township").val(township);
                    $("#submit-full-address").val(fullAddress);
                }
            });
        }
    });
    
    // marker.setMap(map);
    var advancedInfoWindow = new AMap.AdvancedInfoWindow({
        panel: 'panel',
        placeSearch: false,
        driving: false,
        walking: false,
        transmit: false,
        asOrigin: false,
        asDestination: false,
        offset: new AMap.Pixel(0, -30),
    });

    var html = "";
    $("#input_city").append(html);
    $("#input_area").append(html);
    $.each(obj["community"], function (province, province_item) {
        html += "<option value=" + province + " >" + province + "</option> ";
    });
    $("#input_province").append(html);

    function province_change() {
        $("#input_city option").remove();
        $("#input_area option").remove();
        var province = $("#input_province").val();
        var html = "<option value=''>--请选择--</option>";
        $("#input_city option").append(html);
        $.each(obj["community"][province], function (city, city_item) {
            html += "<option value=" + city + " >" + city + "</option> ";
        });
        $("#input_city").append(html);
    }
    
    $("#input_province").change(province_change);

    function city_change() {
        $("#input_area option").remove();
        var province = $("#input_province").val();
        var city = $("#input_city").val();
        var table_html = "";
        var html = "<option value='all'>全部</option>";
        $("#input_area option").append(html);
        $.each(obj["community"][province][city], function (area, area_item) {
            html += "<option value=" + area + " >" + area + "</option> ";
            table_html += "<h4>" + area + "</h4>";
            table_html += "<table class='table table-hover' style='box-shadow: 0.5px 0.5px 0.5px 0.5px; border-radius:5px; background-color: white'><phead><tr><th scope='col'>确诊地点</th><th scope='col'>确诊人数</th><th scope='col'>与我距离</th></tr></thead><tbody>";
            $.each(obj["community"][province][city][area], function (idx, community) {
                table_html += "<tr><td>" + community["show_address"] + "</td><td>" + (community["cnt_sum_certain"] > 0 ? community["cnt_sum_certain"] : "暂无数据") + "</td><td>" + (lng && lat ? (AMap.GeometryUtil.distance([lng, lat], [community.lng, community.lat]) / 1000).toFixed(3) + "km" : "定位失败") + "</td></tr>";
            });
            table_html += "</tbody></table>";
        });
        $("#input_area").append(html);
        $("div#community_tables").html(table_html);
    }

    $("#input_city").change(city_change);

    function area_change() {
        var province = $("#input_province").val();
        var city = $("#input_city").val();
        var area = $("#input_area").val();
        if (area == "all") {
            var table_html = "";
            $.each(obj["community"][province][city], function (area, area_item) {
                table_html += "<h4>" + area + "</h4>";
                table_html += "<table class='table table-hover' style='box-shadow: 0.5px 0.5px 0.5px 0.5px; border-radius:5px; background-color: white'><phead><tr><th scope='col'>确诊地点</th><th scope='col'>确诊人数</th><th scope='col'>与我距离</th></tr></thead><tbody>";
                $.each(obj["community"][province][city][area], function (idx, community) {
                    table_html += "<tr><td>" + community["show_address"] + "</td><td>" + (community["cnt_sum_certain"] > 0 ? community["cnt_sum_certain"] : "暂无数据") + "</td><td>" + (lng && lat ? (AMap.GeometryUtil.distance([lng, lat], [community.lng, community.lat]) / 1000).toFixed(3) + "km" : "定位失败") + "</td></tr>";
                });
                table_html += "</tbody></table>";
            });
        }
        else {
            var table_html = "";
            table_html += "<h4>" + area + "</h4>";
            table_html += "<table class='table table-hover' style='box-shadow: 0.5px 0.5px 0.5px 0.5px; border-radius:5px; background-color: white'><phead><tr><th scope='col'>确诊地点</th><th scope='col'>确诊人数</th><th scope='col'>与我距离</th></tr></thead><tbody>";
            $.each(obj["community"][province][city][area], function (idx, community) {
                table_html += "<tr><td>" + community["show_address"] + "</td><td>" + (community["cnt_sum_certain"] > 0 ? community["cnt_sum_certain"] : "暂无数据") + "</td><td>" + (lng && lat ? (AMap.GeometryUtil.distance([lng, lat], [community.lng, community.lat]) / 1000).toFixed(3) + "km" : "定位失败") + "</td></tr>";
            });
            table_html += "</tbody></table>";
        }
        $("div#community_tables").html(table_html);
    }

    $("#input_area").change(area_change);
    
    var mass = new AMap.MassMarks(poi_data, {
        zIndex: 119,
        cursor: 'pointer',
        capacity: 1.0,
        style: [
            {
                url: 'https://a.amap.com/jsapi_demos/static/images/mass0.png',
                anchor: new AMap.Pixel(8, 8),
                size: new AMap.Size(15, 15),
            },
            {
                url: 'http://webapi.amap.com/ui/1.0/ui/misc/PointSimplifier/examples/imgs/people.png',
                anchor: new AMap.Pixel(8,8),
                size: new AMap.Size(15,15),
            },
        ]
    });
    mass.setMap(map);


    $.ajax({
        url: "/community/get_community",
        dataType: "json",
        success: function (data) {
            // console.log(data.result.length);
            $.each(data.result, function (idx, item) {
                console.log(item);
                if ((item.lng && item.lat)) {
                    user_poi_data.push({
                        lnglat: [item.lng, item.lat],
                        lng: item.lng, // for heatmap
                        lat: item.lat, // for heatmap
                        address: item.address,
                        full_address: item.province+item.city+item.district+item.township+item.address,
                        type: item.type,
                        typeInfo: item.typeInfo,
                        // source: item.source,
                        num: 1,
                        count: 1,
                        style: 1,
                    });
                }
            });
            $("#btn_crowd_in").click(function () {
                // console.log(user_poi_data);
                mass.setData(poi_data.concat(user_poi_data));
                $(this).hide();
                $("#btn_crowd_out").show();
            });

            $("#btn_crowd_out").click(function () {
                mass.setData(poi_data);
                $(this).hide();
                $("#btn_crowd_in").show();
            });
        }
    });

    

    var heatmap = new AMap.Heatmap(map, {
        raidus: 10,
        opacity: [0.1, 0.8],
        // gradient:{
        //     0: 'blue',
        //     0.5: 'rgb(255, 255, 0)',
        //     1.0: 'red'
        // }
    });
    heatmap.hide();
    heatmap.setDataSet({
        data: poi_data,
    });

    $("#btn_to_heatmap").click(function() {
        mass.hide();
        heatmap.show();
        $(this).hide();
        $("#btn_to_mass").show();
    });

    $("#btn_to_mass").click(function() {
        mass.show();
        heatmap.hide();
        $(this).hide();
        $("#btn_to_heatmap").show();
    });

    var markerForMass = new AMap.Marker({ content: " ", map: map });
    function updateMarkerForMass(e) {
        markerForMass.show();
        markerForMass.setPosition(e.data.lnglat);
        if (e.data.style == 0) {
            markerForMass.setLabel({
                content: "地址：" + e.data.full_address + "\n确诊人数:" + (e.data.num > 0 ? e.data.num : "暂未公布"),
                direction: "top",
            });
        }
        else {
            markerForMass.setLabel({
                content: "地址：" + e.data.full_address + " " + (e.data.type >= 0 ? user_poi_type[e.data.type] : e.data.typeInfo) + " (此信息由网站用户提交)",
                direction: "top",
            });
        }
    }
    mass.on("mouseover", updateMarkerForMass);
    mass.on("mouseout", function () {
        markerForMass.hide();
    });
    mass.on("touchstart", updateMarkerForMass);

    map.plugin('AMap.Geolocation', function () {
        var geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            showMarker: false,
            panToLocation: true,
            // GeoLocationFirst: true,
        });
        $('#getLocModal').modal();
        map.addControl(geolocation);

        geolocation.getCurrentPosition();
        AMap.event.addListener(geolocation, 'complete', onComplete);
        AMap.event.addListener(geolocation, 'error', onError);

        function onComplete(data) {
            lng = data.position.lng;
            lat = data.position.lat;
            map_province = data.addressComponent.province;
            map_city = data.addressComponent.city;
            
            if (!map_city) {
                map_city = map_province;
            }
            if (obj["community"].hasOwnProperty(map_province) && obj["community"][map_province].hasOwnProperty(map_city)) {
                $("#input_province option[value='" + map_province + "']").attr("selected", true);
                province_change();
                $("#input_city option[value='" + map_city + "']").attr("selected", true);
                city_change();
            }

            setMarker([lng,lat], map_province, map_city); 

            marker.on('click', function () {
                advancedInfoWindow.open(map, marker.getPosition());
            });

            $("#getLocModal").hide(); $('.modal-backdrop').remove(); $('body').removeClass('modal-open');
        }
        function onError(data) {
            $("#getLocModal").hide(); $('.modal-backdrop').remove(); $('body').removeClass('modal-open');
            alert("定位失败");
        }
    });

});

