var funcModel = {
	"startFuncid": "0009014",
	"linkData": {
		"0009014": {
			"parentList": [],
			"childList": ["0101330", "0101330"],
			"funcId": "0009014",
			"url": "/dloan/lightningloan/ln_selfapplycreditamt.aspx",
			"gongNeng": "未知功能",
			"remark": "",
			"outCount": {
				"0101330": 23
			}
		},
		"0101330": {
			"parentList": ["0009014", "0009014"],
			"childList": ["0130302", "0130302"],
			"funcId": "0101330",
			"url": "/dloan/lightningloan/ln_lightninghome.aspx",
			"gongNeng": "未知功能",
			"remark": "",
			"outCount": {
				"0130302": 27
			}
		},
		"0130302": {
			"parentList": ["0101330", "0101330", "0009016"],
			"childList": ["0009006", "0009016", "0009006"],
			"funcId": "0130302",
			"url": "/dloan/lightningloan/ln_lightningapplystep2.aspx",
			"gongNeng": "未知功能",
			"remark": "",
			"outCount": {
				"0009016": 4,
				"0009006": 1
			}
		},
		"0009016": {
			"parentList": ["0130302"],
			"childList": ["0130302"],
			"funcId": "0009016",
			"url": "/dloan/vtmcommon/vtmverifykit.aspx",
			"gongNeng": "未知功能",
			"remark": "",
			"outCount": {
				"0130302": 1
			}
		},
		"0009006": {
			"parentList": ["0130302", "0130302"],
			"childList": [],
			"funcId": "0009006",
			"url": "/dloan/lightningloan/ln_lightningrepayplan.aspx",
			"gongNeng": "未知功能",
			"remark": "",
			"outCount": {}
		}
	},
	"firstRequest": 45,
	"endFuncid": "0009006"
}

module.exports = funcModel;