var drawTopologyFunc = function (myVue, sourceData, containerID) {
    var self = this;
    var vue = myVue;

    self.pathRoadFlag = 1; //主线路正负标记，如果为负，则从右往左排列，否则从左往右排列
    self.containerID = containerID;

    //图片大小等配置信息
    self.svg_width = document.getElementById("container").offsetWidth - 50;
    self.svg_InitialWidth = document.getElementById("container").offsetWidth - 50; //初始宽度
    self.svg_height = 400;
    self.svg_InitialHeight = 400; //初始高度
    //设置svg的边框距离
    self.svg_margin = {
        top: 20,
        left: 20,
        bottom: 20,
        right: 20
    };

    //主路径上的节点之间的距离
    self.mainNode_margin = {
        height: 50,
        width: 100
    };

    self.nodeShape = {
        width: 150,
        height: 75
    }
    //定义开始节点，并且设置其位置
    self.source = sourceData.source;
    self.source.x = 250;
    self.source.y = self.nodeShape.height + self.mainNode_margin.height + 10;

    self.mainPathDataArr = [sourceData.source]; //存储用户点击的主节点的集合。

    self.mainLine = []; //主节点之间的连线
    self.helpLine = []; //输入、输出节点与其对应节点之间的连线

    self.drawMainPath = function () {
        var _mainNodeDiv = self.mainConainer.selectAll('div.canReachMainNode');
        var _update = _mainNodeDiv.data(self.mainPathDataArr);
        var _enter = _update.enter();
        var _exit = _update.exit();


        _update.style('left', function (d, i) {
                return d.x + "px";
            })
            .style('top', function (d, i) {
                return d.y + "px";
            })
            .select('div')
            .text(function (d) {
                return d.name + " " + d.funcId;
            })

        _enter.append('div')
            .attr('class', 'canReachMainNode')
            .style('left', function (d, i) {
                return d.x + "px";
            })
            .style('top', function (d, i) {
                return d.y + "px";
            })
            .style('width', self.nodeShape.width + "px")
            .style('height', self.nodeShape.height + "px")
            .style("border-radius", self.nodeShape.height / 2 + "px")
            .style("position", "absolute")
            .on('click', function (d, i) {
                self.mainNodeQueryInOut(d, i);
            })
            .append('div')
            .style({
                "text-align": "center",
                "word-break": "break-all",
                "position": "relative",
                "top": "50%",
                "color": "lawngreen",
                "transform": "translateY(-50%)",
            })
            .text(function (d) {
                return d.name + " " + d.funcId;
            })


        _exit.remove();
    }

    //查找主路径上的节点的输入输出
    //nodeData 点击的节点， i : 该点击的节点在主节点的下标
    self.mainNodeQueryInOut = function (nodeData, nodeDataIndex) {
        var queryData = vue.queryInOut(nodeData.funcId);
        var inList = queryData.inList;
        var outList = queryData.outList;
        if (inList.length == 0 && outList.length == 0) {
            self.warnMsg("该节点无输入输出节点！");
            return;
        }

        //选中的主节点的上下节点，不出现在该主节点的输入输出节点集合中。
        var leftNode = self.mainPathDataArr[nodeDataIndex - 1];
        var rightNode = self.mainPathDataArr[nodeDataIndex + 1];
        for (var i in self.mainLine) {
            var _line = self.mainLine[i];
            if (_line.begin == nodeData && _line.end == leftNode) {
                for (var i = 0; i < outList.length; i++) {
                    if (outList[i].funcId == leftNode.funcId) {
                        outList.splice(i, 1);
                        break;
                    }
                }
            }
            if (_line.begin == nodeData && _line.end == rightNode) {
                for (var i = 0; i < outList.length; i++) {
                    if (outList[i].funcId == rightNode.funcId) {
                        outList.splice(i, 1);
                        break;
                    }
                }
            }
            if (_line.end == nodeData && _line.begin == leftNode) {
                for (var i = 0; i < inList.length; i++) {
                    if (inList[i].funcId == leftNode.funcId) {
                        inList.splice(i, 1);
                        break;
                    }
                }
            }
            if (_line.end == nodeData && _line.begin == rightNode) {
                for (var i = 0; i < inList.length; i++) {
                    if (inList[i].funcId == rightNode.funcId) {
                        inList.splice(i, 1);
                        break;
                    }
                }
            }
        }

        if (inList.length == 0 && outList.length == 0) {
            self.warnMsg("该节点无其他输入输出节点！");
            return;
        }

        var inX = inList.length * (self.nodeShape.width + self.mainNode_margin.width / 2) - self.mainNode_margin.width / 2;
        var inStartX = 20;
        if ((inX / 2 - self.nodeShape.width / 2 + 20) < nodeData.x) {
            inStartX = nodeData.x - (inX / 2 - self.nodeShape.width / 2)
        }

        var outX = outList.length * (self.nodeShape.width + self.mainNode_margin.width / 2) - self.mainNode_margin.width / 2;
        var outStartX = 20;
        if ((outX / 2 - self.nodeShape.width / 2 + 20) < nodeData.x) {
            outStartX = nodeData.x - (outX / 2 - self.nodeShape.width / 2)
        }


        //清空输入输出节点连接线数据
        self.helpLine = [];
        //存储输入、输出节点的最大的x轴方向的坐标
        var _maxWidth = 0;
        //计算输入、输出节点的x,y坐标位置
        for (var i in inList) {
            inList[i].y = nodeData.y - self.nodeShape.height - self.mainNode_margin.height;

            if (i == 0) {
                inList[i].x = inStartX;
            } else {
                inList[i].x = inList[i - 1].x + self.nodeShape.width + self.mainNode_margin.width / 2;
            }

            //添加输入、输出的连接线数据
            self.helpLine.push({
                "begin": inList[i],
                "end": nodeData
            })

            //存储输入节点的最大x坐标
            if (i == inList.length - 1) {
                _maxWidth = inList[i].x;
            }
        }

        for (var i in outList) {
            outList[i].y = nodeData.y + self.nodeShape.height + self.mainNode_margin.height;

            if (i == 0) {
                outList[i].x = outStartX;
            } else {
                outList[i].x = outList[i - 1].x + self.nodeShape.width + self.mainNode_margin.width / 2;
            }

            //添加输入、输出的连接线数据
            self.helpLine.push({
                "begin": nodeData,
                "end": outList[i]
            })

            //只在等于0的时候计算一遍，减少计算量
            if (i == 0) {
                //根据计算出的节点，重新设置svg的高度
                if (outList[i].y < self.svg_InitialHeight) {
                    self.svg_height = self.svg_InitialHeight;
                } else {
                    self.svg_height = outList[i].y;
                }
            }

            //计算输出节点的x轴最大坐标，并且将其和输入的最大值进行比较，取其中的较大值
            if (i == outList.length - 1) {
                _maxWidth = Math.max(_maxWidth, outList[i].x);
            }
        }

        //根据x轴上的x的最大值坐标和svg的宽度进行比较，重新设置svg的宽度，这样子页面布局更加合理
        self.svg_width = Math.max(_maxWidth, self.svg_InitialWidth);

        self.updateSvgWidth();

        var intTime = 500;
        self.mainConainer.selectAll('div.canReachHelpNode').remove();
        self.svg.selectAll('line.helpLine').remove();

        var drawHelpNode = function (helpNodeList, inOutType, mainSourceDataIndex) {
            self.mainConainer.selectAll('div.canReachHelpNode.' + inOutType)
                .data(helpNodeList)
                .enter()
                .append('div')
                .attr('class', 'canReachHelpNode ' + inOutType)
                .style('left', function (d) {
                    return d.x + "px";
                })
                .style('top', function (d) {
                    return d.y + "px";
                })
                .style('width', self.nodeShape.width + "px")
                .style('height', self.nodeShape.height + "px")
                .style("opacity", 0.1)
                .style("padding-top", "10px")
                .text(function (d) {
                    return d.name + " " + d.funcId;
                })
                .on('click', function (d, i) {
                    self.helpNodeClickFunc(d, nodeData, inOutType, mainSourceDataIndex);
                })
                .transition().duration(500).style("opacity", 1)
        }
        drawHelpNode(inList, "in", nodeDataIndex);
        drawHelpNode(outList, "out", nodeDataIndex);
        self.drawHelpLine();
    };

    //点击输入、输出节点
    //将该节点添加到主节点集合中，并且出发点击事件，查询该节点的输入、输出节点。
    self.helpNodeClickFunc = function (helpNodeData, mainNodeData, inOutType, mainSourceDataIndex) {

        //考虑到在整个路径的中间点击，如果排序的方向有误，会出现覆盖的情况，所有根据点击的主节点与第一个节点之间的y轴方向的距离进行处理。
        var _flag = ((mainNodeData.y - self.mainPathDataArr[0].y) / ((self.nodeShape.height + self.mainNode_margin.height) * 2)) % 2;
        if (_flag == 0) {
            self.pathRoadFlag = 1;
        } else {
            self.pathRoadFlag = -1;
        }

        // //因为在展示输入、输出节点的时候，已经考虑了该主节点的上下节点的情况，所以，这里就没有必要再判定了。
        // //防止重复，如果点击的副节点是其所属的主节点的上一个或者下一个节点，弹出错误提示。
        // if (self.mainPathDataArr[mainSourceDataIndex - 1]) {
        //     if (self.mainPathDataArr[mainSourceDataIndex - 1].funcId == helpNodeData.funcId) {
        //         self.warnMsg("节点[" + helpNodeData.funcId + "]是上一个节点");
        //         return;
        //     }
        // }
        // if (self.mainPathDataArr[mainSourceDataIndex + 1]) {
        //     if (self.mainPathDataArr[mainSourceDataIndex + 1].funcId == helpNodeData.funcId) {
        //         self.warnMsg("节点[" + helpNodeData.funcId + "]是下一个节点");
        //         return;
        //     }
        // }

        //检查过滤，防止出现 A <-- B <-- A <--B 这种情况，
        //因为 B 的输入、输出节点都有 A，所以在过滤需要展示的输入、输出节点的时候，可能无法完整过滤。所以需要在这里做一遍校验
        if (self.mainPathDataArr[mainSourceDataIndex - 1] && self.mainPathDataArr[mainSourceDataIndex - 2]) {
            if (self.mainPathDataArr[mainSourceDataIndex - 1].funcId == helpNodeData.funcId &&
                self.mainPathDataArr[mainSourceDataIndex - 2].funcId == mainNodeData.funcId) {
                self.warnMsg("从 " + helpNodeData.funcId + " 到 " + mainNodeData.funcId + " 的路径已经存在！！！");
                return;
            }
        }


        //在添加至主节点之前，将其他不相关的主节点删除。
        var delArr = self.mainPathDataArr.splice(mainSourceDataIndex + 1);

        //将点击的节点添加到主节点列表。
        self.mainPathDataArr.push(helpNodeData);

        //重新设置该节点的位置。
        var _nodeX = (self.nodeShape.width + self.mainNode_margin.width) * self.pathRoadFlag + mainNodeData.x;
        //希望整个主线路区域在屏幕中，如果过宽，进行换行处理
        if (_nodeX > (self.svg_InitialWidth - 250) || _nodeX < 250) {
            helpNodeData.x = mainNodeData.x;
            helpNodeData.y = mainNodeData.y + (self.nodeShape.height + self.mainNode_margin.height) * 2;
            self.pathRoadFlag = self.pathRoadFlag * -1;
        } else {
            helpNodeData.x = _nodeX;
            helpNodeData.y = mainNodeData.y;
        }

        //删除主路径线上已经被删除的节点的连线。
        var len = self.mainLine.length;
        var _mianLine = [];
        for (var i = 0; i < len; i++) {
            var _line = self.mainLine[i];
            if (self.mainPathDataArr.indexOf(_line.begin) > -1 && self.mainPathDataArr.indexOf(_line.end) > -1) {
                _mianLine.push(_line);
            }
        }
        self.mainLine = _mianLine;
        //更新主路径线数据
        if (inOutType === "in") {
            self.mainLine.push({
                "begin": helpNodeData,
                "end": mainNodeData
            })
        } else {
            self.mainLine.push({
                "begin": mainNodeData,
                "end": helpNodeData
            })
        }

        self.drawMainPath();
        self.mainNodeQueryInOut(helpNodeData, self.mainPathDataArr.length - 1);
        self.redrawMainLine();
    };

    self.drawHelpLine = function () {
        self.svg.selectAll('line.helpLine')
            .data(self.helpLine)
            .enter()
            .append('line')
            .attr('class', 'helpLine')
            .attr('x1', function (d) {
                var lineStart_x = 0;
                if (d.begin.x > d.end.x + self.nodeShape.width) {
                    lineStart_x = d.begin.x;
                } else if (d.begin.x + self.nodeShape.width < d.end.x) {
                    lineStart_x = d.begin.x + self.nodeShape.width
                } else {
                    lineStart_x = d.begin.x + self.nodeShape.width / 2
                }
                d.lineStart_x = lineStart_x;
                return lineStart_x;
            })
            .attr('y1', function (d) {
                var lineStart_y = 0;
                if (d.begin.y > d.end.y + self.nodeShape.height) {
                    lineStart_y = d.begin.y;
                } else if (d.begin.y + self.nodeShape.height < d.end.y) {
                    lineStart_y = d.begin.y + self.nodeShape.height;
                } else {
                    lineStart_y = d.begin.y + self.nodeShape.height / 2;
                }
                d.lineStart_y = lineStart_y;
                return lineStart_y;
            })
            .attr('x2', function (d) {
                var lineEnd_x = 0;
                if (d.begin.x > d.end.x + self.nodeShape.width) {
                    lineEnd_x = d.end.x + self.nodeShape.width;
                } else if (d.begin.x + self.nodeShape.width < d.end.x) {
                    lineEnd_x = d.end.x;
                } else {
                    lineEnd_x = d.end.x + self.nodeShape.width / 2
                }
                d.lineEnd_x = lineEnd_x;
                return lineEnd_x;
            })
            .attr('y2', function (d) {
                var lineEnd_y = 0;
                if (d.begin.y > d.end.y + self.nodeShape.height) {
                    lineEnd_y = d.end.y + self.nodeShape.height;
                } else if (d.begin.y + self.nodeShape.height < d.end.y) {
                    lineEnd_y = d.end.y;
                } else {
                    lineEnd_y = d.end.y + self.nodeShape.height / 2;
                }
                d.lineEnd_y = lineEnd_y;
                return lineEnd_y;
            })
            .attr("stroke", "#565656")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#arrow)")
            .style("opacity", 0.1)
            .transition().duration(500).style("opacity", 1)
    }

    self.redrawMainLine = function () {
        self.svg.selectAll('line.mainLine').remove();
        self.svg.selectAll('line.mainLine')
            .data(self.mainLine)
            .enter()
            .append('line')
            .attr('class', 'mainLine')
            .attr('x1', function (d) {
                var lineStart_x = 0;
                if (d.begin.x > d.end.x + self.nodeShape.width) {
                    lineStart_x = d.begin.x;
                } else if (d.begin.x + self.nodeShape.width < d.end.x) {
                    lineStart_x = d.begin.x + self.nodeShape.width
                } else {
                    lineStart_x = d.begin.x + self.nodeShape.width / 2
                }
                d.lineStart_x = lineStart_x;
                return lineStart_x;
            })
            .attr('y1', function (d) {
                var lineStart_y = 0;
                if (d.begin.y > d.end.y + self.nodeShape.height) {
                    lineStart_y = d.begin.y;
                } else if (d.begin.y + self.nodeShape.height < d.end.y) {
                    lineStart_y = d.begin.y + self.nodeShape.height;
                } else {
                    lineStart_y = d.begin.y + self.nodeShape.height / 2;
                }
                d.lineStart_y = lineStart_y;
                return lineStart_y;
            })
            .attr('x2', function (d) {
                var lineEnd_x = 0;
                if (d.begin.x > d.end.x + self.nodeShape.width) {
                    lineEnd_x = d.end.x + self.nodeShape.width;
                } else if (d.begin.x + self.nodeShape.width < d.end.x) {
                    lineEnd_x = d.end.x;
                } else {
                    lineEnd_x = d.end.x + self.nodeShape.width / 2
                }
                d.lineEnd_x = lineEnd_x;
                return lineEnd_x;
            })
            .attr('y2', function (d) {
                var lineEnd_y = 0;
                if (d.begin.y > d.end.y + self.nodeShape.height) {
                    lineEnd_y = d.end.y + self.nodeShape.height;
                } else if (d.begin.y + self.nodeShape.height < d.end.y) {
                    lineEnd_y = d.end.y;
                } else {
                    lineEnd_y = d.end.y + self.nodeShape.height / 2;
                }
                d.lineEnd_y = lineEnd_y;
                return lineEnd_y;
            })
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrow)")
    }

    //更新svg,conainer 的宽高
    self.updateSvgWidth = function () {
        d3.select(self.containerID).style('height', self.svg_height + 100 + "px");
        self.svg.attr('width', self.svg_width) //设置svg的宽度
            .attr('height', self.svg_height + 50) //设置svg的高度

        self.mainConainer.attr('width', self.svg_width)
            .attr('height', self.svg_height);
    }

    //弹出警告信息
    self.warnMsg = function (msg) {
        vue.$message({
            showClose: true,
            message: msg,
            type: "warning"
        });
    };

    //弹出错误信息
    self.errMsg = function (msg) {
        that.$message({
            showClose: true,
            message: msg,
            type: "error"
        });
    };

    //绘制箭头
    self.drawJianTou = function () {
        var svg = self.svg;
        var defs = svg.append("defs");
        var arrowMarker = defs.append("marker")
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
            .attr("fill", "#6976C9");
    }

    self.init = function () {
        d3.select(self.containerID).selectAll('svg').remove();
        d3.select(self.containerID).selectAll('div').remove();

        //定义SVG
        self.svg = d3.select(self.containerID)
            .append("svg") //添加svg元素
            .attr('width', self.svg_width) //设置svg的宽度
            .attr('height', self.svg_height + 50) //设置svg的高度
            .style('position', 'absolute')

        d3.select(self.containerID).style('height', self.svg_height + 100 + "px");

        //定义画主路径的区域
        self.mainConainer = d3.select(self.containerID).append('div')
            .style('position', 'absolute')
            .attr('width', self.svg_width)
            .attr('height', self.svg_height);

        //绘制箭头
        self.drawJianTou();

        self.drawMainPath();
    }
}

module.exports = drawTopologyFunc;