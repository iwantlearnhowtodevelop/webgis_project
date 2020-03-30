function update_overall_table() {
    // $.getJSON('./data/DXYOverall.json') 
	$.getJSON('https://lab.isaaclin.cn/nCoV/api/overall?latest=true')
        .done(function (data) {
            $("#confirmedCount").text(data.results[0].confirmedCount);
            // $("#suspectedCount").text(data[0]['suspectedCount']);
            // $("#curedCount").text(data[0]['curedCount']);
            // $("#deadCount").text(data[0]['deadCount']);
			$("#suspectedCount").text(data.results[0].suspectedCount);
			$("#curedCount").text(data.results[0].curedCount);
			$("#deadCount").text(data.results[0].deadCount);
        })
        .fail(function () {
            console.log('更新数据预览表失败')
        })
}

Date.prototype.format = function (fmt) {            
	var o = {                
		"y+": this.getFullYear, //年                
		"M+": this.getMonth() + 1, //月份                
		"d+": this.getDate(), //日                
		"h+": this.getHours(), //小时                
		"m+": this.getMinutes(), //分                
		"s+": this.getSeconds() //秒            
		};            
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));            
	for (var k in o)                
	if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));            
	return fmt;        
}        
setInterval("document.getElementById('time').innerHTML = (new Date()).format('yyyy-MM-dd hh:mm:ss');", 1000);
// setInterval($("#time").text=(new Date()).format('yyyy-MM-dd hh:mm:ss'),1000);
