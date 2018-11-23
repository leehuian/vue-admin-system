var drawTopologyFunc = function (myVue, containerID) {
    var marginLen = 6; //定义路径线终点距离目标终点的距离
    var self = this;
    self.myVue = myVue;
    self.containerID = "#container";
    self.sourceData = null;
    self.objMap = {}; //存储对象的一个map
    self.objMapList = [];
    self.lineMap = {}; //连接线
    self.lineMapList = [];
    self.pointArr = ""; //辅助字段，在计算节点位置时，每个节点的位置都用 "x-y"的形式添加到字符串中

    var TopoShape = {
        window_width: document.getElementById("container").offsetWidth - 50, //内容窗口的宽度
        svg_width: document.getElementById("container").offsetWidth - 50, //svg的宽度
        svg_height: 450,
        svg_oldHeight: 450, //svg的原始高度
        svg_padding: 100, //距离svg边框100 范围内不设置节点位置，预留空白
        node_width: 30, //每个节点的宽度
        node_height: 30, //每个节点的高度
        node_padding_height: 100, //两个节点间的纵向距离
        node_padding_width: 200, //两个节点之间的横向距离
    }

    /**
     * 计算每个节点所在的位置,并且设置连接线信息
     */
    self.computedPoint = function () {
        var maxLenIndex = -1;
        var maxLen = -1;
        for (var i in self.sourceData) {
            var lineObj = self.sourceData[i];
            var lineNodeArr = lineObj.funcidPath.split("-");
            var lineNodeNameArr = lineObj.funcnamePath.split("-");
            if (lineNodeArr.length > maxLen) {
                maxLenIndex = i;
                maxLen = lineNodeArr.length;
            }
            for (var j = 0; j < lineNodeArr.length; j++) {
                var funcid = lineNodeArr[j];
                var name = lineNodeNameArr[j];
                //为了防止开始funcid和结束funcid相同，需要特殊处理
                if (i == 0 && j == lineNodeArr.length - 1) {
                    var obj = {
                        "funcid": funcid,
                        "name": name
                    }
                    self.objMap[funcid + "_end"] = obj;
                } else {
                    if (j != lineNodeArr.length - 1) {
                        //如果在map中没有这个funcid对应的对象
                        if (!self.objMap[funcid]) {
                            var obj = {
                                "funcid": funcid,
                                "name": name
                            }
                            self.objMap[funcid] = obj;
                        }
                    }
                }
            }
        }

        //svg左右两边各预留TopoShape.svg_padding的宽度，然后计算出两个节点之间的横向距离
        var _padding_width = (TopoShape.window_width - TopoShape.svg_padding * 2 - maxLen * TopoShape.node_width) / (maxLen - 1);
        //如果计算出来的横向距离 < 预定义的横向距离，将预定义的横向距离设置为计算出来的横向距离
        if (_padding_width < TopoShape.node_padding_width) {
            TopoShape.node_padding_width = _padding_width;
        }
        //如果两点之间的横向间隔小于100，重新设置
        if (TopoShape.node_padding_width < 100) {
            TopoShape.node_padding_width = 100;
            TopoShape.window_width = TopoShape.node_padding_width * (maxLen - 1) + maxLen * TopoShape.node_width + 2 * TopoShape.svg_padding;
            TopoShape.svg_width = TopoShape.window_width;
        }

        var _lujingLength = maxLen * (TopoShape.node_width + TopoShape.node_padding_width) - TopoShape.node_padding_width;
        var node_startX = TopoShape.window_width / 2 - _lujingLength / 2;

        //先计算路径最长的线路的位置，然后其他的线路根据这个最长的路径依次计算
        var lineNodeFuncidArr = self.sourceData[maxLenIndex].funcidPath.split("-");
        var levleTemp = 1; //等级临时变量，不使用路径下标的原因是防止路径上存在回路
        for (var i = 0; i < lineNodeFuncidArr.length; i++) {
            var funcid = lineNodeFuncidArr[i];
            //如果是结束节点
            if (i == lineNodeFuncidArr.length - 1) {
                funcid = funcid + "_end";
            }
            var obj = self.objMap[funcid];
            if (!obj.level) {
                obj.level = levleTemp;
                levleTemp++;
                obj.x = node_startX + (TopoShape.node_width + TopoShape.node_padding_width) * (obj.level - 1);
                obj.y = TopoShape.svg_height / 2;
                self.pointArr += (obj.x + "-" + obj.y + ",");
            }
        }

        //定义y轴方向上的最小值，在计算完毕所有的节点的位置后，判定y轴方向上的最小值是否 是合理值（大于零 并且距离svg的边界有 TopoShape.svg_padding 的预留距离）
        var minHeight = TopoShape.svg_height / 2;
        var maxHeight = TopoShape.svg_height / 2;

        //根据计算出来的最长路径上的节点的位置，计算其他路径上面的节点的位置
        for (var i in self.sourceData) {
            var lineObj = self.sourceData[i];
            var lineNodeArr = lineObj.funcidPath.split("-");

            for (var j = 0; j < lineNodeArr.length; j++) {
                var funcid = lineNodeArr[j];
                //如果是结束节点
                if (j == lineNodeArr.length - 1) {
                    funcid = funcid + "_end";
                }
                var obj = self.objMap[funcid];
                //每个节点都根据其在该路径上的上一个节点的位置进行计算。（如果该节点没有设置位置信息）
                if (!obj.level) {
                    var leftFuncid = lineNodeArr[j - 1];
                    var leftFuncidObj = self.objMap[leftFuncid];
                    obj.level = leftFuncidObj.level + 1;
                    obj.x = leftFuncidObj.x + (TopoShape.node_width + TopoShape.node_padding_width);
                    var tt = 1;
                    while (true) {
                        var y = TopoShape.svg_height / 2 + (TopoShape.node_height + TopoShape.node_padding_height) * tt;
                        if (self.pointArr.indexOf(obj.x + "-" + y) == -1) {
                            obj.y = y;
                            self.pointArr += (obj.x + "-" + obj.y + ",");
                            if (y > maxHeight) {
                                maxHeight = y;
                            }
                            break;
                        }
                        y = TopoShape.svg_height / 2 - (TopoShape.node_height + TopoShape.node_padding_height) * tt;
                        if (self.pointArr.indexOf(obj.x + "-" + y) == -1) {
                            obj.y = y;
                            self.pointArr += (obj.x + "-" + obj.y + ",");
                            if (y < minHeight) {
                                minHeight = y;
                            }
                            break;
                        }
                        tt++;
                    }
                }

                //添加连接线数据
                if (j != 0) {
                    var leftFuncid = lineNodeArr[j - 1];
                    var lineTo = leftFuncid + "-" + funcid;
                    if (funcid.indexOf('_end') != -1) {
                        console.log(obj);
                    }
                    //如果连接线map中没有这两个节点之间的连接线数据
                    if (!self.lineMap[lineTo]) {
                        self.lineMap[lineTo] = {
                            "begin": self.objMap[leftFuncid],
                            "end": obj,
                            "count": lineObj.pathCount
                        }
                    } else {
                        self.lineMap[lineTo].count += lineObj.pathCount;
                    }

                    //判定这个连接线是否是反向路径（起始节点的level >= 结束节点的 level）
                    if (obj.level <= self.objMap[leftFuncid].level) {
                        self.lineMap[lineTo].isBack = true;
                    }
                }
            }
        }
        //根据 y轴方向上的最小值，重新计算每个节点的位置
        if (minHeight < TopoShape.svg_padding) {
            var addHeight = TopoShape.svg_padding - minHeight; //重新增加的y轴方向上的值
            for (var i in self.objMap) {
                var obj = self.objMap[i];
                obj.y = obj.y + addHeight;
            }
            maxHeight = maxHeight + addHeight; //重新设置y轴的最大值。
        }
        //根据y轴方向上的最大值设置svg的高度
        if ((TopoShape.svg_height - TopoShape.svg_padding) < maxHeight) {
            TopoShape.svg_height = maxHeight + TopoShape.svg_padding;
        }


        var delayIndex = 0;
        for (var i in self.objMap) {
            self.objMap[i].index = delayIndex; //给节点添加下标值，然后后续画图的时候，根据这个下标值，设置延迟效果
            self.objMapList.push(self.objMap[i]);
            delayIndex++;
        }
        for (var i in self.lineMap) {
            self.lineMapList.push(self.lineMap[i]);
        }

        //定义颜色
        self.colors = d3.scale.pow().domain([0, maxLen]).range(['rgb(15,179,255)', 'rgb(95,15,255)']);
    }

    /**
     * 画svg
     */
    self.drawSvg = function () {
        d3.select(self.containerID).select('svg').remove();
        self.svg = d3.select(self.containerID).append("svg");
        self.svg.attr('width', TopoShape.svg_width)
            .attr('height', TopoShape.svg_height)
            .style('align', 'center')
            .style('position', 'relative')
            .on('click', function () {
                d3.select('div.querFuncidInfo').remove();
            })
    }

    /**
     * 绘制节点圆点
     */
    self.drawPoint = function () {
        self.svg.selectAll("circle")
            .data(self.objMapList)
            .enter()
            .append('circle')
            .attr('id', function (d) {
                return "circle_" + d.funcid;
            })
            .attr('cx', function (d) {
                return d.x + TopoShape.node_width / 2
            })
            .attr('cy', function (d) {
                return d.y;
            })
            .attr('r', TopoShape.node_width / 2)
            .attr('fill', function (d) {
                return self.colors(d.level);
            })
            .style('cursor', 'pointer') //鼠标移动上去的的小手图标
            .attr('stroke', '#eee')
            .attr('stroke-width', '4')
            .attr("stroke-linecap", "round")
            .style('opacity', '0')
            .on('mouseover', function (d) {

                //相关联的节点，置为选中状态（也就是鼠标移动上去的状态）
                self.svg.selectAll('circle')
                    .filter(function (n) {
                        return (self.lineMap[d.funcid + "-" + n.funcid] || self.lineMap[n.funcid + "-" + d.funcid] || n.funcid == d.funcid);
                    })
                    .transition()
                    .duration(200)
                    .attr('r', TopoShape.node_width / 2 + 5)
                //其他不相关的节点，直接置灰
                self.svg.selectAll('circle')
                    .filter(function (n) {
                        return !(self.lineMap[d.funcid + "-" + n.funcid] || self.lineMap[n.funcid + "-" + d.funcid] || n.funcid == d.funcid);
                    })
                    .transition()
                    .duration(200)
                    .style('opacity', 0.1)

                //不包含该节点的线路全部置灰
                self.svg.selectAll('g.allLineCls')
                    .filter(function (n) {
                        return !(n.begin.funcid == d.funcid || n.end.funcid == d.funcid);
                    })
                    .style('opacity', 0.1)

                //所有不相关的节点文字置灰
                self.svg.selectAll('text.nodeText')
                    .filter(function (n) {
                        return !(self.lineMap[d.funcid + "-" + n.funcid] || self.lineMap[n.funcid + "-" + d.funcid] || n.funcid == d.funcid);
                    })
                    .transition()
                    .duration(200)
                    .style('opacity', 0.1)

                self.svg.selectAll('text.countText')
                    .filter(function (n) {
                        return !(n.begin.funcid == d.funcid || n.end.funcid == d.funcid);
                    })
                    .style('opacity', 0.1)

            })
            .on('mouseout', function (d) {
                //所有节点恢复正常状态
                self.svg.selectAll('circle')
                    .transition()
                    .duration(200)
                    .attr('r', TopoShape.node_width / 2)
                    .style('opacity', 1)

                //所有连线恢复正常状态
                self.svg.selectAll('g.allLineCls')
                    .style('opacity', 1)

                //所有文字恢复正常
                self.svg.selectAll('text')
                    .style('opacity', 1)

            })
            .on('dblclick', function (d) {
                self.queryNode(d);
            })
            .transition()
            .delay(function (d) {
                return 500 * d.level - 100;
            })
            .style('opacity', '1')
    }

    /**
     * 后端通讯，查询节点的详细信息
     */
    self.queryNode = function (obj) {
        var info = self.myVue.queryFuncidInfo(obj.funcid);
        console.log(info);
        if (self.contentBody) {
            //首先清空页面中的查询详情信息的div
            self.contentBody.selectAll('div').remove();
        } else {
            self.contentBody = d3.select(self.containerID);
        }

        var content = self.contentBody.append('div');

        var cls = "querFuncidInfo find-div-body-";
        if ((obj.x + TopoShape.node_width + 350) > TopoShape.svg_width) {
            cls = cls + "left";
            content.attr('class', cls)
                .style({
                    'top': obj.y - 15 + "px",
                    'left': obj.x - 350 - 8 + "px",
                    'width': 350 + "px"
                })
        } else {
            cls = cls + "right";
            content.attr('class', cls)
                .style({
                    'top': obj.y - 15 + "px",
                    'left': obj.x + TopoShape.node_width + 8 + "px",
                    'width': 350 + "px"
                })
        }

        //添加文字标题
        content.append('div')
            .attr('class', 'content-title')
            .text(info.name);

        //添加funcid
        var attr1 = content.append('div')
            .attr('class', 'content-attr')
        attr1.append('div')
            .text('Funcid');
        attr1.append('div')
            .text(info.funcid);

        //添加url
        var attr2 = content.append('div')
            .attr('class', 'content-attr')
        attr2.append('div')
            .text('URL');
        attr2.append('div')
            .text(info.url);

        //添加所属功能
        var attr3 = content.append('div')
            .attr('class', 'content-attr')
        attr3.append('div')
            .text('功能模块');
        attr3.append('div')
            .text(info.functionName);

        //添加备注信息
        var attr4 = content.append('div')
            .attr('class', 'content-attr')
        attr4.append('div')
            .text('备注');
        attr4.append('div')
            .text(info.description);


        //添加输入节点信息集合
        if (info.inNodeList && info.inNodeList.length > 0) {
            var inNodes = content.append('div')
                .attr('class', 'content-attr in-out')
            inNodes.append('div')
                .text('跳入节点');
            var nodeList = inNodes.append('div');
            var nodeItem = nodeList.append('div')
                .attr('class', 'in-out-attr')
            nodeItem.append('div')
                .text("页面funcid")

            nodeItem.append('div')
                .text("请求数量");
            for (var i in info.inNodeList) {
                var node = info.inNodeList[i];
                var nodeItem = nodeList.append('div')
                    .attr('class', 'in-out-attr')
                nodeItem.append('div')
                    .text(node.name + "（" + node.funcid + "）")

                nodeItem.append('div')
                    .text(node.count);
            }
        }

        //添加输出节点信息结合
        if (info.outNodeList && info.outNodeList.length > 0) {
            var outNodes = content.append('div')
                .attr('class', 'content-attr in-out')
            outNodes.append('div')
                .text('跳出节点');
            var nodeList = outNodes.append('div');
            var nodeItem = nodeList.append('div')
                .attr('class', 'in-out-attr')
            nodeItem.append('div')
                .text("页面funcid")

            nodeItem.append('div')
                .text("请求数量");
            for (var i in info.outNodeList) {
                var node = info.outNodeList[i];
                var nodeItem = nodeList.append('div')
                    .attr('class', 'in-out-attr')
                nodeItem.append('div')
                    .text(node.name + "（" + node.funcid + "）")

                nodeItem.append('div')
                    .text(node.count);
            }
        }
    }

    /**
     * 添加节点名称文字、两个节点间的请求量数据
     */
    self.drawText = function () {
        self.svg.selectAll('text.nodeText')
            .data(self.objMapList)
            .enter()
            .append('text')
            .attr('class', 'nodeText')
            .text(function (d) {
                return d.name;
            })
            .style('opacity', '0')
            .attr({
                'x': function (d) {
                    return d.x + TopoShape.node_width / 2
                }, //文字在X轴方向的位置
                'y': function (d) {
                    return d.y - TopoShape.node_width / 2 - 10
                }, //y轴方向,在柱形的中间
                'text-anchor': 'middle', //文字的对齐方式
                'fill': '#000', //文字的填充颜色
                'size': '28'
            })
            .transition()
            .delay(function (d) {
                return 500 * d.level - 100;
            })
            .style('opacity', '1')

        self.svg.selectAll('text.countText')
            .data(self.lineMapList)
            .enter()
            .append('text')
            .attr('class', 'countText')
            .text(function (d) {
                return d.count
            })
            .style('opacity', '0')
            .attr({
                'x': function (d) {
                    //如果具有中间点，说明这个是曲线
                    if (d.midX) {
                        return d.midX
                    } else {
                        return (d.begin.x + d.end.x) / 2
                    }
                },
                'y': function (d) {
                    //如果具有中间点，说明这个是曲线
                    if (d.midY) {
                        return d.midY - 5
                    } else {
                        return (d.begin.y + d.end.y) / 2 - 5
                    }
                },
                'text-anchor': 'middle', //文字的对齐方式
                'fill': '#000', //文字的填充颜色
                'size': '18'
            })
            .transition()
            .delay(function (d) {
                return 500 * d.begin.level + 200;
            })
            .style('opacity', '1')
    }

    /**
     * 绘制箭头
     */
    self.drawJiantou = function () {
        var defs1 = self.svg.append("defs");
        var arrowMarker = defs1.append("marker")
            .attr("id", "arrow")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "12")
            .attr("markerHeight", "12")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "6")
            .attr("refY", "6")
            .attr("orient", "auto");
        var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
            .attr("d", arrow_path)
            .attr("fill", "#000");

        //绘制浅灰色箭头，供虚线使用
        var defs2 = self.svg.append("defs");
        var arrowMarker = defs2.append("marker")
            .attr("id", "xvArrow")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "12")
            .attr("markerHeight", "12")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "6")
            .attr("refY", "6")
            .attr("orient", "auto");
        var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
            .attr("d", arrow_path)
            .attr("fill", "#b3b3b3");

        //绘制实曲线箭头
        var defs3 = self.svg.append("defs");
        var arrowMarker = defs3.append("marker")
            .attr("id", "shiquarrow")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "12")
            .attr("markerHeight", "12")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "6")
            .attr("refY", "6")
            .attr("orient", "auto");
        var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
            .attr("d", arrow_path)
            .attr("fill", "#00c434");
    }

    /**
     * 绘制连接线（实现、曲线都包括）
     */
    self.drawLine = function () {
        var allG = self.svg.selectAll('g')
            .data(self.lineMapList)
            .enter()
            .append('g')
            .attr('class', 'allLineCls')
            .on('mouseover', function (d) {
                //鼠标移动到的连线显示，其他的置灰
                allG.style('opacity', '0.1');
                d3.select(this).style('opacity', '1');

                //线两端的节点置为选中状态.其他的置灰
                self.svg.selectAll("circle").style('opacity', '0.1');
                self.svg.selectAll("circle")
                    .filter(function (n) {
                        return n.funcid == d.begin.funcid || n.funcid == d.end.funcid;
                    })
                    .style('opacity', '1')
                    .transition()
                    .duration(200)
                    .attr('r', TopoShape.node_width / 2 + 5)

                //先将所有的文字置灰
                self.svg.selectAll('text').style('opacity', '0.1');
                //相关的位置显示
                self.svg.selectAll('text.nodeText')
                    .filter(function (n) {
                        return n.funcid == d.begin.funcid || n.funcid == d.end.funcid;
                    })
                    .style('opacity', 1)

                self.svg.selectAll('text.countText')
                    .filter(function (n) {
                        return n == d;
                    })
                    .style('opacity', 1)
            })
            .on('mouseout', function (d) {
                allG.style('opacity', '1');
                self.svg.selectAll("circle")
                    .style('opacity', '1')
                    .transition()
                    .duration(200)
                    .attr('r', TopoShape.node_width / 2)

                self.svg.selectAll('text').style('opacity', '1');
            })

        //绘制回路型的虚线
        allG.filter(function (d, i) {
                return d.isBack;
            })
            .append('path')
            .attr('d', function (d) {
                var tempData = {
                    "begin": d.begin,
                    "end": d.begin,
                }
                return self.quxian(tempData);
            })
            .style('stroke', "#b3b3b3")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5") //虚线的样式，（黑白长度，循环）
            .style('fill', "none")
            .transition() //延迟与动画效果
            .duration(function (d) {
                return 600 + Math.random() * 100;
            })
            .delay(function (d) {
                return 500 * d.begin.level;
            })
            .attr('d', function (d) {
                return self.quxian(d);
            })
            .attr("marker-end", "url(#xvArrow)");

        //绘制相邻等级之间的直线路径
        allG.filter(function (d, i) {
                return !d.isBack && ((d.end.level - d.begin.level == 1) || (d.begin.y != d.end.y));
            })
            .append('line')
            .attr('x1', function (d) {
                return d.begin.x + TopoShape.node_width;
            })
            .attr('y1', function (d) {
                return d.begin.y;
            })
            .attr('x2', function (d) {
                return d.begin.x + TopoShape.node_width;
            })
            .attr('y2', function (d) {
                return d.begin.y;
            })
            .style('stroke', "#000")
            .attr("stroke-width", 2)
            .style('fill', "none")
            .transition() //延迟与动画效果
            .duration(function (d) {
                return 600 + Math.random() * 100;
            })
            .delay(function (d) {
                return 500 * d.begin.level;
            })
            .attr('x2', function (d) {
                return d.end.x - marginLen;
            })
            .attr('y2', function (d) {
                if (d.begin.y == d.end.y) {
                    return d.end.y;
                } else if (d.begin.y > d.end.y) {
                    return d.end.y + marginLen;
                } else {
                    return d.end.y - marginLen;
                }
            })
            .attr("marker-end", "url(#arrow)");

        //绘制在同一个水平线上的实线（曲线）
        allG.filter(function (d, i) {
                return !d.isBack && ((d.end.level - d.begin.level != 1) && (d.begin.y == d.end.y));
            })
            .append('path')
            .attr('d', function (d) {
                var tempData = {
                    "begin": d.begin,
                    "end": d.begin,
                }
                return self.quxian(tempData);
            })
            .style('stroke', "#00c434")
            .attr("stroke-width", 2)
            .style('fill', "none")
            .transition() //延迟与动画效果
            .duration(function (d) {
                return 600 + Math.random() * 100;
            })
            .delay(function (d) {
                return 500 * d.begin.level;
            })
            .attr('d', function (d) {
                return self.quxian(d);
            })
            .attr("marker-end", "url(#shiquarrow)");
    }

    self.drawTopology = function () {
        self.computedPoint();
        self.drawSvg();
        self.drawPoint();
        self.drawJiantou();
        self.drawLine();
        self.drawText();
    }

    /**
     * 计算两点之间指定（180-15*2）弧度的圆点位置
     * @param {开始点x坐标} x1 
     * @param {开始点y坐标} y1 
     * @param {结束点x坐标} x2 
     * @param {结束点y坐标} y2 
     */
    self.computeMidPoint = function (x1, y1, x2, y2) {
        var customerAngle = 15
        //首先计算出两点之间的角度
        var x = Math.abs(x1 - x2);
        var y = Math.abs(y1 - y2);
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var sin = y / z;
        var radina = Math.asin(sin); //用反三角函数求弧度
        var angle = Math.floor(180 / (Math.PI / radina)); //将弧度转换成角度

        //计算两点之间指定夹角的圆的半径
        var r = z / (2 * Math.cos(customerAngle * Math.PI / 180));
        var midAngle = Math.abs(angle - customerAngle);
        var padx = Math.round(r * Math.cos(midAngle * Math.PI / 180));
        var pady = Math.round(r * Math.sin(midAngle * Math.PI / 180));
        var midX, midY;
        if (x2 > x1 && y2 < y1) { //在第一象限
            if ((angle - customerAngle) >= 0) {
                midX = x1 + padx;
                midY = y1 - pady;
            } else {
                midX = x1 + padx;
                midY = y1 + pady;
            }
        } else if (x2 < x1 && y2 < y1) { //在第二象限
            if ((angle - customerAngle) >= 0) {
                midX = x1 - padx;
                midY = y1 - pady;
            } else {
                midX = x1 - padx;
                midY = y1 + pady;
            }
        } else if (x2 < x1 && y2 > y1) { //在第三象限
            if ((angle - customerAngle) >= 0) {
                midX = x1 - padx;
                midY = y1 + pady;
            } else {
                midX = x1 - padx;
                midY = y1 - pady;
            }
        } else if (x2 > x1 && y2 > y1) { //在第四象限
            if ((angle - customerAngle) >= 0) {
                midX = x1 + padx;
                midY = y1 + pady;
            } else {
                midX = x1 + padx;
                midY = y1 - pady;
            }
        } else if (x2 > x1 && y2 == y1) { //在x轴正向
            midX = x1 + padx;
            midY = y1 + pady;
        } else if (x2 == x1 && y2 < y1) { //在y轴正向
            midX = x1 + padx;
            midY = y1 - pady;
        } else if (x2 < x1 && y2 == y1) { //在x轴负向
            midX = x1 - padx;
            midY = y1 - pady;
        } else if (x2 == x1 && y2 > y1) { //在y轴负向
            midX = x1 - padx;
            midY = y1 + pady;
        }
        return {
            "x": midX,
            "y": midY
        }
    }

    /**
     * d3提供的生成曲线的方法
     */
    self.line_generator = d3.svg.line() //d3中绘制曲线的函数
        .x(function (d) {
            return d.x;
        }) //曲线中x的值
        .y(function (d) {
            return d.y;
        }) //曲线中y的值
        .interpolate("cardinal") //把曲线设置光滑

    self.quxian = function (lineData) {
        var x1, y1, x2, y2;
        var sx1, sy1, sx2, sy2;
        if (lineData.begin.level == lineData.end.level) {
            if (lineData.begin.y > lineData.end.y) {
                sx1 = lineData.begin.x + TopoShape.node_width;
                sy1 = lineData.begin.y;
                sx2 = lineData.end.x + TopoShape.node_width;
                sy2 = lineData.end.y;
                x1 = sx1;
                y1 = sy1;
                x2 = sx2;
                y2 = sy2 + marginLen * 2;
            } else {
                sx1 = lineData.begin.x;
                sy1 = lineData.begin.y;
                sx2 = lineData.end.x;
                sy2 = lineData.end.y;
                x1 = sx1;
                y1 = sy1;
                x2 = sx2;
                y2 = sy2 - marginLen * 2;
            }
        } else if (lineData.begin.level > lineData.end.level) {
            sx1 = lineData.begin.x;
            sy1 = lineData.begin.y;
            sx2 = lineData.end.x + TopoShape.node_width;
            sy2 = lineData.end.y;
            x1 = sx1;
            y1 = sy1;
            x2 = sx2 + marginLen;
            y2 = sy2 - marginLen;
        } else { //这种情况是针对开始节点等级小于结束节点的实线
            if (lineData.begin.y >= lineData.end.y) {
                sx1 = lineData.begin.x + TopoShape.node_width;
                sy1 = lineData.begin.y;
                sx2 = lineData.end.x;
                sy2 = lineData.end.y;
                x1 = sx1;
                y1 = sy1;
                x2 = sx2 - marginLen;
                y2 = sy2 + marginLen * 2;
            } else {
                sx1 = lineData.begin.x + TopoShape.node_width;
                sy1 = lineData.begin.y;
                sx2 = lineData.end.x;
                sy2 = lineData.end.y;
                x1 = sx1;
                y1 = sy1;
                x2 = sx2 - marginLen;
                y2 = sy2 - marginLen * 2;
            }
        }

        //计算出两点之间的曲线中间点，并将坐标赋值给曲线对象，用来确定曲线文字的位置
        var midPoint = self.computeMidPoint(sx1, sy1, sx2, sy2);
        lineData.midX = midPoint.x;
        lineData.midY = midPoint.y;

        var quxianData = [{
                "x": x1,
                "y": y1
            },
            midPoint,
            {
                "x": x2,
                "y": y2
            }
        ];
        return self.line_generator(quxianData);
    }

    /**
     * 
     * @param {对象集合} sourceData 
     */
    self.create = function (sourceData) {
        self.sourceData = sourceData; //传入需要处理的data
        self.drawTopology();
    }

    /**
     * 根据传入的路径，显示选定的路径，其他不相关的路径全部置灰处理
     * lujing数据格式：["a-b-c","a-e-c"]
     * @param {[string]} lujing 线路路径的集合
     * @param {number} countNumber 单条路径的访问总量
     */
    self.changePath = function (lujing, countNumber) {
        //如果传入的路径是空，则直接返回，不进行任何操作。
        if (!lujing) {
            return false;
        }
        if (!countNumber) {
            countNumber = 0;
        }

        //step1. 将图中所有的内容清空
        self.svg.selectAll('circle').remove();
        self.svg.selectAll('g').remove();
        self.svg.selectAll('text').remove();
        if (self.contentBody) {
            self.contentBody.selectAll('div').remove();
        }

        //step2. 判断传入的路径是否为多条路径（如果是多条路径，也就是全部路径）
        if (lujing.length > 1) {
            self.drawPoint();
            self.drawLine();
            self.drawText();
        } else {
            //如果是单条路径，直接显示单条路径，并且移除一些动画效果
            //step2.1. 画节点
            var _nodeData = [];
            var arrSplit = lujing[0].split('-')
            for (var i = 0; i < arrSplit.length; i++) {
                var fid = arrSplit[i];
                //如果是终点，需要添加'_end'
                if (i == arrSplit.length - 1) {
                    fid = fid + "_end";
                }
                _nodeData.push(self.objMap[fid]);
            }
            self.svg.selectAll('circle')
                .data(_nodeData)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return d.x + TopoShape.node_width / 2
                })
                .attr('cy', function (d) {
                    return d.y;
                })
                .attr('r', TopoShape.node_width / 2)
                .attr('fill', function (d) {
                    return self.colors(d.level);
                })
                .style('cursor', 'pointer') //鼠标移动上去的的小手图标
                .attr('stroke', '#eee')
                .attr('stroke-width', '4')
                .attr("stroke-linecap", "round")
                .style('opacity', '0')
                .on('dblclick', function (d) {
                    self.queryNode(d);
                })
                .transition()
                .delay(function (d, i) {
                    return 500 * i - 100;
                })
                .style('opacity', '1')

            //step2.2. 画连接线
            var singleLine_Data = [];
            for (var i = 0; i < self.lineMapList.length; i++) {
                var d = self.lineMapList[i];
                var lt = d.begin.funcid + "-" + d.end.funcid;
                if (lujing[0].indexOf(lt) != -1) {
                    singleLine_Data.push(d);
                }
            }
            console.log(singleLine_Data);
            var singleLine = self.svg.selectAll('g')
                .data(singleLine_Data)
                .enter()
                .append('g')
                .attr('class', 'allLineCls')

            //绘制回路型的虚线
            singleLine.filter(function (d) {
                    return d.isBack;
                })
                .append('path')
                .attr('d', function (d) {
                    var tempData = {
                        "begin": d.begin,
                        "end": d.begin,
                    }
                    return self.quxian(tempData);
                })
                .style('stroke', "#b3b3b3")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5") //虚线的样式，（黑白长度，循环）
                .style('fill', "none")
                .transition() //延迟与动画效果
                .duration(function (d) {
                    return 500;
                })
                .delay(function (d) {
                    return 500 * (arrSplit.indexOf(d.begin.funcid)); //根据开始节点在传入路径中的位置确定延迟时间
                })
                .attr('d', function (d) {
                    return self.quxian(d);
                })
                .attr("marker-end", "url(#xvArrow)");

            //绘制相邻等级之间的直线路径
            singleLine.filter(function (d, i) {
                    return !d.isBack && ((d.end.level - d.begin.level == 1) || (d.begin.y != d.end.y));
                })
                .append('line')
                .attr('x1', function (d) {
                    return d.begin.x + TopoShape.node_width;
                })
                .attr('y1', function (d) {
                    return d.begin.y;
                })
                .attr('x2', function (d) {
                    return d.begin.x + TopoShape.node_width;
                })
                .attr('y2', function (d) {
                    return d.begin.y;
                })
                .style('stroke', "#000")
                .attr("stroke-width", 2)
                .style('fill', "none")
                .transition() //延迟与动画效果
                .duration(function (d) {
                    return 500;
                })
                .delay(function (d) {
                    return 500 * (arrSplit.indexOf(d.begin.funcid)); //根据开始节点在传入路径中的位置确定延迟时间
                })
                .attr('x2', function (d) {
                    return d.end.x - marginLen;
                })
                .attr('y2', function (d) {
                    if (d.begin.y == d.end.y) {
                        return d.end.y;
                    } else if (d.begin.y > d.end.y) {
                        return d.end.y + marginLen;
                    } else {
                        return d.end.y - marginLen;
                    }
                })
                .attr("marker-end", "url(#arrow)");

            //绘制在同一个水平线上的实线（曲线）
            singleLine.filter(function (d, i) {
                    return !d.isBack && ((d.end.level - d.begin.level != 1) && (d.begin.y == d.end.y));
                })
                .append('path')
                .attr('d', function (d) {
                    var tempData = {
                        "begin": d.begin,
                        "end": d.begin,
                    }
                    return self.quxian(tempData);
                })
                .style('stroke', "#00c434")
                .attr("stroke-width", 2)
                .style('fill', "none")
                .transition() //延迟与动画效果
                .duration(function (d) {
                    return 500;
                })
                .delay(function (d) {
                    return 500 * (arrSplit.indexOf(d.begin.funcid)); //根据开始节点在传入路径中的位置确定延迟时间
                })
                .attr('d', function (d) {
                    return self.quxian(d);
                })
                .attr("marker-end", "url(#shiquarrow)");

            //step2.3. 绘制功能名称文字
            self.svg.selectAll('text.nodeText')
                .data(_nodeData)
                .enter()
                .append('text')
                .attr('class', 'nodeText')
                .text(function (d) {
                    return d.name;
                })
                .style('opacity', '0')
                .attr({
                    'x': function (d) {
                        return d.x + TopoShape.node_width / 2
                    }, //文字在X轴方向的位置
                    'y': function (d) {
                        return d.y - TopoShape.node_width / 2 - 10
                    }, //y轴方向,在柱形的中间
                    'text-anchor': 'middle', //文字的对齐方式
                    'fill': '#000', //文字的填充颜色
                    'size': '28'
                })
                .transition()
                .delay(function (d, i) {
                    return 500 * i - 100;
                })
                .style('opacity', '1')

            //绘制线路上的请求数量
            self.svg.selectAll('text.countText')
                .data(singleLine_Data)
                .enter()
                .append('text')
                .attr('class', 'countText')
                .style('opacity', '1')
                .attr({
                    'x': function (d) {
                        //如果具有中间点，说明这个是曲线
                        if (d.midX) {
                            return d.midX
                        } else {
                            return (d.begin.x + d.end.x) / 2
                        }
                    },
                    'y': function (d) {
                        //如果具有中间点，说明这个是曲线
                        if (d.midY) {
                            return d.midY - 5
                        } else {
                            return (d.begin.y + d.end.y) / 2 - 5
                        }
                    },
                    'text-anchor': 'middle', //文字的对齐方式
                    'fill': '#000', //文字的填充颜色
                    'size': '18'
                })
                .transition()
                .delay(function (d) {
                    return 500 * (arrSplit.indexOf(d.begin.funcid)) + 200;
                })
                .text(countNumber)
        }
    }
}

module.exports = drawTopologyFunc;