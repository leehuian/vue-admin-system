var sankey = function (myVue, containerID) {
    var self = this;
    self.myVue = myVue;
    self.containerID = "#sangjitu";
    self.sourceData = null;

    var TopoShape = {
        svg_width: document.getElementById("sangjitu").offsetWidth - 100, //svg的宽度
        svg_height: 600,

    }

    self.nodes = [];
    self.links = [];
    self.helpNodeMap = {};

    /**
     * 根据数据，转化为符合桑基图要求的数据格式
     */
    self.computeData = function () {
        var maxLenIndex = -1;
        var maxLen = -1;

        //step1. 首选找出最长路径
        for (var i = 0; i < self.sourceData.length; i++) {
            var lujingObj = self.sourceData[i];
            var fidList = lujingObj.funcidPath.split('-');
            if (fidList.length > maxLen) {
                maxLenIndex = i;
                maxLen = fidList.length;
            }
        }
        //step2. 然后计算最长路径上各点的等级。
        var maxLujing = self.sourceData[maxLenIndex];
        var maxFidArr = maxLujing.funcidPath.split('-');
        var maxNameArr = maxLujing.funcnamePath.split('-');
        var theCount = maxLujing.pathCount;
        var endNodeIdx = maxFidArr.length - 1;
        var funcidLevelMap = {}; //funcid对应的level，下标
        for (var i = 0; i < maxFidArr.length; i++) {
            var funcid = maxFidArr[i];
            var name = maxNameArr[i];
            var idx = self.nodes.length;
            var obj = {
                "funcid": funcid,
                "name": name,
                "level": i
            }
            if (i != maxFidArr.length - 1 && i != 0) {
                //记录该funcid最新的等级和下标
                funcidLevelMap[funcid] = {
                    "level": i,
                    "idx": i
                };
            }
            self.nodes.push(obj);

            //添加路径
            if (i != 0) {
                self.links.push({
                    "source": i - 1,
                    "target": i,
                    "value": theCount
                })
            }
        }
        //计算其他非最长路径
        for (var i = 0; i < self.sourceData.length; i++) {
            if (i === maxLenIndex) {
                continue;
            } else {
                var lujingObj = self.sourceData[i];
                var fidArr = lujingObj.funcidPath.split('-');
                var nameArr = lujingObj.funcnamePath.split('-');
                var count = lujingObj.pathCount;
                for (var j = 1; j < fidArr.length; j++) {
                    var funcid = fidArr[j];
                    var name = nameArr[j];
                    if (j == fidArr.length - 1 && j == 1) { //如果这条路径只有开始结束两个点
                        self.links.push({
                            "source": 0,
                            "target": endNodeIdx,
                            "value": count
                        })
                    } else if (j == 1) {
                        if (funcidLevelMap[funcid]) {
                            self.links.push({
                                "source": 0,
                                "target": funcidLevelMap[funcid].idx,
                                "value": count
                            })
                        } else {
                            var idx = self.nodes.length;
                            self.nodes.push({
                                "funcid": funcid,
                                "name": name,
                                "level": 1
                            })
                            self.links.push({
                                "source": 0,
                                "target": idx,
                                "value": count
                            })
                            funcidLevelMap[funcid] = {
                                "level": 1,
                                "idx": idx
                            }
                        }
                    } else if (j == fidArr.length - 1) {
                        var topFuncid = fidArr[j - 1];
                        self.links.push({
                            "source": funcidLevelMap[topFuncid].idx,
                            "target": endNodeIdx,
                            "value": count
                        })
                    } else {
                        var topFuncid = fidArr[j - 1];
                        if (funcidLevelMap[funcid]) { //如果该funcid存在
                            //如果上一个节点等级大于等于该节点。 || 上一个节点和这个节点是同一个节点（据xianzhe说不会出现，为了防止，这里添加上了校验）
                            if (funcidLevelMap[topFuncid].level > funcidLevelMap[funcid].level || funcid == topFuncid) {
                                var topLv = funcidLevelMap[topFuncid].level;
                                var topIdx = funcidLevelMap[topFuncid].idx;
                                var lv = topLv + 1;
                                var idx = self.nodes.length;
                                self.nodes.push({
                                    "funcid": funcid,
                                    "name": name,
                                    "level": lv
                                })

                                funcidLevelMap[funcid].level = lv;
                                funcidLevelMap[funcid].idx = idx;
                                self.links.push({
                                    "source": topIdx,
                                    "target": idx,
                                    "value": count
                                })
                            } else {
                                self.links.push({
                                    "source": funcidLevelMap[topFuncid].idx,
                                    "target": funcidLevelMap[funcid].idx,
                                    "value": count
                                })
                            }
                        } else { //如果该funcid不存在
                            var lv = funcidLevelMap[topFuncid].level + 1;
                            var idx = self.nodes.length;
                            self.nodes.push({
                                "funcid": funcid,
                                "name": name,
                                "level": lv
                            });
                            self.links.push({
                                "source": funcidLevelMap[topFuncid].idx,
                                "target": idx,
                                "value": count
                            })
                            funcidLevelMap[funcid] = {
                                "level": lv,
                                "idx": idx
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 画桑基图
     */
    self.drawSankey = function () {
        var margin = {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            },
            width = TopoShape.svg_width - margin.left - margin.right,
            height = TopoShape.svg_height - margin.top - margin.bottom;

        color = d3.scale.category20();

        // append the svg canvas to the page
        d3.select(self.containerID).select("svg").remove();
        var svg = d3.select(self.containerID).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Set the sankey diagram properties
        var sankey = d3.sankey()
            .nodeWidth(20)
            .nodePadding(20)
            .size([width, height]);

        var path = sankey.link();

        //set up graph in same style as original example but empty
        var graph = {
            "nodes": [],
            "links": []
        };

        graph.nodes = self.nodes;
        graph.links = self.links;

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

        // add in the links
        var link = svg.append("g").selectAll(".sankey-link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "sankey-link")
            .attr("d", path)
            .style("stroke-width", function (d) {
                return Math.max(1, d.dy);
            })
            .sort(function (a, b) {
                return b.dy - a.dy;
            });

        // add the link titles
        link.append("title")
            .text(function (d) {
                return d.source.name + " → " +
                    d.target.name + "\n" + d.value;
            });

        // add in the nodes
        var node = svg.append("g").selectAll(".sankey-node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "sankey-node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.behavior.drag()
                .origin(function (d) {
                    return d;
                })
                .on("dragstart", function () {
                    this.parentNode.appendChild(this);
                })
                .on("drag", dragmove));

        // add the rectangles for the nodes
        node.append("rect")
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function (d) {
                return d.color = color(d.name.replace(/ .*/, ""));
            })
            .style("stroke", function (d) {
                return d3.rgb(d.color).darker(2);
            })
            .append("title")
            .text(function (d) {
                return d.name + "\n" + d.value;
            });

        // add in the title for the nodes
        node.append("text")
            .attr("x", -6)
            .attr("y", function (d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function (d) {
                return d.name;
            })
            .filter(function (d) {
                return d.x < width / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        // the function for moving the nodes
        function dragmove(d) {
            d3.select(this).attr("transform",
                "translate(" + d.x + "," + (
                    d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
            sankey.relayout();
            link.attr("d", path);
        }
    }

    self.createSangjiTu = function (sourceData) {
        self.sourceData = sourceData;
        self.computeData();
        self.drawSankey();
    }
}

module.exports = sankey;